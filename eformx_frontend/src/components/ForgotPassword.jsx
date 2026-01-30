import React from "react";
import "../styles/Login.css";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

function ForgotPassword({ goBack }) {
  return (
    <div className="login-container">
      <h1 className="logo">eFormX</h1>

      <div className="login-card">
        <FaArrowLeft className="back-icon" onClick={goBack} />

        <h2>Forgot Password</h2>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input type="email" placeholder="Enter Your Email Account" />
        </div>

        <button className="login-btn">Send Reset Link</button>
      </div>
    </div>
  );
}

export default ForgotPassword;
