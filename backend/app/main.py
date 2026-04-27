from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.auth import router as auth_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Learnexa API",
    description="Backend API for SSB International School's Learnexa learning platform.",
    version="1.0.0",
)

import os

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:5173,http://localhost:8081").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Learnexa API is running", "school": "SSB International School"}

@app.get("/health")
def health():
    return {"status": "ok"}
