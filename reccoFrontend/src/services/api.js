import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
};

export default api;
