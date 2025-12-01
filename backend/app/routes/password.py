from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.security import set_session_cookie
from app.dependencies import get_password_reset_service
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.services.password_reset_service import (
    InvalidResetTokenError,
    PasswordResetService,
    PasswordReuseError,
    RateLimitError,
)

router = APIRouter(prefix="/password", tags=["password"])


def _get_client_ip(request: Request | None) -> str:
    if request and request.client and request.client.host:
        return request.client.host
    return "unknown"


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    payload: ForgotPasswordRequest,
    reset_service: PasswordResetService = Depends(get_password_reset_service),
    request: Request | None = None,
):
    """
    Issue password reset token via email/SMS without leaking account existence.
    """
    try:
        found_user = reset_service.initiate_reset(payload.identifier, client_ip=_get_client_ip(request))
    except RateLimitError:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")

    if found_user:
        return {"message": "Reset token generated"}
    return {"message": "If the account exists, a reset link will be sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: ResetPasswordRequest,
    reset_service: PasswordResetService = Depends(get_password_reset_service),
    response: Response | None = None,
    request: Request | None = None,
):
    """
    Consume reset token, set new password, and optionally sign the user back in.
    """
    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent") if request else None

    try:
        result = reset_service.complete_reset(
            payload.token,
            payload.new_password,
            client_ip=client_ip,
            user_agent=user_agent,
        )
    except RateLimitError:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many reset attempts")
    except InvalidResetTokenError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    except PasswordReuseError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from the current password",
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    if response is not None and result.session_id:
        response.delete_cookie(key="session")
        set_session_cookie(response, result.session_id)
        return {"message": "Password updated and you are now signed in."}
    return {"message": "Password updated. Please log in again."}
