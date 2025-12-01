import logging
import threading
import time
from typing import Callable
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.models.user import UserStatus
from app.services.user_service import UserService
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.core.session import create_reset_token, consume_reset_token, revoke_all_sessions
from app.core.security import hash_password

router = APIRouter(prefix="/password", tags=["password"])
logger = logging.getLogger(__name__)
_RATE_LIMIT_WINDOW_SECONDS = 300
_IDENTIFIER_ATTEMPT_LIMIT = 5
_IP_ATTEMPT_LIMIT = 20
_rate_limit_lock = threading.Lock()
_identifier_attempts: dict[str, list[float]] = {}
_ip_attempts: dict[str, list[float]] = {}


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_reset_token_creator() -> Callable[[UUID], str]:
    return create_reset_token


def get_reset_token_consumer() -> Callable[[str], UUID | None]:
    return consume_reset_token


def _dispatch_reset_token(user, token: str) -> None:
    contact = user.email or user.username
    logger.info("Dispatching password reset token for user_id=%s to %s", user.id, contact)
    channel = "email" if "@" in contact else "sms"
    message = f"Use this code to reset your AquaMate password: {token}"

    def _deliver():
        try:
            logger.info("Sending password reset token via %s to %s", channel, contact)
            logger.debug("Password reset token payload for %s: %s", contact, message)
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
):
    """
    Placeholder: Consume reset token and set new password.
    """
    # TODO: enforce password policy (length/complexity) and reuse checks.
    user_id = consume_reset_token_fn(payload.token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    repo = service.repo
    user = repo.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset request")

    # TODO: audit log password reset and surface suspicious activity alerts.
    user.hashed_password = hash_password(payload.new_password)
    repo.db.add(user)
    repo.db.commit()
    repo.db.refresh(user)

    revoke_all_sessions(user.id)
    if response is not None:
        response.delete_cookie(key="session")
        # TODO: optionally issue a fresh session after reset to streamline UX.
    return {"message": "Password updated. Please log in again."}
