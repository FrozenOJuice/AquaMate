import logging
from dataclasses import dataclass
from typing import Callable, Optional
from uuid import UUID

from app.core.config import get_settings
from app.core.security import verify_password
from app.models.user import User, UserStatus
from app.schemas import validators
from app.services.reset_token_service import ResetTokenService
from app.services.session_service import SessionService
from app.services.user_service import UserService
from app.services.password_reset.audit import ResetAuditTracker
from app.services.password_reset.notifier import ResetNotifier
from app.services.password_reset.rate_limiter import SlidingWindowRateLimiter

logger = logging.getLogger(__name__)


class RateLimitError(Exception):
    """Raised when a rate limit bucket is exceeded."""


class InvalidResetTokenError(Exception):
    """Raised when reset token is invalid or expired."""


class PasswordReuseError(Exception):
    """Raised when a new password matches the current one."""


@dataclass
class PasswordResetResult:
    session_id: str | None
    suspicious: bool


class PasswordResetService:
    _RATE_LIMIT_WINDOW_SECONDS = 300
    _IDENTIFIER_ATTEMPT_LIMIT = 5
    _IP_ATTEMPT_LIMIT = 20
    _RESET_ATTEMPT_LIMIT = 20
    _RESET_ALERT_WINDOW_SECONDS = 3600
    _RESET_ALERT_THRESHOLD = 3

    def __init__(
        self,
        user_service: UserService,
        session_service: SessionService,
        token_service: ResetTokenService,
        send_email_fn: Optional[Callable[[str, str, str], None]] = None,
    ):
        self.user_service = user_service
        self.session_service = session_service
        self.token_service = token_service
        self.settings = get_settings()
        self.rate_limiter = SlidingWindowRateLimiter(self._RATE_LIMIT_WINDOW_SECONDS)
        self.reset_auditor = ResetAuditTracker(
            self._RESET_ALERT_WINDOW_SECONDS,
            self._RESET_ALERT_THRESHOLD,
        )
        self.notifier = ResetNotifier(self.settings, send_email_fn)

    def initiate_reset(self, identifier: str, client_ip: str | None = None) -> bool:
        identifier_key = identifier.lower()
        self._enforce_rate_limit(identifier_key, self._IDENTIFIER_ATTEMPT_LIMIT)
        self._enforce_rate_limit(client_ip or "unknown", self._IP_ATTEMPT_LIMIT)

        user = self.user_service.get_by_identifier(identifier)
        if not user or user.status != UserStatus.ACTIVE:
            return False

        token = self.token_service.create_reset_token(user.id)
        self.notifier.dispatch(user, token)
        return True

    def complete_reset(
        self,
        token: str,
        new_password: str,
        client_ip: str | None = None,
        user_agent: str | None = None,
    ) -> PasswordResetResult:
        validators.validate_password(new_password)

        self._enforce_rate_limit(client_ip or "unknown", self._RESET_ATTEMPT_LIMIT)

        user_id = self.token_service.consume_reset_token(token)
        if not user_id:
            logger.warning("Password reset failed: invalid token")
            raise InvalidResetTokenError()

        user = self.user_service.repo.get(user_id)
        if not user:
            raise InvalidResetTokenError()

        if verify_password(new_password, user.hashed_password):
            raise PasswordReuseError()

        suspicious = self.reset_auditor.record(user.id, client_ip or "unknown")
        logger.info(
            "Password reset completed",
            extra={
                "event": "password_reset",
                "user_id": str(user.id),
                "ip": client_ip or "unknown",
                "suspicious": suspicious,
            },
        )
        if suspicious:
            logger.warning(
                "Suspicious password reset velocity detected",
                extra={
                    "user_id": str(user.id),
                    "ip": client_ip or "unknown",
                    "reset_count_window": self.reset_auditor.count_for(user.id),
                },
            )

        self._update_password(user, new_password)
        self.session_service.revoke_all_sessions(user.id)
        session_id = self.session_service.create_session(
            user.id,
            user_agent=user_agent,
            ip=client_ip,
        )
        return PasswordResetResult(session_id=session_id, suspicious=suspicious)

    def _update_password(self, user: User, new_password: str) -> User:
        return self.user_service.set_password(user, new_password)

    def _enforce_rate_limit(self, key: str, limit: int) -> None:
        if self.rate_limiter.exceeded(key, limit):
            raise RateLimitError()
