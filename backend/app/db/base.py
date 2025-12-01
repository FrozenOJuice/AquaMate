from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


# TODO: import new models here so Alembic autogenerate picks them up.
from app.models.user import User
