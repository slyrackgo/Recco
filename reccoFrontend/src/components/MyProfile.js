import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MyProfile.css';

function MyProfile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="myprofile-container"><div className="loading">Loading profile...</div></div>;
  }

  if (!user) {
    return (
      <div className="myprofile-container">
        <div className="error-message">No user data available</div>
        <button className="back-btn" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="myprofile-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1>My Profile</h1>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <label>Email:</label>
            <p className="value">{user?.email || 'Not set'}</p>
          </div>

          {user?.name && (
            <div className="info-row">
              <label>Name:</label>
              <p className="value">{user.name}</p>
            </div>
          )}

          {user?.surname && (
            <div className="info-row">
              <label>Surname:</label>
              <p className="value">{user.surname}</p>
            </div>
          )}

          <div className="info-row">
            <label>User ID:</label>
            <p className="value mono">{user?.id || 'Loading...'}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-label">Account Status</span>
            <span className="stat-value">Active</span>
          </div>
          <div className="stat">
            <span className="stat-label">Member Since</span>
            <span className="stat-value">2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
