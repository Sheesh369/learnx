from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, ParentStudent
from app.schemas.schemas import UserRegister, UserLogin, LoginResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=LoginResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        phone=data.phone,
        class_name=data.class_name,
        section=data.section,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return LoginResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )

@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Get children for parent users
    children = None
    if user.role.value == "parent":
        links = db.query(ParentStudent).filter(ParentStudent.parent_id == user.id).all()
        children = []
        for link in links:
            child = db.query(User).filter(User.id == link.student_id).first()
            if child:
                children.append({"name": child.name, "class": f"{child.class_name}{child.section or ''}"})

    user_out = UserOut.model_validate(user)
    user_out.children = children

    token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return LoginResponse(access_token=token, user=user_out)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
