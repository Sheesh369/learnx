from pydantic import BaseModel
from typing import Optional
from app.models.content import ContentType


class ContentCreate(BaseModel):
    content_type: ContentType
    title: str
    order_index: int = 0
    text_content: Optional[str] = None
    gcs_url: Optional[str] = None
    youtube_url: Optional[str] = None
    is_ai_generated: bool = False


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    text_content: Optional[str] = None
    youtube_url: Optional[str] = None
    order_index: Optional[int] = None


class ContentOut(BaseModel):
    id: str
    chapter_id: str
    content_type: ContentType
    title: str
    order_index: int
    text_content: Optional[str] = None
    gcs_url: Optional[str] = None
    youtube_url: Optional[str] = None
    is_ai_generated: bool
    uploaded_by: Optional[str] = None

    class Config:
        from_attributes = True


class BulkReorderItem(BaseModel):
    id: str
    order_index: int
