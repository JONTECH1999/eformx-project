import React, { useState } from "react";
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

function Dashboard() {
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

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [forms, setForms] = useState([
    {
      id: 1,
      title: "Customer Feedback",
      description:
        "Help us improve our service by providing your valuable feedback.",
      fields: [],
      analytics: {
        totalRespondents: 156,
        completionRate: 87,
        recentActivity: 12,
      },
      responses: [
        {
          date: "Jan 25, 2026",
          name: "Juan Dela Cruz",
          choice: "Very Satisfied",
          feedback: "Great service!",
        },
        {
          date: "Jan 26, 2026",
          name: "Maria Santos",
          choice: "Satisfied",
          feedback: "Can improve response time.",
        },
        {
          date: "Jan 27, 2026",
          name: "Pedro Reyes",
          choice: "Neutral",
          feedback: "No additional comments.",
        },
      ],
    },
  ]);

  // ===== MODAL HANDLERS =====
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormToEdit(null);
  };

  // ===== CREATE / UPDATE =====
  const handleCreateForm = (formData) => {
    if (isEditMode) {
      const updatedForms = forms.map((form) =>
        form.id === formToEdit.id ? { ...formData, id: form.id } : form
      );
      setForms(updatedForms);
    } else {
      const formWithId = {
        ...formData,
        id: Date.now(),
        analytics: {
          totalRespondents: 0,
          completionRate: 0,
          recentActivity: 0,
        },
        responses: [],
      };
      setForms([...forms, formWithId]);
    }
    closeModal();
  };

  // ===== EDIT =====
  const handleEditForm = (formId) => {
    const selected = forms.find((f) => f.id === formId);
    setFormToEdit(selected);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // ===== SHARE =====
  const handleShareForm = (formId) => {
    const link = `https://example.com/form/${formId}`;
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
  const confirmDelete = () => {
    setForms(forms.filter((form) => form.id !== formToDelete));
    setIsDeleteModalOpen(false);
    setFormToDelete(null);
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
  const handleViewResponses = (formId) => {
    const selected = forms.find((f) => f.id === formId);
    setSelectedFormResponses(selected);
    setIsResponsesOpen(true);
  };

  // ===== EXPORT CSV =====
  const handleExportCSV = () => {
    if (!selectedFormResponses) return;

    const headers = [
      "Submission Date",
      "Respondent Name",
      "Choice Selected",
      "Additional Feedback",
    ];
    const rows = selectedFormResponses.responses.map((r) => [
      r.date,
      r.name,
      r.choice,
      r.feedback,
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

          <div className="forms-grid">
            {forms.map((form) => (
              <div
                key={form.id}
                className="form-card"
                onClick={() => handleViewResponses(form.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="form-card-header">
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
            <div className="responses-table-wrapper">
              <table className="responses-table">
                <thead>
                  <tr>
                    <th>Submission Date</th>
                    <th>Respondent Name</th>
                    <th>Choice Selected</th>
                    <th>Additional Feedback</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFormResponses.responses.map((response, index) => (
                    <tr key={index}>
                      <td>{response.date}</td>
                      <td>{response.name}</td>
                      <td>{response.choice}</td>
                      <td>{response.feedback}</td>
                      <td>
                        <button className="view-btn">View</button>
                      </td>
                    </tr>
                  ))}
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

                <div className="profile-name">ADMIN</div>

                <button className="logout-btn">Log out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;