import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignupForm.css";

function LoginSignupForm() {
  const [activeTab, setActiveTab] = useState("login");

  // ----- Login fields -----
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ----- Signup fields -----
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Adjust to match your FastAPI server URL
  const BASE_URL = "http://127.0.0.1:8000";

  const navigate = useNavigate();

  localStorage.clear();

  // Handle the login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login successful:", data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      // Navigate to the dashboard page
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Handle the signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
          created_at: new Date().toISOString()  // Provide current timestamp
        }),
      });

      if (!response.ok) {
        throw new Error(`Signup failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Signup successful:", data);
      // e.g. switch to login tab automatically
      setActiveTab("login");
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="loginSignupContainer">
      <div className="loginSignupCard">
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {activeTab === "login" ? "Login Form" : "Signup Form"}
        </h2>

        {/* Tabs for switching between Login and Signup */}
        <div className="tabContainer">
          <button
            className={`tabButton ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`tabButton ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin}>
            <label htmlFor="loginUsername">Username</label>
            <input
              id="loginUsername"
              className="formControl"
              type="text"
              placeholder="Enter your username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />

            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              className="formControl"
              type="password"
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button className="loginSignUpBtn" type="submit">
              Login
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignup}>
            <label htmlFor="signupUsername">Username</label>
            <input
              id="signupUsername"
              className="formControl"
              type="text"
              placeholder="Create a username"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              required
            />

            <label htmlFor="signupEmail">Email Address</label>
            <input
              id="signupEmail"
              className="formControl"
              type="email"
              placeholder="Enter your email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />

            <label htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              className="formControl"
              type="password"
              placeholder="Create a password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
            />

            <button className="loginSignUpBtn" type="submit">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginSignupForm;
