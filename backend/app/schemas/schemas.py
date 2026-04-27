from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.models.models import UserRole

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    phone: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

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
