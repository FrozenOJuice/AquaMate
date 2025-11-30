from functools import lru_cache
from uuid import UUID

from itsdangerous import BadSignature, BadTimeSignature, SignatureExpired, URLSafeTimedSerializer

from .config import get_settings


class SessionManager:
    """Lightweight, signed, cookie-friendly session tokens."""
    def __init__(self, secret_key: str, salt: str = "session", max_age: int = 60 * 60 * 24 * 7):
        self.serializer = URLSafeTimedSerializer(secret_key, salt=salt)
        self.max_age = max_age

    def create_session(self, user_id: UUID) -> str:
        return self.serializer.dumps(str(user_id))

    def verify_session(self, token: str) -> UUID:
        user_id = self.serializer.loads(token, max_age=self.max_age)
        return UUID(user_id)

    def is_valid(self, token: str) -> bool:
        try:
            self.verify_session(token)
            return True
        except (BadSignature, BadTimeSignature, SignatureExpired):
            return False


@lru_cache
def get_session_manager() -> SessionManager:
    settings = get_settings()
    return SessionManager(settings.session_secret, max_age=settings.session_max_age)
