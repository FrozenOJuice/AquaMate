from fastapi import APIRouter, Depends, status

from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.services.user_service import UserService
from app.db.session import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/password", tags=["password"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.post("/forgot", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    payload: ForgotPasswordRequest,
    service: UserService = Depends(get_user_service),
):
    """
    Placeholder: Issue password reset token via email/SMS.
    """
    # TODO: generate reset token, store it (Redis/DB) with TTL, and send via email/SMS.
    _ = service.get_by_identifier(payload.identifier)  # Lookup to avoid user enumeration changes later.
    return {"message": "If the account exists, a reset link will be sent"}


@router.post("/reset", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def reset_password(
    payload: ResetPasswordRequest,
    service: UserService = Depends(get_user_service),
):
    """
    Placeholder: Consume reset token and set new password.
    """
    # TODO: validate reset token, update hashed password, revoke all sessions, and force re-login.
    return {"message": "Password reset flow not yet implemented"}


# TODO: wire proper dependencies and token persistence when implementing reset flow.
