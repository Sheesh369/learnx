import random
import string
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import hash_password


def _generate_password(name: str, phone: str | None) -> str:
    first = name.split()[0].lower() if name else "user"
    if phone and len(phone) >= 4:
        return first + phone[-4:]
    return first + "".join(random.choices(string.digits, k=4))


def create_user(
    db: Session,
    name: str,
    email: str,
    role: UserRole,
    phone: str | None = None,
    class_name: str | None = None,
    section: str | None = None,
    plain_password: str | None = None,
) -> tuple[User, str]:
    """Create a user. Returns (user, plain_password)."""
    password = plain_password or _generate_password(name, phone)
    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        role=role,
        phone=phone,
        class_name=class_name,
        section=section,
    )
    db.add(user)
    db.flush()
    return user, password
