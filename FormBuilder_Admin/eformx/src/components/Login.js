import React, { useState } from "react";
import "../styles/Login.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/eFormX.png";

function Login({ goRegister, goForgot }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
        <div className="logo-container">
          <img src={logo} alt="eFormX Logo" className="logo" />
        </div>

      <div className="login-card">
        <h2>Welcome</h2>
    
        <div className="input-group">
          <FaEnvelope className="icon" />
          <input type="email" placeholder="name@gmail.com" />
        </div>

        <div className="input-group password-group">
          <FaLock className="icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="login-btn">Sign In</button>

        <div className="links">
          <span onClick={goForgot}>Forgot Password</span>
        </div>
      </div>
    </div>
  );
}

export default Login;