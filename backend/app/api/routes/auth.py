from datetime import datetime

from fastapi import APIRouter, HTTPException, status

from ...core.database import get_db
from ...core.security import generate_token, hash_password, verify_password
from ...models import User
from ...schemas import AuthResponse, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate) -> UserPublic:
    db = get_db()

    if db.get_user_by_username(payload.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    if db.get_user_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        created_at=datetime.utcnow(),
    )

    db.add_user(user)
    return UserPublic(**user.__dict__)


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin) -> AuthResponse:
    db = get_db()
    user = db.get_user_by_username(payload.username)

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = generate_token()
    return AuthResponse(**user.__dict__, token=token)
