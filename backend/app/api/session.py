import redis
from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.session_models import SessionStartRequest, SessionStartResponse, SessionEndRequest, \
    SessionReport
from backend.app.utils.redis_utils import get_redis_connection
import uuid
import json
from datetime import datetime, timezone

router = APIRouter()


# Start a new session
@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(request: SessionStartRequest, redis_conn: redis.Redis = Depends(get_redis_connection)):
    session_id = str(uuid.uuid4())  # Generate a unique session ID
    session_data = {
        "user_id": request.user_id,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "focus_time": 0,  # Placeholder value for focus time
        "distraction_time": 0,  # Placeholder value for distraction time
        "activity_data": {}  # Empty dict to store activity types
    }
    # Save the session data in Redis
    await redis_conn.set(f"session:{session_id}", json.dumps(session_data))
    return SessionStartResponse(session_id=session_id, status="started")


# End the current session
@router.post("/session/end", response_model=SessionReport)
async def end_session(request: SessionEndRequest, redis_conn: redis.Redis = Depends(get_redis_connection)):
    session_key = f"session:{request.session_id}"
    session_data = await redis_conn.get(session_key)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    session_data = json.loads(session_data.decode("utf-8"))

    # Example: Calculate session stats (update with real focus and distraction time)
    # Assuming focus_time and distraction_time were updated during tracking
    session_report = {
        "session_id": request.session_id,
        "focus_time": session_data["focus_time"],  # Focus time from stored data
        "distraction_time": session_data["distraction_time"],  # Distraction time from stored data
        "session_report": session_data["activity_data"]  # Example: Activity breakdown (reading, browsing, etc.)
    }

    # Update the session data with end time and status
    session_data["end_time"] = datetime.now(timezone.utc).isoformat()
    session_data["status"] = "completed"
    session_data["report"] = session_report

    # Save the updated session data back to Redis
    await redis_conn.set(session_key, json.dumps(session_data))  # Persist updated session data

    return SessionReport(**session_report)


# Get session status
@router.get("/session/{session_id}")
async def get_session(session_id: str, redis_conn: redis.Redis = Depends(get_redis_connection)):
    session_data = await redis_conn.get(f"session:{session_id}")
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    return json.loads(session_data)


# Get all sessions (active and completed)
@router.get("/sessions")
async def get_sessions(redis_conn: redis.Redis = Depends(get_redis_connection)):
    keys = await redis_conn.keys("session:*")
    sessions = [json.loads(await redis_conn.get(key)) for key in keys if await redis_conn.get(key)]
    return sessions
