"""
Async runner: executes the ADK agent and persists its output to the DB.
"""
import json
import asyncio
from sqlalchemy.orm import Session
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from app.agent.agent import book_agent
from app.agent.schemas.output import ChapterContentOutput
from app.models.content import ChapterContent, ContentType
from app.services.glossary_service import upsert_word


async def _extract_pdf_text(gcs_url: str) -> str:
    """Download PDF from GCS (real or emulated) and extract plain text using pypdf."""
    import io
    from pypdf import PdfReader
    from app.core.gcs import get_gcs_client, _blob_name_from_url
    from app.core.config import GCS_BUCKET_NAME

    blob_name = _blob_name_from_url(gcs_url)
    if not blob_name:
        raise ValueError(f"Unexpected GCS URL format: {gcs_url}")

    client = get_gcs_client()
    buf = io.BytesIO()
    client.bucket(GCS_BUCKET_NAME).blob(blob_name).download_to_file(buf)
    buf.seek(0)

    reader = PdfReader(buf)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


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

    # 1. Extract text from PDF
    raw_text = await _extract_pdf_text(pdf_gcs_url)
    if not raw_text.strip():
        raise ValueError("PDF appears to be empty or non-textual")

    user_message = (
        f"Chapter: {chapter_title}\n"
        f"Subject: {subject_name}\n"
        f"Grade: {grade_standard}\n\n"
        f"Raw text:\n{raw_text[:12000]}"  # limit to avoid token overflow
    )

    # 2. Run agent
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
            parts=[genai_types.Part(text=user_message)],
        ),
    )

    result_json: str | None = None
    async for event in events:
        if event.is_final_response() and event.content and event.content.parts:
            result_json = event.content.parts[0].text
        # Drain all events — do not break early, as that causes GeneratorExit
        # to propagate into the ADK's OpenTelemetry spans and crash

    if not result_json:
        raise ValueError("Agent returned no output")

    output = ChapterContentOutput.model_validate_json(result_json)

    # 3. Persist simplified_text
    db.add(
        ChapterContent(
            chapter_id=chapter_id,
            content_type=ContentType.simplified_text,
            title=f"Simplified: {chapter_title}",
            text_content=output.simplified_text,
            is_ai_generated=True,
        )
    )

    # 4. Persist YouTube URLs
    for url in output.youtube_urls:
        db.add(
            ChapterContent(
                chapter_id=chapter_id,
                content_type=ContentType.video_youtube,
                title=f"Video: {chapter_title}",
                youtube_url=url,
                is_ai_generated=True,
            )
        )

    # 5. Persist AI-generated images
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

    # 6. Persist glossary words
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
