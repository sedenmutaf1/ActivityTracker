# 👁️ Real-Time Gaze & Activity Tracker with User Management

A full-stack FastAPI-based web application that tracks users’ focus and activities (reading, browsing, etc.) in real-time using a webcam. Users can create accounts, start sessions, get live activity feedback, and view detailed reports — all stored and managed with Redis.

---

## 🚀 Features

- ✅ **User Registration & Login**
- ✅ **Session Start/End & Activity Tracking**
- ✅ **Real-Time Gaze Direction Detection (OpenCV)**
- ✅ **Live WebSocket Feed**
- ✅ **Per-User Session History**
- ✅ **Redis for fast, lightweight session storage**
- ✅ **OpenAPI docs via Swagger UI**

---

## 🧱 Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Backend    | FastAPI                   |
| Real-time  | WebSocket (FastAPI)       |
| CV Engine  | OpenCV (with Dlib optional) |
| Storage    | Redis                     |
| Auth       | Custom (basic hashed passwords) |
| Docs       | Swagger UI (`/docs`)      |

---

## 🧠 Architecture Overview

```
Client <--> FastAPI (REST/WebSocket) <--> Redis (Sessions & Users)
                          ↑
                     Gaze Tracker
                      (OpenCV)
```

---

## 📁 Project Structure

```
backend/
│
├── app/
│   ├── api/
│   │   ├── session.py        # Session logic
│   │   ├── tracking.py       # WebSocket activity streaming
│   │   └── user.py           # Auth & user handling
│   │
│   ├── models/
│   │   ├── session_models.py # Session schemas
│   │   ├── activity_models.py# WebSocket schema
│   │   └── user_models.py    # Auth schemas
│   │
│   └── utils/
│       └── redis_utils.py    # Redis connection helper
│
├── main.py                   # FastAPI app with lifespan
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. 🔀 Clone the Repo
```bash
git clone https://github.com/your-username/activity-tracker.git
cd activity-tracker
```

### 2. 📦 Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. 🧠 Start Redis (with Docker)
```bash
docker run -d --name redis -p 6379:6379 redis
```

### 4. 🚀 Run FastAPI App
```bash
uvicorn backend.main:app --reload
```

---

## 📡 API Endpoints Overview

### 🧝‍♂️ User Management
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| POST   | `/users/register`     | Register a new user       |
| POST   | `/users/login`        | Login existing user       |
| GET    | `/users/{username}`   | Get user profile info     |

### 📋 Session Management
| Method | Endpoint              | Description                       |
|--------|-----------------------|-----------------------------------|
| POST   | `/session/start`      | Begin a new session               |
| POST   | `/session/end`        | End a session and generate report |
| GET    | `/session/{id}`       | Fetch session details             |
| GET    | `/sessions`           | All sessions                      |
| GET    | `/sessions/user/{id}` | Sessions for a specific user      |

### 🌐 Real-Time Activity
| Type     | Endpoint                            | Description                    |
|----------|-------------------------------------|--------------------------------|
| WebSocket| `/ws/session/{session_id}/track`    | Stream gaze + activity live    |

---

## 📊 Example Session Report

```json
{
  "session_id": "abc123",
  "focus_time": 1400,
  "distraction_time": 300,
  "session_report": {
    "reading_time": 800,
    "browsing_time": 400,
    "watching_time": 200
  }
}
```

---

## 🔐 Auth Notes

- Passwords are hashed (simplified — you should upgrade to `bcrypt` in production).
- JWT/token support can be added later if desired.
- User IDs are UUID-based and tied to session ownership.

---

## 🌟 Future Enhancements

- [ ] Add a full frontend (React/Vue)
- [ ] Improve activity classification (AI-based)
- [ ] Support face recognition per user
- [ ] Export reports as CSV/PDF
- [ ] Token-based auth (JWT)

---

## 📃 License

MIT © 2025 [Your Name]