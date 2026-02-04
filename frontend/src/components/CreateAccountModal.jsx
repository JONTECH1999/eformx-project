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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.name || !form.email || (!account && !form.password)) {
      setIsError(true);
      setMessage("Please fill in all required fields.");
      return;
    }

    // Stricter email format check: require domain + TLD
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setIsError(true);
      setMessage("Please enter a valid email (e.g., name@example.com).");
      return;
    }

    // Enforce minimum password length on create (and on edit if provided)
    if ((!account && form.password.length < 6) || (account && form.password && form.password.length < 6)) {
      setIsError(true);
      setMessage("The password must be at least 6 characters.");
      return;
    }

    const accountData = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      status: account ? form.status : "Active", // force Active on create
    };

    try {
      if (account) {
        await onUpdate(accountData);
        setMessage("Account successfully updated!");
      } else {
        await onCreate(accountData);
        setMessage("Account successfully created!");
      }
      setIsError(false);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      // Surface backend validation or generic errors
      const apiMsg = err?.response?.data?.message
        || (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join(', ') : null)
        || "An error occurred. Please try again.";
      setIsError(true);
      setMessage(apiMsg);
    }
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
            pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
            title="Enter a valid email like name@example.com"
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

          {/* ✅ SMART STATUS DROPDOWN ONLY WHEN EDITING */}
          {account && (
            <select
              name="status"
              value={form.status}
              onChange={(e) => {
                const value = e.target.value;

                // Convert action into real status
                if (value === "Deactivate") {
                  setForm({ ...form, status: "Inactive" });
                } else if (value === "Reactivate") {
                  setForm({ ...form, status: "Active" });
                } else {
                  setForm({ ...form, status: value });
                }
              }}
            >
              {/* Show current status */}
              <option value={form.status}>{form.status}</option>

              {/* Show action based on current status */}
              {form.status === "Active" && (
                <option value="Deactivate">Deactivate</option>
              )}

              {form.status === "Inactive" && (
                <option value="Reactivate">Reactivate</option>
              )}
            </select>
          )}

          <button type="submit" className="create-btn">
            {account ? "Update Account" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountModal;
