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

  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = async (email, jwtToken) => {
    setProfileLoading(true);
    try {
      const currentUser = await userService.getCurrentUser();
      if (localStorage.getItem('jwtToken') === jwtToken) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      if (localStorage.getItem('jwtToken') === jwtToken) {
        setUser({ email });
      }
    } finally {
      if (localStorage.getItem('jwtToken') === jwtToken) {
        setProfileLoading(false);
      }
    }
  };

  const applyToken = async (jwtToken, profile) => {
    localStorage.setItem('jwtToken', jwtToken);
    setToken(jwtToken);
    const email = decodeEmail(jwtToken);
    if (profile?.id) {
      setUser(profile);
      setProfileLoading(false);
    } else {
      setUser({ email });
      void fetchUserProfile(email, jwtToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    setProfileLoading(false);
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

  const login = async (jwtToken, profile) => {
    await applyToken(jwtToken, profile);
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
        profileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
