from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.glossary import GlossaryEntry
from app.models.chapter import Chapter
from app.schemas.glossary import GlossaryEntryCreate, GlossaryEntryUpdate, GlossaryEntryOut
from app.services.glossary_service import get_for_chapter, upsert_word

router = APIRouter(prefix="/api/glossary", tags=["Glossary"])


@router.get("/chapter/{chapter_id}", response_model=list[GlossaryEntryOut])
def get_chapter_glossary(
    chapter_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return get_for_chapter(chapter_id, chapter.subject_id, db)


@router.post("", response_model=GlossaryEntryOut, status_code=201)
def create_glossary_entry(
    data: GlossaryEntryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = upsert_word(
        word=data.word,
        definition=data.definition,
        synonym=data.synonym,
        chapter_id=data.chapter_id,
        subject_id=data.subject_id,
        is_ai_generated=False,
        db=db,
    )
    entry.created_by = current_user.id
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=GlossaryEntryOut)
def update_glossary_entry(
    entry_id: str,
    data: GlossaryEntryUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    entry = db.query(GlossaryEntry).filter(GlossaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_glossary_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    entry = db.query(GlossaryEntry).filter(GlossaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
