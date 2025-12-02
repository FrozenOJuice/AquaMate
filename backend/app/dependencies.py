from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.services.password_reset import PasswordResetService
from app.services.reset_token_service import ResetTokenService
from app.services.session_service import SessionService
from app.services.user_service import UserService


def get_session_service() -> SessionService:
    return SessionService(get_settings())


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_reset_token_service() -> ResetTokenService:
    return ResetTokenService(get_settings())


def get_password_reset_service(
    user_service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service),
    token_service: ResetTokenService = Depends(get_reset_token_service),
) -> PasswordResetService:
    return PasswordResetService(user_service, session_service, token_service)
