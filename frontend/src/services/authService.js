import api from './api';

const authService = {
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise} User data with token
     */
    async login(email, password) {
        const response = await api.post('/login', { email, password });

        // Store token if provided (for regular users)
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data));

        return response.data;
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null} User data
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            console.error('Failed to parse user from storage:', e);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    /**
     * Request password reset link
     * @param {string} email
     */
    async forgotPassword(email) {
        const res = await api.post('/password/forgot', { email });
        return res.data;
    },

    /**
     * Reset password with token
     * @param {object} payload { token, email, password, password_confirmation }
     */
    async resetPassword(payload) {
        const res = await api.post('/password/reset', payload);
        return res.data;
    },

    /**
     * Update authenticated user's profile
     * @param {object} payload { name?, email?, password? }
     */
    async updateProfile(payload) {
        const res = await api.put('/profile', payload);
        const updated = res.data;
        // Persist updated user in storage
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    },

    /**
     * Change authenticated user's password
     * @param {object} payload { current_password, password, password_confirmation }
     */
    async changePassword(payload) {
        const res = await api.put('/profile/password', payload);
        return res.data;
    },
};

export default authService;
