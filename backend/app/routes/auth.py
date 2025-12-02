from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status

from app.core.security import (
    get_current_user,
    set_session_cookie,
    verify_password,
)
from app.dependencies import get_session_service, get_user_service
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate, UserRead
from app.services.session_service import SessionService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    response: Response,
    service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service),
):
    try:
        user = service.create_user(payload)
    except ValueError as exc:
        detail = {"code": "account_exists", "message": "Account already exists"}
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail) from exc

    session_id = session_service.create_session(user.id)
    set_session_cookie(response, session_id)
    return user


@router.post("/login", response_model=UserRead)
def login(
    payload: LoginRequest,
    response: Response,
    service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service),
    existing_session: str | None = Cookie(None, alias="session"),
):
    user = service.get_by_identifier(payload.identifier)
    if not user or not verify_password(payload.password, user.hashed_password):
        detail = {"code": "invalid_credentials", "message": "Invalid credentials"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Rotate any existing session for this client.
    from app.core.security import _unsign  # local import to avoid circular

    if existing_session:
        raw = _unsign(existing_session)
        if raw:
            session_service.revoke_session_for_user(user.id, raw)

    session_id = session_service.create_session(user.id)
    set_session_cookie(response, session_id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    session_token: str | None = Cookie(None, alias="session"),
    session_service: SessionService = Depends(get_session_service),
):
    if session_token:
        from app.core.security import _unsign  # local import to avoid circular

        raw = _unsign(session_token)
        if raw:
            session_service.revoke_session_for_user(current_user.id, raw)
    response.delete_cookie(key="session")
    return None


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
