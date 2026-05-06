from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, gen_uuid


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String, primary_key=True, default=gen_uuid)
    number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    subject = relationship("Subject", back_populates="chapters")
    contents = relationship("ChapterContent", back_populates="chapter")
    glossary_entries = relationship("GlossaryEntry", back_populates="chapter")
