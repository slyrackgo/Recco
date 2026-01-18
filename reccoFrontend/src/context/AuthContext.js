import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full user profile
  const fetchUserProfile = async (email) => {
    try {
      const allUsers = await userService.getAllUsers();
      const foundUser = allUsers.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
      } else {
        setUser({ email });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser({ email });
    }
  };

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('jwtToken');
      if (savedToken) {
        setToken(savedToken);
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          await fetchUserProfile(payload.sub);
        } catch (error) {
          console.error('Invalid token', error);
          localStorage.removeItem('jwtToken');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (jwtToken) => {
    localStorage.setItem('jwtToken', jwtToken);
    setToken(jwtToken);
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      fetchUserProfile(payload.sub);
    } catch (error) {
      console.error('Token error', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
