from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Change stuff in .env to configure.
# TODO: enforce required settings (e.g., database_url, secrets) when environment is production.
class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = True
    database_url: Optional[str] = None
    cors_origins: str = "*"  # Comma-separated; tighten in production.
    session_secret: str = "change-me"  # TODO: set a strong secret in production.
    session_signing_secret: str = "change-me-too"  # Used for signing session cookies.
    session_max_age_seconds: int = 60 * 60 * 24 * 7  # 7 days
    redis_url: str = "redis://redis:6379/0"
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_sender: str = "no-reply@aquamate.local"
    smtp_use_tls: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Singleton settings instance so configuration remains stable."""
    return Settings()


# Future: extend with auth keys, SMTP, S3, telemetry toggles, etc.
