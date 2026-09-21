import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '../services/api';

const AuthContext = createContext();

const getUserId = (user) => user?.id || user?._id || null;

const getStoredToken = () => {
  const localToken =
    localStorage.getItem('jwtToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('keycloakToken') ||
    localStorage.getItem('token') ||
    null;

  if (localToken) {
    return localToken;
  }

  if (typeof window !== 'undefined' && window.keycloak) {
    return window.keycloak.token || window.keycloak.idToken || null;
  }

  return null;
};

const parseJwt = (token) => {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload;
  } catch (error) {
    console.error('Failed to parse JWT payload:', error, { token });
    return null;
  }
};

const getIdentifierFromPayload = (payload) => {
  if (!payload) return null;
  return (
    payload.sub ||
    payload.email ||
    payload.preferred_username ||
    payload.username ||
    payload.name ||
    null
  );
};

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

  // Fetch full user profile by any available identifier from token
  const fetchUserProfile = async (identifier) => {
    try {
      const normalizedIdentifier = identifier?.toString().trim();
      if (!normalizedIdentifier) {
        console.warn('No identifier provided for user profile fetch');
        return null;
      }

      console.log('Fetching user profile for identifier:', normalizedIdentifier);

      try {
        let foundUser = null;

        // First, try to fetch by email directly if identifier looks like an email
        if (normalizedIdentifier.includes('@')) {
          try {
            foundUser = await userService.getUserByEmail(normalizedIdentifier);
            console.log('User found by email lookup:', foundUser ? 'yes' : 'no');
          } catch (error) {
            console.log('Email lookup not found, trying other methods:', error.message);
          }
        }

        // If not found by email, try to get all users and match
        if (!foundUser) {
          try {
            const allUsers = await userService.getAllUsers();
            if (Array.isArray(allUsers)) {
              const matchUser = (user) => {
                const idValue = getUserId(user);
                const email = (user.email || '').toString().toLowerCase();
                const username = (user.username || user.preferred_username || '').toString().toLowerCase();
                const name = (user.name || user.firstName || user.givenName || '').toString().toLowerCase();
                const surname = (user.surname || user.lastName || user.familyName || '').toString().toLowerCase();
                const search = normalizedIdentifier.toLowerCase();

                return (
                  idValue === normalizedIdentifier ||
                  idValue === normalizedIdentifier.replace(/^\{"|"\}$/g, '') ||
                  email === search ||
                  username === search ||
                  name === search ||
                  surname === search ||
                  `${name} ${surname}`.trim() === search ||
                  `${surname} ${name}`.trim() === search
                );
              };

              foundUser = allUsers.find(matchUser);
              console.log('User found in all users list:', foundUser ? 'yes' : 'no');
            }
          } catch (error) {
            console.log('Error fetching all users:', error.message);
          }
        }

        // If still not found, try direct ID lookup
        if (!foundUser && !normalizedIdentifier.includes('@')) {
          try {
            foundUser = await userService.getUserById(normalizedIdentifier);
            console.log('User found by ID direct lookup:', foundUser ? 'yes' : 'no');
          } catch (error) {
            console.log('ID lookup failed:', error.message);
          }
        }

        if (foundUser) {
          const userWithId = { ...foundUser, id: getUserId(foundUser) };
          console.log('Setting user with ID:', userWithId.id, 'email:', userWithId.email);
          setUser(userWithId);
        } else {
          console.warn('User not found in database for identifier:', normalizedIdentifier, '- storing email temporarily');
          // Store email for now, but mark that full profile isn't loaded
          setUser({ email: normalizedIdentifier });
        }
      } catch (error) {
        console.error('Error fetching user from database:', error);
        // If database lookup fails, still set minimal user info
        setUser({ email: normalizedIdentifier });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser({ email: identifier });
    }
  };

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = getStoredToken();
      if (savedToken) {
        setToken(savedToken);
        try {
          const payload = parseJwt(savedToken);
          const identifier = getIdentifierFromPayload(payload);
          await fetchUserProfile(identifier);
        } catch (error) {
          console.error('Invalid token', error);
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('keycloakToken');
          localStorage.removeItem('token');
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
      const payload = parseJwt(jwtToken);
      const identifier = getIdentifierFromPayload(payload);
      fetchUserProfile(identifier);
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
