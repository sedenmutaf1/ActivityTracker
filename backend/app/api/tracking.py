from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from PIL import Image
import io
import base64
import numpy as np
import cv2
from backend.app.utils.image_utils import decode_base64_image_from_json, face_detection
router = APIRouter()

@router.websocket("/ws/session/{session_id}/track")
async def track_session(session_id: str, websocket: WebSocket):
    await websocket.accept()
    print(f"📡 WebSocket connected for session {session_id}")

    try:
        while True:
            data = await websocket.receive_text()

            decoded = decode_base64_image_from_json(data)
            if decoded is not None:

                faces = face_detection(decoded)

                await websocket.send_json({
                    "type": "face_detection",
                    "faces": faces
                })
            else:
                print("❌ Could not decode image")

    except WebSocketDisconnect:
        print(f"❌ WebSocket disconnected for session {session_id}")
