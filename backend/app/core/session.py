import secrets
from uuid import UUID

from app.core.config import get_settings
from app.core.redis_client import redis_client

settings = get_settings()

SESSION_PREFIX = "session:"


def _key(session_id: str) -> str:
    return f"{SESSION_PREFIX}{session_id}"


def create_session(user_id: UUID) -> str:
    session_id = secrets.token_urlsafe(32)
    redis_client.setex(
        _key(session_id),
        settings.session_max_age_seconds,
        str(user_id),
    )
    return session_id


def get_user_id_for_session(session_id: str) -> UUID | None:
    user_id_str = redis_client.get(_key(session_id))
    if not user_id_str:
        return None
    try:
        return UUID(user_id_str)
    except ValueError:
        return None


def revoke_session(session_id: str) -> None:
    redis_client.delete(_key(session_id))
