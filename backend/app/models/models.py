import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid

def gen_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    school_admin = "school_admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    class_name = Column(String(10), nullable=True)  # For students: "9"
    section = Column(String(5), nullable=True)       # For students: "A"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    parent_links = relationship("ParentStudent", foreign_keys="ParentStudent.parent_id", back_populates="parent")
    student_links = relationship("ParentStudent", foreign_keys="ParentStudent.student_id", back_populates="student")

class ParentStudent(Base):
    __tablename__ = "parent_students"

    id = Column(String, primary_key=True, default=gen_uuid)
    parent_id = Column(String, ForeignKey("users.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)

    parent = relationship("User", foreign_keys=[parent_id], back_populates="parent_links")
    student = relationship("User", foreign_keys=[student_id], back_populates="student_links")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    code = Column(String(10), nullable=False)
    class_standard = Column(Integer, nullable=False)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chapters = relationship("Chapter", back_populates="subject")

class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String, primary_key=True, default=gen_uuid)
    number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    subject = relationship("Subject", back_populates="chapters")
    contents = relationship("Content", back_populates="chapter")


class ContentType(enum.Enum):
    pdf = "pdf"
    video = "video"
    image = "image"
    gif = "gif"


class Content(Base):
    __tablename__ = "contents"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(300), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    url = Column(Text, nullable=True)          # file path or external URL
    file_size = Column(Integer, nullable=True)  # bytes
    duration = Column(String(10), nullable=True)  # for videos: "12:34"
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chapter = relationship("Chapter", back_populates="contents")


class DifficultyLevel(enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_option = Column(String(1), nullable=False)  # A/B/C/D
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.medium)
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class TestStatus(enum.Enum):
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


class NotificationType(enum.Enum):
    info = "info"
    success = "success"
    warning = "warning"
    error = "error"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.info)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

