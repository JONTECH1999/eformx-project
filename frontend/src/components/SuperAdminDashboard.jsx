import React, { useState, useEffect } from "react";
import "../styles/SuperAdminDashboard.css";
import { FaBell, FaUserCircle, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import CreateAccountModal from "./CreateAccountModal";
import logo from "../assets/eFormX.png";
import authService from "../services/authService";
import userService from "../services/userService";


function SuperAdminDashboard({ superAdminProfile, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [accountToEdit, setAccountToEdit] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Default profile if not provided
  const profile = superAdminProfile || {
    name: "Super Admin",
    email: "superadmin@example.com",
    role: "Super Admin",
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getUsers();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // CREATE NEW ACCOUNT
  const handleCreateAccount = async (account) => {
    try {
      await userService.createUser(account);
      await fetchUsers(); // Refresh list
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user. " + (err.response?.data?.message || "Please try again."));
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  // UPDATE EXISTING ACCOUNT
  const handleUpdateAccount = async (updatedAccount) => {
    try {
      await userService.updateUser(accountToEdit.id, updatedAccount);
      await fetchUsers(); // Refresh list
      setAccountToEdit(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user. " + (err.response?.data?.message || "Please try again."));
    }
  };

  // DELETE ACCOUNT
  const openDeleteModal = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(accountToDelete.id);
      await fetchUsers(); // Refresh list
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  // LOGOUT FUNCTION
  const handleLogout = async () => {
    await authService.logout();
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="superadmin">
      {/* HEADER */}
      <header className="sa-header">
        <div className="sa-logo">
          <img src={logo} alt="eFormX Logo" className="logo-img" />
        </div>

        <div className="sa-right">
          <FaBell className="icon" />
          <div
            className="profile"
            onClick={() => setIsProfileOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <span>{profile.name}</span>
            <FaUserCircle className="profile-icon" />
          </div>
        </div>
      </header>

      {/* TITLE */}
      <div className="page-title">
        <h2>Account Management</h2>
        <button
          className="create-account-btn"
          onClick={() => {
            setAccountToEdit(null);
            setIsModalOpen(true);
          }}
        >
          <FaPlus /> Create Account
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        {loading && <p style={{ textAlign: "center", padding: "20px" }}>Loading users...</p>}
        {error && <p style={{ textAlign: "center", padding: "20px", color: "red" }}>{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No accounts created yet
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td>{acc.name}</td>
                    <td>{acc.email}</td>
                    <td>{acc.role || 'User'}</td>
                    <td className={acc.status === "Active" ? "active" : "inactive"}>
                      {acc.status}
                    </td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button className="edit-btn" onClick={() => openEditModal(acc)}>
                        <FaEdit />
                      </button>
                      <button className="delete-btn" onClick={() => openDeleteModal(acc)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT ACCOUNT MODAL */}
      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAccountToEdit(null);
        }}
        onCreate={handleCreateAccount}
        onUpdate={handleUpdateAccount}
        account={accountToEdit}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && accountToDelete !== null && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete <br />
              <strong>{accountToDelete.email}</strong>?
            </p>
            <div className="delete-actions">
              <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN PROFILE MODAL */}

      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="profile-modal-card">
            <span className="close-icon" onClick={() => setIsProfileOpen(false)}>✖</span>

            <div className="profile-picture">
              <img
                src="https://i.pravatar.cc/150?img=5" // temporary avatar
                alt="Super Admin"
              />
            </div>

            <h3 className="profile-name">{profile.name}</h3>

            <button className="logout-btn" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminDashboard;
