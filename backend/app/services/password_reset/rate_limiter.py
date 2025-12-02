import threading
import time


class SlidingWindowRateLimiter:
    """
    In-memory sliding window limiter for arbitrary keys.
    """

    def __init__(self, window_seconds: int):
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._buckets: dict[str, list[float]] = {}

    def exceeded(self, key: str, limit: int) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        with self._lock:
            recent = [ts for ts in self._buckets.get(key, []) if ts >= cutoff]
            recent.append(now)
            self._buckets[key] = recent
            return len(recent) > limit
