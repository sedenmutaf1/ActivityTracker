import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserMedia } from "./useUserMedia";
import "./OngoingSession.css";
import HomeButton from "./HomeButton";

const BASE_URL = "http://127.0.0.1:8000";

//GET SESSION INFO TO DISPLAY CORRECT SESSION
function getSessionInfo() {
  const sessionInfo = localStorage.getItem("sessionInfo");
  return sessionInfo ? JSON.parse(sessionInfo) : null;
}

export default function OngoingSession() {

  //USE STATES AND CALLED METHODS
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // HIDDEN CANVAS FOR FRAME CAPTURE
  const overlayCanvasRef = useRef(null); // VISIBLE CANVAS FOR FACE BOXES
  const navigate = useNavigate();
  const sessionInfo = getSessionInfo();
  const { stream, error } = useUserMedia({ video: true });
  const socketRef = useRef(null);
  const [detectedFaces, setDetectedFaces] = useState([]);

  //CONVERTS SECONDS TO MINUTES AND SECONDS FOR BETTER DISPLAY
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  //ESTABLISHES WEBSOCKET CONNECTION AND RECEIVES FACE DETECTION DATA
  useEffect(() => {
  if (!sessionInfo?.session_id) return;

  const timeout = setTimeout(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/session/${sessionInfo.session_id}/track`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("📡 Activity tracking WebSocket connected");
    };

   socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "face_detection") {
        setDetectedFaces(data.faces);
      }
    } catch (err) {
      console.error("❌ Failed to parse activity data:", err);
    }
  };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }, 300); // wait 300ms before connecting

  return () => clearTimeout(timeout);
}, [sessionInfo?.session_id]);


  //CAPTURES VIDEO FRAMES FROM STREAM TO SEND OVER WEBSOCKET
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

  //DISPLAY BOUNDING BOX AROUND DETECTED FACES
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !detectedFaces) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detectedFaces.forEach((face) => {
      ctx.beginPath();
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.rect(face.x, face.y, face.w, face.h);
      ctx.stroke();
    });
  }, [detectedFaces]);

  //CALCULATES THE TIME LEFT ON MOUNT
  useEffect(() => {
    if (!sessionInfo) return;

    const startTime = new Date(sessionInfo.start_time);
    const durationMs = sessionInfo.session_duration * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
    const now = new Date();

    const diffInSeconds = Math.floor((endTime - now) / 1000);
    setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 0);
  }, [sessionInfo]);

  //BASE METHOD TO END THE SESSION (TO BE USED BY END SESSION BUTTON OR NO TIME LEFT)
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

  //TIMER COUNTDOWN
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

  //END SESSION BUTTON HANDLER
  const handleSessionEnd = (e) => {
    e.preventDefault();
    endSession();
  };

  //RENDER
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

      {/* HIDDEN CANVAS USED TO EXTRACT FRAMES FOR BACKEND */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
