# 🧠 Real-Time Gaze & Activity Tracking System

## 🚀 Overview
This project is a **real-time web application** for tracking **gaze direction, focus levels, and activity recognition**. It allows users to start a session, monitor their focus in real-time using **WebSockets**, and generate detailed session reports.

## 🔥 Features
- **Real-Time Gaze & Activity Tracking** using OpenCV & Dlib.
- **WebSockets for Live Data Streaming**.
- **Redis for Fast, In-Memory Data Storage**.
- **FastAPI for a High-Performance API Backend**.
- **Session Management & Reporting**.
- **Dockerized Redis Server** for easy deployment.

## 🏗️ Tech Stack
- **Backend:** FastAPI, WebSockets, Redis
- **Computer Vision:** OpenCV, Dlib
- **Database:** Redis (for fast, in-memory storage)
- **Containerization:** Docker (for Redis)

## 📁 Project Structure
```
backend/
│── app/
│   ├── api/
│   │   ├── session.py        # Session start/end & reporting API
│   │   ├── tracking.py       # WebSocket for live tracking
│   ├── models/
│   │   ├── session_models.py # Data models for session
│   │   ├── activity_models.py # Data models for tracking
│   ├── db/
│   │   ├── redis_client.py   # Redis connection management
│── main.py                   # FastAPI app entry point
│── Dockerfile                # Container setup
```

## 🔧 Setup & Installation
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/real-time-gaze-tracker.git
cd real-time-gaze-tracker
```

### 2️⃣ Install Dependencies
Make sure you have **Python 3.9+** installed.
```sh
pip install -r requirements.txt
```

### 3️⃣ Start Redis Server (via Docker)
```sh
docker run -d --name redis -p 6379:6379 redis
```

### 4️⃣ Run the FastAPI Server
```sh
uvicorn backend.main:app --reload
```

### 5️⃣ Open Swagger UI for API Testing
Visit: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## 📡 WebSocket Endpoint (For Real-Time Tracking)
**Endpoint:** `ws://127.0.0.1:8000/ws/session/{session_id}/track`
- Connect via WebSocket.
- Receive real-time gaze tracking updates.

## 📊 Session Flow
1. **Start a Session** → `/session/start` (POST)
2. **Stream Live Activity Data** → WebSocket `/ws/session/{session_id}/track`
3. **End Session & Generate Report** → `/session/end` (POST)
4. **Retrieve Past Sessions** → `/sessions` (GET)

## 🛠️ Future Enhancements
✅ Eye-Tracking Model Improvements  
✅ Frontend Dashboard (React/Next.js)  
✅ Enhanced Focus Metrics & Alerts  

## 🤝 Contributing
Feel free to fork, submit PRs, and improve the project! 🚀

## 📜 License
MIT License © 2025 Your Name

