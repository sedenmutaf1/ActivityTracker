from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
import redis
import json
import asyncio
from datetime import datetime, timezone

from backend.app.models.activity_models import ActivityData
from backend.app.utils.redis_utils import get_redis_connection

router = APIRouter()

@router.websocket("/ws/session/{session_id}/track")
async def track_activity(
    websocket: WebSocket,
    session_id: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    WebSocket endpoint to stream real-time tracking data.
    Continuously sends mock activity data to the connected client
    and stores it in Redis.
    """
    await websocket.accept()

    try:
        while True:
            # Simulate real-time gaze data (replace with actual logic)
            activity_data = ActivityData(
                timestamp=datetime.now(timezone.utc),
                gaze_direction="left",
                activity="reading",
                blink_rate=1.5
            )

            # Convert Pydantic model to dict
            activity_data_dict = activity_data.model_dump()

            # Redis key for storing the latest activity data
            session_key = f"session:{session_id}:activity"

            # Store the activity data in Redis (on a background thread)
            await asyncio.to_thread(redis_conn.set, session_key, json.dumps(activity_data_dict))
            # Optional: Set a TTL (Time To Live) if desired
            await asyncio.to_thread(redis_conn.expire, session_key, 60)  # 60 seconds

            # Send data to the WebSocket client
            await websocket.send_json(activity_data_dict)

            # Introduce a short delay so it doesn't spam in a tight loop
            await asyncio.sleep(1.0)

    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")

@router.get("/session/{session_id}/latest_activity", status_code=status.HTTP_200_OK)
async def get_latest_activity(
    session_id: str,
    redis_conn: redis.Redis = Depends(get_redis_connection)
):
    """
    HTTP endpoint to retrieve the most recent activity data for a given session.
    """
    session_key = f"session:{session_id}:activity"
    activity_data_raw = await asyncio.to_thread(redis_conn.get, session_key)

    if not activity_data_raw:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recent activity found for this session"
        )

    activity_data = json.loads(activity_data_raw)

    return {
        "message": "Latest activity retrieved successfully",
        "data": activity_data
    }
