import React, { useEffect, useState } from "react";
import "../styles/SuperAdminDashboard.css";
import { FaBell, FaPlus, FaEdit, FaTrash, FaUserEdit, FaCamera } from "react-icons/fa";
import CreateAccountModal from "./CreateAccountModal";
import logo from "../assets/eFormX.png";
import authService from "../services/authService";
import userService from "../services/userService";
import { FaSearch } from "react-icons/fa";
import notificationsService from "../services/notificationsService";


function SuperAdminDashboard({ onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [accountToEdit, setAccountToEdit] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;


  // Load accounts from backend on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const users = await userService.getUsers();
        setAccounts(users);
        setError("");
      } catch (e) {
        console.error("Failed to load users:", e);
        setError("Failed to load accounts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
    // Load notifications for Super Admin
    const loadNotifications = async () => {
      try {
        const items = await notificationsService.list();
        setNotifications(items);
      } catch (e) {
        // ignore for now
      }
    };
    loadNotifications();
  }, []);

  // Auto-refresh accounts periodically to stay in sync with backend
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const users = await userService.getUsers();
        setAccounts(users);
      } catch (e) {
        // ignore transient errors
      }
    }, 3000); // every 3 seconds to match notifications cadence

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh notifications in the background (no page restart needed)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const items = await notificationsService.list();
        setNotifications(items);
      } catch (e) {
        // ignore transient errors
      }
    }, 3000); // every 3 seconds for snappier updates

    return () => clearInterval(interval);
  }, []);

  // ✅ Persistent Super Admin Profile
  const [superAdminProfile, setSuperAdminProfile] = useState(() => {
    const currentUser = authService.getCurrentUser();
    const saved = localStorage.getItem("superAdminProfile");
    const savedObj = saved ? JSON.parse(saved) : null;

    if (currentUser) {
      return {
        name: currentUser.name,
        email: currentUser.email,
        photo: savedObj?.photo || "https://i.pravatar.cc/150?img=5",
      };
    }

    return (
      savedObj || {
        name: "Admin",
        email: "admin@example.com",
        photo: "https://i.pravatar.cc/150?img=5",
      }
    );
  });

  const handleSaveProfile = async () => {
    try {
      // Persist profile changes to backend account (Super Admin)
      const updated = await authService.updateProfile({
        name: superAdminProfile.name,
        email: superAdminProfile.email,
      });

      // Keep local UI profile in sync
      const nextProfile = {
        ...superAdminProfile,
        name: updated.name,
        email: updated.email,
      };
      setSuperAdminProfile(nextProfile);
      localStorage.setItem("superAdminProfile", JSON.stringify(nextProfile));

      setProfileMessage("Profile updated!");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to update profile.";
      setProfileMessage(msg);
    } finally {
      setTimeout(() => setProfileMessage(""), 2000);
    }
  };

  // Account Logic
  const handleCreateAccount = async (account) => {
    try {
      const created = await userService.createUser(account);
      setAccounts((prev) => [...prev, created]);
      setError("");
      // Refresh notifications immediately so the bell reflects the action
      try {
        const items = await notificationsService.list();
        setNotifications(items);
      } catch (_) {}
      // Also refresh accounts from backend to confirm state
      try {
        const users = await userService.getUsers();
        setAccounts(users);
      } catch (_) {}
    } catch (e) {
      console.error("Create user failed:", e);
      const message = e?.response?.data?.message || "Failed to create account.";
      setError(message);
      throw e; // allow modal to surface error
    }
  };

  const openEditModal = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleUpdateAccount = async (updatedAccount) => {
    if (!accountToEdit) return;
    try {
      const id = accountToEdit.id;
      const updated = await userService.updateUser(id, updatedAccount, accountToEdit.role);
      setAccounts((prev) => 
        prev.map(acc => acc.id === id ? updated : acc)
      );
      setAccountToEdit(null);
      setIsModalOpen(false);
      setError("");
    } catch (e) {
      console.error("Update user failed:", e);
      const message = e?.response?.data?.message || "Failed to update account.";
      setError(message);
      throw e; // allow modal to surface error
    }
  };

  const openDeleteModal = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const target = accountToDelete;
      if (target?.id) {
        await userService.deleteUser(target.id, target.role);
        setAccounts((prev) => prev.filter(acc => acc.id !== target.id));
        // Refresh notifications immediately so the bell reflects the action
        try {
          const items = await notificationsService.list();
          setNotifications(items);
        } catch (_) {}
        // Also refresh accounts from backend to confirm state
        try {
          const users = await userService.getUsers();
          setAccounts(users);
        } catch (_) {}
      }
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
      setError("");
    } catch (e) {
      console.error("Delete user failed:", e);
      const message = e?.response?.data?.message || "Failed to delete account.";
      setError(message);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      setIsProfileOpen(false);
      // Clear any locally cached profile so next login reads backend user
      localStorage.removeItem("superAdminProfile");
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
  const term = searchTerm.toLowerCase();

  return (
    acc.name?.toLowerCase().includes(term) ||
    acc.email?.toLowerCase().includes(term) ||
    acc.role?.toLowerCase().includes(term) ||
    acc.status?.toLowerCase().includes(term)
  );
});



  return (
    <div className="superadmin">
      {/* HEADER */}
      <header className="sa-header">
        <div className="sa-logo">
          <img src={logo} alt="eFormX Logo" className="logo-img" />
        </div>

        <div className="sa-right">
          <div style={{ position: "relative" }}>
            <FaBell className="icon" onClick={() => setShowNotifications(v => !v)} style={{ cursor: "pointer" }} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "#ef4444",
                color: "#fff",
                borderRadius: "9999px",
                fontSize: 12,
                padding: "2px 6px"
              }}>{unreadCount}</span>
            )}
            {showNotifications && (
              <div style={{
                position: "absolute",
                right: 0,
                top: 28,
                width: 280,
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                borderRadius: 8,
                overflow: "hidden",
                zIndex: 10
              }}>
                <div style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>Notifications</span>
                  <button
                    onClick={async () => {
                      try { await notificationsService.markAllRead(); const items = await notificationsService.list(); setNotifications(items);} catch {}
                    }}
                    style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer" }}
                  >Mark all read</button>
                  <button
                    onClick={async () => { try { await notificationsService.deleteAll(); const items = await notificationsService.list(); setNotifications(items);} catch {} }}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: 8 }}
                  >Delete all</button>
                </div>
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 12, color: "#6b7280" }}>No notifications</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: 12, borderBottom: "1px solid #f3f4f6", background: n.is_read ? "#fff" : "#f9fafb" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>{n.message}</div>
                      {!n.is_read && (
                        <button
                          onClick={async () => { try { await notificationsService.markRead(n.id); const items = await notificationsService.list(); setNotifications(items);} catch {} }}
                          style={{ marginTop: 6, background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 12 }}
                        >Mark read</button>
                      )}
                      <button
                        onClick={async () => { try { await notificationsService.delete(n.id); const items = await notificationsService.list(); setNotifications(items);} catch {} }}
                        style={{ marginTop: 6, background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, marginLeft: 12, display: "inline-flex", alignItems: "center" }}
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div
            className="profile"
            onClick={() => setIsProfileOpen(true)}
            style={{ cursor: "pointer" }}
          >
            {/* <span className="profile-name-with-bell">
              {superAdminProfile.name} 
              <FaBell className="header-bell-icon" title="Notifications" />
            </span> */}
            <img
              src={superAdminProfile.photo}
              alt="Profile"
              className="header-profile-pic"
            />
          </div>
        </div>

      </header>


      {/* TITLE */}
      <div className="page-title">
        <h2>Account Management</h2>
          <div className="page-actions">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

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
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '10px 12px',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            {error}
          </div>
        )}
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
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-row" style={{ textAlign: "center", padding: "20px" }}>Loading accounts...</td>
              </tr>
            ) : accounts && Array.isArray(accounts) && accounts.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row" style={{ textAlign: "center", padding: "20px" }}>
                  No accounts created yet
                </td>
              </tr>
            ) : (
              filteredAccounts.map((acc, index) => (
                <tr key={`${acc.email || ''}-${acc.role || ''}-${acc.id ?? index}`}>
                  <td>{acc.name}</td>
                  <td>{acc.email}</td>
                  <td>{acc.role}</td>
                  <td
                    className={
                      String(acc.status).toLowerCase() === "active" ? "active" : "inactive"
                    }
                  >
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

            {profileMessage && (
              <div className="success-banner" role="status" aria-live="polite">
                {profileMessage}
              </div>
            )}

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

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal-card">
            <h3>Are you sure you want to delete this account?</h3>

            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default SuperAdminDashboard;
