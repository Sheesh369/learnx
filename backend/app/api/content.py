import asyncio
import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.processing_state import chapter_processing
from app.models.content import ChapterContent, ContentType
from app.models.chapter import Chapter
from app.schemas.content import ContentCreate, ContentUpdate, ContentOut, BulkReorderItem
from app.core.gcs import upload_bytes, delete_blob

_YOUTUBE_RE = re.compile(
    r'^https?://(www\.)?youtube\.com/watch\?v=|^https?://youtu\.be/'
)

router = APIRouter(prefix="/api/content", tags=["Content"])


@router.get("/stats")
def content_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Count of distinct chapters that have at least one AI-generated content item."""
    count = db.query(func.count(distinct(ChapterContent.chapter_id))).filter(
        ChapterContent.is_ai_generated == True,  # noqa: E712
    ).scalar()
    return {"chapters_with_content": count or 0}


@router.get("/chapter/{chapter_id}", response_model=list[ContentOut])
def list_content(chapter_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return (
        db.query(ChapterContent)
        .filter(ChapterContent.chapter_id == chapter_id)
        .order_by(ChapterContent.order_index)
        .all()
    )


@router.post("/chapter/{chapter_id}", response_model=ContentOut, status_code=201)
def add_content(
    chapter_id: str,
    data: ContentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    item = ChapterContent(
        chapter_id=chapter_id,
        content_type=data.content_type,
        title=data.title,
        order_index=data.order_index,
        text_content=data.text_content,
        gcs_url=data.gcs_url,
        youtube_url=data.youtube_url,
        is_ai_generated=data.is_ai_generated,
        uploaded_by=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/chapter/{chapter_id}/upload", response_model=ContentOut, status_code=201)
async def upload_content_file(
    chapter_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Upload an image or PDF file and create a content entry."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    data = await file.read()
    folder = "images" if file.content_type and file.content_type.startswith("image/") else "files"
    gcs_url = await asyncio.to_thread(upload_bytes, data, file.content_type or "application/octet-stream", folder)
    ctype = ContentType.image if folder == "images" else ContentType.pdf

    item = ChapterContent(
        chapter_id=chapter_id,
        content_type=ctype,
        title=file.filename,
        gcs_url=gcs_url,
        uploaded_by=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{content_id}", response_model=ContentOut)
def update_content(
    content_id: str,
    data: ContentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    item = db.query(ChapterContent).filter(ChapterContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    if item.chapter_id in chapter_processing:
        raise HTTPException(status_code=409, detail="Cannot edit content while chapter is being processed")
    if data.youtube_url and not _YOUTUBE_RE.match(data.youtube_url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL — must be youtube.com/watch?v= or youtu.be/")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{content_id}/reorder", response_model=ContentOut)
def reorder_content(
    content_id: str,
    order_index: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    item = db.query(ChapterContent).filter(ChapterContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    item.order_index = order_index
    db.commit()
    db.refresh(item)
    return item


@router.patch("/chapter/{chapter_id}/reorder-bulk", status_code=204)
def bulk_reorder_content(
    chapter_id: str,
    items: list[BulkReorderItem],
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Update order_index for multiple content items in one transaction."""
    for item in items:
        db.query(ChapterContent).filter(
            ChapterContent.id == item.id,
            ChapterContent.chapter_id == chapter_id,
        ).update({"order_index": item.order_index})
    db.commit()


@router.delete("/{content_id}", status_code=204)
def remove_content(
    content_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    item = db.query(ChapterContent).filter(ChapterContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    if item.chapter_id in chapter_processing:
        raise HTTPException(status_code=409, detail="Cannot delete content while chapter is being processed")
    if item.gcs_url:
        delete_blob(item.gcs_url)
    db.delete(item)
    db.commit()
