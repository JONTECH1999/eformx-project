import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import CreateFormModal from "./Createformmodal";
import AnalyticsCharts from "./AnalyticsCharts";
import logo from "../assets/eFormX.png";
import headerLogo from "../assets/logoforheader.png";
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
} from "react-icons/fa";
import formService from "../services/formService";
import authService from "../services/authService";

function Dashboard({ userEmail, onLogout }) {
  const defaultAdminAvatar =
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200";

  // Profile state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState(userEmail || "admin@eformx.com");
  const [adminAvatar, setAdminAvatar] = useState(defaultAdminAvatar);
  const [tempAdminName, setTempAdminName] = useState(adminName);
  const [tempAdminEmail, setTempAdminEmail] = useState(adminEmail);
  const [tempAdminAvatar, setTempAdminAvatar] = useState(adminAvatar);

  // Form state
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
  const [searchQuery, setSearchQuery] = useState("");

  const adminAvatarUrl =
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200";

  // Fetch forms on mount
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await formService.getForms();
      setForms(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("Failed to load forms. Please try again.");
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
        await formService.updateForm(formToEdit.id, formData);
      } else {
        await formService.createForm(formData);
      }
      await fetchForms();
      closeModal();
    } catch (err) {
      console.error("Error saving form:", err);
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

  // ===== STATUS TOGGLE =====
  const handleStatusToggle = async (formId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      setForms(
        forms.map((f) => (f.id === formId ? { ...f, status: newStatus } : f))
      );
      await formService.updateForm(formId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      setForms(forms.map((f) => (f.id === formId ? { ...f, status: currentStatus } : f)));
      alert("Failed to update status");
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
      await fetchForms();
      setIsDeleteModalOpen(false);
      setFormToDelete(null);
    } catch (err) {
      console.error("Error deleting form:", err);
      alert("Failed to delete form. Please try again.");
    }
  };
  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFormToDelete(null);
  };

  // ===== ANALYTICS =====
  const handleAnalytics = (formId) => {
    const selected = forms.find((f) => f.id === formId);
    setSelectedFormAnalytics(selected);
    setIsAnalyticsOpen(true);
  };

  // ===== RESPONSES =====
  const handleViewResponses = async (formId) => {
    try {
      const form = forms.find((f) => f.id === formId);
      const responses = await formService.getFormResponses(formId);
      setSelectedFormResponses({ ...form, responses });
      setSearchQuery("");
      setIsResponsesOpen(true);
    } catch (err) {
      console.error("Error fetching responses:", err);
      alert("Failed to load responses. Please try again.");
    }
  };

  const filteredResponses =
    selectedFormResponses?.responses?.filter((r) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        r.respondent_name?.toLowerCase().includes(query) ||
        r.respondent_email?.toLowerCase().includes(query) ||
        Object.values(r.responses).join(" ").toLowerCase().includes(query)
      );
    }) || [];

  const handleExportCSV = () => {
    if (!selectedFormResponses || !selectedFormResponses.responses) return;
    const headers = ["Submission Date", "Respondent Name", "Respondent Email", "Responses"];
    const rows = selectedFormResponses.responses.map((r) => [
      new Date(r.created_at).toLocaleDateString(),
      r.respondent_name || "Anonymous",
      r.respondent_email || "N/A",
      JSON.stringify(r.responses),
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

  // ===== PROFILE =====
  const handleOpenProfile = () => {
    setIsProfileOpen(true);
    setIsProfileEditMode(false);
    setTempAdminName(adminName);
    setTempAdminEmail(adminEmail);
    setTempAdminAvatar(adminAvatar);
  };

  const handleEditProfile = () => setIsProfileEditMode(true);

  const handleSaveProfile = () => {
    const trimmedName = tempAdminName.trim();
    const trimmedEmail = tempAdminEmail.trim();
    if (!trimmedName) return alert("Please enter a name");
    if (!trimmedEmail || !trimmedEmail.includes("@"))
      return alert("Please enter a valid email address");
    setAdminName(trimmedName);
    setAdminEmail(trimmedEmail);
    setAdminAvatar(tempAdminAvatar || defaultAdminAvatar);
    setIsProfileEditMode(false);
  };

  const handleCancelEditProfile = () => {
    setTempAdminName(adminName);
    setTempAdminEmail(adminEmail);
    setTempAdminAvatar(adminAvatar);
    setIsProfileEditMode(false);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempAdminAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    if (onLogout) onLogout();
    else window.location.reload();
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src={headerLogo} alt="eFormX" className="header-logo" />
        </div>
        <div className="header-right">
          <FaBell className="icon-bell" />
          <div className="admin-profile clickable-profile" onClick={handleOpenProfile}>
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
              <p className="section-subtitle">Manage and Track your active forms</p>
            </div>
            <button className="create-form-btn" onClick={openModal}>
              <FaPlus /> Create Form
            </button>
          </div>

          {loading && <p>Loading forms...</p>}
          {error && (
            <div>
              <p>{error}</p>
              <button onClick={fetchForms}>Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div className="forms-grid">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="form-card"
                  onClick={() => handleViewResponses(form.id)}
                >
                  <div className="form-card-header">
                    <h2>{form.title}</h2>
                    <div className="card-actions">
                      <FaChartBar
                        className="action-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalytics(form.id);
                        }}
                      />
                      <FaTrash
                        className="action-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteForm(form.id);
                        }}
                      />
                    </div>
                  </div>
                  <p className="form-description">{form.description}</p>
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
                  </div>
                </div>
              ))}
              <div className="add-form-card" onClick={openModal}>
                <FaPlus className="add-icon" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <CreateFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreateForm={handleCreateForm}
        editMode={isEditMode}
        formData={formToEdit}
      />

      {isShareModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Share Form</h2>
            <input type="text" value={shareLink} readOnly onFocus={(e) => e.target.select()} />
            <button onClick={closeShareModal}>Close</button>
          </div>
        </div>
      )}

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
            <AnalyticsCharts
              form={selectedFormAnalytics}
              responses={selectedFormAnalytics.responses}
            />
          </div>
        </div>
      )}

      {isResponsesOpen && selectedFormResponses && (
        <div className="modal-overlay">
          <div className="responses-modal">
            <div className="responses-header">
              <h2>{selectedFormResponses.title} - Responses</h2>
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => setIsResponsesOpen(false)}>✕</button>
            </div>
            <div className="responses-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((r, i) => (
                    <tr key={i}>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>{r.respondent_name || "Anonymous"}</td>
                      <td>{r.respondent_email || "N/A"}</td>
                      <td>{JSON.stringify(r.responses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleExportCSV}>Export CSV</button>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <div className="profile-card">
              <span onClick={() => setIsProfileOpen(false)}>←</span>
              {!isProfileEditMode ? (
                <>
                  <img src={adminAvatar} alt={adminName} />
                  <h3>{adminName}</h3>
                  <p>{adminEmail}</p>
                  <button onClick={handleEditProfile}>
                    <FaUserEdit /> Edit Profile
                  </button>
                  <button onClick={handleLogout}>Log out</button>
                </>
              ) : (
                <>
                  <img src={tempAdminAvatar} alt={tempAdminName} />
                  <input type="file" onChange={handleProfileImageChange} />
                  <input value={tempAdminName} onChange={(e) => setTempAdminName(e.target.value)} />
                  <input value={tempAdminEmail} onChange={(e) => setTempAdminEmail(e.target.value)} />
                  <button onClick={handleCancelEditProfile}>Cancel</button>
                  <button onClick={handleSaveProfile}>Save</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
