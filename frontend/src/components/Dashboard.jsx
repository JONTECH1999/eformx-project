import React, { useState, useEffect } from "react";
import AnalyticsCharts from "./AnalyticsCharts";
import "../styles/Dashboard.css";
import CreateFormModal from "./Createformmodal";
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
} from "react-icons/fa";
import formService from "../services/formService";
import authService from "../services/authService";

function Dashboard({ userEmail, onLogout }) {
  const adminAvatar =
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200";

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

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch forms on component mount
  useEffect(() => {
    console.log('Dashboard mounted, fetching forms...');
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError("");
      console.log('Calling formService.getForms()...');
      const data = await formService.getForms();
      console.log('Forms fetched successfully:', data);
      setForms(data);
    } catch (err) {
      console.error("Error fetching forms:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
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
      await fetchForms(); // Refresh forms list
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
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      // Optimistic update
      setForms(forms.map(f => f.id === formId ? { ...f, status: newStatus } : f));

      await formService.updateForm(formId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on error
      setForms(forms.map(f => f.id === formId ? { ...f, status: currentStatus } : f));
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
      await fetchForms(); // Refresh forms list
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

  // ===== ANALYTICS (Stats Overview) =====
  const handleAnalytics = (formId) => {
    const selected = forms.find((f) => f.id === formId);
    setSelectedFormAnalytics(selected);
    setIsAnalyticsOpen(true);
  };

  // ===== VIEW RESPONSES (Detailed Table) =====
  const handleViewResponses = async (formId) => {
    try {
      const form = forms.find((f) => f.id === formId);
      const responses = await formService.getFormResponses(formId);
      setSelectedFormResponses({ ...form, responses });
      setSearchQuery(""); // Reset search
      setIsResponsesOpen(true);
    } catch (err) {
      console.error("Error fetching responses:", err);
      alert("Failed to load responses. Please try again.");
    }
  };

  // ===== EXPORT CSV =====
  const handleExportCSV = () => {
    if (!selectedFormResponses || !selectedFormResponses.responses) return;

    const headers = [
      "Submission Date",
      "Respondent Name",
      "Respondent Email",
      "Responses",
    ];
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

  // ===== LOGOUT =====
  const handleLogout = async () => {
    await authService.logout();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  // ===== HELPERS =====
  const getQuestionLabel = (key) => {
    if (!selectedFormResponses || !selectedFormResponses.fields) return key;
    const field = selectedFormResponses.fields.find((f) => f.id === key);
    return field ? field.label : key;
  };

  // Filter responses based on search query
  const filteredResponses = selectedFormResponses?.responses?.filter((response) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();

    // Check name and email
    if (response.respondent_name?.toLowerCase().includes(searchLower)) return true;
    if (response.respondent_email?.toLowerCase().includes(searchLower)) return true;

    // Check response values
    const values = Object.values(response.responses).join(" ").toLowerCase();
    if (values.includes(searchLower)) return true;

    return false;
  }) || [];

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
            onClick={() => setIsProfileOpen(true)}
          >
            <span className="admin-label">Admin</span>
            <div className="profile-avatar">
              <img src={adminAvatar} alt="Admin" />
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

          {/* Loading State */}
          {loading && (
            <div className="loading-message">
              <p>Loading forms...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchForms}>Retry</button>
            </div>
          )}

          {/* Forms Grid */}
          {!loading && !error && (
            <div className="forms-grid">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="admin-form-card"
                  onClick={() => handleViewResponses(form.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-card-header">
                    <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
                      <span className={`status-badge ${form.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {form.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={form.status === 'active'}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusToggle(form.id, form.status);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <h2>{form.title}</h2>
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
                  <p className="admin-card-description">{form.description}</p>
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
            <div className="analytics-stats-body">
              <div className="analytics-stats-content">
                <div className="stat-card">
                  <div className="stat-label">Total Respondents</div>
                  <div className="stat-value">
                    {selectedFormAnalytics.analytics?.totalRespondents || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completion Rate</div>
                  <div className="stat-value">
                    {selectedFormAnalytics.analytics?.completionRate || 0}
                    <span className="stat-percentage">%</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Recent Activity</div>
                  <div className="stat-value">
                    {selectedFormAnalytics.analytics?.recentActivity || 0}
                  </div>
                </div>
              </div>
              <div className="analytics-charts-wrapper">
                <AnalyticsCharts
                  form={selectedFormAnalytics}
                  responses={selectedFormAnalytics.responses}
                />
              </div>
            </div>
            <div className="analytics-stats-footer">
              <button
                className="export-csv-btn"
                onClick={() => {
                  handleViewResponses(selectedFormAnalytics.id);
                  setIsAnalyticsOpen(false);
                }}
              >
                <FaDownload style={{ marginRight: "8px" }} />
                View Responses
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
              <div className="responses-controls">
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="responses-search-input"
                />
                <button
                  className="close-responses-btn"
                  onClick={() => {
                    setIsResponsesOpen(false);
                    setSelectedFormResponses(null);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="responses-table-wrapper">
              {filteredResponses.length > 0 ? (
                <table className="responses-table">
                  <thead>
                    <tr>
                      <th>Submission Date</th>
                      <th>Respondent Name</th>
                      <th>Respondent Email</th>
                      <th>Responses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response, index) => (
                      <tr key={index}>
                        <td>{new Date(response.created_at).toLocaleDateString()}</td>
                        <td>{response.respondent_name || "Anonymous"}</td>
                        <td>{response.respondent_email || "N/A"}</td>
                        <td>
                          <div className="response-list">
                            {Object.entries(response.responses).map(([key, value]) => (
                              <div key={key} className="response-item">
                                <span className="response-label">
                                  {getQuestionLabel(key)}
                                </span>
                                <span className="response-value">
                                  {Array.isArray(value) ? value.join(", ") : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", padding: "20px" }}>No responses yet.</p>
              )}
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
                  onClick={() => setIsProfileOpen(false)}
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
                <div className="profile-avatar-wrapper">
                  <img
                    src={adminAvatar}
                    alt="Admin"
                    className="profile-avatar-large"
                  />
                </div>

                <div className="profile-name">{userEmail || "ADMIN"}</div>

                <button className="logout-btn" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;