from fastapi import APIRouter, Depends, Response, status

from app.core.session import (
    list_sessions,
    revoke_all_sessions,
)
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/")
def list_user_sessions(current_user: User = Depends(get_current_user)):
    """
    Minimal session listing for UI use. Future: include more metadata (UA/IP), pagination, and rotation flags.
    """
    return list_sessions(current_user.id)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
):
    revoke_all_sessions(current_user.id)
    response.delete_cookie(key="session")
    return None


# TODO: add route to revoke a specific session id, and include user-agent/IP metadata in listings.
