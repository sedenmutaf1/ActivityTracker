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
    session_id: str
):
    await websocket.accept()
    redis_conn = websocket.app.state.redis

    try:
        while True:
            activity_data = ActivityData(
                timestamp=datetime.now(timezone.utc),
                gaze_direction="left",
                activity="reading",
                blink_rate=1.5
            )

            activity_data_dict = json.loads(activity_data.model_dump_json())

            session_key = f"session:{session_id}:activity"
            await asyncio.to_thread(redis_conn.set, session_key, json.dumps(activity_data_dict))
            await asyncio.to_thread(redis_conn.expire, session_key, 60)

            await websocket.send_json(activity_data_dict)
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
