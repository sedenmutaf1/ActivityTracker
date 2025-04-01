# user.py

import uuid
import json
import bcrypt
import redis

from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.models.user_models import UserRegister, UserLogin
from backend.app.utils.redis_utils import get_redis_connection

router = APIRouter()

# Utility function to hash password using bcrypt
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

# Utility function to check hashed password
def check_password(hashed_password: str, candidate_password: str) -> bool:
    return bcrypt.checkpw(candidate_password.encode("utf-8"), hashed_password.encode("utf-8"))

@router.post("/users/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    request: UserRegister,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Register a new user in Redis, storing a hashed password.
    Returns a status code 201 and a JSON message on success.
    """
    user_id = str(uuid.uuid4())
    user_key = f"user:{request.username}"

    # Check if user already exists
    if redis_conn.exists(user_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Prepare user data
    user_data = {
        "user_id": user_id,
        "username": request.username,
        "password": hash_password(request.password),
        "email": request.email,
        "created_at": request.created_at.isoformat()
    }

    # Save user data in Redis
    redis_conn.set(user_key, json.dumps(user_data))

    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "username": request.username,
        "email": request.email
    }

@router.post("/users/login", status_code=status.HTTP_200_OK)
async def login_user(
    request: UserLogin,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Log in an existing user by verifying credentials against Redis.
    Returns a status code 200 and a JSON message on success.
    """
    user_key = f"user:{request.username}"

    user_data_raw = redis_conn.get(user_key)
    if not user_data_raw:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user_data = json.loads(user_data_raw.decode("utf-8"))

    # Check the hashed password
    if not check_password(user_data["password"], request.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    return {
        "message": "Login successful",
        "user_id": user_data["user_id"],
        "username": user_data["username"],
        "email": user_data["email"]
    }

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
