import React from "react";
import "../styles/Login.css";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

function Register({ goBack }) {
  return (
    <div className="login-container">
      <h1 className="logo">eFormX</h1>

      <div className="login-card">
        <FaArrowLeft className="back-icon" onClick={goBack} />

        <h2>Create Account</h2>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input type="email" placeholder='Enter Email "example@gmail.com"' />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input type="password" placeholder="Enter Password" />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input type="password" placeholder="Confirm Password" />
        </div>

        <button className="login-btn">Sign Up</button>
      </div>
    </div>
  );
}

export default Register;
