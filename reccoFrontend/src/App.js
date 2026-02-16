import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import UserSearch from './components/UserSearch';
import UserProfile from './components/UserProfile';
import MyProfile from './components/MyProfile';
import Dashboard from './components/Dashboard';
import AddInterest from './components/AddInterest';
import InterestPosts from './components/InterestPosts';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { userService } from './services/api';

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const searchTimeoutRef = React.useRef(null);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Searching for:', searchTerm);
        const allUsers = await userService.getAllUsers();
        console.log('All users fetched:', allUsers);
        
        if (!allUsers || !Array.isArray(allUsers)) {
          console.log('Invalid response:', allUsers);
          setSearchResults([]);
          setShowResults(false);
          return;
        }

        const searchLower = searchTerm.toLowerCase().trim();
        console.log('Search term (lower):', searchLower);
        
        const matched = allUsers.filter((user) => {
          // Support multiple possible field names from the backend
          const firstName = (user.name || user.firstName || '').toLowerCase();
          const lastName = (user.surname || user.lastName || '').toLowerCase();
          const email = (user.email || '').toLowerCase();

          const matches =
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            email.includes(searchLower);

          if (matches) {
            console.log(
              'Match found:',
              firstName,
              lastName,
              'email:',
              email
            );
          }
          return matches;
        });

        console.log('Matched users:', matched);
        setSearchResults(matched);
        setShowResults(matched.length > 0);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce
  }, [searchTerm]);

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

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const term = searchTerm.trim();
    if (!term) {
      return;
    }

    // Always go to the search results page so the user list
    // (with names) appears in the body under the header
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowResults(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
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
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
            
            {showResults && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((user) => {
                  const firstName = user.name || user.firstName || '';
                  const lastName = user.surname || user.lastName || '';
                  const displayName =
                    [firstName, lastName].filter(Boolean).join(' ') ||
                    user.email ||
                    'Unknown user';

                  const avatarInitial =
                    displayName.charAt(0).toUpperCase() || 'U';

                  return (
                    <div
                      key={user.id}
                      className="search-result-item"
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div className="result-avatar">{avatarInitial}</div>
                      <div className="result-info">
                        <div className="result-name">{displayName}</div>
                        <div className="result-email">{user.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </form>
        )}

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {isAuthenticated ? (
            <>
              <button className="dashboard-btn" onClick={handleDashboardClick}>
                Dashboard
              </button>
              <button className="profile-link" onClick={handleMyProfileClick}>
                My Profile
              </button>
              <span className="user-name">
                {(() => {
                  const firstName = user?.name || user?.firstName || '';
                  const lastName = user?.surname || user?.lastName || '';
                  const displayName =
                    [firstName, lastName].filter(Boolean).join(' ') ||
                    user?.email ||
                    '';
                  return displayName;
                })()}
              </span>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-interest" element={<AddInterest />} />
          <Route path="/interests/:code" element={<InterestPosts />} />
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
