from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import require_admin
from app.models.grade import Grade
from app.models.subject import Subject
from app.schemas.grade import GradeCreate, GradeOut, SubjectCreate, SubjectOut

router = APIRouter(prefix="/api/admin/grades", tags=["Admin - Grades"])


@router.post("", response_model=GradeOut)
def create_grade(data: GradeCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    grade = Grade(standard=data.standard, board=data.board)
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("", response_model=list[GradeOut])
def list_grades(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Grade).order_by(Grade.standard).all()


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
def list_subjects(grade_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Subject).filter(Subject.grade_id == grade_id).all()


@router.delete("/{grade_id}/subjects/{subject_id}", status_code=204)
def delete_subject(
    grade_id: str,
    subject_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subject = (
        db.query(Subject)
        .filter(Subject.id == subject_id, Subject.grade_id == grade_id)
        .first()
    )
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
