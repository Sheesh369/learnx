import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base, gen_uuid


class TestStatus(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    active = "active"
    completed = "completed"


class Test(Base):
    __tablename__ = "tests"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    class_standard = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=False, default=100)
    duration_mins = Column(Integer, nullable=False, default=60)
    status = Column(Enum(TestStatus), default=TestStatus.draft)
    scheduled_at = Column(DateTime, nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    attempts = relationship("TestAttempt", back_populates="test")
    test_questions = relationship("TestQuestion", back_populates="test")


class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    test_id = Column(String, ForeignKey("tests.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    order_index = Column(Integer, default=0)
    marks = Column(Integer, default=1)

    test = relationship("Test", back_populates="test_questions")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(String, primary_key=True, default=gen_uuid)
    test_id = Column(String, ForeignKey("tests.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=True)
    total = Column(Integer, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime, nullable=True)

    test = relationship("Test", back_populates="attempts")
