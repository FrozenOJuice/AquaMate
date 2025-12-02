import json
import secrets
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.core.config import Settings
from app.core.redis_client import redis_client


class ResetTokenService:
    """
    Issue and consume short-lived password reset tokens in Redis.
    """

    RESET_TOKEN_PREFIX = "reset:"

    def __init__(self, settings: Settings, client=redis_client, default_ttl_seconds: int = 3600):
        self.settings = settings
        self.client = client
        self.default_ttl_seconds = default_ttl_seconds

    def create_reset_token(self, user_id: UUID, ttl_seconds: Optional[int] = None) -> str:
        token = secrets.token_urlsafe(32)
        payload = {
            "user_id": str(user_id),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        ttl = ttl_seconds or self.default_ttl_seconds
        self.client.setex(self._reset_key(token), ttl, json.dumps(payload))
        return token

    def consume_reset_token(self, token: str) -> UUID | None:
        raw = self.client.get(self._reset_key(token))
        if not raw:
            return None
        self.client.delete(self._reset_key(token))
        try:
            payload = json.loads(raw)
            return UUID(payload.get("user_id"))
        except (ValueError, TypeError, json.JSONDecodeError):
            return None

    def _reset_key(self, token: str) -> str:
        return f"{self.RESET_TOKEN_PREFIX}{token}"
