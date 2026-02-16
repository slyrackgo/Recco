import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [availableInterests, setAvailableInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadDashboard();
      loadUserInterests();
    }
  }, [user?.id]);

  // Reload data when returning from AddInterest page
  useEffect(() => {
    if (location.state?.interestAdded && user?.id) {
      loadDashboard();
      loadUserInterests();
      setSuccessMessage('Interest added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Clear the state in history
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user?.id]);

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      const interests = await userService.getUserDashboard(user.id);
      console.log('Available interests loaded:', interests);
      setAvailableInterests(interests || []);
      setError('');
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load interests');
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadUserInterests = async () => {
    try {
      const interests = await userService.getUserInterests(user.id);
      console.log('Full user interests response:', JSON.stringify(interests));
      console.log('User interests array:', interests);
      setUserInterests(interests || []);
    } catch (err) {
      console.error('Error loading user interests:', err);
    }
  };

  // Unique interest types for "My Interests" (no duplicates)
  const interestTypes = Array.from(
    new Set(
      userInterests.map((interest) => (
        interest.interestType || interest.code || interest.name || 'UNKNOWN'
      ))
    )
  );

  const handleInterestClick = (interest) => {
    // Navigate to interest posts page
    navigate(`/interests/${interest.code}`);
  };


  if (loading || dashboardLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My interests</h1>
        <p>View and manage your interests</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="dashboard-content">
        <div className="interests-card">
          <h2>Available Interests</h2>
          {availableInterests.length > 0 ? (
            <div className="interests-simple-list">
              {availableInterests.map((interest) => {
                const displayCode = interest.code || 'INTEREST';
                return (
                  <div key={interest.code} className="interest-item">
                    <span
                      className="interest-name"
                      onClick={() => handleInterestClick(interest)}
                      role="button"
                      style={{ cursor: 'pointer' }}
                    >
                      {displayCode}
                    </span>
                    <span
                      className="interest-plus"
                      onClick={(e) => { e.stopPropagation(); navigate(`/add-interest?code=${interest.code}`); }}
                      role="button"
                      style={{ cursor: 'pointer' }}
                    >
                      +
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-interests">No interests available</p>
          )}
        </div>

        <div className="interests-card">
          <h2>My Interests</h2>
          {interestTypes.length > 0 ? (
            <div className="my-interests-list">
              {interestTypes.map((code) => (
                <div
                  key={code}
                  className="my-interest-item"
                  onClick={() => navigate(`/interests/${code}`)}
                >
                  <span className="my-interest-title">{code}</span>
                  <span className="my-interest-arrow">›</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-interests">No interests added yet. Start by adding some above!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
