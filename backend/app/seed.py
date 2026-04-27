"""
Seed script — creates test accounts in a fresh database.
Called automatically on backend startup (idempotent — skips existing users).
Can also be run manually:  python -m app.seed
"""
from app.db.database import SessionLocal, engine, Base
from app.models.models import User
from app.core.security import hash_password

# Ensure tables exist
Base.metadata.create_all(bind=engine)

SEED_USERS = [
    {"name": "Admin User",   "email": "admin@ssb.edu",   "password": "admin123",   "role": "school_admin"},
    {"name": "Ramesh Kumar",  "email": "teacher@ssb.edu", "password": "teacher123", "role": "teacher"},
    {"name": "Arjun Reddy",   "email": "student@ssb.edu", "password": "student123", "role": "student"},
    {"name": "Priya Devi",    "email": "parent@ssb.edu",  "password": "parent123",  "role": "parent"},
]

def seed():
    db = SessionLocal()
    created = 0
    try:
        for u in SEED_USERS:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if exists:
                continue
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            )
            db.add(user)
            created += 1
        db.commit()
        if created:
            print(f"[seed] Created {created} test account(s)")
        else:
            print("[seed] All test accounts already exist, skipping")
    except Exception as e:
        print(f"[seed] Warning: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
