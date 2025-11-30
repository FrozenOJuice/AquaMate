from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the API."""

    project_name: str = "AquaMate API"
    allowed_origins: List[str] = ["*"]
    api_prefix: str = ""
    debug: bool = True
    database_url: str = "postgresql+psycopg2://aquamate:aquamate@localhost:5432/aquamate"
    session_secret: str = "change-me"
    session_max_age: int = 60 * 60 * 24 * 7  # 7 days
    password_breach_check_enabled: bool = False
    rate_limit_register_max_requests: int = 5
    rate_limit_register_window_seconds: int = 60
    rate_limit_login_max_requests: int = 10
    rate_limit_login_window_seconds: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
