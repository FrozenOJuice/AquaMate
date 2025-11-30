import time
from collections import defaultdict, deque
from threading import Lock
from typing import Callable

from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    """Simple in-memory sliding window rate limiter keyed by a string (e.g., client IP + endpoint)."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str) -> tuple[bool, int | None]:
        """Return (allowed, retry_after_seconds)."""
        now = time.time()
        with self._lock:
            bucket = self._hits[key]
            cutoff = now - self.window_seconds
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                retry_after = max(1, int(self.window_seconds - (now - bucket[0])))
                return False, retry_after
            bucket.append(now)
            return True, None


def make_rate_limit_dependency(limiter: InMemoryRateLimiter, key_prefix: str) -> Callable[[Request], None]:
    def dependency(request: Request) -> None:
        client_host = request.client.host if request.client else "unknown"
        key = f"{key_prefix}:{client_host}"
        allowed, retry_after = limiter.check(key)
        if not allowed:
            headers = {"Retry-After": str(retry_after)} if retry_after is not None else None
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down.",
                headers=headers,
            )

    return dependency
