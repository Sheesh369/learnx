"""
Async runner: executes the ADK agent and persists its output to the DB.
PDF is sent directly to Gemini as inline data — no text extraction needed.
This works for both text-based and scanned/image-based PDFs.
"""
import logging
import os
import re
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from app.agent.agent import book_agent
from app.agent.schemas.output import ChapterContentOutput
from app.models.content import ChapterContent, ContentType
from app.services.glossary_service import upsert_word


def _get_run_logger(chapter_id: str) -> logging.Logger:
    """Create a file logger for a single agent run."""
    os.makedirs("logs", exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = f"logs/agent_{chapter_id}_{ts}.log"
    logger = logging.getLogger(f"agent_run.{chapter_id}.{ts}")
    logger.setLevel(logging.DEBUG)
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s\n%(message)s\n"))
    logger.addHandler(fh)
    return logger


async def _download_pdf_bytes(gcs_url: str) -> bytes:
    """Download raw PDF bytes from GCS (real or emulated)."""
    import io
    from app.core.gcs import get_gcs_client, _blob_name_from_url
    from app.core.config import GCS_BUCKET_NAME

    blob_name = _blob_name_from_url(gcs_url)
    if not blob_name:
        raise ValueError(f"Unexpected GCS URL format: {gcs_url}")

    client = get_gcs_client()
    buf = io.BytesIO()
    client.bucket(GCS_BUCKET_NAME).blob(blob_name).download_to_file(buf)
    buf.seek(0)
    return buf.read()


async def process_chapter_async(
    chapter_id: str,
    chapter_title: str,
    subject_name: str,
    grade_standard: int,
    subject_id: str | None,
    pdf_gcs_url: str,
    db: Session,
) -> None:
    """Run the ADK agent for a chapter and persist results."""

    logger = _get_run_logger(chapter_id)
    try:
        # 1. Download PDF bytes — send directly to Gemini (handles scanned PDFs via vision)
        pdf_bytes = await _download_pdf_bytes(pdf_gcs_url)
        logger.info(f"[PDF BYTES] size={len(pdf_bytes)} bytes from {pdf_gcs_url}")

        # Compute grade tier, tone, and image style based on grade_standard
        age = grade_standard + 5
        if grade_standard <= 5:
            tier = "primary school"
            tone = "very simple vocabulary, short sentences, fun analogies like everyday objects"
            image_style = "colorful cartoon illustration, simple shapes, bright colors, child-friendly"
        elif grade_standard <= 8:
            tier = "middle school"
            tone = "clear explanations with correct scientific terms, cause-and-effect reasoning"
            image_style = "clean educational diagram, semi-realistic, labeled, informative"
        else:
            tier = "high school"
            tone = "academic vocabulary, nuanced reasoning, assumes prior subject knowledge"
            image_style = "detailed scientific diagram, realistic, technical labels, academic style"

        text_prompt = (
            f"Chapter: {chapter_title}\n"
            f"Subject: {subject_name}\n"
            f"Grade: {grade_standard} ({tier}, students ~{age} years old)\n"
            f"Tone: {tone}\n"
            f"Image style to use: {image_style}\n\n"
            f"The attached PDF is a textbook chapter. Read every single page carefully.\n"
            f"Base your response ONLY on the PDF content — no outside knowledge.\n"
            f"Use the image style above when calling generate_image.\n\n"
            f"CRITICAL FORMATTING RULE: The simplified_text field in your JSON MUST use Markdown: "
            f"## headings for each major section, ### for sub-sections. "
            f"Write at least 2,000 words, proportional to the chapter size. "
            f"Choose examples and analogies that feel natural and relatable to students at this grade level."
        )

        logger.info(f"[USER MESSAGE]\n{text_prompt}")

        # 2. Run agent — PDF sent as inline_data Part alongside the text prompt
        session_service = InMemorySessionService()
        runner = Runner(
            agent=book_agent,
            app_name="learnexa",
            session_service=session_service,
        )
        session = await session_service.create_session(
            app_name="learnexa",
            user_id="system",
        )

        events = runner.run_async(
            user_id="system",
            session_id=session.id,
            new_message=genai_types.Content(
                role="user",
                parts=[
                    genai_types.Part(text=text_prompt),
                    genai_types.Part(
                        inline_data=genai_types.Blob(
                            mime_type="application/pdf",
                            data=pdf_bytes,
                        )
                    ),
                ],
            ),
        )

        result_json: str | None = None
        try:
            async for event in events:
                if event.is_final_response() and event.content and event.content.parts:
                    result_json = event.content.parts[0].text
                # Drain all events — do not break early, as that causes GeneratorExit
                # to propagate into the ADK's OpenTelemetry spans and crash
        except Exception:
            logger.error(f"[ERROR] Agent run failed\n{traceback.format_exc()}")
            raise

        logger.info(f"[AGENT RAW RESPONSE]\n{result_json}")

        if not result_json:
            raise ValueError("Agent returned no output")

        # Strip markdown code fences if the model wrapped the JSON (e.g. ```json ... ```)
        stripped = result_json.strip()
        if stripped.startswith("```"):
            stripped = stripped.split("\n", 1)[-1]          # remove first ```json line
            stripped = stripped.rsplit("```", 1)[0].strip() # remove trailing ```
            result_json = stripped

        try:
            output = ChapterContentOutput.model_validate_json(result_json)
        except Exception:
            logger.error(f"[ERROR] Failed to parse agent output\n{traceback.format_exc()}")
            raise

        logger.info(
            f"[PARSED OUTPUT SUMMARY] "
            f"simplified_text={len(output.simplified_text)} chars, "
            f"youtube_urls={len(output.youtube_urls)}, "
            f"image_urls={len(output.image_urls)}, "
            f"glossary_words={len(output.glossary_words)}\n"
            f"simplified_text preview: {output.simplified_text[:200]}"
        )

        # 3. Delete previous AI-generated content for this chapter (replace, not append)
        from app.models.glossary import GlossaryEntry
        from app.core.gcs import delete_blob

        old_ai_items = (
            db.query(ChapterContent)
            .filter(
                ChapterContent.chapter_id == chapter_id,
                ChapterContent.is_ai_generated == True,  # noqa: E712
            )
            .all()
        )
        for item in old_ai_items:
            if item.gcs_url:
                delete_blob(item.gcs_url)
            db.delete(item)

        db.query(GlossaryEntry).filter(
            GlossaryEntry.chapter_id == chapter_id,
            GlossaryEntry.is_ai_generated == True,  # noqa: E712
        ).delete(synchronize_session=False)

        db.flush()

        # 4. Persist simplified_text
        db.add(
            ChapterContent(
                chapter_id=chapter_id,
                content_type=ContentType.simplified_text,
                title=f"Simplified: {chapter_title}",
                text_content=output.simplified_text,
                is_ai_generated=True,
            )
        )

        # 5. Persist YouTube URLs — filter to only valid watch?v= format
        yt_watch_pattern = re.compile(r'youtube\.com/watch\?v=[A-Za-z0-9_-]{11}')
        valid_yt_urls = [u for u in output.youtube_urls if yt_watch_pattern.search(u)]
        logger.info(f"[YOUTUBE VALIDATION] {len(output.youtube_urls)} URLs → {len(valid_yt_urls)} valid")
        for url in valid_yt_urls:
            db.add(
                ChapterContent(
                    chapter_id=chapter_id,
                    content_type=ContentType.video_youtube,
                    title=f"Video: {chapter_title}",
                    youtube_url=url,
                    is_ai_generated=True,
                )
            )

        # 6. Persist AI-generated images
        for img_url in output.image_urls:
            db.add(
                ChapterContent(
                    chapter_id=chapter_id,
                    content_type=ContentType.image,
                    title=f"Illustration: {chapter_title}",
                    gcs_url=img_url,
                    is_ai_generated=True,
                )
            )

        # 7. Persist glossary words
        for gw in output.glossary_words:
            upsert_word(
                word=gw.word,
                definition=gw.definition,
                synonym=gw.synonym,
                chapter_id=chapter_id,
                subject_id=subject_id,
                is_ai_generated=True,
                db=db,
            )

        db.commit()
        logger.info("[DONE] Chapter processing complete, DB committed.")
    finally:
        db.close()
