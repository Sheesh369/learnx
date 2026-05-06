"""Initial schema — 10 tables

Revision ID: 001
Revises:
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column(
            "role",
            sa.Enum("school_admin", "teacher", "student", "parent", name="userrole"),
            nullable=False,
        ),
        sa.Column("parent_id", sa.String(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("class_name", sa.String(10), nullable=True),
        sa.Column("section", sa.String(5), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # 2. grades
    op.create_table(
        "grades",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("standard", sa.Integer(), nullable=False),
        sa.Column("board", sa.String(10), nullable=False, server_default="CBSE"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # 3. subjects
    op.create_table(
        "subjects",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("code", sa.String(10), nullable=False),
        sa.Column("grade_id", sa.String(), sa.ForeignKey("grades.id"), nullable=False),
        sa.Column("teacher_id", sa.String(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # 4. chapters
    op.create_table(
        "chapters",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("subject_id", sa.String(), sa.ForeignKey("subjects.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # 5. chapter_contents
    op.create_table(
        "chapter_contents",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("chapter_id", sa.String(), sa.ForeignKey("chapters.id"), nullable=False),
        sa.Column(
            "content_type",
            sa.Enum(
                "simplified_text", "image", "video_youtube", "pdf", "note",
                name="contenttype",
            ),
            nullable=False,
        ),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("order_index", sa.Integer(), server_default="0"),
        sa.Column("text_content", sa.Text(), nullable=True),
        sa.Column("gcs_url", sa.Text(), nullable=True),
        sa.Column("youtube_url", sa.Text(), nullable=True),
        sa.Column("is_ai_generated", sa.Boolean(), server_default="false"),
        sa.Column("uploaded_by", sa.String(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # 6. glossary_entries
    op.create_table(
        "glossary_entries",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("word", sa.String(150), nullable=False),
        sa.Column("definition", sa.Text(), nullable=False),
        sa.Column("synonym", sa.String(300), nullable=True),
        sa.Column("chapter_id", sa.String(), sa.ForeignKey("chapters.id"), nullable=True),
        sa.Column("subject_id", sa.String(), sa.ForeignKey("subjects.id"), nullable=True),
        sa.Column("is_ai_generated", sa.Boolean(), server_default="false"),
        sa.Column("created_by", sa.String(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # 7. questions
    op.create_table(
        "questions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("option_a", sa.String(500), nullable=False),
        sa.Column("option_b", sa.String(500), nullable=False),
        sa.Column("option_c", sa.String(500), nullable=False),
        sa.Column("option_d", sa.String(500), nullable=False),
        sa.Column("correct_option", sa.String(1), nullable=False),
        sa.Column(
            "difficulty",
            sa.Enum("easy", "medium", "hard", name="difficultylevel"),
            nullable=True,
        ),
        sa.Column("chapter_id", sa.String(), sa.ForeignKey("chapters.id"), nullable=False),
        sa.Column("created_by", sa.String(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # 8. tests
    op.create_table(
        "tests",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("subject_id", sa.String(), sa.ForeignKey("subjects.id"), nullable=False),
        sa.Column("class_standard", sa.Integer(), nullable=False),
        sa.Column("total_marks", sa.Integer(), server_default="100"),
        sa.Column("duration_mins", sa.Integer(), server_default="60"),
        sa.Column(
            "status",
            sa.Enum("draft", "scheduled", "active", "completed", name="teststatus"),
            server_default="draft",
        ),
        sa.Column("scheduled_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.String(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # 9. test_questions
    op.create_table(
        "test_questions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("test_id", sa.String(), sa.ForeignKey("tests.id"), nullable=False),
        sa.Column("question_id", sa.String(), sa.ForeignKey("questions.id"), nullable=False),
        sa.Column("order_index", sa.Integer(), server_default="0"),
        sa.Column("marks", sa.Integer(), server_default="1"),
    )

    # 10. test_attempts
    op.create_table(
        "test_attempts",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("test_id", sa.String(), sa.ForeignKey("tests.id"), nullable=False),
        sa.Column("student_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("total", sa.Integer(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("test_attempts")
    op.drop_table("test_questions")
    op.drop_table("tests")
    op.drop_table("questions")
    op.drop_table("glossary_entries")
    op.drop_table("chapter_contents")
    op.drop_table("chapters")
    op.drop_table("subjects")
    op.drop_table("grades")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS contenttype")
    op.execute("DROP TYPE IF EXISTS difficultylevel")
    op.execute("DROP TYPE IF EXISTS teststatus")
