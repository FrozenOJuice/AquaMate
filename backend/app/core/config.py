from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Change stuff in .env to configure.
class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = True
    database_url: Optional[str] = None
    cors_origins: str = "*"  # Comma-separated; tighten in production.

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
