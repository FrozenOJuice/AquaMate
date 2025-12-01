from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


settings = get_settings()

# Future: consider async engine/session if moving to async DB drivers.
engine = create_engine(
    settings.database_url or "sqlite:///./app.db",
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """FastAPI dependency that yields a session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# TODO: add engine disposal hooks on shutdown and pool sizing tuned per deployment.
