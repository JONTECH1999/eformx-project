import React, { useState } from "react";
import "../styles/SuperAdminDashboard.css";
import { FaBell, FaUserCircle, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import CreateAccountModal from "./CreateAccountModal";
import logo from "../assets/eFormX.png";


function SuperAdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [accountToEdit, setAccountToEdit] = useState(null); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 

  // Super Admin profile 
  const superAdminProfile = {
    name: "Super Admin",
    email: "superadmin@example.com",
    role: "Super Admin",
  };

  // CREATE NEW ACCOUNT
  const handleCreateAccount = (account) => {
    setAccounts([...accounts, account]);
  };

  // OPEN EDIT MODAL
  const openEditModal = (index) => {
    setAccountToEdit({ ...accounts[index], index }); 
    setIsModalOpen(true);
  };

  // UPDATE EXISTING ACCOUNT
  const handleUpdateAccount = (updatedAccount) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountToEdit.index] = updatedAccount;
    setAccounts(updatedAccounts);
    setAccountToEdit(null);
    setIsModalOpen(false);
  };

  // DELETE ACCOUNT
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

  // LOGOUT FUNCTION
  const handleLogout = () => {
    console.log("Logout clicked");
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

        <div className="sa-right">
          <FaBell className="icon" />
          <div
            className="profile"
            onClick={() => setIsProfileOpen(true)} 
            style={{ cursor: "pointer" }}
          >
            <span>{superAdminProfile.name}</span>
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
                  <td className={acc.status === "Active" ? "active" : "inactive"}>
                    {acc.status}
                  </td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button className="edit-btn" onClick={() => openEditModal(index)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => openDeleteModal(index)}>
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

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && accountToDelete !== null && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete <br />
              <strong>{accounts[accountToDelete].email}</strong>?
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

              <h3 className="profile-name">{superAdminProfile.name}</h3>

              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        )}

    </div>
  );
}

export default SuperAdminDashboard;
