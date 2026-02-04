import api from './api';

const userService = {
    /**
     * Get all users
     * @returns {Promise<Array>} List of users
     */
    async getUsers() {
        // Fetch regular users and super-admins, then merge so UI shows all accounts
        const [usersRes, saRes] = await Promise.allSettled([
            api.get('/users'),
            api.get('/super-admins'),
        ]);

        const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
        const superAdmins = saRes.status === 'fulfilled' ? saRes.value.data : [];

        // Ensure super-admin entries have consistent fields
        const mappedSA = superAdmins.map(sa => ({
            id: sa.id,
            name: sa.name,
            email: sa.email,
            role: sa.role || 'Super Admin',
            status: sa.status || 'Active',
        }));

        // Combine, dedupe by email (prefer Super Admin when duplicates exist)
        const combined = [...mappedSA, ...users];
        const map = new Map();
        for (const entry of combined) {
            const emailKey = (entry.email || '').toLowerCase();
            if (!emailKey) continue;

            if (!map.has(emailKey)) {
                map.set(emailKey, entry);
                continue;
            }

            const existing = map.get(emailKey);
            // Prefer a Super Admin record over a regular user
            if (existing.role !== 'Super Admin' && entry.role === 'Super Admin') {
                map.set(emailKey, entry);
            }
            // Otherwise keep the existing record
        }

        return Array.from(map.values());
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
        // If creating a Super Admin, call the dedicated endpoint
        if (userData && userData.role && String(userData.role).toLowerCase() === 'super admin') {
            const response = await api.post('/super-admins', userData);
            return response.data;
        }

        const response = await api.post('/users', userData);
        return response.data;
    },

    /**
     * Update an existing user
     * @param {number} id User ID
     * @param {Object} userData Updated user data
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(id, userData, currentRole) {
        const desiredRole = (userData?.role || '').toLowerCase();
        const originalRole = (currentRole || '').toLowerCase();

        // If the original record is a Super Admin, update via super-admins endpoint
        if (originalRole === 'super admin') {
            const response = await api.put(`/super-admins/${id}`, userData);
            return response.data;
        }

        // Otherwise it's a regular user; if converting to Super Admin, backend will handle
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Delete a user
     * @param {number} id User ID
     * @returns {Promise<Object>} Success message
     */
    async deleteUser(id, currentRole) {
        const originalRole = (currentRole || '').toLowerCase();
        if (originalRole === 'super admin') {
            const response = await api.delete(`/super-admins/${id}`);
            return response.data;
        }
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export default userService;
