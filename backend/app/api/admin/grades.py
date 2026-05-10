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
from app.models.grade import Grade
from app.models.question import Question
from app.models.subject import Subject
from app.models.test import Test, TestAttempt, TestQuestion
from app.schemas.grade import GradeCreate, GradeOut, SubjectCreate, SubjectOut

router = APIRouter(prefix="/api/admin/grades", tags=["Admin - Grades"])


class GradeUpdate(BaseModel):
    board: str


class SubjectUpdate(BaseModel):
    name: str
    code: str


# ── Cascade helpers ───────────────────────────────────────────────────────────

def _block_if_processing(chapter_ids: list[str], scope: str = "item") -> None:
    """Raise 409 if any chapter is currently being processed."""
    if any(cid in chapter_processing for cid in chapter_ids):
        raise HTTPException(
            status_code=409,
            detail=f"This {scope} has chapters currently being processed. Cancel all processing first.",
        )


def _cascade_delete_chapters(db: Session, chapter_ids: list[str]) -> list[str]:
    """
    Delete all DB rows under the given chapters inside the caller's transaction.
    Returns a list of GCS URLs to clean up after the commit.
    """
    if not chapter_ids:
        return []

    question_ids = [
        r[0] for r in db.query(Question.id).filter(Question.chapter_id.in_(chapter_ids)).all()
    ]
    if question_ids:
        db.query(TestQuestion).filter(
            TestQuestion.question_id.in_(question_ids)
        ).delete(synchronize_session=False)

    gcs_urls = [
        r[0] for r in
        db.query(ChapterContent.gcs_url)
        .filter(ChapterContent.chapter_id.in_(chapter_ids), ChapterContent.gcs_url.isnot(None))
        .all()
    ]

    db.query(GlossaryEntry).filter(GlossaryEntry.chapter_id.in_(chapter_ids)).delete(synchronize_session=False)
    db.query(Question).filter(Question.chapter_id.in_(chapter_ids)).delete(synchronize_session=False)
    db.query(ChapterContent).filter(ChapterContent.chapter_id.in_(chapter_ids)).delete(synchronize_session=False)
    db.query(Chapter).filter(Chapter.id.in_(chapter_ids)).delete(synchronize_session=False)

    return gcs_urls


def _cascade_delete_subjects(db: Session, subject_ids: list[str]) -> list[str]:
    """
    Delete all DB rows under the given subjects (including the subjects themselves).
    Returns GCS URLs to clean up after commit.
    """
    if not subject_ids:
        return []

    chapter_ids = [
        r[0] for r in db.query(Chapter.id).filter(Chapter.subject_id.in_(subject_ids)).all()
    ]

    test_ids = [
        r[0] for r in db.query(Test.id).filter(Test.subject_id.in_(subject_ids)).all()
    ]
    if test_ids:
        db.query(TestAttempt).filter(TestAttempt.test_id.in_(test_ids)).delete(synchronize_session=False)
        db.query(TestQuestion).filter(TestQuestion.test_id.in_(test_ids)).delete(synchronize_session=False)
        db.query(Test).filter(Test.id.in_(test_ids)).delete(synchronize_session=False)

    db.query(GlossaryEntry).filter(GlossaryEntry.subject_id.in_(subject_ids)).delete(synchronize_session=False)

    gcs_urls = _cascade_delete_chapters(db, chapter_ids)

    db.query(Subject).filter(Subject.id.in_(subject_ids)).delete(synchronize_session=False)

    return gcs_urls


# ── Grade endpoints ───────────────────────────────────────────────────────────

@router.post("", response_model=GradeOut)
def create_grade(data: GradeCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    grade = Grade(standard=data.standard, board=data.board)
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("", response_model=list[GradeOut])
def list_grades(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Grade).order_by(Grade.standard).all()


@router.put("/{grade_id}", response_model=GradeOut)
def update_grade(
    grade_id: str,
    data: GradeUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    grade.board = data.board
    db.commit()
    db.refresh(grade)
    return grade


@router.delete("/{grade_id}", status_code=204)
async def delete_grade(
    grade_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    subject_ids = [r[0] for r in db.query(Subject.id).filter(Subject.grade_id == grade_id).all()]
    chapter_ids = (
        [r[0] for r in db.query(Chapter.id).filter(Chapter.subject_id.in_(subject_ids)).all()]
        if subject_ids else []
    )
    _block_if_processing(chapter_ids, "grade")

    gcs_urls = _cascade_delete_subjects(db, subject_ids)
    db.query(Grade).filter(Grade.id == grade_id).delete(synchronize_session=False)
    db.commit()

    # Best-effort GCS cleanup after commit — fake-gcs-server handles same as real GCS
    for url in gcs_urls:
        await asyncio.to_thread(delete_blob, url)


# ── Subject endpoints ─────────────────────────────────────────────────────────

@router.post("/{grade_id}/subjects", response_model=SubjectOut)
def add_subject(
    grade_id: str,
    data: SubjectCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    subject = Subject(
        name=data.name,
        code=data.code,
        grade_id=grade_id,
        teacher_id=data.teacher_id,
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/{grade_id}/subjects", response_model=list[SubjectOut])
def list_subjects(grade_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Subject).filter(Subject.grade_id == grade_id).all()


@router.put("/{grade_id}/subjects/{subject_id}", response_model=SubjectOut)
def update_subject(
    grade_id: str,
    subject_id: str,
    data: SubjectUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.grade_id == grade_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    duplicate = db.query(Subject).filter(
        Subject.grade_id == grade_id,
        Subject.code == data.code,
        Subject.id != subject_id,
    ).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Code already used by another subject in this class")

    subject.name = data.name
    subject.code = data.code
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{grade_id}/subjects/{subject_id}", status_code=204)
async def delete_subject(
    grade_id: str,
    subject_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.grade_id == grade_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    chapter_ids = [r[0] for r in db.query(Chapter.id).filter(Chapter.subject_id == subject_id).all()]
    _block_if_processing(chapter_ids, "subject")

    gcs_urls = _cascade_delete_subjects(db, [subject_id])
    db.commit()

    for url in gcs_urls:
        await asyncio.to_thread(delete_blob, url)
