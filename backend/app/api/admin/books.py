import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import require_admin, get_current_user
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.models.grade import Grade
from app.models.content import ChapterContent, ContentType
from app.core.gcs import upload_bytes
from app.schemas.agent import AgentStatusOut

router = APIRouter(prefix="/api/admin/books", tags=["Admin - Books"])


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

    data = await file.read()
    gcs_url = upload_bytes(data, "application/pdf", folder="books")

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

    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()
    grade = db.query(Grade).filter(Grade.id == subject.grade_id).first() if subject else None

    # Find the PDF content for this chapter
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

    background_tasks.add_task(
        _run_agent_bg,
        chapter_id=chapter_id,
        chapter_title=chapter.title,
        subject_name=subject_name,
        grade_standard=grade_standard,
        subject_id=subject.id if subject else None,
        pdf_gcs_url=pdf_content.gcs_url,
    )

    return AgentStatusOut(chapter_id=chapter_id, status="queued", message="Agent started")


def _run_agent_bg(
    chapter_id: str,
    chapter_title: str,
    subject_name: str,
    grade_standard: int,
    subject_id: str | None,
    pdf_gcs_url: str,
):
    """Background wrapper to run the async agent."""
    from app.agent.runner import process_chapter_async
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        asyncio.run(
            process_chapter_async(
                chapter_id=chapter_id,
                chapter_title=chapter_title,
                subject_name=subject_name,
                grade_standard=grade_standard,
                subject_id=subject_id,
                pdf_gcs_url=pdf_gcs_url,
                db=db,
            )
        )
    finally:
        db.close()
