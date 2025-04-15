import json
import base64
import numpy as np
import cv2 as cv2
import os
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


def face_detection(frame):

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    face_cascade = cv2.CascadeClassifier(cascade_path)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    # Convert the result into a serializable format (list of dicts)
    face_list = [{"x": int(x), "y": int(y), "w": int(w), "h": int(h)} for (x, y, w, h) in faces]
    return face_list
