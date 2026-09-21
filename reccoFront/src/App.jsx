import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import { userService } from './services/api.js';
import formatDisplayName, { initials } from './utils/formatDisplayName.js';
import AuthModal from './components/AuthModal.jsx';
import Dashboard from './components/Dashboard.jsx';
import AddInterest from './components/AddInterest.jsx';
import InterestPosts from './components/InterestPosts.jsx';
import MyProfile from './components/MyProfile.jsx';
import UserProfile from './components/UserProfile.jsx';
import UserSearch from './components/UserSearch.jsx';
import './App.css';

function AppContent() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const searchFormRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const updateDropdownPos = () => {
    if (!searchFormRef.current) return;
    const rect = searchFormRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  };

  const clearHeaderSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const allUsers = await userService.getAllUsers();
        const q = searchTerm.toLowerCase().trim();
        const matched = (allUsers || []).filter((u) => {
          const first = (u.name || '').toLowerCase();
          const last = (u.surname || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          const full = [first, last].filter(Boolean).join(' ');
          const byName = full.startsWith(q) || first.startsWith(q) || last.startsWith(q);
          const byEmail = (q.includes('@') || q.includes('.')) && email.includes(q);
          return byName || byEmail;
        });
        setSearchResults(matched);
        setShowResults(matched.length > 0);
        updateDropdownPos();
      } catch {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 250);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  useEffect(() => {
    if (location.pathname !== '/search') clearHeaderSearch();
  }, [location.pathname]);

  useEffect(() => {
    const onEvent = () => updateDropdownPos();
    window.addEventListener('scroll', onEvent);
    window.addEventListener('resize', onEvent);
    return () => {
      window.removeEventListener('scroll', onEvent);
      window.removeEventListener('resize', onEvent);
    };
  }, []);

  if (loading) {
    return <div className="boot-screen">Loading Shelf…</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <button className="brand" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
          <img src="/logo.png" alt="Shelf" className="logo" />
          <span>Recco</span>
        </button>

        {isAuthenticated && (
          <form
            className="header-search"
            ref={searchFormRef}
            onSubmit={(e) => {
              e.preventDefault();
              const term = searchTerm.trim();
              if (!term) return;
              navigate(`/search?q=${encodeURIComponent(term)}`);
              setShowResults(false);
            }}
          >
            <input
              type="text"
              placeholder="Find people…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={updateDropdownPos}
            />
            <button type="submit" aria-label="Search">
              Search
            </button>
          </form>
        )}

        <div className="header-actions">
          <button className="ghost-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          {isAuthenticated ? (
            <>
              <button className="ghost-btn" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button className="ghost-btn" onClick={() => navigate('/my-profile')}>
                {formatDisplayName(user)}
              </button>
              <button
                className="solid-btn"
                onClick={() => {
                  logout();
                  clearHeaderSearch();
                  navigate('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="ghost-btn"
                onClick={() => {
                  setAuthMode('login');
                  setAuthOpen(true);
                }}
              >
                Sign in
              </button>
              <button
                className="solid-btn"
                onClick={() => {
                  setAuthMode('register');
                  setAuthOpen(true);
                }}
              >
                Join Shelf
              </button>
            </>
          )}
        </div>
      </header>

      {showResults &&
        searchResults.length > 0 &&
        isAuthenticated &&
        createPortal(
          <div
            className="search-dropdown"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
          >
            {searchResults.map((u) => (
              <button
                key={u.id}
                className="search-result-item"
                onClick={() => {
                  navigate(`/profile/${u.id}`);
                  clearHeaderSearch();
                }}
              >
                <span className="avatar sm">{initials(u)}</span>
                <span>
                  <strong>{formatDisplayName(u)}</strong>
                  <em>{u.email}</em>
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}

      <AuthModal isOpen={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} />

      <main className="main">
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-interest" element={<AddInterest />} />
            <Route path="/interests/:code" element={<InterestPosts />} />
            <Route path="/profile/:userId/interests/:code" element={<InterestPosts />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/search" element={<UserSearch />} />
          </Routes>
        ) : (
          <section className="landing">
            <div className="landing-copy">
              <p className="eyebrow">Recommendations, from people you actually know</p>
              <h1>Keep a living shelf of books, shows, podcasts, and games.</h1>
              <p>
                Shelf is a small social catalog. Sign in to add what you are into, browse friends’
                lists, and keep notes on the things worth sharing.
              </p>
              <div className="landing-actions">
                <button
                  className="solid-btn lg"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthOpen(true);
                  }}
                >
                  Create an account
                </button>
                <button
                  className="ghost-btn lg"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                >
                  I already have one
                </button>
              </div>
            </div>
            <div className="landing-grid">
              {['Books', 'TV Shows', 'Podcasts', 'Games'].map((label) => (
                <article key={label} className="landing-card">
                  <h3>{label}</h3>
                  <p>Save titles, write a short take, and revisit them later.</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
