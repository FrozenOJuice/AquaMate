
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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
