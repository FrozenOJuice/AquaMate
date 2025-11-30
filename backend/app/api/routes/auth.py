from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...core.config import get_settings
from ...core.database import get_db
from ...core.rate_limit import InMemoryRateLimiter, make_rate_limit_dependency
from ...core.security import ensure_not_breached_password, hash_password, verify_password
from ...core.session import get_session_manager
from ...models import User, UserRole, UserStatus
from ...schemas import AuthResponse, UserCreate, UserLogin, UserPublic
from ...schemas.validators import trim, validate_email, validate_password, validate_username
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

settings = get_settings()
register_rate_limit = make_rate_limit_dependency(
    InMemoryRateLimiter(settings.rate_limit_register_max_requests, settings.rate_limit_register_window_seconds),
    "register",
)
login_rate_limit = make_rate_limit_dependency(
    InMemoryRateLimiter(settings.rate_limit_login_max_requests, settings.rate_limit_login_window_seconds),
    "login",
)


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(register_rate_limit)],
)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserPublic:
    username = validate_username(payload.username)
    email = validate_email(payload.email)
    password = validate_password(payload.password)
    ensure_not_breached_password(password)

    existing_account = db.query(User).filter(or_(User.username == username, User.email == email)).first()
    if existing_account:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account already exists")

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        role=UserRole.APPLICANT,
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


@router.post(
    "/login",
    response_model=AuthResponse,
    dependencies=[Depends(login_rate_limit)],
)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    identifier = trim(payload.username)
    user = db.query(User).filter(or_(User.username == identifier, User.email == identifier)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    session_manager = get_session_manager()
    session_token = session_manager.create_session(user.id)

    response.set_cookie(
        key="session",
        value=session_token,
        max_age=session_manager.max_age,
        httponly=True,
        samesite="lax",
        secure=False,  # flip to True when serving over HTTPS
    )

    token = session_token  # returned for compatibility; cookie is the primary session
    return AuthResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
        token=token,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    # Clear the session cookie
    response.delete_cookie(key="session", httponly=True, samesite="lax", secure=False)
    return None


@router.get("/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        status=current_user.status,
        created_at=current_user.created_at,
    )
