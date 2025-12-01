from uuid import UUID

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import Cookie, Depends, HTTPException, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.repositories.user_repo import UserRepository

settings = get_settings()

_pwd_hasher = PasswordHasher()
_session_serializer = URLSafeTimedSerializer(settings.session_secret)
SESSION_COOKIE_NAME = "session"


def hash_password(password: str) -> str:
    """Return a salted Argon2 hash of the password."""
    # TODO: expose argon2 parameters via config and track for rehash needs.
    return _pwd_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a plaintext password against an Argon2 hash."""
    try:
        return _pwd_hasher.verify(hashed_password, password)
    except VerifyMismatchError:
        return False
    except VerificationError:
        return False


def create_session_token(user_id: UUID) -> str:
    """Create a signed session token for a user id."""
    return _session_serializer.dumps(str(user_id))


def verify_session_token(token: str) -> UUID | None:
    """Validate and decode a session token into a user id."""
    try:
        user_id_str = _session_serializer.loads(
            token, max_age=settings.session_max_age_seconds
        )
        return UUID(user_id_str)
    except (BadSignature, SignatureExpired, ValueError):
        return None


def set_session_cookie(response, token: str) -> None:
    """Attach the session cookie to the response."""
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=not settings.debug,
        samesite="lax",
        max_age=settings.session_max_age_seconds,
    )


def get_current_user(
    session_token: str | None = Cookie(None, alias=SESSION_COOKIE_NAME),
    db: Session = Depends(get_db),
):
    """
    Dependency to fetch the current user from a signed session cookie.
    """
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = verify_session_token(session_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = UserRepository(db).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# TODO: set cookie with httponly/secure/samesite flags when issuing session tokens.
