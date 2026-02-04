import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://backend.test/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

console.log('API Base URL:', api.defaults.baseURL);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log('API Request:', config.method.toUpperCase(), config.url);
    console.log('Auth token present:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, 'Status:', error.response?.status);
    console.error('Error details:', error.response?.data);
    if (error.response?.status === 401) {
      const url = (error.config?.url || '').toString();
      const isLoginAttempt = url.includes('/login');
      if (!isLoginAttempt) {
        // Token expired or invalid on a protected route
        console.warn('Unauthorized - clearing auth and redirecting to login');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return; // stop further handling after redirect
      }
      // On failed login attempt, do not redirect; let UI show the error
    }
    return Promise.reject(error);
  }
);

export default api;
