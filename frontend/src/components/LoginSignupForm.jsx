import React, { useState } from "react";
import "./LoginSignupForm.css";  // Import the CSS file here

function LoginSignupForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Example: replace with your real FastAPI endpoint
  const BASE_URL = "http://127.0.0.1:8000";

  // Handle the login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Logging in with:", { loginEmail, loginPassword });
    // Here you’d typically do:
    // const response = await fetch(`${BASE_URL}/users/login`, { ... })
  };

  // Handle the signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("Signing up with:", { signupEmail, signupPassword });
    // const response = await fetch(`${BASE_URL}/users/register`, { ... })
  };

  return (
    <div className="loginSignupContainer">
      <div className="loginSignupCard">
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Login Form
        </h2>

        {/* Tabs for Login / Signup */}
        <div className="tabContainer">
          <button
            className={`tabButton ${activeTab === "login" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`tabButton ${activeTab === "signup" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin}>
            <label htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              className="formControl"
              type="email"
              placeholder="Enter your email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
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

            <div style={{ textAlign: "right", marginBottom: "1rem" }}>
              <a href="#" className="forgotLink">
                Forgot password?
              </a>
            </div>

            <button className="loginSignUpBtn" type="submit">
              Login
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              Not a member?{" "}
              <span
                className="switchLink"
                onClick={() => setActiveTab("signup")}
              >
                Signup now
              </span>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignup}>
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

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              Already a member?{" "}
              <span
                className="switchLink"
                onClick={() => setActiveTab("login")}
              >
                Login now
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginSignupForm;
