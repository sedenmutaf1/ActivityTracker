import redis
from fastapi import Request

def get_redis_connection(request: Request) -> redis.Redis:
    return request.app.state.redis