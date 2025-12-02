import json
import secrets
from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import UUID

from app.core.config import Settings
from app.core.redis_client import redis_client


class SessionService:
    """
    Redis-backed session management.
    """

    SESSION_PREFIX = "session:"
    SESSION_SET_PREFIX = "user_sessions:"

    def __init__(self, settings: Settings, client=redis_client):
        self.settings = settings
        self.client = client

    def create_session(self, user_id: UUID, user_agent: Optional[str] = None, ip: Optional[str] = None) -> str:
        session_id = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc).isoformat()
        metadata = {
            "user_id": str(user_id),
            "created_at": now,
            "issued_at": now,
            "user_agent": user_agent,
            "ip": ip,
            "last_seen": now,
        }
        self.client.setex(
            self._session_key(session_id),
            self.settings.session_max_age_seconds,
            json.dumps(metadata),
        )
        self.client.sadd(self._user_sessions_key(user_id), session_id)
        self.client.expire(self._user_sessions_key(user_id), self.settings.session_max_age_seconds)
        return session_id

    def get_user_id_for_session(self, session_id: str) -> UUID | None:
        raw = self.client.get(self._session_key(session_id))
        if not raw:
            return None
        try:
            payload = json.loads(raw)
            payload["last_seen"] = datetime.now(timezone.utc).isoformat()
            self.client.setex(
                self._session_key(session_id),
                self.settings.session_max_age_seconds,
                json.dumps(payload),
            )
            return UUID(payload.get("user_id"))
        except (ValueError, TypeError, json.JSONDecodeError):
            return None

    def list_sessions(self, user_id: UUID) -> List[Dict[str, Optional[str]]]:
        session_ids = self.client.smembers(self._user_sessions_key(user_id)) or []
        sessions: List[Dict[str, Optional[str]]] = []
        for session_id in session_ids:
            raw = self.client.get(self._session_key(session_id))
            if not raw:
                continue
            try:
                meta = json.loads(raw)
                meta["id"] = session_id
                sessions.append(meta)
            except json.JSONDecodeError:
                continue
        return sessions

    def revoke_session(self, session_id: str) -> None:
        raw = self.client.get(self._session_key(session_id))
        user_id = None
        if raw:
            try:
                user_id = json.loads(raw).get("user_id")
            except json.JSONDecodeError:
                user_id = None
        self.client.delete(self._session_key(session_id))
        if user_id:
            self.client.srem(self._user_sessions_key(UUID(user_id)), session_id)

    def revoke_all_sessions(self, user_id: UUID) -> None:
        session_ids = self.client.smembers(self._user_sessions_key(user_id)) or []
        if session_ids:
            keys = [self._session_key(sid) for sid in session_ids]
            self.client.delete(*keys)
        self.client.delete(self._user_sessions_key(user_id))

    def revoke_session_for_user(self, user_id: UUID, session_id: str) -> bool:
        """
        Revoke a specific session if it belongs to the user.
        """
        raw = self.client.get(self._session_key(session_id))
        if not raw:
            self.client.srem(self._user_sessions_key(user_id), session_id)
            return False
        try:
            payload = json.loads(raw)
            if payload.get("user_id") != str(user_id):
                return False
        except json.JSONDecodeError:
            return False
        self.client.delete(self._session_key(session_id))
        self.client.srem(self._user_sessions_key(user_id), session_id)
        return True

    def _session_key(self, session_id: str) -> str:
        return f"{self.SESSION_PREFIX}{session_id}"

    def _user_sessions_key(self, user_id: UUID) -> str:
        return f"{self.SESSION_SET_PREFIX}{user_id}"
