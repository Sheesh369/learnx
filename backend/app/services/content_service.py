from sqlalchemy.orm import Session
from app.models.content import ChapterContent
from app.core.gcs import delete_blob


def delete_content(content_id: str, db: Session) -> bool:
    item = db.query(ChapterContent).filter(ChapterContent.id == content_id).first()
    if not item:
        return False
    if item.gcs_url:
        delete_blob(item.gcs_url)
    db.delete(item)
    db.commit()
    return True
