import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import CreateFormModal from "./Createformmodal";
import logo from "../assets/eFormX.png";
import headerLogo from "../assets/logoforheader.png";
import formService from "../services/formService";
import {
  FaBell,
  FaPlus,
  FaShareAlt,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaDownload,
  FaUserEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaSearch,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Dashboard({ onLogout, userEmail, userName }) {
  const defaultAdminAvatar =
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200";

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedFormAnalytics, setSelectedFormAnalytics] = useState(null);

  const [isResponsesOpen, setIsResponsesOpen] = useState(false);
  const [selectedFormResponses, setSelectedFormResponses] = useState(null);
  const [responsesSearchTerm, setResponsesSearchTerm] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [adminName, setAdminName] = useState(userName || "Admin");
  const [adminEmail, setAdminEmail] = useState(userEmail || "admin@eformx.com");
  const [adminAvatar, setAdminAvatar] = useState(defaultAdminAvatar);
  const [tempAdminName, setTempAdminName] = useState(userName || "Admin");
  const [tempAdminEmail, setTempAdminEmail] = useState(userEmail || "admin@eformx.com");
  const [tempAdminAvatar, setTempAdminAvatar] = useState(defaultAdminAvatar);
  const [profileNotification, setProfileNotification] = useState({ type: "", message: "" });

  // Change password
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // no longer used visually
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false); // no longer used visually
  const [hideChangePasswordCta, setHideChangePasswordCta] = useState(false);

  const resetChangePasswordFields = () => {
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const openChangePassword = () => {
    setHideChangePasswordCta(true);
    setTimeout(() => setHideChangePasswordCta(false), 700);
    setIsChangePasswordOpen(true);
    resetChangePasswordFields();
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await formService.getForms();
      console.log('=== FETCH FORMS DEBUG ===');
      console.log('Raw API response:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Length:', data?.length);

      if (Array.isArray(data) && data.length > 0) {
        console.log('First form structure:', data[0]);
        console.log('First form title:', data[0]?.title);
        console.log('First form description:', data[0]?.description);
      }

      setForms(Array.isArray(data) ? data : []);
      console.log('Forms set to state');
    } catch (err) {
      console.error("Failed to fetch forms:", err);
      setError("Failed to load forms. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // ===== MODAL HANDLERS =====
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormToEdit(null);
  };

  // ===== CREATE / UPDATE =====
  const handleCreateForm = async (formData) => {
    try {
      if (isEditMode) {
        const updated = await formService.updateForm(formToEdit.id, {
          ...formData,
          status: formToEdit.status // Maintain current status on edit
        });
        console.log('Updated form data:', updated);
        setForms(forms.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await formService.createForm({
          ...formData,
          status: 'active' // Default status
        });
        console.log('Created form data:', created);
        setForms([created, ...forms]);
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save form:", err);
      alert("Failed to save form. Please try again.");
    }
  };

  // ===== EDIT =====
  const handleEditForm = (formId) => {
    const selected = forms.find((f) => f.id === formId);
    setFormToEdit(selected);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // ===== TOGGLE STATUS (Activate/Deactivate) =====
  const handleToggleFormStatus = async (formId) => {
    try {
      const target = forms.find((f) => f.id === formId);
      if (!target) return;
      const current = (target.status || 'active').toLowerCase();
      const nextStatus = current === 'active' ? 'closed' : 'active';
      const updated = await formService.updateForm(formId, { status: nextStatus });
      setForms(forms.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err) {
      console.error('Failed to toggle form status:', err);
      alert('Could not update form status. Please try again.');
    }
  };

  // ===== SHARE =====
  const handleShareForm = (formId) => {
    const link = `${window.location.origin}/form/${formId}`;
    setShareLink(link);
    setIsShareModalOpen(true);
  };
  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareLink("");
  };

  // ===== DELETE =====
  const handleDeleteForm = (formId) => {
    setFormToDelete(formId);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    try {
      await formService.deleteForm(formToDelete);
      setForms(forms.filter((form) => form.id !== formToDelete));
      setIsDeleteModalOpen(false);
      setFormToDelete(null);
    } catch (err) {
      console.error("Failed to delete form:", err);
      alert("Failed to delete form.");
    }
  };
  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFormToDelete(null);
  };

  // ===== ANALYTICS (Stats Overview) =====
  const handleAnalytics = async (formId) => {
    try {
      const analyticsData = await formService.getFormAnalytics(formId) || {};
      setSelectedFormAnalytics({
        id: analyticsData.form_id || formId,
        title: analyticsData.title || "Form Analytics",
        analytics: analyticsData.analytics || {
          totalRespondents: 0,
          completionRate: 0,
          recentActivity: 0
        }
      });
      setIsAnalyticsOpen(true);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      alert("Failed to load analytics data.");
    }
  };

  // ===== VIEW RESPONSES (Detailed Table) =====
  const handleViewResponses = async (formId) => {
    try {
      const responses = await formService.getFormResponses(formId);
      console.log('Fetched responses:', responses);
      const selected = forms.find((f) => String(f.id) === String(formId));
      setSelectedFormResponses({
        ...(selected || {}),
        responses: Array.isArray(responses) ? responses : []
      });
      setIsResponsesOpen(true);
    } catch (err) {
      console.error("Failed to fetch responses:", err);
      alert("Could not load responses.");
    }
  };

  // ===== EXPORT CSV =====
  const handleExportCSV = () => {
    if (!selectedFormResponses) return;

    const headers = [
      "Submission Date",
      "Respondent Name",
      "Respondent Email",
      "Responses Summary",
    ];
    const rows = selectedFormResponses.responses.map((r) => [
      new Date(r.created_at).toLocaleDateString(),
      r.respondent_name || "Anonymous",
      r.respondent_email || "N/A",
      JSON.stringify(r.responses || {}).substring(0, 100),
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedFormResponses.title}_responses.csv`;
    link.click();
  };

  // ===== PROFILE MANAGEMENT =====
  const handleOpenProfile = () => {
    setIsProfileOpen(true);
    setIsProfileEditMode(false);
    setIsChangePasswordOpen(false);
    resetChangePasswordFields();
    // Reset temp values to current values when opening
    setTempAdminName(adminName);
    setTempAdminEmail(adminEmail);
    setTempAdminAvatar(adminAvatar);
    // Clear any notifications
    setProfileNotification({ type: "", message: "" });
  };

  const handleEditProfile = () => {
    setIsProfileEditMode(true);
  };

  const handleSaveProfile = () => {
    const trimmedName = tempAdminName.trim();
    const trimmedEmail = tempAdminEmail.trim();

    // Clear previous notifications
    setProfileNotification({ type: "", message: "" });

    if (!trimmedName) {
      setProfileNotification({ type: "error", message: "Please enter a name" });
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setProfileNotification({ type: "error", message: "Please enter a valid email address" });
      return;
    }

    (async () => {
      try {
        const authService = (await import("../services/authService")).default;

        // If user entered a new password, validate it here (no separate save button)
        const hasPasswordChange = !!newPassword || !!confirmNewPassword;
        if (hasPasswordChange) {
          if (!newPassword || newPassword.length < 6) {
            setProfileNotification({ type: "error", message: "New password must be at least 6 characters" });
            return;
          }
          if (newPassword !== confirmNewPassword) {
            setProfileNotification({ type: "error", message: "New passwords do not match" });
            return;
          }
        }

        // Persist profile changes to backend
        const updated = await authService.updateProfile({
          name: trimmedName,
          email: trimmedEmail,
        });

        // If requested, persist password change
        if (hasPasswordChange) {
          setIsChangingPassword(true);
          await authService.changePassword({
            password: newPassword,
            password_confirmation: confirmNewPassword,
          });
          resetChangePasswordFields();
          setIsChangePasswordOpen(false);
        }

        // Update local UI state
        setAdminName(updated.name || trimmedName);
        setAdminEmail(updated.email || trimmedEmail);
        setAdminAvatar(tempAdminAvatar || defaultAdminAvatar);
        setIsProfileEditMode(false);

        // Show success notification
        setProfileNotification({
          type: "success",
          message: hasPasswordChange ? "Profile and password updated successfully!" : "Profile updated successfully!",
        });
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setProfileNotification({ type: "", message: "" });
        }, 3000);

        // Optional: Refresh stored user in memory for current session
        try {
          const storedStr = localStorage.getItem('user');
          const stored = storedStr ? JSON.parse(storedStr) : {};
          const next = { ...stored, name: updated.name, email: updated.email };
          localStorage.setItem('user', JSON.stringify(next));
        } catch {}
      } catch (err) {
        console.error('Failed to save profile:', err);
        const errorMsg =
          err?.response?.data?.message ||
          (err?.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(" ")
            : null) ||
          "Failed to save profile. Please try again.";
        setProfileNotification({ type: "error", message: errorMsg });
      } finally {
        setIsChangingPassword(false);
      }
    })();
  };

  const handleCancelEditProfile = () => {
    // Reset temp values to current values
    setTempAdminName(adminName);
    setTempAdminEmail(adminEmail);
    setTempAdminAvatar(adminAvatar);
    setIsProfileEditMode(false);
    setIsChangePasswordOpen(false);
    resetChangePasswordFields();
    // Clear notifications
    setProfileNotification({ type: "", message: "" });
  };

  // Password is saved via "Save Changes" only.

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAdminAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredResponses =
    selectedFormResponses && Array.isArray(selectedFormResponses.responses)
      ? selectedFormResponses.responses.filter((response) => {
          const term = responsesSearchTerm.trim().toLowerCase();
          if (!term) return true;
          const name = (response.respondent_name || "").toLowerCase();
          const email = (response.respondent_email || "").toLowerCase();
          return name.includes(term) || email.includes(term);
        })
      : [];

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src={headerLogo} alt="eFormX" className="header-logo" />
        </div>
        <div className="header-right">
          <FaBell className="icon-bell" />
          <div
            className="admin-profile clickable-profile"
            onClick={handleOpenProfile}
          >
            <span className="admin-label">{adminName}</span>
            <div className="profile-avatar">
              <img src={adminAvatar} alt={adminName} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="main-container">
        <div className="content-wrapper">
          <div className="section-header">
            <div className="section-title">
              <h1>FORMS</h1>
              <p className="section-subtitle">
                Manage and Track your active forms
              </p>
            </div>
            <button className="create-form-btn" onClick={openModal}>
              <FaPlus /> Create Form
            </button>
          </div>

          <div className="forms-grid">
            {loading ? (
              <div className="loading-state">Loading your forms...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : forms.length === 0 ? (
              <div className="empty-state">
                <FaPlus size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No forms created yet.</p>
                <button className="create-form-btn" onClick={openModal} style={{ marginTop: '1rem' }}>
                  Create Your First Form
                </button>
              </div>
            ) : forms.length > 0 ? (
              forms.map((form) => {
                console.log('Rendering form card:', form.id, 'Title:', form.title);
                return (
                  <div
                    key={form.id}
                    className="form-card"
                    onClick={() => handleViewResponses(form.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="form-card-header">
                      <h2>{form.title || "Untitled Form"}</h2>
                      <span className={`status-badge ${String(form.status||'active').toLowerCase()}`}> 
                        {String(form.status || 'active').toUpperCase()}
                      </span>
                      <div className="card-actions">
                        <FaChartBar
                          className="action-icon"
                          title="Analytics"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalytics(form.id);
                          }}
                        />
                        <FaTrash
                          className="action-icon"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteForm(form.id);
                          }}
                        />
                      </div>
                    </div>
                    <p className="form-description">{form.description || "No description provided."}</p>
                    <div className="card-footer">
                      <button
                        className="btn-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareForm(form.id);
                        }}
                      >
                        <FaShareAlt /> Share
                      </button>
                      <button
                        className="btn-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditForm(form.id);
                        }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className={`toggle-switch ${String(form.status||'active').toLowerCase() === 'active' ? 'active' : 'inactive'}`}
                        title={String(form.status||'active').toLowerCase() === 'active' ? 'Click to deactivate' : 'Click to activate'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFormStatus(form.id);
                        }}
                        aria-label={String(form.status||'active').toLowerCase() === 'active' ? 'Deactivate form' : 'Activate form'}
                      >
                        <span className="knob" />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty-state">
                <FaPlus size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No valid forms found.</p>
                <button className="create-form-btn" onClick={openModal} style={{ marginTop: '1rem' }}>
                  Create Your First Form
                </button>
              </div>
            )}

            {!loading && !error && forms.length > 0 && (
              <div className="add-form-card" onClick={openModal}>
                <FaPlus className="add-icon" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <CreateFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreateForm={handleCreateForm}
        editMode={isEditMode}
        formData={formToEdit}
      />

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Share Form</h2>
            <p>Copy the link below to share this form:</p>
            <input
              type="text"
              value={shareLink}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <button onClick={closeShareModal}>Close</button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Form</h2>
            <p>This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS MODAL - Stats Overview */}
      {isAnalyticsOpen && selectedFormAnalytics && (
        <div className="modal-overlay">
          <div className="analytics-stats-modal">
            <div className="analytics-stats-header">
              <h2>{selectedFormAnalytics.title}</h2>
              <button
                className="close-analytics-btn"
                onClick={() => {
                  setIsAnalyticsOpen(false);
                  setSelectedFormAnalytics(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="analytics-stats-content">
              <div className="stat-card">
                <div className="stat-label">Total Respondents</div>
                <div className="stat-value">
                  {selectedFormAnalytics.analytics.totalRespondents}
                  <span className="stat-percentage">%</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completion Rate</div>
                <div className="stat-value">
                  {selectedFormAnalytics.analytics.completionRate}
                  <span className="stat-percentage">%</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Recent Activity</div>
                <div className="stat-value">
                  {selectedFormAnalytics.analytics.recentActivity}
                  <span className="stat-percentage">%</span>
                </div>
              </div>
            </div>
            <div className="analytics-stats-footer">
              <button
                className="export-csv-btn"
                onClick={() => {
                  setSelectedFormResponses(selectedFormAnalytics);
                  handleExportCSV();
                }}
              >
                <FaDownload style={{ marginRight: "8px" }} />
                Export CSV
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RESPONSES MODAL - Detailed Table */}
      {isResponsesOpen && selectedFormResponses && (
        <div className="modal-overlay">
          <div className="responses-modal">
            <div className="responses-header">
              <h2>{selectedFormResponses.title} - Responses</h2>
              <div className="responses-search-wrapper">
                <FaSearch className="responses-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={responsesSearchTerm}
                  onChange={(e) => setResponsesSearchTerm(e.target.value)}
                  className="responses-search-input"
                />
              </div>
              <button
                className="close-responses-btn"
                onClick={() => {
                  setIsResponsesOpen(false);
                  setSelectedFormResponses(null);
                  setResponsesSearchTerm("");
                }}
              >
                ✕
              </button>
            </div>
            <div className="responses-table-wrapper">
              <table className="responses-table">
                <thead>
                  <tr>
                    <th>Submission Date</th>
                    <th>Respondent Name</th>
                    <th>Respondent Email</th>
                    <th>Responses Summary</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses && filteredResponses.length > 0 ? (
                    filteredResponses.map((response, index) => {
                      const responsesStr = JSON.stringify(response.responses || {});
                      return (
                        <tr key={index}>
                          <td>{new Date(response.created_at).toLocaleDateString()}</td>
                          <td>{response.respondent_name || "Anonymous"}</td>
                          <td>{response.respondent_email || "N/A"}</td>
                          <td title={responsesStr}>
                            {responsesStr.substring(0, 50)}{responsesStr.length > 50 ? "..." : ""}
                          </td>
                          <td>
                            <button className="view-btn">View Detail</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                        No responses submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="responses-footer">
              <button className="export-csv-btn" onClick={handleExportCSV}>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <div className="profile-card">
              <div className="profile-header-top">
                <span
                  className="profile-back-icon"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleCancelEditProfile();
                  }}
                >
                  ←
                </span>
                <img
                  src={logo}
                  alt="eFormX logo"
                  className="profile-logo-mark"
                />
              </div>

              <div className="profile-main">
                {/* NOTIFICATION */}
                {profileNotification.message && (
                  <div className={`profile-notification ${profileNotification.type}`}>
                    {profileNotification.message}
                  </div>
                )}

                {!isProfileEditMode ? (
                  // VIEW MODE
                  <>
                    <div className="profile-avatar-wrapper">
                      <img
                        src={adminAvatar}
                        alt={adminName}
                        className="profile-avatar-large"
                      />
                    </div>

                    <div className="profile-name">{adminName}</div>
                    <div className="profile-email">{adminEmail}</div>

                    <button
                      className="edit-profile-btn"
                      onClick={handleEditProfile}
                    >
                      <FaUserEdit /> Edit Profile
                    </button>

                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  // EDIT MODE
                  <>
                    <div className="profile-avatar-wrapper profile-avatar-editable">
                      <img
                        src={tempAdminAvatar}
                        alt={tempAdminName}
                        className="profile-avatar-large"
                      />
                      <label className="avatar-change-btn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          style={{ display: "none" }}
                        />
                        <FaCamera className="avatar-change-icon" />
                      </label>
                    </div>

                    <div className="profile-edit-form">
                      <div className="profile-form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          className="profile-input"
                          value={tempAdminName}
                          onChange={(e) => {
                            setTempAdminName(e.target.value);
                            if (profileNotification.message) setProfileNotification({ type: "", message: "" });
                          }}
                          placeholder="Enter your name"
                        />
                      </div>

                      <div className="profile-form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          className="profile-input"
                          value={tempAdminEmail}
                          onChange={(e) => {
                            setTempAdminEmail(e.target.value);
                            if (profileNotification.message) setProfileNotification({ type: "", message: "" });
                          }}
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* CHANGE PASSWORD */}
                      <div className="profile-form-group">
                        <div className="profile-section-header">
                          {!hideChangePasswordCta && !isChangePasswordOpen && (
                            <button
                              type="button"
                              className="profile-link-btn"
                              onClick={() => {
                                openChangePassword();
                                if (profileNotification.message) setProfileNotification({ type: "", message: "" });
                              }}
                            >
                              Change Password
                            </button>
                          )}
                        </div>

                        {isChangePasswordOpen && (
                          <div className="profile-password-panel">
                            <div className="profile-form-group">
                              <label>New password</label>
                              <div className="profile-password-row">
                                <input
                                  type="password"
                                  className="profile-input profile-password-input"
                                  value={newPassword}
                                  onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (profileNotification.message) setProfileNotification({ type: "", message: "" });
                                  }}
                                  placeholder="Enter new password"
                                  autoComplete="new-password"
                                />
                              </div>
                              {newPassword.length > 0 && newPassword.length < 6 && (
                                <div className="profile-field-error">Password must be at least 6 characters.</div>
                              )}
                            </div>

                            <div className="profile-form-group">
                              <label>Confirm new password</label>
                              <div className="profile-password-row">
                                <input
                                  type="password"
                                  className="profile-input profile-password-input"
                                  value={confirmNewPassword}
                                  onChange={(e) => {
                                    setConfirmNewPassword(e.target.value);
                                    if (profileNotification.message) setProfileNotification({ type: "", message: "" });
                                  }}
                                  placeholder="Confirm new password"
                                  autoComplete="new-password"
                                />
                              </div>
                              {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                                <div className="profile-field-error">Passwords do not match.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="profile-edit-actions">
                        <button
                          className="profile-cancel-btn"
                          onClick={handleCancelEditProfile}
                        >
                          <FaTimes /> Cancel
                        </button>
                        <button
                          className="profile-save-btn"
                          onClick={handleSaveProfile}
                        >
                          <FaSave /> Save Changes
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;