from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.auth import router as auth_router
from .api.routes.health import router as health_router

from .core.config import get_settings
from .core.errors import register_exception_handlers
from .core.logging import configure_logging, log_requests_middleware

settings = get_settings()

configure_logging()
app = FastAPI(title=settings.project_name, debug=settings.debug)
register_exception_handlers(app)
app.middleware("http")(log_requests_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Welcome to AquaMate API"}
