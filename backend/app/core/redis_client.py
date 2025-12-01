from redis import Redis

from app.core.config import get_settings

settings = get_settings()

# Simple sync Redis client; consider connection pooling options if needed.
redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
