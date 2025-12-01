from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_session_token,
    get_current_user,
    set_session_cookie,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    response: Response,
    service: UserService = Depends(get_user_service),
):
    try:
        user = service.create_user(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    token = create_session_token(user.id)
    set_session_cookie(response, token)
    return user


@router.post("/login", response_model=UserRead)
def login(
    username: str,
    password: str,
    response: Response,
    service: UserService = Depends(get_user_service),
):
    user = service.get_by_username(username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_session_token(user.id)
    set_session_cookie(response, token)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="session")
    return None
