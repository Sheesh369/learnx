from pydantic import BaseModel
from typing import Optional


class BookProcessRequest(BaseModel):
    chapter_id: str


class AgentStatusOut(BaseModel):
    chapter_id: str
    status: str  # queued | processing | done | error
    message: Optional[str] = None
