"""
Async runner: executes the ADK agent and persists its output to the DB.
PDF is sent directly to Gemini as inline data — no text extraction needed.
This works for both text-based and scanned/image-based PDFs.
"""
import asyncio
import logging
import os
import re
import traceback
from datetime import datetime
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from app.agent.agent import book_agent
from app.agent.schemas.output import ChapterContentOutput
from app.core.gcs import delete_blob
from app.core.processing_state import chapter_processing, chapter_cancelled
from app.models.content import ChapterContent, ContentType
from app.models.question import Question
from app.services.glossary_service import upsert_word
from app.services.question_service import generate_questions_for_chapter


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


async def _is_youtube_embeddable(url: str) -> bool:
    """Return True only if the YouTube video exists and allows embedding."""
    import requests as _requests
    oembed = f"https://www.youtube.com/oembed?url={url}&format=json"
    try:
        resp = await asyncio.to_thread(_requests.get, oembed, timeout=5)
        return resp.status_code == 200
    except Exception:
        return False


async def _download_pdf_bytes(gcs_url: str) -> bytes:
    """Download raw PDF bytes from GCS — offloaded to a thread so the event loop stays free."""
    import io
    from app.core.gcs import get_gcs_client, _blob_name_from_url
    from app.core.config import GCS_BUCKET_NAME

    blob_name = _blob_name_from_url(gcs_url)
    if not blob_name:
        raise ValueError(f"Unexpected GCS URL format: {gcs_url}")

    def _download() -> bytes:
        client = get_gcs_client()
        buf = io.BytesIO()
        client.bucket(GCS_BUCKET_NAME).blob(blob_name).download_to_file(buf)
        buf.seek(0)
        return buf.read()

    return await asyncio.to_thread(_download)


def _split_markdown(text: str) -> list[str]:
    """Split markdown at ## headings. Falls back to [text] if no headings found."""
    sections = re.split(r'(?=^##\s)', text.strip(), flags=re.MULTILINE)
    return [s.strip() for s in sections if s.strip()] or [text.strip()]


def _write_chapter_to_db(
    chapter_id: str,
    chapter_title: str,
    subject_id: str | None,
    output: ChapterContentOutput,
    valid_yt_urls: list[str],
) -> list[str]:
    """
    Synchronous DB writes for a processed chapter.
    Creates its own session so it is safe to call via asyncio.to_thread.
    Returns old GCS URLs that should be deleted after a successful commit.
    """
    from app.db.database import SessionLocal
    from app.models.glossary import GlossaryEntry
    from sqlalchemy import func

    db = SessionLocal()
    old_gcs_urls_to_delete: list[str] = []
    try:
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
                old_gcs_urls_to_delete.append(item.gcs_url)
            db.delete(item)

        db.query(GlossaryEntry).filter(
            GlossaryEntry.chapter_id == chapter_id,
            GlossaryEntry.is_ai_generated == True,  # noqa: E712
        ).delete(synchronize_session=False)

        db.query(Question).filter(
            Question.chapter_id == chapter_id,
            Question.created_by.is_(None),
        ).delete(synchronize_session=False)

        db.flush()

        # Start order_index after any surviving non-AI items (e.g. manually uploaded PDFs)
        max_existing = db.query(func.max(ChapterContent.order_index)).filter(
            ChapterContent.chapter_id == chapter_id,
            ChapterContent.is_ai_generated == False,  # noqa: E712
        ).scalar()
        start_idx = (max_existing + 1) if max_existing is not None else 0

        # ── Text sections (split at ## headings) ──────────────────────────
        sections = _split_markdown(output.simplified_text)
        for i, section in enumerate(sections):
            m = re.match(r'^#{1,3}\s+(.+)', section)
            section_title = m.group(1) if m else ("Introduction" if i == 0 else f"Section {i + 1}")
            db.add(
                ChapterContent(
                    chapter_id=chapter_id,
                    content_type=ContentType.simplified_text,
                    title=section_title,
                    text_content=section,
                    is_ai_generated=True,
                    order_index=start_idx + i,
                )
            )

        # ── Videos — after all text sections ──────────────────────────────
        video_base = start_idx + len(sections)
        for i, url in enumerate(valid_yt_urls):
            db.add(
                ChapterContent(
                    chapter_id=chapter_id,
                    content_type=ContentType.video_youtube,
                    title=f"Video: {chapter_title}",
                    youtube_url=url,
                    is_ai_generated=True,
                    order_index=video_base + i,
                )
            )

        # ── Images — after all videos ──────────────────────────────────────
        image_base = video_base + len(valid_yt_urls)
        for i, img_url in enumerate(output.image_urls):
            db.add(
                ChapterContent(
                    chapter_id=chapter_id,
                    content_type=ContentType.image,
                    title=f"Illustration: {chapter_title}",
                    gcs_url=img_url,
                    is_ai_generated=True,
                    order_index=image_base + i,
                )
            )

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
        return old_gcs_urls_to_delete

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


async def process_chapter_async(
    chapter_id: str,
    chapter_title: str,
    subject_name: str,
    grade_standard: int,
    subject_id: str | None,
    pdf_gcs_url: str,
) -> None:
    """Run the ADK agent for a chapter and persist results."""

    logger = _get_run_logger(chapter_id)
    # Note: chapter_processing.add() was already called atomically in the endpoint
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
            f"Choose examples and analogies that feel natural and relatable to students at this grade level.\n\n"
            f"When searching for YouTube videos, look for popular and widely-viewed videos "
            f"that are publicly accessible and freely embeddable. Avoid niche, obscure, "
            f"or potentially restricted content."
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

        # === CANCELLATION CHECKPOINT ===
        # Check AFTER agent finishes (can't interrupt mid-flight) but BEFORE any DB writes.
        if chapter_id in chapter_cancelled:
            logger.info("[CANCELLED] Cancel requested — discarding agent output, no DB writes.")
            # Imagen already uploaded blobs during the agent run — delete them now,
            # since they are not recorded in DB yet and this is the only chance to clean them up.
            for blob_url in output.image_urls:
                try:
                    await asyncio.to_thread(delete_blob, blob_url)
                except Exception:
                    logger.warning(f"[GCS CANCEL CLEANUP] Failed to delete orphan blob {blob_url}")
            return  # finally block still runs: discards both sets

        # 3. Validate YouTube URLs via oEmbed before writing to DB
        yt_watch_pattern = re.compile(r'youtube\.com/watch\?v=[A-Za-z0-9_-]{11}')
        format_valid = [u for u in output.youtube_urls if yt_watch_pattern.search(u)]

        # Check each URL against YouTube oEmbed — filters hallucinated IDs,
        # embedding-disabled videos, and age-restricted videos in one call.
        oembed_results = await asyncio.gather(
            *[_is_youtube_embeddable(u) for u in format_valid],
            return_exceptions=True,
        )
        valid_yt_urls = [u for u, ok in zip(format_valid, oembed_results) if ok is True]

        dropped = len(format_valid) - len(valid_yt_urls)
        if dropped > 0 and not valid_yt_urls:
            logger.warning(
                f"[YOUTUBE] All {len(format_valid)} URLs failed oEmbed check "
                f"— chapter will have no videos. Raw URLs: {format_valid}"
            )
        elif dropped > 0:
            logger.warning(f"[YOUTUBE] {dropped}/{len(format_valid)} URLs dropped by oEmbed check")
        else:
            logger.info(f"[YOUTUBE] {len(valid_yt_urls)}/{len(format_valid)} URLs passed oEmbed check")

        # 4–8. Write all content + glossary to DB in a thread pool — keeps the event loop
        # free for other requests while SQLAlchemy flushes and commits to PostgreSQL.
        old_gcs_urls_to_delete = await asyncio.to_thread(
            _write_chapter_to_db,
            chapter_id,
            chapter_title,
            subject_id,
            output,
            valid_yt_urls,
        )
        logger.info("[DONE] Chapter processing complete, DB committed.")

        # GCS cleanup AFTER successful commit — if this fails, DB is clean; worst case is orphaned storage
        for url in old_gcs_urls_to_delete:
            try:
                await asyncio.to_thread(delete_blob, url)
            except Exception:
                logger.warning(f"[GCS CLEANUP] Failed to delete old blob {url}: {traceback.format_exc()}")
        if old_gcs_urls_to_delete:
            logger.info(f"[GCS CLEANUP] Deleted {len(old_gcs_urls_to_delete)} old blobs after commit.")

        # 9. Generate questions — isolated, content already committed and safe
        try:
            q_count = await generate_questions_for_chapter(
                chapter_id=chapter_id,
                simplified_text=output.simplified_text,
                subject_name=subject_name,
                grade_standard=grade_standard,
            )
            logger.info(f"[QUESTIONS] {q_count} questions saved for chapter {chapter_id}")
        except Exception:
            logger.warning(
                f"[QUESTIONS] Generation failed — content unaffected\n{traceback.format_exc()}"
            )

    except Exception:
        logger.error(f"[ERROR] process_chapter_async failed\n{traceback.format_exc()}")
        raise
    finally:
        # Always discard from BOTH sets — prevents stale entries poisoning future runs
        chapter_processing.discard(chapter_id)
        chapter_cancelled.discard(chapter_id)


def run_process_chapter(
    chapter_id: str,
    chapter_title: str,
    subject_name: str,
    grade_standard: int,
    subject_id: str | None,
    pdf_gcs_url: str,
) -> None:
    """
    Sync entry point for FastAPI BackgroundTasks.

    FastAPI runs `def` background tasks in a thread-pool worker, completely off
    the uvicorn event loop. asyncio.run() then creates a fresh event loop inside
    that thread, so the Gemini/ADK HTTP calls (which can take 5+ minutes) never
    touch the server's event loop — other requests are served normally the whole time.
    """
    asyncio.run(process_chapter_async(
        chapter_id=chapter_id,
        chapter_title=chapter_title,
        subject_name=subject_name,
        grade_standard=grade_standard,
        subject_id=subject_id,
        pdf_gcs_url=pdf_gcs_url,
    ))
