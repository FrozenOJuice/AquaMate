from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from sqlalchemy.orm import Session

from app.core.security import (
    get_current_user,
    set_session_cookie,
    verify_password,
)
from app.core.session import (
    create_session,
    revoke_session,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest
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
        detail = {"code": "account_exists", "message": "Account already exists"}
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail) from exc

    session_id = create_session(user.id)
    set_session_cookie(response, session_id)
    return user


@router.post("/login", response_model=UserRead)
def login(
    payload: LoginRequest,
    response: Response,
    service: UserService = Depends(get_user_service),
):
    user = service.get_by_identifier(payload.identifier)
    if not user or not verify_password(payload.password, user.hashed_password):
        detail = {"code": "invalid_credentials", "message": "Invalid credentials"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    session_id = create_session(user.id)
    set_session_cookie(response, session_id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    session_token: str | None = Cookie(None, alias="session"),
):
    if session_token:
        revoke_session(session_token)
    response.delete_cookie(key="session")
    return None


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
