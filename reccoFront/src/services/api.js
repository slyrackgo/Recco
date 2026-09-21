import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthCall = error.config?.url?.includes('/auth/');
      if (!isAuthCall) {
        localStorage.removeItem('jwtToken');
        window.dispatchEvent(new Event('recco:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
};

export const userService = {
  getAllUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  getUserById: async (id) => {
    const { data } = await api.get(`/users/id/${id}`);
    return data;
  },
  getUserByName: async (name) => {
    const { data } = await api.get(`/users/name/${name}`);
    return data;
  },
  getUserDashboard: async (id) => {
    const { data } = await api.get(`/users/${id}/dashboard`);
    return data;
  },
  getAvailableInterests: async () => {
    const { data } = await api.get('/interests');
    return data;
  },
  addInterestType: async (interestTypeDto) => {
    const { data } = await api.post('/users/interests', interestTypeDto);
    return data;
  },
  getUserInterests: async (id) => {
    const { data } = await api.get(`/users/interests/${id}`);
    return data;
  },
  getInterestPosts: async (code, userId = null) => {
    const url = userId
      ? `/interests/${code}/posts?userId=${userId}`
      : `/interests/${code}/posts`;
    const { data } = await api.get(url);
    return data;
  },
  updateInterestDescription: async (interestId, description) => {
    const { data } = await api.put(`/users/interests/${interestId}/description`, {
      description,
    });
    return data;
  },
  deleteInterest: async (interestId) => {
    const response = await api.delete(`/users/interests/${interestId}`);
    return response.status === 204 ? true : response.data;
  },
};

export default api;
