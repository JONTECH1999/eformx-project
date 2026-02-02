import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import formService from '../services/formService';
import '../styles/PublicFormPage.css';
import logo from '../assets/eFormX.png';

const PublicFormPage = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await formService.getPublicForm(id);
                setForm(data);

                // Initialize form data with empty strings for all fields
                const initialData = {
                    respondent_name: '',
                    respondent_email: ''
                };
                if (data.fields && Array.isArray(data.fields)) {
                    data.fields.forEach(field => {
                        initialData[field.id || field.label] = '';
                    });
                }
                setFormData(initialData);
            } catch (err) {
                console.error('Error fetching form:', err);
                setError(err.response?.data?.message || 'Failed to load form. It may not exist or is no longer active.');
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [id]);

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Prepare submission data
            const submission = {
                respondent_name: formData.respondent_name,
                respondent_email: formData.respondent_email,
                responses: { ...formData }
            };

            // Remove meta fields from responses object
            delete submission.responses.respondent_name;
            delete submission.responses.respondent_email;

            await formService.submitResponse(id, submission);
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Failed to submit response. Please check your data and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="public-form-loading">Loading form...</div>;
    }

    if (error) {
        return (
            <div className="public-form-error-container">
                <div className="error-card">
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="public-form-success-container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h2>Thank You!</h2>
                    <p>Your response has been successfully submitted to <strong>{form.title}</strong>.</p>
                    <button onClick={() => window.location.reload()}>Submit Another Response</button>
                </div>
            </div>
        );
    }

    return (
        <div className="public-form-container">
            <div className="public-form-header">
                <img src={logo} alt="eFormX Logo" className="public-logo" />
            </div>

            <div className="form-card">
                <div className="form-info">
                    <h1>{form.title}</h1>
                    {form.description && <p className="form-description">{form.description}</p>}
                </div>

                <form onSubmit={handleSubmit} className="public-form">
                    <div className="form-section">
                        <h3>Your Information</h3>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.respondent_name}
                                onChange={(e) => handleInputChange('respondent_name', e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                required
                                value={formData.respondent_email}
                                onChange={(e) => handleInputChange('respondent_email', e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Questions</h3>
                        {form.fields && form.fields.map((field, index) => (
                            <div key={index} className="form-group">
                                <label>{field.label} {field.required ? '*' : ''}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        required={field.required}
                                        value={formData[field.id || field.label]}
                                        onChange={(e) => handleInputChange(field.id || field.label, e.target.value)}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        required={field.required}
                                        value={formData[field.id || field.label]}
                                        onChange={(e) => handleInputChange(field.id || field.label, e.target.value)}
                                    >
                                        <option value="">Select an option</option>
                                        {field.options && field.options.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type || 'text'}
                                        required={field.required}
                                        value={formData[field.id || field.label]}
                                        onChange={(e) => handleInputChange(field.id || field.label, e.target.value)}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                </form>
            </div>

            <footer className="public-form-footer">
                <p>Powered by eFormX</p>
            </footer>
        </div>
    );
};

export default PublicFormPage;
