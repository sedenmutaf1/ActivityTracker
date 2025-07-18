import React, { useState, useEffect } from "react";
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
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ----- Forgot Password fields -----
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  // Adjust to match your FastAPI server URL
  const BASE_URL = "http://localhost:8000";

  const navigate = useNavigate();

  localStorage.clear();

  // Handle the login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage("Login failed: " + (errorData.detail || response.status));
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);
      setMessage("Login successful");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Login failed: " + err.message);
    }
  };

  // Handle the signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
          created_at: new Date().toISOString(), // Provide current timestamp
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage("Signup failed: " + (errorData.detail || response.status));
        return;
      }

      const data = await response.json();
      console.log("Signup successful:", data);
      setMessage("Signup successful");
      setActiveTab("login");
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("Signup failed: " + err.message);
    }
  };

  // Handle the forgot password form submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage("Forgot password failed: " + (errorData.detail || response.status));
        return;
      }

      const data = await response.json();
      console.log("Forgot password successful:", data);
      setMessage("Email sent successfully. Please check your inbox.");
      setActiveTab("login");
    } catch (err) {
      console.error("Forgot password error:", err);
      setMessage("Forgot password failed: " + err.message);
    }
  };

  useEffect(() => {
    if (message) {
      setShowPopup(true);

      const timeout = setTimeout(() => {
        setShowPopup(false);
        setMessage(""); // optional: clear message
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timeout); // cleanup
    }
  }, [message]);

  return (
    <div className="loginSignupContainer">
      <div className="loginSignupCard">
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {activeTab === "login"
            ? "Login Form"
            : activeTab === "signup"
            ? "Signup Form"
            : "Forgot Password"}
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
            <p>
              Forgot your password?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("forgotPassword")}
                className="linkButton"
              >
                Reset it here
              </button>
            </p>
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

        {/* FORGOT PASSWORD FORM */}
        {activeTab === "forgotPassword" && (
          <form onSubmit={handleForgotPassword}>
            <label htmlFor="forgotPasswordEmail">Email Address</label>
            <input
              id="forgotPasswordEmail"
              className="formControl"
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />
            <button className="loginSignUpBtn" type="submit">
              Send Reset Email
            </button>
          </form>
        )}

        {/* POPUP MESSAGE */}
        {showPopup && <div className="popupMessage">{message}</div>}
      </div>
    </div>
  );
}

export default LoginSignupForm;
