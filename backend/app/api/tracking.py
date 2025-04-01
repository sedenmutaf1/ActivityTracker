from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from backend.app.models.activity_models import ActivityData
from datetime import datetime, timezone
import redis
import json
import asyncio
from backend.app.utils.redis_utils import get_redis_connection

router = APIRouter()


# WebSocket endpoint to stream real-time tracking data
@router.websocket("/ws/session/{session_id}/track")
async def track_activity(websocket: WebSocket, session_id: str,
                         redis_conn: redis.Redis = Depends(get_redis_connection)):
    await websocket.accept()
    try:
        while True:
            # Simulate real-time gaze data (replace with actual logic for tracking)
            activity_data = ActivityData(
                timestamp=datetime.now(timezone.utc),  # Use timezone-aware datetime
                gaze_direction="left",  # Example gaze direction
                activity="reading",  # Example activity
                blink_rate=1.5  # Example blink rate
            )

            # Store this activity data in Redis for real-time session tracking
            session_key = f"session:{session_id}:activity"
            activity_data_dict = activity_data.model_dump()  # Use model_dump() instead of dict()

            # Store the activity data in Redis (synchronously offloaded to a thread)
            await asyncio.to_thread(redis_conn.set, session_key, json.dumps(activity_data_dict))

            # Optionally, set a TTL (Time To Live) for the session data in Redis (e.g., 60 seconds)
            await asyncio.to_thread(redis_conn.expire, session_key, 60)  # TTL in seconds (adjust as needed)

            # Send the activity data to the frontend
            await websocket.send_json(activity_data_dict)

    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")


# Optionally, you could add an endpoint to retrieve the latest activity data from Redis
@router.get("/session/{session_id}/latest_activity")
async def get_latest_activity(session_id: str, redis_conn: redis.Redis = Depends(get_redis_connection)):
    session_key = f"session:{session_id}:activity"
    activity_data = await asyncio.to_thread(redis_conn.get, session_key)

    if activity_data:
        return json.loads(activity_data)
    else:
        raise HTTPException(status_code=404, detail="Session activity not found")
