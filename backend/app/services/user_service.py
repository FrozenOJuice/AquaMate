from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def create_user(self, data: UserCreate) -> User:
        return self.repo.create(data)

    def get_user(self, user_id: UUID) -> User | None:
        return self.repo.get(user_id)

    def get_by_email(self, email: str) -> User | None:
        return self.repo.get_by_email(email)

    def get_by_username(self, username: str) -> User | None:
        return self.repo.get_by_username(username)

    def list_users(self, *, limit: int = 100, offset: int = 0) -> list[User]:
        return self.repo.list(limit=limit, offset=offset)

    def update_user(self, user_id: UUID, data: UserUpdate) -> User | None:
        user = self.repo.get(user_id)
        if not user:
            return None
        return self.repo.update(user, data)

    def deactivate_user(self, user_id: UUID) -> User | None:
        user = self.repo.get(user_id)
        if not user:
            return None
        return self.repo.deactivate(user)

    def activate_user(self, user_id: UUID) -> User | None:
        user = self.repo.get(user_id)
        if not user:
            return None
        return self.repo.activate(user)

    def delete_user(self, user_id: UUID) -> bool:
        user = self.repo.get(user_id)
        if not user:
            return False
        self.repo.delete(user)
        return True


# TODO: add uniqueness validation, role-based access checks, and domain errors.
