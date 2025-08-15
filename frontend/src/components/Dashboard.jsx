import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import HomeButton from "./HomeButton";
import LogoutButton from "./LogoutButton";

const BASE_URL = "http://127.0.0.1:8000";



export default function Dashboard() {

  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [showDurationInput, setShowDurationInput] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("");

  const handleSessionRequest = () => {
    setShowDurationInput(true);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/me`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("User not authenticated");

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("User fetch failed:", err);
        navigate("/"); 
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSessionStart = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials:"include",
        body: JSON.stringify({
          session_duration: parseInt(sessionDuration, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(`Session failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Session successful:", data);
      navigate("/session");

    } catch (err) {
      console.error("Session error:", err);
    }
  };

  function handleLogout() {
  
    document.cookie = "access_token=; Max-Age=0";
    navigate("/");
  }

  return (
    <div className="dashboardContainer">
      <HomeButton onClick={() => navigate("/dashboard")} />
      <div className="topRight">
      <LogoutButton onClick={handleLogout} />
      </div>
      <div className="dashboardCard">
        <div className="userInfoCard">
          <img src="/img.png" alt="User Icon" className="userIcon" />
          <p className="welcomeText">
            Welcome back, <strong>{user ? user.username : "Guest"}</strong>!
          </p>
        </div>

        <h1>Welcome to Your Dashboard!</h1>

        <button className="dashboardButton" onClick={() => navigate("/oldsessions")}>Old Sessions</button>

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
