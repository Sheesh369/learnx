from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import require_admin
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.schemas.chapter import ChapterCreate, ChapterOut

router = APIRouter(prefix="/api/admin/chapters", tags=["Admin - Chapters"])


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
def list_chapters(subject_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Chapter).filter(Chapter.subject_id == subject_id).order_by(Chapter.number).all()
