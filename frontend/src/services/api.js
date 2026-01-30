import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

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
      // Token expired or invalid
      console.warn('Unauthorized - clearing auth and redirecting to login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
