from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, gen_uuid


class GlossaryEntry(Base):
    __tablename__ = "glossary_entries"

    id = Column(String, primary_key=True, default=gen_uuid)
    word = Column(String(150), nullable=False)
    definition = Column(Text, nullable=False)
    synonym = Column(String(300), nullable=True)
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=True)
    is_ai_generated = Column(Boolean, default=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    chapter = relationship("Chapter", back_populates="glossary_entries")
    subject = relationship("Subject", back_populates="glossary_entries")
