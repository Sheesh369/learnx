from pydantic import BaseModel
from typing import Optional, List
from app.models.user import UserRole


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    is_active: bool
    children: Optional[List[dict]] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ExcelUploadResponse(BaseModel):
    created: int
    skipped: int
    errors: List[str]
