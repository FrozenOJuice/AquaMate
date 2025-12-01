from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import get_current_user
from app.dependencies import get_session_service
from app.models.user import User
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/")
def list_user_sessions(
    current_user: User = Depends(get_current_user),
    session_service: SessionService = Depends(get_session_service),
):
    """
    Minimal session listing for UI use. Future: include more metadata (UA/IP), pagination, and rotation flags.
    """
    return session_service.list_sessions(current_user.id)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    session_service: SessionService = Depends(get_session_service),
):
    session_service.revoke_all_sessions(current_user.id)
    response.delete_cookie(key="session")
    return None


@router.post("/revoke", status_code=status.HTTP_204_NO_CONTENT)
def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    session_service: SessionService = Depends(get_session_service),
):
    ok = session_service.revoke_session_for_user(current_user.id, session_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return None


# TODO: add route to revoke a specific session id, and include user-agent/IP metadata in listings.
