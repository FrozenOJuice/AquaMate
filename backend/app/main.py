from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings

settings = get_settings()
IS_DEV = settings.environment != "production"

# In production, consider setting docs_url/redoc_url/openapi_url to None to hide docs;
# in development it is convenient to expose them for debugging.
app = FastAPI(
    title="AquaMate API",
    version="0.1.0",
    docs_url="/docs" if IS_DEV else None,
    redoc_url="/redoc" if IS_DEV else None,
    openapi_url="/openapi.json" if IS_DEV else None,
)

# Comma-separated env var of allowed origins; default to "*" for local development.
# In production, tighten this to the UI origin(s) to avoid browsers accepting unwanted origins.
raw_origins = settings.cors_origins
allowed_origins: List[str] = (
    ["*"]
    if raw_origins == "*"
    else [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "environment": settings.environment}




# Future: import routers from app packages (e.g., users) and include them under /api/
# Example: app.include_router(user_router, prefix="/api/users")
# Future production hardening: add request logging middleware, metrics, rate limiting,
# structured error handling, database session lifespan events, and auth (Cookies).
