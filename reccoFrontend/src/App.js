import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import UserList from './components/UserList';
import UserProfile from './components/UserProfile';

function AppContent() {
  const [activeTab, setActiveTab] = useState('register');
  const navigate = useNavigate();

  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Recco</h1>
        <p>User Management</p>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <nav className="nav">
                <button
                  className={`nav-btn ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </button>
                <button
                  className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  Users
                </button>
              </nav>

              <main className="container">
                {activeTab === 'register' && <Register />}
                {activeTab === 'users' && <UserList onUserSelect={handleUserSelect} />}
              </main>
            </>
          }
        />
        <Route path="/profile/:userId" element={<UserProfile />} />
      </Routes>
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
