import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import require_admin, get_current_user
from app.core.gcs import delete_blob
from app.core.processing_state import chapter_processing
from app.db.database import get_db
from app.models.chapter import Chapter
from app.models.content import ChapterContent
from app.models.glossary import GlossaryEntry
from app.models.question import Question
from app.models.subject import Subject
from app.models.test import TestQuestion
from app.schemas.chapter import ChapterCreate, ChapterOut

router = APIRouter(prefix="/api/admin/chapters", tags=["Admin - Chapters"])


class ChapterUpdate(BaseModel):
    title: str
    description: str | None = None


class ReorderItem(BaseModel):
    id: str
    number: int


@router.post("", response_model=ChapterOut, status_code=201)
def create_chapter(data: ChapterCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    subject = db.query(Subject).filter(Subject.id == data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    chapter = Chapter(
        number=data.number,
        title=data.title,
        description=data.description,
        subject_id=data.subject_id,
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.get("/subject/{subject_id}", response_model=list[ChapterOut])
def list_chapters(subject_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Chapter).filter(Chapter.subject_id == subject_id).order_by(Chapter.number).all()


@router.put("/{chapter_id}", response_model=ChapterOut)
def update_chapter(
    chapter_id: str,
    data: ChapterUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    chapter.title = data.title
    chapter.description = data.description
    db.commit()
    db.refresh(chapter)
    return chapter


@router.delete("/{chapter_id}", status_code=204)
async def delete_chapter(
    chapter_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    if chapter_id in chapter_processing:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete chapter while it is being processed. Cancel processing first.",
        )

    gcs_urls = [
        r[0] for r in
        db.query(ChapterContent.gcs_url)
        .filter(ChapterContent.chapter_id == chapter_id, ChapterContent.gcs_url.isnot(None))
        .all()
    ]

    question_ids = [r[0] for r in db.query(Question.id).filter(Question.chapter_id == chapter_id).all()]
    if question_ids:
        db.query(TestQuestion).filter(
            TestQuestion.question_id.in_(question_ids)
        ).delete(synchronize_session=False)

    db.query(GlossaryEntry).filter(GlossaryEntry.chapter_id == chapter_id).delete(synchronize_session=False)
    db.query(Question).filter(Question.chapter_id == chapter_id).delete(synchronize_session=False)
    db.query(ChapterContent).filter(ChapterContent.chapter_id == chapter_id).delete(synchronize_session=False)
    db.query(Chapter).filter(Chapter.id == chapter_id).delete(synchronize_session=False)
    db.commit()

    for url in gcs_urls:
        await asyncio.to_thread(delete_blob, url)


@router.patch("/subject/{subject_id}/reorder", response_model=list[ChapterOut])
def reorder_chapters(
    subject_id: str,
    items: list[ReorderItem],
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if not items:
        raise HTTPException(status_code=400, detail="No items provided")

    valid_ids = {
        r[0] for r in db.query(Chapter.id).filter(Chapter.subject_id == subject_id).all()
    }
    for item in items:
        if item.id not in valid_ids:
            raise HTTPException(status_code=400, detail=f"Chapter {item.id} does not belong to this subject")

    numbers = [item.number for item in items]
    if len(numbers) != len(set(numbers)):
        raise HTTPException(status_code=400, detail="Chapter numbers must be unique")
    if any(n < 1 for n in numbers):
        raise HTTPException(status_code=400, detail="Chapter numbers must be positive integers")

    for item in items:
        db.query(Chapter).filter(Chapter.id == item.id).update({"number": item.number})
    db.commit()

    return db.query(Chapter).filter(Chapter.subject_id == subject_id).order_by(Chapter.number).all()
