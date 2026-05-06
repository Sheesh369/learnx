from pydantic import BaseModel
from typing import Optional


class GradeCreate(BaseModel):
    standard: int
    board: str = "CBSE"


class GradeOut(BaseModel):
    id: str
    standard: int
    board: str

    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    name: str
    code: str
    teacher_id: Optional[str] = None


class SubjectOut(BaseModel):
    id: str
    name: str
    code: str
    grade_id: str
    teacher_id: Optional[str] = None

    class Config:
        from_attributes = True
