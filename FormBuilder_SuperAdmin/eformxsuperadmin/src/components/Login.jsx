import React from "react";
import "../styles/Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import logo from "../assets/eFormX1.png";

function Login() {
  return (
    <div className="login-container">
      
      {/* Logo */}
      <div className="logo-wrapper">
        <img src={logo} alt="eFormX Logo" className="login-logo" />
      </div>

      {/* Card */}
      <div className="login-card">
        <h2>Welcome</h2>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input type="email" placeholder="name@gmail.com" />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input type="password" placeholder="Password" />
        </div>

        <button className="login-btn">Sign In</button>
      </div>
    </div>
  );
}

export default Login;
