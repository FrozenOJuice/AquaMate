
from functools import lru_cache
from typing import List

from pydantic import BaseModel


class Settings(BaseModel):
    """Runtime configuration for the API."""

    project_name: str = "AquaMate API"
    allowed_origins: List[str] = ["*"]
    api_prefix: str = ""
    debug: bool = True
    password_salt: str = "aquamate-demo-salt"


@lru_cache
def get_settings() -> Settings:
    return Settings()
