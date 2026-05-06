from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, gen_uuid


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    code = Column(String(10), nullable=False)
    grade_id = Column(String, ForeignKey("grades.id"), nullable=False)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    grade = relationship("Grade", back_populates="subjects")
    chapters = relationship("Chapter", back_populates="subject")
    glossary_entries = relationship("GlossaryEntry", back_populates="subject")
