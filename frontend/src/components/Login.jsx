import React, { useState } from "react";
import "../styles/Login.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/eFormX.png";
import authService from "../services/authService";

function Login({ goRegister, goForgot, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = await authService.login(email, password);
      setUser(userData); // Send logged-in user info to App.jsx
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="eFormX Logo" className="logo" />
      </div>

      <div className="login-card">
        <h2>Welcome</h2>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="input-group password-group">
          <FaLock className="icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="links">
          <span onClick={goForgot}>Forgot Password</span>
          {goRegister && <span onClick={goRegister}>Register</span>}
        </div>
      </div>
    </div>
  );
}

export default Login;
