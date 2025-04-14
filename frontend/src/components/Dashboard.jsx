import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const BASE_URL = "http://127.0.0.1:8000";

function getUser() {
  const storedUser = localStorage.getItem("userInfo");
  return storedUser ? JSON.parse(storedUser) : null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [showDurationInput, setShowDurationInput] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("");

  const handleSessionRequest = () => {
    setShowDurationInput(true);
  };

  const handleSessionStart = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          session_duration: parseInt(sessionDuration, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(`Session failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Session successful:", data);
      localStorage.setItem("sessionInfo", JSON.stringify(data));
      navigate("/session");

    } catch (err) {
      console.error("Session error:", err);
    }
  };

  return (
    <div className="dashboardContainer">
      <div className="dashboardCard">
        <div className="userInfoCard">
          <img src="/img.png" alt="User Icon" className="userIcon" />
          <p className="welcomeText">
            Welcome back, <strong>{user ? user.username : "Guest"}</strong>!
          </p>
        </div>

        <h1>Welcome to Your Dashboard!</h1>

        <button className="dashboardButton">Old Sessions</button>

        {!showDurationInput ? (
          <button className="dashboardButton" onClick={handleSessionRequest}>
            Start a New Session
          </button>
        ) : (
          <form onSubmit={handleSessionStart} className="sessionForm">
            <label>
              Session Duration (minutes):
              <input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                required
                min="1"
              />
            </label>
            <button className="dashboardButton" type="submit">
              Confirm and Start
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
