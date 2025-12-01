import json
import secrets
from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import UUID

from app.core.config import get_settings
from app.core.redis_client import redis_client

settings = get_settings()

SESSION_PREFIX = "session:"
SESSION_SET_PREFIX = "user_sessions:"


def _session_key(session_id: str) -> str:
    return f"{SESSION_PREFIX}{session_id}"


def _user_sessions_key(user_id: UUID) -> str:
    return f"{SESSION_SET_PREFIX}{user_id}"


def create_session(user_id: UUID, user_agent: Optional[str] = None, ip: Optional[str] = None) -> str:
    session_id = secrets.token_urlsafe(32)
    metadata = {
        "user_id": str(user_id),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "user_agent": user_agent,
        "ip": ip,
        "last_seen": datetime.now(timezone.utc).isoformat(),
    }
    redis_client.setex(
        _session_key(session_id),
        settings.session_max_age_seconds,
        json.dumps(metadata),
    )
    redis_client.sadd(_user_sessions_key(user_id), session_id)
    redis_client.expire(_user_sessions_key(user_id), settings.session_max_age_seconds)
    return session_id


def get_user_id_for_session(session_id: str) -> UUID | None:
    raw = redis_client.get(_session_key(session_id))
    if not raw:
        return None
    try:
        payload = json.loads(raw)
        # update last_seen
        payload["last_seen"] = datetime.now(timezone.utc).isoformat()
        redis_client.setex(
            _session_key(session_id),
            settings.session_max_age_seconds,
            json.dumps(payload),
        )
        return UUID(payload.get("user_id"))
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


def list_sessions(user_id: UUID) -> List[Dict[str, Optional[str]]]:
    session_ids = redis_client.smembers(_user_sessions_key(user_id)) or []
    sessions: List[Dict[str, Optional[str]]] = []
    for session_id in session_ids:
        raw = redis_client.get(_session_key(session_id))
        if not raw:
            continue
        try:
            meta = json.loads(raw)
            meta["id"] = session_id
            sessions.append(meta)
        except json.JSONDecodeError:
            continue
    return sessions


def revoke_session(session_id: str) -> None:
    raw = redis_client.get(_session_key(session_id))
    user_id = None
    if raw:
        try:
            user_id = json.loads(raw).get("user_id")
        except json.JSONDecodeError:
            user_id = None
    redis_client.delete(_session_key(session_id))
    if user_id:
        redis_client.srem(_user_sessions_key(UUID(user_id)), session_id)


def revoke_all_sessions(user_id: UUID) -> None:
    session_ids = redis_client.smembers(_user_sessions_key(user_id)) or []
    if session_ids:
        keys = [_session_key(sid) for sid in session_ids]
        redis_client.delete(*keys)
    redis_client.delete(_user_sessions_key(user_id))


def revoke_session_for_user(user_id: UUID, session_id: str) -> bool:
    """
    Revoke a specific session if it belongs to the user.
    """
    raw = redis_client.get(_session_key(session_id))
    if not raw:
        redis_client.srem(_user_sessions_key(user_id), session_id)
        return False
    try:
        payload = json.loads(raw)
        if payload.get("user_id") != str(user_id):
            return False
    except json.JSONDecodeError:
        return False
    redis_client.delete(_session_key(session_id))
    redis_client.srem(_user_sessions_key(user_id), session_id)
    return True
