import React, { createContext, useContext, useEffect, useState } from 'react';
import { userService } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function decodeEmail(token) {
  const payloadPart = token.split('.')[1];
  if (!payloadPart) throw new Error('Invalid JWT');

  const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const payload = JSON.parse(atob(paddedBase64));
  return payload.sub;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (email) => {
    try {
      const allUsers = await userService.getAllUsers();
      const found = allUsers.find((u) => u.email?.toLowerCase() === email?.toLowerCase());
      setUser(found || { email });
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setUser({ email });
    }
  };

  const applyToken = async (jwtToken) => {
    localStorage.setItem('jwtToken', jwtToken);
    setToken(jwtToken);
    const email = decodeEmail(jwtToken);
    await fetchUserProfile(email);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initialize = async () => {
      const saved = localStorage.getItem('jwtToken');
      if (saved) {
        try {
          await applyToken(saved);
        } catch {
          localStorage.removeItem('jwtToken');
        }
      }
      setLoading(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('recco:unauthorized', onUnauthorized);
    return () => window.removeEventListener('recco:unauthorized', onUnauthorized);
  }, []);

  const login = async (jwtToken) => {
    await applyToken(jwtToken);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
