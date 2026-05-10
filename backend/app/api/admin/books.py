import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import require_admin, get_current_user
from app.core.processing_state import chapter_processing, chapter_cancelled, question_generating
from app.models.chapter import Chapter
from app.models.question import Question
from app.models.subject import Subject
from app.models.grade import Grade
from app.models.content import ChapterContent, ContentType
from app.core.gcs import upload_bytes, delete_blob
from app.schemas.agent import AgentStatusOut
from app.agent.runner import run_process_chapter

router = APIRouter(prefix="/api/admin/books", tags=["Admin - Books"])


def _is_actively_processing(chapter_id: str) -> bool:
    """True only when processing AND not yet cancelled."""
    return chapter_id in chapter_processing and chapter_id not in chapter_cancelled


@router.post("/upload/{chapter_id}", status_code=202)
async def upload_pdf(
    chapter_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _=Depends(require_admin),
):
    """Upload a PDF for a chapter and store it in GCS."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    if _is_actively_processing(chapter_id):
        raise HTTPException(
            status_code=409,
            detail="Cannot replace PDF while chapter is being processed. Cancel first or wait.",
        )

    # Delete old PDFs for this chapter
    old_pdfs = db.query(ChapterContent).filter(
        ChapterContent.chapter_id == chapter_id,
        ChapterContent.content_type == ContentType.pdf,
    ).all()
    for old in old_pdfs:
        if old.gcs_url:
            await asyncio.to_thread(delete_blob, old.gcs_url)
        db.delete(old)
    db.flush()

    data = await file.read()
    gcs_url = await asyncio.to_thread(upload_bytes, data, "application/pdf", "books")

    content = ChapterContent(
        chapter_id=chapter_id,
        content_type=ContentType.pdf,
        title=file.filename,
        gcs_url=gcs_url,
        uploaded_by=current_user.id,
    )
    db.add(content)
    db.commit()
    return {"message": "PDF uploaded", "gcs_url": gcs_url}


@router.post("/{chapter_id}/process", response_model=AgentStatusOut)
async def process_chapter(
    chapter_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Trigger AI agent to process the chapter's PDF and generate content + glossary."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    if _is_actively_processing(chapter_id):
        raise HTTPException(
            status_code=409,
            detail="Chapter is already being processed. Cancel first or wait.",
        )

    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()
    grade = db.query(Grade).filter(Grade.id == subject.grade_id).first() if subject else None

    pdf_content = (
        db.query(ChapterContent)
        .filter(
            ChapterContent.chapter_id == chapter_id,
            ChapterContent.content_type == ContentType.pdf,
        )
        .order_by(ChapterContent.created_at.desc())
        .first()
    )
    if not pdf_content or not pdf_content.gcs_url:
        raise HTTPException(status_code=400, detail="No PDF uploaded for this chapter")

    grade_standard = grade.standard if grade else 0
    subject_name = subject.name if subject else ""

    # Acquire the lock BEFORE add_task — no await between here and add_task,
    # so this is atomic in asyncio. Any concurrent request now sees the lock.
    chapter_processing.add(chapter_id)

    background_tasks.add_task(
        run_process_chapter,
        chapter_id=chapter_id,
        chapter_title=chapter.title,
        subject_name=subject_name,
        grade_standard=grade_standard,
        subject_id=subject.id if subject else None,
        pdf_gcs_url=pdf_content.gcs_url,
    )

    return AgentStatusOut(chapter_id=chapter_id, status="queued", message="Agent started")


@router.get("/{chapter_id}/status")
async def get_chapter_status(
    chapter_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Check if content has been generated for a chapter."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    content_count = (
        db.query(ChapterContent)
        .filter(
            ChapterContent.chapter_id == chapter_id,
            ChapterContent.is_ai_generated == True,  # noqa: E712
        )
        .count()
    )
    has_content = content_count > 0

    question_count = (
        db.query(Question)
        .filter(Question.chapter_id == chapter_id)
        .count()
    )

    return {
        "chapter_id": chapter_id,
        "has_content": has_content,
        "content_count": content_count,
        "is_processing": _is_actively_processing(chapter_id),
        "has_questions": question_count > 0,
        "question_count": question_count,
        "is_generating_questions": chapter_id in question_generating,
    }


@router.delete("/{chapter_id}/process", status_code=200)
async def cancel_processing(
    chapter_id: str,
    _=Depends(require_admin),
):
    """Signal the running agent to discard its output. Frees upload/process lock."""
    if chapter_id not in chapter_processing:
        raise HTTPException(status_code=409, detail="Chapter is not currently being processed")

    # Only add to cancelled — do NOT remove from chapter_processing.
    # The runner's finally block owns chapter_processing cleanup.
    chapter_cancelled.add(chapter_id)
    return {"chapter_id": chapter_id, "status": "cancelled"}
