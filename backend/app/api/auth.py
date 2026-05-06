from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin, LoginResponse, UserOut
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    children = None
    if user.role.value == "parent":
        kids = db.query(User).filter(User.parent_id == user.id).all()
        children = [
            {"name": k.name, "class": f"{k.class_name or ''}{k.section or ''}"}
            for k in kids
        ]

    user_out = UserOut.model_validate(user)
    user_out.children = children
    token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return LoginResponse(access_token=token, user=user_out)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
