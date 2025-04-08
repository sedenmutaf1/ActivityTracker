import React from "react";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboardContainer">
      <div className="dashboardCard">
        <h1>Welcome to Your Dashboard!</h1>

        <button className="dashboardButton">Old Sessions</button>
        <button className="dashboardButton">Start a New Session</button>
      </div>
    </div>
  );
}

export default Dashboard;
