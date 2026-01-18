import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import UserSearch from './components/UserSearch';
import UserProfile from './components/UserProfile';
import MyProfile from './components/MyProfile';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, loading } = useAuth();

  const handleSignIn = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setSearchTerm('');
  };

  const handleMyProfileClick = () => {
    navigate('/my-profile');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Recco Logo" className="logo" />
        </div>

        {isAuthenticated && (
          <form className="header-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Find users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </form>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <button className="profile-link" onClick={handleMyProfileClick}>
                My Profile
              </button>
              <span className="user-name">{user?.name || user?.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="signin-btn" onClick={handleSignIn}>
                Sign In
              </button>
              <button className="signup-btn" onClick={handleSignUp}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />

      {isAuthenticated ? (
        <Routes>
          <Route
            path="/"
            element={<div className="home-placeholder"></div>}
          />
          <Route path="/search" element={<UserSearch />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
        </Routes>
      ) : (
        <div className="not-authenticated">
          <div className="auth-message">
            <h2>Please sign in to continue</h2>
            <p>Sign in or create an account to access the user management system.</p>
            <button className="cta-signin" onClick={handleSignIn}>
              Sign In Now
            </button>
            <button className="cta-signup" onClick={handleSignUp}>
              Create Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
