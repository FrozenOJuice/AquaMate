from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


# Import models here so Alembic autogenerate picks them up.
from app.models.user import User
