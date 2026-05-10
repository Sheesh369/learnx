from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserOut, ExcelUploadResponse
from app.services.excel_service import process_student_excel, process_teacher_excel

router = APIRouter(prefix="/api/admin", tags=["Admin - Users"])


@router.post("/upload/students", response_model=ExcelUploadResponse)
def upload_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files accepted")
    data = file.file.read()
    result = process_student_excel(data, db)
    return result


@router.post("/upload/teachers", response_model=ExcelUploadResponse)
def upload_teachers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files accepted")
    data = file.file.read()
    result = process_teacher_excel(data, db)
    return result


@router.get("/users", response_model=list[UserOut])
def list_users(
    role: str | None = None,
    page: int = 1,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    q = db.query(User)
    if role:
        try:
            q = q.filter(User.role == UserRole(role))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unknown role: {role}")
    offset = (page - 1) * 50
    return q.offset(offset).limit(50).all()
