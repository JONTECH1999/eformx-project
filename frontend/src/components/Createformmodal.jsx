import React, { useState, useEffect } from "react";
import "../styles/Createformmodal.css";
import { FaTimes, FaPlus, FaTrash, FaGripVertical } from "react-icons/fa";

function CreateFormModal({
  isOpen,
  onClose,
  onCreateForm,
  editMode,
  formData,
}) {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [fieldsError, setFieldsError] = useState("");

  // ✅ PREFILL WHEN EDITING
  useEffect(() => {
    if (editMode && formData) {
      setFormTitle(formData.title || "");
      setFormDescription(formData.description || "");

      let fieldsData = formData.fields || [];
      if (typeof fieldsData === 'string') {
        try {
          fieldsData = JSON.parse(fieldsData);
        } catch (e) {
          console.error("Failed to parse fields string:", fieldsData);
          fieldsData = [];
        }
      }
      setFields(Array.isArray(fieldsData) ? fieldsData : []);
    } else {
      setFormTitle("");
      setFormDescription("");
      setFields([]);
    }
    // Clear errors when modal opens/closes
    setTitleError("");
    setDescriptionError("");
    setFieldsError("");
  }, [editMode, formData, isOpen]);

  if (!isOpen) return null;

  const addField = (fieldType) => {
    const newField = {
      id: Date.now(),
      type: fieldType,
      label: "",
      required: false,
      placeholder: "",
      // for multiple-choice: radio = single select, checkbox = multi select
      choiceType: fieldType === "multiple-choice" ? "radio" : undefined,
      options:
        fieldType === "multiple-choice" ? ["Option 1", "Option 2"] : [],
    };
    setFields([...fields, newField]);
  };

  const updateField = (fieldId, property, value) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    );
  };

  const removeField = (fieldId) => {
    setFields(fields.filter((field) => field.id !== fieldId));
  };

  const addOption = (fieldId) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId
          ? {
            ...field,
            options: [
              ...field.options,
              `Option ${field.options.length + 1}`,
            ],
          }
          : field
      )
    );
    if (fieldsError) setFieldsError(""); // Clear error when user adds an option
  };

  const updateOption = (fieldId, optionIndex, value) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = value;
          return { ...field, options: newOptions };
        }
        return field;
      })
    );
  };

  const removeOption = (fieldId, optionIndex) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId
          ? {
            ...field,
            options: field.options.filter((_, i) => i !== optionIndex),
          }
          : field
      )
    );
  };

  const handleSaveForm = () => {
    // Clear any previous errors
    setTitleError("");
    setDescriptionError("");
    setFieldsError("");

    let hasError = false;

    if (!formTitle.trim()) {
      setTitleError("Please enter a form title");
      hasError = true;
    }
    if (!formDescription.trim()) {
      setDescriptionError("Please enter a form description");
      hasError = true;
    }
    if (fields.length === 0) {
      setFieldsError("Please add at least one field to your form");
      hasError = true;
    } else {
      if (fields.some((f) => !f.label.trim())) {
        setFieldsError("Please add labels to all fields");
        hasError = true;
      } else if (
        fields.some(
          (f) => f.type === "multiple-choice" && f.options.length < 2
        )
      ) {
        setFieldsError("Multiple choice fields must have at least 2 options");
        hasError = true;
      }
    }

    if (hasError) return;

    onCreateForm({
      title: formTitle,
      description: formDescription,
      fields,
    });
  };

  const getFieldTypeLabel = (type) => {
    switch (type) {
      case "text":
        return "Text Input";
      case "multiple-choice":
        return "Multiple Choice";
      case "date":
        return "Date Field";
      default:
        return type;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* ✅ ONLY WAY TO CLOSE */}
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-content">
          {/* HEADER */}
          <div className="form-header-section">
            <input
              type="text"
              className="form-title-input"
              placeholder="Form Title"
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value);
                if (titleError) setTitleError(""); // Clear error when user types
              }}
            />
            {titleError && (
              <div className="field-error-message">
                {titleError}
              </div>
            )}
            <textarea
              className="form-description-input"
              placeholder="Form Description"
              value={formDescription}
              onChange={(e) => {
                setFormDescription(e.target.value);
                if (descriptionError) setDescriptionError(""); // Clear error when user types
              }}
              rows="3"
            />
            {descriptionError && (
              <div className="field-error-message">
                {descriptionError}
              </div>
            )}
          </div>

          {/* FIELD BUTTONS */}
          <div className="form-fields-section">
            <label className="section-label">FORM FIELDS</label>
            {fieldsError && (
              <div className="field-error-message">
                {fieldsError}
              </div>
            )}
            <div className="field-buttons">
              <button className="field-btn" onClick={() => addField("text")}>
                <FaPlus /> Text Input
              </button>
              <button
                className="field-btn"
                onClick={() => addField("multiple-choice")}
              >
                <FaPlus /> Multiple Choice
              </button>
              <button className="field-btn" onClick={() => addField("date")}>
                <FaPlus /> Date Field
              </button>
            </div>

            {fields.map((field) => (
              <div key={field.id} className="field-editor">
                <div className="field-editor-header">
                  <div className="field-type-badge">
                    <FaGripVertical />
                    <span>{getFieldTypeLabel(field.type)}</span>
                  </div>
                  <button
                    className="remove-field-btn"
                    onClick={() => removeField(field.id)}
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="form-group">
                  <label>Field Label *</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => {
                      updateField(field.id, "label", e.target.value);
                      if (fieldsError) setFieldsError(""); // Clear error when user types
                    }}
                  />
                </div>

                {field.type === "text" && (
                  <div className="form-group">
                    <label>Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) =>
                        updateField(field.id, "placeholder", e.target.value)
                      }
                    />
                  </div>
                )}

                {field.type === "date" && (
                  <div className="form-group">
                    <label>Date Field Preview</label>
                    {/* HTML5 date picker for preview */}
                    <input type="date" />
                  </div>
                )}

                {field.type === "multiple-choice" && (
                  <div className="form-group">
                    <label>Selection Type</label>
                    <select
                      value={field.choiceType || "radio"}
                      onChange={(e) =>
                        updateField(field.id, "choiceType", e.target.value)
                      }
                      style={{ marginBottom: "12px" }}
                    >
                      <option value="radio">Radio (single select)</option>
                      <option value="checkbox">Checkboxes (multi select)</option>
                    </select>

                    <label>Options</label>
                    {field.options.map((opt, i) => (
                      <div key={i} className="option-item">
                        <input
                          type={field.choiceType === "checkbox" ? "checkbox" : "radio"}
                          style={{ marginRight: "10px" }}
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            updateOption(field.id, i, e.target.value)
                          }
                        />
                        {field.options.length > 2 && (
                          <button
                            onClick={() => removeOption(field.id, i)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addOption(field.id)}>
                      <FaPlus /> Add Option
                    </button>
                  </div>
                )}

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateField(field.id, "required", e.target.checked)
                    }
                  />
                  Required field
                </label>
              </div>
            ))}
          </div>

          <button className="save-form-btn" onClick={handleSaveForm}>
            {editMode ? "Update Form" : "Save Form"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFormModal;
