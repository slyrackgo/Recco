import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const userService = {
  registerUser: async (userData) => {
    const response = await api.post('/user', userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/id/${id}`);
    return response.data;
  },

  getUserByName: async (name) => {
    const response = await api.get(`/users/name/${name}`);
    return response.data;
  },

  // GET /api/users/{id}/dashboard
  getUserDashboard: async (id) => {
    const response = await api.get(`/users/${id}/dashboard`);
    return response.data;
  },

  // POST /api/users/interests
  addInterestType: async (interestTypeDto) => {
    const response = await api.post('/users/interests', interestTypeDto);
    return response.data;
  },

  // GET /api/users/interests/{id}
  getUserInterests: async (id) => {
    const response = await api.get(`/users/interests/${id}`);
    return response.data;
  },

  // GET /api/interests/{code}/posts  (all users' posts for a given interest code)
  getInterestPosts: async (code) => {
    const response = await api.get(`/interests/${code}/posts`);
    return response.data;
  },
};

export default api;
