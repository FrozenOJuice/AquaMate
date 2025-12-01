import logging
import smtplib
import threading
import time
from email.message import EmailMessage
from typing import Callable
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.models.user import UserStatus
from app.services.user_service import UserService
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.core.session import create_reset_token, consume_reset_token, revoke_all_sessions, create_session
from app.core.security import hash_password, verify_password, set_session_cookie
from app.core.config import get_settings

router = APIRouter(prefix="/password", tags=["password"])
logger = logging.getLogger(__name__)
settings = get_settings()
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


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_reset_token_creator() -> Callable[[UUID], str]:
    return create_reset_token


def get_reset_token_consumer() -> Callable[[str], UUID | None]:
    return consume_reset_token


def _send_email(recipient: str, subject: str, body: str) -> None:
    if not settings.smtp_host:
        logger.warning("SMTP not configured; unable to send email to %s", recipient)
        return
    message = EmailMessage()
    message["From"] = settings.smtp_sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except Exception:
        logger.exception("Failed to send email to %s", recipient)


def _dispatch_reset_token(user, token: str) -> None:
    contact = user.email or user.username
    logger.info("Dispatching password reset token for user_id=%s to %s", user.id, contact)
    channel = "email" if "@" in contact else "sms"
    message = f"Use this code to reset your AquaMate password: {token}"

    def _deliver():
        try:
            logger.info("Sending password reset token via %s to %s", channel, contact)
            if channel == "email":
                _send_email(contact, "Reset your AquaMate password", message)
            else:
                logger.warning("SMS delivery not configured; unable to send reset token to %s", contact)
        except Exception:
            logger.exception("Failed to dispatch reset token for user_id=%s", user.id)

    threading.Thread(target=_deliver, name=f"reset-token-{user.id}", daemon=True).start()


def _record_and_check_limit(key: str, bucket: dict[str, list[float]], limit: int) -> bool:
    now = time.monotonic()
    cutoff = now - _RATE_LIMIT_WINDOW_SECONDS
    with _rate_limit_lock:
        recent = [ts for ts in bucket.get(key, []) if ts >= cutoff]
        recent.append(now)
        bucket[key] = recent
        return len(recent) > limit


def _get_client_ip(request: Request | None) -> str:
    if request and request.client and request.client.host:
        return request.client.host
    return "unknown"


def _record_reset_audit(user_id: UUID, ip: str) -> bool:
    now = time.monotonic()
    cutoff = now - _RESET_ALERT_WINDOW_SECONDS
    key = str(user_id)
    with _rate_limit_lock:
        recent = [ts for ts in _reset_activity.get(key, []) if ts >= cutoff]
        recent.append(now)
        _reset_activity[key] = recent
        return len(recent) >= _RESET_ALERT_THRESHOLD


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    payload: ForgotPasswordRequest,
    service: UserService = Depends(get_user_service),
    issue_reset_token: Callable[[UUID], str] = Depends(get_reset_token_creator),
    request: Request | None = None,
):
    """
    Placeholder: Issue password reset token via email/SMS.
    """
    identifier_key = payload.identifier.lower()
    if _record_and_check_limit(identifier_key, _identifier_attempts, _IDENTIFIER_ATTEMPT_LIMIT):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")

    ip_key = _get_client_ip(request)
    if _record_and_check_limit(ip_key, _ip_attempts, _IP_ATTEMPT_LIMIT):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")

    user = service.get_by_identifier(payload.identifier)
    if not user:
        return {"message": "If the account exists, a reset link will be sent"}

    if user.status != UserStatus.ACTIVE:
        return {"message": "If the account exists, a reset link will be sent"}

    token = issue_reset_token(user.id)
    _dispatch_reset_token(user, token)
    return {"message": "Reset token generated"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: ResetPasswordRequest,
    service: UserService = Depends(get_user_service),
    response: Response = None,
    consume_reset_token_fn: Callable[[str], UUID | None] = Depends(get_reset_token_consumer),
    request: Request | None = None,
):
    """
    Placeholder: Consume reset token and set new password.
    """
    password = payload.new_password
    if len(password) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 12 characters long",
        )

    has_lower = any(ch.islower() for ch in password)
    has_upper = any(ch.isupper() for ch in password)
    has_digit = any(ch.isdigit() for ch in password)
    has_symbol = any(not ch.isalnum() for ch in password)
    if not (has_lower and has_upper and has_digit and has_symbol):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include uppercase, lowercase, number, and symbol characters",
        )

    ip_key = _get_client_ip(request)
    if _record_and_check_limit(ip_key, _reset_attempts, _RESET_ATTEMPT_LIMIT):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many reset attempts")

    user_id = consume_reset_token_fn(payload.token)
    if not user_id:
        logger.warning("Password reset failed: invalid token")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    repo = service.repo
    user = repo.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset request")

    if verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from the current password",
        )

    client_ip = _get_client_ip(request)
    suspicious = _record_reset_audit(user.id, client_ip)
    logger.info(
        "Password reset completed",
        extra={
            "event": "password_reset",
            "user_id": str(user.id),
            "ip": client_ip,
            "suspicious": suspicious,
        },
    )
    if suspicious:
        logger.warning(
            "Suspicious password reset velocity detected",
            extra={"user_id": str(user.id), "ip": client_ip, "reset_count_window": len(_reset_activity[str(user.id)])},
        )
    user.hashed_password = hash_password(password)
    repo.db.add(user)
    repo.db.commit()
    repo.db.refresh(user)

    revoke_all_sessions(user.id)
    if response is not None:
        response.delete_cookie(key="session")
        session_id = create_session(
            user.id,
            user_agent=request.headers.get("user-agent") if request else None,
            ip=_get_client_ip(request),
        )
        set_session_cookie(response, session_id)
        return {"message": "Password updated and you are now signed in."}
    return {"message": "Password updated. Please log in again."}
