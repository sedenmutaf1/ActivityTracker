# user.py

import uuid
import json
import bcrypt
import redis

from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.models.user_models import UserRegister, UserLogin
from backend.app.utils.redis_utils import get_redis_connection

router = APIRouter()


@router.get("/users/{username}", status_code=status.HTTP_200_OK)
async def get_user(
    username: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Retrieve user information by username from Redis.
    Returns a status code 200 and a JSON message on success.
    """
    user_key = f"user:{username}"

    user_data_raw = redis_conn.get(user_key)
    if not user_data_raw:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user_data = json.loads(user_data_raw.decode("utf-8"))

    return {
        "message": "User retrieved successfully",
        "user_id": user_data["user_id"],
        "username": user_data["username"],
        "email": user_data["email"]
    }
