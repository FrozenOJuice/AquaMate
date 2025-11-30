import hashlib
import logging
import secrets
from http import HTTPStatus

import httpx
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import HTTPException

from .config import get_settings

logger = logging.getLogger(__name__)
_hasher = PasswordHasher()  # Uses Argon2id by default

def hash_password(password: str) -> str:
    """Hash a password with Argon2id using per-password salts."""
    return _hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return _hasher.verify(hashed, password)
    except VerifyMismatchError:
        return False


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def ensure_not_breached_password(password: str) -> None:
    """Check password against HIBP k-anonymity API; raise if found or unavailable."""
    settings = get_settings()
    if not settings.password_breach_check_enabled:
        return

    sha1_hash = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1_hash[:5], sha1_hash[5:]
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    headers = {"User-Agent": f"AquaMate/1.0 ({settings.project_name})"}

    try:
        response = httpx.get(url, headers=headers, timeout=5.0)
        response.raise_for_status()
    except Exception as exc:
        logger.warning("Password breach check unavailable", exc_info=exc)
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail="Password validation service is temporarily unavailable. Please try again later.",
        ) from exc

    for line in response.text.splitlines():
        hash_suffix, *_rest = line.split(":")
        if hash_suffix.strip().upper() == suffix:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="Password has appeared in a data breach; choose a different password.",
            )
