import json
import logging
import time
import uuid

from fastapi import Request


def configure_logging() -> None:
    # Keep simple JSON lines; avoid leaking sensitive headers/bodies.
    logging.basicConfig(level=logging.INFO, format="%(message)s")


def _serialize(payload: dict) -> str:
    return json.dumps(payload, separators=(",", ":"))


async def log_requests_middleware(request: Request, call_next):
    logger = logging.getLogger("aquamate.request")
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.exception(
            _serialize(
                {
                    "event": "request_error",
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "client_ip": client_ip,
                    "user_agent": ua,
                }
            )
        )
        raise

    duration_ms = int((time.perf_counter() - start) * 1000)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        _serialize(
            {
                "event": "request",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client_ip": client_ip,
                "user_agent": ua,
            }
        )
    )
    return response
