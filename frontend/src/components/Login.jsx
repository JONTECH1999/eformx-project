import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/eFormX1.png";

import authService from "../services/authService";

function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (err) {
      console.error("Login component error:", err);
      let message = "Invalid email or password";

      if (!err.response) {
        message = "Cannot connect to server. Please ensure the backend is running at http://127.0.0.1:8000";
      } else if (err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="eFormX Logo" className="logo" />
      </div>

      <div className="login-card">
        <h2>Welcome</h2>

        {error && <div className="error-message" style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{error}</div>}

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="input-group password-group">
          <FaLock className="icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          className="login-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="links">
          <span onClick={() => navigate('/forgot')} style={{ cursor: 'pointer' }}>Forgot Password</span>
        </div>
      </div>
    </div>
  );
}

export default Login;