from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


# Models are imported in migration env to avoid circular imports during app startup.
