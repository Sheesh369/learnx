from pydantic import BaseModel
from typing import Optional


class GlossaryEntryCreate(BaseModel):
    word: str
    definition: str
    synonym: Optional[str] = None
    chapter_id: Optional[str] = None
    subject_id: Optional[str] = None


class GlossaryEntryUpdate(BaseModel):
    definition: Optional[str] = None
    synonym: Optional[str] = None


class GlossaryEntryOut(BaseModel):
    id: str
    word: str
    definition: str
    synonym: Optional[str] = None
    chapter_id: Optional[str] = None
    subject_id: Optional[str] = None
    is_ai_generated: bool

    class Config:
        from_attributes = True
