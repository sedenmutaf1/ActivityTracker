from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from PIL import Image
import io
import base64
import numpy as np
import cv2
from backend.app.utils.image_utils import decode_base64_image_from_json, detect_faces_and_gaze
router = APIRouter()

@router.websocket("/ws/session/{session_id}/track")
async def track_session(session_id: str, websocket: WebSocket):
    print("WebSocket handler called for session", session_id)
    try:
        await websocket.accept()
        print(f"📡 WebSocket connected for session {session_id}")

        try:
            while True:
                try:
                    data = await websocket.receive_text()
                    

                    decoded = decode_base64_image_from_json(data)
                    if decoded is not None:

                        result= detect_faces_and_gaze(decoded)
                        gaze = result["gaze"]
                        face_box = result["face_box"]   

                        await websocket.send_json({
                            "gaze": gaze,
                            "face": face_box 
                        })

                    else:
                        print("❌ Could not decode image")

                except Exception as e:
                    print(f"❌ Error processing frame: {e}")
                    await websocket.send_json({"error": str(e)})
                    continue

        except WebSocketDisconnect:
            print(f"❌ WebSocket disconnected for session {session_id}")

    except Exception as e:
        print(f"❌ Error in WebSocket handler for session {session_id}: {e}")
        await websocket.close(code=1011, reason="Internal server error")

