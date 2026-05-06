from pydantic import BaseModel


class ChapterContentInput(BaseModel):
    chapter_id: str
    chapter_title: str
    subject_name: str
    grade_standard: int
    raw_text: str  # extracted text from the PDF
