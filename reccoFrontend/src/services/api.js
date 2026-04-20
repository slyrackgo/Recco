import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredToken = () => {
  return (
    localStorage.getItem('jwtToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('keycloakToken') ||
    localStorage.getItem('token') ||
    null
  );
};

// Add JWT / Keycloak token to every request
api.interceptors.request.use((config) => {
  const token = getStoredToken();
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

  getUserByEmail: async (email) => {
    const response = await api.get(`/users/email/${email}`);
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

  // GET /api/users/dashboard/by-email
  getUserDashboardByEmail: async (email) => {
    const response = await api.get('/users/dashboard/by-email', { params: { email } });
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

  // GET /api/users/interests/by-email
  getUserInterestsByEmail: async (email) => {
    const response = await api.get('/users/interests/by-email', { params: { email } });
    return response.data;
  },

  // GET /api/interests/{code}/posts?userId={userId}
  // If userId provided: returns only that user's posts
  // If userId not provided: returns all posts
  getInterestPosts: async (code, userId = null) => {
    const url = userId 
      ? `/interests/${code}/posts?userId=${userId}` 
      : `/interests/${code}/posts`;
    const response = await api.get(url);
    return response.data;
  },

  // PUT /api/users/interests/{interestId}/description
  updateInterestDescription: async (interestId, description) => {
    const response = await api.put(`/users/interests/${interestId}/description`, { description });
    return response.data;
  },

  // DELETE /api/users/interests/{interestId}
  deleteInterest: async (interestId) => {
    const response = await api.delete(`/users/interests/${interestId}`);
    // backend returns 204 No Content on success — return true for convenience
    return response.status === 204 ? true : response.data;
  },
};

export default api;
