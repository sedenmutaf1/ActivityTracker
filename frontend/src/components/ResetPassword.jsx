import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./ResetPassword.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const BASE_URL = "http://localhost:8000";

  const query = useQuery();
  const token = query.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successful!");
        await new Promise(resolve => setTimeout(resolve, 3000));
        navigate("/dashboard");
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#b4004e",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              onClick={() => setShowConfirm((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "#b4004e",
              }}
            >
              {showConfirm ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit">Reset Password</button>
        </form>

        {message && <div className="popup">{message}</div>}
      </div>
    </div>
  );
}

export default ResetPassword;
