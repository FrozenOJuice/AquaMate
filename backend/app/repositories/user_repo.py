from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: UserCreate) -> User:
        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
            role=data.role,
            status=data.status,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get(self, user_id: UUID) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def list(self, *, limit: int = 100, offset: int = 0) -> list[User]:
        return (
            self.db.query(User)
            .order_by(User.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    # TODO: add queries by role/status and password rehash handling if parameters change.
