import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './UserProfile.css';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchUserInterests();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      setError('Failed to load user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInterests = async () => {
    try {
      const userInterests = await userService.getUserInterests(userId);
      setInterests(userInterests || []);
    } catch (err) {
      console.error('Failed to load user interests:', err);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Users
        </button>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Users
        </button>
        <div className="no-data">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Users
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-title">
            <h1>{user.name} {user.surname}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>User Information</h3>
            <div className="detail-item">
              <span className="detail-label">First Name:</span>
              <span className="detail-value">{user.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Name:</span>
              <span className="detail-value">{user.surname}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">{user.id}</span>
            </div>
          </div>

          {interests.length > 0 && (
            <div className="detail-section interests-section">
              <h3>Interests</h3>
              <div className="interests-list">
                {interests.map((interest) => {
                  const displayCode = interest.code || 'INTEREST';
                  return (
                    <span key={interest.code} className="interest-badge">
                      {displayCode}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
