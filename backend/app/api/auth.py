# user.py

import uuid
import json
import redis

from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.models.user_models import UserRegister, UserLogin
from backend.app.utils.redis_utils import get_redis_connection
from backend.app.utils.hash_utils import hash_password, check_password
from backend.app.models.user_models import ForgotPassword, ResetPassword
from backend.app.utils.token_utils import generate_reset_token, hash_token
from backend.app.utils.mailer import send_password_reset_email
from backend.app.utils.jwt_utils import create_access_token
from fastapi import Response

router = APIRouter(prefix="/auth")
ACCESS_TOKEN_EXPIRE_MINUTES = 15

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    request: UserRegister,
    response: Response,
    redis_conn: redis.Redis = Depends(get_redis_connection)
    
):
    user_id = str(uuid.uuid4())
    user_key = f"user:{request.username}"
    email_key = f"email:{request.email.lower()}"

    # Check if username or email already exists
    if redis_conn.exists(user_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    if redis_conn.exists(email_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )

    # Prepare user data
    user_data = {
        "user_id": user_id,
        "username": request.username,
        "password": hash_password(request.password),
        "email": request.email,
        "created_at": request.created_at.isoformat()
    }

    # Save user and email mapping
    redis_conn.set(user_key, json.dumps(user_data))
    redis_conn.set(email_key, request.username)


    access_token = create_access_token({"sub": user_id})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="Strict",
        max_age=60 * 15,
        path="/"
    )


    return {
        "message": "User registered successfully",
    }


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(
    request: UserLogin,
    response: Response,
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
    
    access_token = create_access_token({"sub": user_data["user_id"]})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="Strict",
        max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES,
        path="/"
    )

    return {
        "message": "Login successful",
    }

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: ForgotPassword,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Forgot password functionality.
    Returns a status code 200 and a JSON message on success.
    """
    email_key = f"email:{request.email.lower()}"
    username = redis_conn.get(email_key)
    if not username:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Email not found"
      )
  
    username = username.decode("utf-8")
    user_key = f"user:{username}"
    user_data_raw = redis_conn.get(user_key)
    if not user_data_raw:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
      )

    token = generate_reset_token()
    hashed_token = hash_token(token)
    redis_conn.set(f"reset_token:{hashed_token}", username, ex=3600)
    send_password_reset_email(request.email, token)
    
    user_data = json.loads(user_data_raw.decode("utf-8"))
    return {
        "message": "Password reset email sent",
        "user_id": user_data["user_id"],
        "username": user_data["username"],
        "email": user_data["email"]
    }

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request: ResetPassword,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Reset password functionality.
    Returns a status code 200 and a JSON message on success.
    """
    hashed_token = hash_token(request.token)
    username = redis_conn.get(f"reset_token:{hashed_token}")
    if not username:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired token"
      )
    
    username = username.decode("utf-8")
    user_key = f"user:{username}"
    user_data_raw = redis_conn.get(user_key)
    if not user_data_raw:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
      )
    
    user_data = json.loads(user_data_raw.decode("utf-8"))
    user_data["password"] = hash_password(request.new_password)
    redis_conn.set(user_key, json.dumps(user_data))
    redis_conn.delete(f"reset_token:{hashed_token}")
    return {
        "message": "Password reset successfully",
        "user_id": user_data["user_id"],
        "username": user_data["username"],
        "email": user_data["email"]
    }