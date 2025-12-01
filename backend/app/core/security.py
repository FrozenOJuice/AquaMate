from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

from app.db.session import get_db
from app.repositories.user_repo import UserRepository


_pwd_hasher = PasswordHasher()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Dependency to fetch the current user from an auth token.

    NOTE: This placeholder treats the bearer token as a user UUID. Replace with
    JWT/session validation and proper claims checks for production.
    """
    try:
        user_id = UUID(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = UserRepository(db).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
