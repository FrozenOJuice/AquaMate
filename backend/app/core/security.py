import hashlib
import secrets

from .config import get_settings


def hash_password(password: str) -> str:
    """Hash a password with a static salt (demo only; replace for production)."""
    settings = get_settings()
    salted = f"{settings.password_salt}:{password}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def generate_token() -> str:
    return secrets.token_urlsafe(32)
