from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base, gen_uuid


class Grade(Base):
    __tablename__ = "grades"

    id = Column(String, primary_key=True, default=gen_uuid)
    standard = Column(Integer, nullable=False)  # 1-10
    board = Column(String(10), nullable=False, default="CBSE")  # KSEEB | CBSE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    subjects = relationship("Subject", back_populates="grade")
