import logging
from typing import Callable
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.services.user_service import UserService
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.core.session import create_reset_token, consume_reset_token, revoke_all_sessions
from app.core.security import hash_password

router = APIRouter(prefix="/password", tags=["password"])
logger = logging.getLogger(__name__)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_reset_token_creator() -> Callable[[UUID], str]:
    return create_reset_token


def get_reset_token_consumer() -> Callable[[str], UUID | None]:
    return consume_reset_token


def _dispatch_reset_token(user, token: str) -> None:
    contact = user.email or user.username
    logger.info("Dispatching password reset token for user_id=%s to %s", user.id, contact)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    payload: ForgotPasswordRequest,
    service: UserService = Depends(get_user_service),
    issue_reset_token: Callable[[UUID], str] = Depends(get_reset_token_creator),
):
    """
    Placeholder: Issue password reset token via email/SMS.
    """
    user = service.get_by_identifier(payload.identifier)
    if not user:
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
    user_id = consume_reset_token_fn(payload.token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    repo = service.repo
    user = repo.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset request")

    user.hashed_password = hash_password(payload.new_password)
    repo.db.add(user)
    repo.db.commit()
    repo.db.refresh(user)

    revoke_all_sessions(user.id)
    if response is not None:
        response.delete_cookie(key="session")
    return {"message": "Password updated. Please log in again."}
