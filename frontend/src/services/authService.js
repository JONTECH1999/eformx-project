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
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getCurrentUser();
    },
};

export default authService;
