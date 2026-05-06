from pydantic import BaseModel
from typing import Optional


class ChapterCreate(BaseModel):
    number: int
    title: str
    description: Optional[str] = None
    subject_id: str


class ChapterOut(BaseModel):
    id: str
    number: int
    title: str
    description: Optional[str] = None
    subject_id: str

    class Config:
        from_attributes = True
