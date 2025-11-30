
from typing import Dict, Optional

from ..models.user import User


class InMemoryDB:
    """Very lightweight in-memory store for demo and tests."""

    def __init__(self) -> None:
        self.users_by_username: Dict[str, User] = {}
        self.users_by_email: Dict[str, User] = {}

    def add_user(self, user: User) -> User:
        self.users_by_username[user.username] = user
        self.users_by_email[user.email] = user
        return user

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.users_by_username.get(username)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.users_by_email.get(email)

    def reset(self) -> None:
        self.users_by_username.clear()
        self.users_by_email.clear()


db = InMemoryDB()


def get_db() -> InMemoryDB:
    return db
