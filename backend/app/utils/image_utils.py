import json
import base64
import numpy as np
import cv2
import mediapipe as mp

# === Yüz kutusu için setup ===
mp_face = mp.solutions.face_detection
face_detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5)

# === Gaze için setup ===
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def decode_base64_image_from_json(json_data: str):
    try:
        data = json.loads(json_data)
        image_data = data["image"]
        if "," in image_data:
            image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        return cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    except Exception as e:
        print("Error decoding image:", e)
        return None

def face_detection_box(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_detector.process(rgb)
    if results.detections:
        ih, iw, _ = frame.shape
        det = results.detections[0]
        box = det.location_data.relative_bounding_box
        x = int(box.xmin * iw)
        y = int(box.ymin * ih)
        w = int(box.width * iw)
        h = int(box.height * ih)
        return {"x": x, "y": y, "w": w, "h": h}
    return None

def calculate_gaze_direction(face_landmarks, image_width, image_height):
    def to_px(lm): return np.array([lm.x * image_width, lm.y * image_height])

    l_iris = to_px(face_landmarks.landmark[468])
    r_iris = to_px(face_landmarks.landmark[473])
    l_inner, l_outer = to_px(face_landmarks.landmark[133]), to_px(face_landmarks.landmark[33])
    r_inner, r_outer = to_px(face_landmarks.landmark[362]), to_px(face_landmarks.landmark[263])
    l_upper, l_lower = to_px(face_landmarks.landmark[159]), to_px(face_landmarks.landmark[145])
    r_upper, r_lower = to_px(face_landmarks.landmark[386]), to_px(face_landmarks.landmark[374])

    def normalized_horizontal_position(iris, inner, outer):
        eye_vec = outer - inner
        eye_length = np.linalg.norm(eye_vec)
        if eye_length == 0:
            return 0.0
        relative_iris_pos = np.dot(iris - inner, eye_vec) / eye_length
        return (relative_iris_pos / eye_length)*2 - 1  # range [-1, 1]

    def vertical_ratio(iris, upper, lower):
        dist_total = np.linalg.norm(upper - lower)
        return np.linalg.norm(iris - upper) / dist_total if dist_total != 0 else 0.5

    l_h = normalized_horizontal_position(l_iris, l_inner, l_outer)
    r_h = normalized_horizontal_position(r_iris, r_inner, r_outer)
    l_v = vertical_ratio(l_iris, l_upper, l_lower)
    r_v = vertical_ratio(r_iris, r_upper, r_lower)

    h_ratio = l_h
    v_ratio = (l_v + r_v) / 2

    return {"horizontal": round(h_ratio,3), "vertical": round(v_ratio,3), 
    "eyes" : {
    "left": {"x": float(l_iris[0]), "y": float(l_iris[1])},
    "right": {"x": float(r_iris[0]), "y": float(r_iris[1])}
}}

def detect_faces_and_gaze(frame):
    gaze_result = None
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mesh_results = face_mesh.process(rgb)

    if mesh_results.multi_face_landmarks:
        ih, iw, _ = frame.shape
        landmarks = mesh_results.multi_face_landmarks[0]
        gaze_result = calculate_gaze_direction(landmarks, iw, ih)

    face_box = face_detection_box(frame)

    return {"gaze": gaze_result, "face_box": face_box}
