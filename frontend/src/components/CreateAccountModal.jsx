import React, { useState, useEffect } from "react";
import "../styles/CreateAccountModal.css";

function CreateAccountModal({ isOpen, onClose, onCreate, onUpdate, account }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
    status: "Active",
  });

  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (isOpen) {
      if (account) {
        
        setForm({
          name: account.name || "",
          email: account.email || "",
          password: "", 
          role: account.role || "Admin",
          status: account.status || "Active",
        });
      } else {

        setForm({
          name: "",
          email: "",
          password: "",
          role: "Admin",
          status: "Active",
        });
      }
      setMessage(null);
      setIsError(false);
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // optional choice for the password
    if (!form.name || !form.email || (!account && !form.password)) {
      setIsError(true);
      setMessage("Please fill in all required fields.");
      return;
    }

    const accountData = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      status: form.status,
    };

    if (account) {
      // Edit mode
      onUpdate(accountData);
      setMessage("Account successfully updated!");
    } else {
      // Create mode
      onCreate(accountData);
      setMessage("Account successfully created!");
    }

    setIsError(false);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{account ? "Edit Account" : "Create Account"}</h3>
          <span className="close-icon" onClick={onClose}>✖</span>
        </div>

        {message && (
          <div className={isError ? "error-msg" : "success-msg"}>
            {message}
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            disabled={!!account} 
          />

          <input
            type="password"
            name="password"
            placeholder={account ? "Leave blank to keep password" : "Password"}
            value={form.password}
            onChange={handleChange}
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option>Admin</option>
            <option>Super Admin</option>
          </select>

          <select name="status" value={form.status} onChange={handleChange}>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button type="submit" className="create-btn">
            {account ? "Update Account" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountModal;
