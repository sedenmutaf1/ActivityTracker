# user.py

import uuid
import json
import bcrypt
import redis

from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.models.user_models import UserRegister, UserLogin, UserInfoRequest
from backend.app.utils.redis_utils import get_redis_connection
from backend.app.utils.jwt_utils import jwt_decode
from fastapi import Request

router = APIRouter()

@router.get("/me")
def get_me(
    request: Request,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        payload = jwt_decode(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")

    # Lookup user data (assuming you store by username)
    for key in redis_conn.scan_iter("user:*"):
        user_data = json.loads(redis_conn.get(key))
        if user_data["user_id"] == user_id:
            return {"username": user_data["username"], "user_id": user_id}

    raise HTTPException(status_code=404, detail="User not found")
