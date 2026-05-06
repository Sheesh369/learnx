import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://learnexa:learnexa123@localhost:5433/learnexa_db")
SECRET_KEY = os.getenv("SECRET_KEY", "learnexa-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# ---- GCS ----
STORAGE_EMULATOR_HOST = os.getenv("STORAGE_EMULATOR_HOST", "http://localhost:4443")
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "learnexa-bucket")

# ---- Gemini / Imagen ----
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-pro-preview")
GEMINI_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "FALSE")
