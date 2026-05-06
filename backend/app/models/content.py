import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base, gen_uuid


class ContentType(str, enum.Enum):
    simplified_text = "simplified_text"
    image = "image"
    video_youtube = "video_youtube"
    pdf = "pdf"
    note = "note"


class ChapterContent(Base):
    __tablename__ = "chapter_contents"

    id = Column(String, primary_key=True, default=gen_uuid)
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    title = Column(String(300), nullable=False)
    order_index = Column(Integer, default=0)
    text_content = Column(Text, nullable=True)
    gcs_url = Column(Text, nullable=True)
    youtube_url = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, default=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    chapter = relationship("Chapter", back_populates="contents")
