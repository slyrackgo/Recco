import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import formatDisplayName from './utils/formatDisplayName';
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const searchInputRef = useRef(null);
  const searchFormRef = useRef(null);
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
          // Normalize backend fields
          const firstName = (user.name || user.firstName || '').toLowerCase();
          const lastName = (user.surname || user.lastName || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const fullName = [firstName, lastName].filter(Boolean).join(' ').toLowerCase();

          // Prefer prefix (startsWith) matching for suggestions so typing 'At' returns
          // names that start with 'at' (Atai, etc.). Only match email when query looks like an email.
          const matchesByPrefix =
            fullName.startsWith(searchLower) ||
            firstName.startsWith(searchLower);

          const matchesByEmail = (searchLower.includes('@') || searchLower.includes('.')) && email.includes(searchLower);
          const matches = matchesByPrefix || matchesByEmail;

          if (matches) {
            console.log('Match found (prefix):', fullName || email);
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

  const clearHeaderSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleLogout = () => {
    logout();
    clearHeaderSearch();
    navigate('/');
  };

  // use centralized formatter (imported from utils)
  // const formatDisplayName = ...  <-- removed (now imported)

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
    // clear any stale dropdown immediately while debounce runs
    setSearchTerm(value);
    setSearchResults([]);
    setShowResults(false);
    
    // Update dropdown position when input changes
    if (searchFormRef.current) {
      const rect = searchFormRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleDashboardClick = () => {
    clearHeaderSearch();
    navigate('/dashboard');
  };

  const handleMyProfileClick = () => {
    clearHeaderSearch();
    navigate('/my-profile');
  };

  const handleLogoClick = () => {
    clearHeaderSearch();
    navigate('/');
  };

  // Clear header search when route changes (keeps search when user stays on /search)
  const location = useLocation();
  useEffect(() => {
    if (location && location.pathname !== '/search') {
      clearHeaderSearch();
    }
  }, [location.pathname]);

  // Update dropdown position when results are shown
  useEffect(() => {
    if (showResults && searchFormRef.current) {
      const rect = searchFormRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [showResults, searchResults]);

  // Handle window scroll and resize to update dropdown position
  useEffect(() => {
    const handleWindowEvent = () => {
      if (showResults && searchFormRef.current) {
        const rect = searchFormRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', handleWindowEvent);
    window.addEventListener('resize', handleWindowEvent);
    return () => {
      window.removeEventListener('scroll', handleWindowEvent);
      window.removeEventListener('resize', handleWindowEvent);
    };
  }, [showResults]);

  // Allow child components to request a header-clear (for actions that do not navigate)
  useEffect(() => {
    const handler = () => clearHeaderSearch();
    window.addEventListener('clearHeaderSearch', handler);
    return () => window.removeEventListener('clearHeaderSearch', handler);
  }, []);

  // Sync header search when other components dispatch search changes
  useEffect(() => {
    const syncHandler = (e) => {
      const value = (e && e.detail) || '';
      // keep header input in sync but hide dropdown while page-level search runs
      setSearchTerm(value);
      setSearchResults([]);
      setShowResults(false);
    };
    window.addEventListener('syncHeaderSearch', syncHandler);
    return () => window.removeEventListener('syncHeaderSearch', syncHandler);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Recco Logo" className="logo" />
        </div>

        {isAuthenticated && (
          <form className="header-search" ref={searchFormRef} onSubmit={handleSearchSubmit}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Find users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
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
              <span className="user-name">{formatDisplayName(user)}</span>
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

      {/* Portal for search dropdown - renders at root level to always appear on top */}
      {showResults && searchResults.length > 0 && isAuthenticated && 
        ReactDOM.createPortal(
          <div 
            className="search-dropdown-portal"
            style={{
              position: 'fixed',
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
              zIndex: 10000
            }}
          >
            {searchResults.map((user) => {
              const displayName = formatDisplayName(user);
              const avatarInitial = displayName.charAt(0).toUpperCase() || 'U';

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
          </div>,
          document.body
        )
      }

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
