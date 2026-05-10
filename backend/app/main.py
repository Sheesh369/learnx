import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all models so they are registered with Base metadata
import app.models  # noqa: F401

from app.api.auth import router as auth_router
from app.api.content import router as content_router
from app.api.glossary import router as glossary_router
from app.api.admin.grades import router as grades_router
from app.api.admin.users import router as admin_users_router
from app.api.admin.books import router as books_router
from app.api.admin.chapters import router as chapters_router
from app.api.questions import router as questions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure GCS bucket exists (local emulator or real GCS)
    try:
        from app.core.gcs import get_gcs_client
        from app.core.config import GCS_BUCKET_NAME
        client = get_gcs_client()
        if not client.lookup_bucket(GCS_BUCKET_NAME):
            client.create_bucket(GCS_BUCKET_NAME)
            print(f"GCS bucket '{GCS_BUCKET_NAME}' created.")
        else:
            print(f"GCS bucket '{GCS_BUCKET_NAME}' already exists.")
    except Exception as e:
        print(f"GCS bucket init warning: {e}")
    yield


app = FastAPI(
    title="Learnexa API",
    description="Backend API for SSB International School's Learnexa learning platform.",
    version="2.0.0",
    debug=True,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(content_router)
app.include_router(glossary_router)
app.include_router(grades_router)
app.include_router(admin_users_router)
app.include_router(books_router)
app.include_router(chapters_router)
app.include_router(questions_router, prefix="/api/questions", tags=["Questions"])


@app.get("/")
def root():
    return {"message": "Learnexa API is running", "school": "SSB International School"}


@app.get("/health")
def health():
    return {"status": "ok"}
