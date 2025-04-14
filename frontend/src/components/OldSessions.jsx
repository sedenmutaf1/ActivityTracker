import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OldSessions.css";
import HomeButton from "./HomeButton";

const BASE_URL = "http://127.0.0.1:8000";

function getUser() {
  const userData = localStorage.getItem("userInfo");
  return userData ? JSON.parse(userData) : null;
}

export default function OldSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sessions/user/${user.user_id}`);
        const result = await response.json();
        setSessions(result.data || []);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSessions();
    }
  }, []);

  return (
    <div className="oldSessionsContainer">
      <HomeButton onClick={() => navigate("/dashboard")} />
      <div className="oldSessionsCard">
        <h1>Your Sessions</h1>
        {loading ? (
          <p>Loading...</p>
        ) : sessions.length === 0 ? (
          <p>No sessions found.</p>
        ) : (
          <div className="sessionGrid">
            {sessions.map((session, index) => (
              <div className="sessionCard" key={index}>
                <p><strong>Start:</strong> {new Date(session.start_time).toLocaleString()}</p>
                <p><strong>Duration:</strong> {session.session_duration} min</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${session.status}`}>
                    {session.status}
                  </span>
                </p>
                {session.status === "active" && (
                  <button
                    className="resumeButton"
                    onClick={() => navigate("/session")}
                  >
                    Resume
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
