import threading
import time
from uuid import UUID


class ResetAuditTracker:
    """
    Tracks reset velocity per user to flag suspicious activity.
    """

    def __init__(self, window_seconds: int, threshold: int):
        self.window_seconds = window_seconds
        self.threshold = threshold
        self._lock = threading.Lock()
        self._activity: dict[str, list[float]] = {}

    def record(self, user_id: UUID, ip: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        key = str(user_id)
        with self._lock:
            recent = [ts for ts in self._activity.get(key, []) if ts >= cutoff]
            recent.append(now)
            self._activity[key] = recent
            return len(recent) >= self.threshold

    def count_for(self, user_id: UUID) -> int:
        return len(self._activity.get(str(user_id), []))
