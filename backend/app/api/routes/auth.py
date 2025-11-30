from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.security import generate_token, hash_password, verify_password
from ...models import User, UserRole, UserStatus
from ...schemas import AuthResponse, UserCreate, UserLogin, UserPublic
from ...schemas.validators import trim, validate_email, validate_password, validate_username

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserPublic:
    username = validate_username(payload.username)
    email = validate_email(payload.email)
    password = validate_password(payload.password)

    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        role=UserRole.VOLUNTEER,
        status=UserStatus.ACTIVE,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return UserPublic(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> AuthResponse:
    username = trim(payload.username)
    user = db.query(User).filter(User.username == username).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = generate_token()
    return AuthResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
        token=token,
    )
