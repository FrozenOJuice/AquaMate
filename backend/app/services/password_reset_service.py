import logging
import threading
import time
from dataclasses import dataclass
from typing import Callable, Optional
from uuid import UUID

from app.core.config import get_settings
from app.core.security import verify_password
from app.models.user import User, UserStatus
from app.schemas import validators
from app.services.session_service import SessionService
from app.services.user_service import UserService

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

    _rate_limit_lock = threading.Lock()
    _identifier_attempts: dict[str, list[float]] = {}
    _ip_attempts: dict[str, list[float]] = {}
    _reset_attempts: dict[str, list[float]] = {}
    _reset_activity: dict[str, list[float]] = {}

    def __init__(
        self,
        user_service: UserService,
        session_service: SessionService,
        send_email_fn: Optional[Callable[[str, str, str], None]] = None,
    ):
        self.user_service = user_service
        self.session_service = session_service
        self.settings = get_settings()
        self._send_email_fn = send_email_fn or self._send_email

    def initiate_reset(self, identifier: str, client_ip: str | None = None) -> bool:
        identifier_key = identifier.lower()
        if self._record_and_check_limit(identifier_key, self._identifier_attempts, self._IDENTIFIER_ATTEMPT_LIMIT):
            raise RateLimitError()

        if self._record_and_check_limit(client_ip or "unknown", self._ip_attempts, self._IP_ATTEMPT_LIMIT):
            raise RateLimitError()

        user = self.user_service.get_by_identifier(identifier)
        if not user or user.status != UserStatus.ACTIVE:
            return False

        token = self.session_service.create_reset_token(user.id)
        self._dispatch_reset_token(user, token)
        return True

    def complete_reset(
        self,
        token: str,
        new_password: str,
        client_ip: str | None = None,
        user_agent: str | None = None,
    ) -> PasswordResetResult:
        validators.validate_password(new_password)

        if self._record_and_check_limit(client_ip or "unknown", self._reset_attempts, self._RESET_ATTEMPT_LIMIT):
            raise RateLimitError()

        user_id = self.session_service.consume_reset_token(token)
        if not user_id:
            logger.warning("Password reset failed: invalid token")
            raise InvalidResetTokenError()

        user = self.user_service.repo.get(user_id)
        if not user:
            raise InvalidResetTokenError()

        if verify_password(new_password, user.hashed_password):
            raise PasswordReuseError()

        suspicious = self._record_reset_audit(user.id, client_ip or "unknown")
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
                    "reset_count_window": len(self._reset_activity[str(user.id)]),
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

    def _dispatch_reset_token(self, user: User, token: str) -> None:
        contact = user.email or user.username
        logger.info("Dispatching password reset token for user_id=%s to %s", user.id, contact)
        channel = "email" if "@" in contact else "sms"
        message = f"Use this code to reset your AquaMate password: {token}"

        def _deliver():
            try:
                logger.info("Sending password reset token via %s to %s", channel, contact)
                if channel == "email":
                    self._send_email_fn(contact, "Reset your AquaMate password", message)
                else:
                    logger.warning("SMS delivery not configured; unable to send reset token to %s", contact)
            except Exception:
                logger.exception("Failed to dispatch reset token for user_id=%s", user.id)

        threading.Thread(target=_deliver, name=f"reset-token-{user.id}", daemon=True).start()

    def _send_email(self, recipient: str, subject: str, body: str) -> None:
        if not self.settings.smtp_host:
            logger.warning("SMTP not configured; unable to send email to %s", recipient)
            return
        import smtplib
        from email.message import EmailMessage

        message = EmailMessage()
        message["From"] = self.settings.smtp_sender
        message["To"] = recipient
        message["Subject"] = subject
        message.set_content(body)
        try:
            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port, timeout=10) as server:
                if self.settings.smtp_use_tls:
                    server.starttls()
                if self.settings.smtp_username and self.settings.smtp_password:
                    server.login(self.settings.smtp_username, self.settings.smtp_password)
                server.send_message(message)
        except Exception:
            logger.exception("Failed to send email to %s", recipient)

    def _record_and_check_limit(self, key: str, bucket: dict[str, list[float]], limit: int) -> bool:
        now = time.monotonic()
        cutoff = now - self._RATE_LIMIT_WINDOW_SECONDS
        with self._rate_limit_lock:
            recent = [ts for ts in bucket.get(key, []) if ts >= cutoff]
            recent.append(now)
            bucket[key] = recent
            return len(recent) > limit

    def _record_reset_audit(self, user_id: UUID, ip: str) -> bool:
        now = time.monotonic()
        cutoff = now - self._RESET_ALERT_WINDOW_SECONDS
        key = str(user_id)
        with self._rate_limit_lock:
            recent = [ts for ts in self._reset_activity.get(key, []) if ts >= cutoff]
            recent.append(now)
            self._reset_activity[key] = recent
            return len(recent) >= self._RESET_ALERT_THRESHOLD
