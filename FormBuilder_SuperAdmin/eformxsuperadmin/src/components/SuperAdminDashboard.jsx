import React, { useState } from "react";
import "../styles/SuperAdminDashboard.css";
import { FaBell, FaPlus, FaEdit, FaTrash, FaUserEdit, FaCamera } from "react-icons/fa";
import CreateAccountModal from "./CreateAccountModal";
import logo from "../assets/eFormX.png";

function SuperAdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [accountToEdit, setAccountToEdit] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // ✅ Persistent Super Admin Profile
  const [superAdminProfile, setSuperAdminProfile] = useState(() => {
    const saved = localStorage.getItem("superAdminProfile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Admin",
          email: "admin@example.com",
          photo: "https://i.pravatar.cc/150?img=5",
        };
  });

  const handleSaveProfile = () => {
    localStorage.setItem(
      "superAdminProfile",
      JSON.stringify(superAdminProfile)
    );
    alert("Profile updated!");
    setIsEditProfileOpen(false);
    setIsProfileOpen(false);
  };

  // Account Logic
  const handleCreateAccount = (account) => {
    setAccounts([...accounts, account]);
  };

  const openEditModal = (index) => {
    setAccountToEdit({ ...accounts[index], index });
    setIsModalOpen(true);
  };

  const handleUpdateAccount = (updatedAccount) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountToEdit.index] = updatedAccount;
    setAccounts(updatedAccounts);
    setAccountToEdit(null);
    setIsModalOpen(false);
  };

  const openDeleteModal = (index) => {
    setAccountToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    const updated = accounts.filter((_, i) => i !== accountToDelete);
    setAccounts(updated);
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const handleLogout = () => {
    alert("Logged out!");
    setIsProfileOpen(false);
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
              {superAdminProfile.name} 
              <FaBell className="header-bell-icon" title="Notifications" />
            </span>
            <img
              src={superAdminProfile.photo}
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
              accounts.map((acc, index) => (
                <tr key={index}>
                  <td>{acc.name}</td>
                  <td>{acc.email}</td>
                  <td>{acc.role}</td>
                  <td
                    className={
                      acc.status === "Active" ? "active" : "inactive"
                    }
                  >
                    {acc.status}
                  </td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(index)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => openDeleteModal(index)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

      {/* PROFILE VIEW MODAL */}
      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="profile-modal-card">
            <span
              className="close-icon"
              onClick={() => setIsProfileOpen(false)}
            >
              ✖
            </span>

            <div className="profile-picture">
              <img src={superAdminProfile.photo} alt="Profile" />
            </div>

            <h3 className="profile-name">{superAdminProfile.name}</h3>

            <div className="profile-actions">
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <FaUserEdit className="btn-icon" /> 
                  Edit Profile
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

            <h3 className="profile-name">Edit Profile</h3>

            <div className="profile-picture">
              <img src={superAdminProfile.photo} alt="Profile" />

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                id="profileFileInput"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setSuperAdminProfile({
                      ...superAdminProfile,
                      photo: reader.result,
                    });
                  };
                  if (file) reader.readAsDataURL(file);
                }}
              />

              {/* Overlay + icon */}
              <label htmlFor="profileFileInput" className="profile-upload-icon">
                <FaCamera />
              </label>

            </div>


            <input
              type="text"
              value={superAdminProfile.name}
              onChange={(e) =>
                setSuperAdminProfile({
                  ...superAdminProfile,
                  name: e.target.value,
                })
              }
              placeholder="Full Name"
              className="profile-input"
            />

            <input
              type="email"
              value={superAdminProfile.email}
              onChange={(e) =>
                setSuperAdminProfile({
                  ...superAdminProfile,
                  email: e.target.value,
                })
              }
              placeholder="Email"
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
