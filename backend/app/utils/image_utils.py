import json
import base64
import numpy as np
import cv2 as cv2
import os
import mediapipe as mp

def decode_base64_image_from_json(json_data: str):
    try:
        data = json.loads(json_data)
        image_data = data["image"]

        # Strip header: "data:image/jpeg;base64,..."
        if "," in image_data:
            image_data = image_data.split(",")[1]

        image_bytes = base64.b64decode(image_data)
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)  # BGR format
        return frame  # NumPy array (H x W x 3)
    except Exception as e:
        print("Error decoding image:", e)
        return None


# Initialize Mediapipe face detection
mp_face = mp.solutions.face_detection
face_detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5)

def face_detection(frame):
    # Convert image to RGB (as Mediapipe expects)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process with Mediapipe
    results = face_detector.process(rgb)

    # Collect bounding boxes for detected faces
    faces = []
    if results.detections:
        for detection in results.detections:
            box = detection.location_data.relative_bounding_box
            ih, iw, _ = frame.shape
            x = int(box.xmin * iw)
            y = int(box.ymin * ih)
            w = int(box.width * iw)
            h = int(box.height * ih)
            faces.append({"x": x, "y": y, "w": w, "h": h})
    return faces
