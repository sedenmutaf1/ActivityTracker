import React, { useState, useEffect, useCallback } from "react";
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
  const navigate = useNavigate();
  const sessionInfo = getSessionInfo();
  const { stream, error } = useUserMedia({ video: true });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Calculate time left on mount
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
        body: JSON.stringify({
          session_id: sessionInfo?.session_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Session failed: ${response.status}`);
      }

      setSessionEnded(true);
      localStorage.removeItem("sessionInfo");
      const data = await response.json();
      console.log("Session successful:", data);
    } catch (err) {
      console.error("Session error:", err);
    }
  }, [sessionInfo?.session_id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || sessionEnded) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          (async () => {
            await endSession();
          })();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, sessionEnded, endSession]);

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
              <video
                autoPlay
                muted
                ref={(video) => {
                  if (video && stream && video.srcObject !== stream) {
                    video.srcObject = stream;
                  }
                }}
              />
            )}
            <button className="dashboardButton" onClick={handleSessionEnd}>
              End Session
            </button>
          </>
        ) : (
          <>
            <h1>✅ Session complete!</h1>

          </>
        )}
      </div>
    </div>
  );
}