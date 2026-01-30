import api from './api';

const formService = {
    /**
     * Get all forms for the authenticated user
     * @returns {Promise<Array>} List of forms
     */
    async getForms() {
        const response = await api.get('/forms');
        return response.data;
    },

    /**
     * Get a single form's details for public view (unauthenticated)
     * @param {number} id Form ID
     * @returns {Promise<Object>} Form data (fields only)
     */
    async getPublicForm(id) {
        const response = await api.get(`/forms/${id}/public`);
        return response.data;
    },

    /**
     * Get a single form by ID (private)
     * @param {number} id Form ID
     * @returns {Promise<Object>} Form data
     */
    async getForm(id) {
        const response = await api.get(`/forms/${id}`);
        return response.data;
    },

    /**
     * Create a new form
     * @param {Object} formData Form data
     * @returns {Promise<Object>} Created form
     */
    async createForm(formData) {
        const response = await api.post('/forms', formData);
        return response.data;
    },

    /**
     * Update an existing form
     * @param {number} id Form ID
     * @param {Object} formData Updated form data
     * @returns {Promise<Object>} Updated form
     */
    async updateForm(id, formData) {
        const response = await api.put(`/forms/${id}`, formData);
        return response.data;
    },

    /**
     * Delete a form
     * @param {number} id Form ID
     * @returns {Promise<Object>} Success message
     */
    async deleteForm(id) {
        const response = await api.delete(`/forms/${id}`);
        return response.data;
    },

    /**
     * Get analytics for a specific form
     * @param {number} id Form ID
     * @returns {Promise<Object>} Analytics data
     */
    async getFormAnalytics(id) {
        const response = await api.get(`/forms/${id}/analytics`);
        return response.data;
    },

    /**
     * Get all responses for a specific form
     * @param {number} formId Form ID
     * @returns {Promise<Array>} List of responses
     */
    async getFormResponses(formId) {
        const response = await api.get(`/forms/${formId}/responses`);
        return response.data;
    },

    /**
     * Submit a response to a form (public endpoint)
     * @param {number} formId Form ID
     * @param {Object} responseData Response data
     * @returns {Promise<Object>} Submitted response
     */
    async submitResponse(formId, responseData) {
        const response = await api.post(`/forms/${formId}/responses`, responseData);
        return response.data;
    },
};

export default formService;
