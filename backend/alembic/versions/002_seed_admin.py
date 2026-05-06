"""Seed admin user

Revision ID: 002
Revises: 001
Create Date: 2026-05-05
"""
from datetime import datetime, timezone
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def _hash_pw(plain: str) -> str:
    import bcrypt
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def upgrade() -> None:
    import uuid
    from sqlalchemy.sql import text

    conn = op.get_bind()

    # Skip if admin already exists
    result = conn.execute(
        text("SELECT id FROM users WHERE email = 'admin@ssb.edu' LIMIT 1")
    ).fetchone()
    if result:
        return

    hashed = _hash_pw("admin123")
    now = datetime.now(timezone.utc)
    conn.execute(
        text(
            """
            INSERT INTO users (id, name, email, hashed_password, role, is_active, created_at, updated_at)
            VALUES (:id, :name, :email, :pw, :role, true, :now, :now)
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": "admin@ssb.edu",
            "pw": hashed,
            "role": "school_admin",
            "now": now,
        },
    )


def downgrade() -> None:
    from sqlalchemy.sql import text
    conn = op.get_bind()
    conn.execute(text("DELETE FROM users WHERE email = 'admin@ssb.edu'"))
