"""
Seed script — creates test accounts in a fresh database.
Run once after `docker compose up -d`:

    python -m app.seed
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
    try:
        for u in SEED_USERS:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if exists:
                print(f"  ⏭  {u['email']} already exists, skipping")
                continue
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            )
            db.add(user)
            print(f"  ✅ Created {u['role']:13s} → {u['email']}")
        db.commit()
        print("\n🎉 Seeding complete!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
