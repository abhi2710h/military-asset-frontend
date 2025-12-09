import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug: Log API URL (remove in production if needed)
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Dashboard API
export const dashboardAPI = {
  getMetrics: (filters) => api.get('/dashboard/metrics', { params: filters }),
  getNetMovementDetails: (filters) => api.get('/dashboard/net-movement-details', { params: filters }),
};

// Purchases API
export const purchasesAPI = {
  create: (data) => api.post('/purchases', data),
  getAll: (filters) => api.get('/purchases', { params: filters }),
};

// Transfers API
export const transfersAPI = {
  create: (data) => api.post('/transfers', data),
  getAll: (filters) => api.get('/transfers', { params: filters }),
};

// Assignments API
export const assignmentsAPI = {
  create: (data) => api.post('/assignments/assign', data),
  recordExpenditure: (data) => api.post('/assignments/expend', data),
  getAssignments: (filters) => api.get('/assignments/assignments', { params: filters }),
  getExpenditures: (filters) => api.get('/assignments/expenditures', { params: filters }),
};

// Common API
export const commonAPI = {
  getBases: () => api.get('/common/bases'),
  getEquipmentTypes: () => api.get('/common/equipment-types'),
  getAssets: (filters) => api.get('/common/assets', { params: filters }),
};

export default api;

