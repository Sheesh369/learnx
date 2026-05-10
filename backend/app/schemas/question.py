from datetime import datetime
from pydantic import BaseModel, ConfigDict


class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # "A" | "B" | "C" | "D"
    difficulty: str      # "easy" | "medium" | "hard"
    chapter_id: str


class QuestionOut(BaseModel):
    id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    difficulty: str
    chapter_id: str
    chapter_title: str | None = None
    subject_name: str | None = None
    grade_standard: int | None = None
    created_at: datetime
    is_ai_generated: bool  # True when created_by is None

    model_config = ConfigDict(from_attributes=True)
