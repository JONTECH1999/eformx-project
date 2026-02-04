import React, { useState } from "react";
import "../styles/Login.css";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import logo from "../assets/eFormX1.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMessage("Reset link sent. Please check your email.");
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to send reset link.");
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
        <FaArrowLeft className="back-icon" onClick={() => navigate('/')} />

        <h2>Forgot Password</h2>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Enter Your Email Account"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button className="login-btn" onClick={submit} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
