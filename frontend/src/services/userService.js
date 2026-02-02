import api from './api';

const userService = {
    /**
     * Get all users
     * @returns {Promise<Array>} List of users
     */
    async getUsers() {
        const response = await api.get('/users');
        return response.data;
    },

    /**
     * Get a single user by ID
     * @param {number} id User ID
     * @returns {Promise<Object>} User data
     */
    async getUser(id) {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Create a new user
     * @param {Object} userData User data
     * @returns {Promise<Object>} Created user
     */
    async createUser(userData) {
        const response = await api.post('/users', userData);
        return response.data;
    },

    /**
     * Update an existing user
     * @param {number} id User ID
     * @param {Object} userData Updated user data
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(id, userData) {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Delete a user
     * @param {number} id User ID
     * @returns {Promise<Object>} Success message
     */
    async deleteUser(id) {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export default userService;
