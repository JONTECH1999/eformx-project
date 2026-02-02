import React, { useState, useEffect } from "react";
import "../styles/SuperAdminDashboard.css";
import {
  FaBell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserEdit,
  FaCamera,
  FaUserCircle,
} from "react-icons/fa";
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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Default profile fallback
  const profile = superAdminProfile || {
    name: "Super Admin",
    email: "superadmin@example.com",
  };

  // Persistent Super Admin Profile (frontend only)
  const [superAdminProfileState, setSuperAdminProfileState] = useState(() => {
    const saved = localStorage.getItem("superAdminProfile");
    return saved
      ? JSON.parse(saved)
      : {
          name: profile.name,
          email: profile.email,
          photo: "https://i.pravatar.cc/150?img=5",
        };
  });

  /* ===========================
     FETCH USERS (LARAVEL)
  ============================ */
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
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     ACCOUNT CRUD (LARAVEL)
  ============================ */
  const handleCreateAccount = async (account) => {
    try {
      await userService.createUser(account);
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to create user.");
    }
  };

  const openEditModal = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleUpdateAccount = async (updatedAccount) => {
    try {
      await userService.updateUser(accountToEdit.id, updatedAccount);
      await fetchUsers();
      setAccountToEdit(null);
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  const openDeleteModal = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(accountToDelete.id);
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  /* ===========================
     PROFILE LOGIC (FRONTEND)
  ============================ */
  const handleSaveProfile = () => {
    localStorage.setItem(
      "superAdminProfile",
      JSON.stringify(superAdminProfileState)
    );
    alert("Profile updated!");
    setIsEditProfileOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsProfileOpen(false);
    if (onLogout) onLogout();
    else window.location.reload();
  };

  return (
    <div className="superadmin">
      {/* HEADER */}
      <header className="sa-header">
        <div className="sa-logo">
          <img src={logo} alt="eFormX Logo" className="logo-img" />
        </div>

        <div
          className="profile"
          onClick={() => setIsProfileOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <span className="profile-name-with-bell">
            {superAdminProfileState.name}
            <FaBell className="header-bell-icon" />
          </span>
          <img
            src={superAdminProfileState.photo}
            alt="Profile"
            className="header-profile-pic"
          />
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
        {loading && <p style={{ textAlign: "center" }}>Loading users...</p>}
        {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

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
                    <td>{acc.role || "User"}</td>
                    <td className={acc.status === "Active" ? "active" : "inactive"}>
                      {acc.status}
                    </td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(acc)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => openDeleteModal(acc)}
                      >
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

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete <br />
              <strong>{accountToDelete?.email}</strong>?
            </p>
            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE VIEW MODAL */}
      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="profile-modal-card">
            <span className="close-icon" onClick={() => setIsProfileOpen(false)}>
              ✖
            </span>

            <div className="profile-picture">
              <img src={superAdminProfileState.photo} alt="Profile" />
            </div>

            <h3>{superAdminProfileState.name}</h3>

            <div className="profile-actions">
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <FaUserEdit /> Edit Profile
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="modal-overlay">
          <div className="profile-modal-card">
            <span
              className="close-icon"
              onClick={() => setIsEditProfileOpen(false)}
            >
              ✖
            </span>

            <h3>Edit Profile</h3>

            <div className="profile-picture">
              <img src={superAdminProfileState.photo} alt="Profile" />

              <input
                type="file"
                accept="image/*"
                id="profileFileInput"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setSuperAdminProfileState({
                      ...superAdminProfileState,
                      photo: reader.result,
                    });
                  };
                  if (file) reader.readAsDataURL(file);
                }}
              />

              <label htmlFor="profileFileInput" className="profile-upload-icon">
                <FaCamera />
              </label>
            </div>

            <input
              type="text"
              value={superAdminProfileState.name}
              onChange={(e) =>
                setSuperAdminProfileState({
                  ...superAdminProfileState,
                  name: e.target.value,
                })
              }
              className="profile-input"
            />

            <input
              type="email"
              value={superAdminProfileState.email}
              onChange={(e) =>
                setSuperAdminProfileState({
                  ...superAdminProfileState,
                  email: e.target.value,
                })
              }
              className="profile-input"
            />

            <button className="save-btn" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
