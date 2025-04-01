# session.py

import uuid
import json
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, status
import redis

from backend.app.utils.redis_utils import get_redis_connection

router = APIRouter()

@router.post("/session/start", status_code=status.HTTP_201_CREATED)
async def start_session(
    user_id: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Start a new session for a user.
    Returns HTTP 201 and a simple message if successful.
    """
    session_id = str(uuid.uuid4())
    session_data = {
        "user_id": user_id,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "focus_time": 0,
        "distraction_time": 0,
        "activity_data": {}
    }

    # Store session in Redis
    redis_conn.set(f"session:{session_id}", json.dumps(session_data))

    return {
        "message": "Session started successfully",
        "session_id": session_id
    }


@router.post("/session/end", status_code=status.HTTP_200_OK)
async def end_session(
    session_id: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    End an existing session and return its report.
    """
    session_key = f"session:{session_id}"
    raw_data = redis_conn.get(session_key)

    if not raw_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Session not found"
        )

    session_data = json.loads(raw_data.decode("utf-8"))

    # Example report data
    report_data = {
        "session_id": session_id,
        "focus_time": session_data.get("focus_time", 0),
        "distraction_time": session_data.get("distraction_time", 0),
        "activity_data": session_data.get("activity_data", {})
    }

    # Mark session as completed
    session_data["status"] = "completed"
    session_data["end_time"] = datetime.now(timezone.utc).isoformat()
    session_data["report"] = report_data

    # Update session in Redis
    redis_conn.set(session_key, json.dumps(session_data))

    return {
        "message": "Session ended successfully",
        "report": report_data
    }


@router.get("/session/{session_id}", status_code=status.HTTP_200_OK)
async def get_session(
    session_id: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Retrieve a session by its ID.
    """
    session_key = f"session:{session_id}"
    raw_data = redis_conn.get(session_key)

    if not raw_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Session not found"
        )

    session_data = json.loads(raw_data.decode("utf-8"))
    return {
        "message": "Session retrieved successfully",
        "data": session_data
    }


@router.get("/sessions", status_code=status.HTTP_200_OK)
async def get_sessions(
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Retrieve all sessions (active and completed).
    """
    keys = redis_conn.keys("session:*")
    sessions = []

    for key in keys:
        raw_data = redis_conn.get(key)
        if raw_data:
            sessions.append(json.loads(raw_data.decode("utf-8")))

    return {
        "message": "Sessions retrieved successfully",
        "data": sessions
    }


@router.get("/sessions/user/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_sessions(
    user_id: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    Retrieve all sessions belonging to a specific user.
    """
    keys = redis_conn.keys("session:*")
    user_sessions = []

    for key in keys:
        raw_data = redis_conn.get(key)
        if raw_data:
            session_data = json.loads(raw_data.decode("utf-8"))
            if session_data["user_id"] == user_id:
                user_sessions.append(session_data)

    return {
        "message": f"Sessions for user {user_id} retrieved successfully",
        "data": user_sessions
    }
