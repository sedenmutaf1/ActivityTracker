import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserMedia } from "./useUserMedia";
import "./OngoingSession.css";
import HomeButton from "./HomeButton";

const BASE_URL = "http://127.0.0.1:8000";

function getSessionInfo() {
  const sessionInfo = localStorage.getItem("sessionInfo");
  return sessionInfo ? JSON.parse(sessionInfo) : null;
}

export default function OngoingSession() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // Hidden frame capture canvas
  const overlayCanvasRef = useRef(null); // Face box overlay
  const gazeOverlayCanvasRef = useRef(null); // NEW: Fullscreen gaze overlay
  const navigate = useNavigate();
  const sessionInfo = getSessionInfo();
  const { stream, error } = useUserMedia({ video: true });
  const socketRef = useRef(null);
  const [detectedFace, setDetectedFace] = useState();
  const [gazePoint, setGazePoint] = useState();
  

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    if (!sessionInfo?.session_id) return;

    const timeout = setTimeout(() => {
      const socket = new WebSocket(`ws://127.0.0.1:8000/ws/session/${sessionInfo.session_id}/track`);
      socketRef.current = socket;

      socket.onopen = () => console.log("📡 Activity tracking WebSocket connected");

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setDetectedFace(data.face);
          setGazePoint(data.gaze);
          
        } catch (err) { 
          console.error("❌ Failed to parse activity data:", err);
        }
      };

      socket.onclose = () => console.log("WebSocket closed");
      socket.onerror = (err) => console.error("WebSocket error:", err);
    }, 300);

    return () => clearTimeout(timeout);
  }, [sessionInfo?.session_id]);

  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current || !socketRef.current || sessionEnded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    video.addEventListener("loadedmetadata", updateCanvasSize);

    const interval = setInterval(() => {
      try {
        if (!video.videoWidth || !video.videoHeight) return;

        updateCanvasSize();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              image: dataUrl,
              timestamp: Date.now(),
            })
          );
        }
      } catch (err) {
        console.error("📸 Frame capture/send failed:", err);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      video.removeEventListener("loadedmetadata", updateCanvasSize);
    };
  }, [stream, sessionEnded]);

  // Face box and gaze cloud on small video canvas
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !detectedFace) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.rect(detectedFace.x, detectedFace.y, detectedFace.w, detectedFace.h);
    ctx.stroke();

     
  }, [detectedFace]);

  // 💡 NEW: Gaze cloud on full screen canvas
  useEffect(() => {
    const canvas = gazeOverlayCanvasRef.current;
    if (!canvas || !gazePoint) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (typeof gazePoint.horizontal === "number" && typeof gazePoint.vertical === "number") {
      const sensitivity = 5;
      const gazeX = sensitivity * gazePoint.horizontal * (canvas.width / 2) + (canvas.width / 2);
      const gazeY = gazePoint.vertical * canvas.height;

      const radius = 60;
      const gradient = ctx.createRadialGradient(gazeX, gazeY, 0, gazeX, gazeY, radius);
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.6)");
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(gazeX, gazeY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [gazePoint]);

  useEffect(() => {
    if (!sessionInfo) return;

    const startTime = new Date(sessionInfo.start_time);
    const durationMs = sessionInfo.session_duration * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
    const now = new Date();

    const diffInSeconds = Math.floor((endTime - now) / 1000);
    setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 0);
  }, [sessionInfo]);

  const endSession = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/session/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionInfo.session_id }),
      });

      if (!response.ok) throw new Error(`Session failed: ${response.status}`);

      if (socketRef.current) socketRef.current.close();
      setSessionEnded(true);
      localStorage.removeItem("sessionInfo");

      const data = await response.json();
      console.log("Session successful:", data);
    } catch (err) {
      console.error("Session error:", err);
    }
  }, [sessionInfo?.session_id]);

  useEffect(() => {
    if (sessionEnded || timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          clearInterval(interval);
          endSession();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionEnded, timeLeft, endSession]);

  const handleSessionEnd = (e) => {
    e.preventDefault();
    endSession();
  };

  return (
    <div className="ongoingSessionContainer">
      <HomeButton onClick={() => navigate("/dashboard")} />
      <div className="ongoingSessionCard">
        {!sessionEnded ? (
          <>
            <h1>Session has started.</h1>
            <h1 className="timerText">
              Time left:{" "}
              <strong>
                <span className="timeDisplay">
                  {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
                </span>
              </strong>
            </h1>

            {error ? (
              <p>Error accessing camera</p>
            ) : (
              <div className="videoWrapper">
                <video
                  autoPlay
                  muted
                  ref={(video) => {
                    if (video && stream && video.srcObject !== stream) {
                      video.srcObject = stream;
                    }
                    videoRef.current = video;
                  }}
                />
                <canvas
                  ref={overlayCanvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />
              </div>
            )}

            <button className="dashboardButton" onClick={handleSessionEnd}>
              End Session
            </button>
          </>
        ) : (
          <h1>✅ Session complete!</h1>
        )}
      </div>

      {/* HIDDEN CANVAS FOR FRAME SENDING */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* NEW FULLSCREEN GAZE CANVAS */}
      <canvas
        ref={gazeOverlayCanvasRef}
        className="gaze-overlay"
      />
    </div>
  );
}
