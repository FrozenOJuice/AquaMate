from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def create_user(self, data: UserCreate) -> User:
        self._ensure_unique(data.email, data.username)
        return self.repo.create(data)

    def get_user(self, user_id: UUID) -> User | None:
        return self.repo.get(user_id)

    def get_by_email(self, email: str) -> User | None:
        return self.repo.get_by_email(email)

    def get_by_username(self, username: str) -> User | None:
        return self.repo.get_by_username(username)

    def _ensure_unique(self, email: str | None = None, username: str | None = None) -> None:
        if email and self.repo.get_by_email(email):
            raise ValueError("Email already in use")
        if username and self.repo.get_by_username(username):
            raise ValueError("Username already in use")


# TODO: add uniqueness validation, role-based access checks, and domain errors.
