import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import formatDisplayName, { initials } from '../utils/formatDisplayName.js';

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <div className="muted">Loading profile…</div>;
  if (!user) {
    return (
      <div>
        <p className="banner error">No profile loaded.</p>
        <button className="ghost-btn" onClick={() => navigate('/dashboard')}>
          Back
        </button>
      </div>
    );
  }

  return (
    <section>
      <button className="back-link" onClick={() => navigate('/dashboard')}>
        ← Back
      </button>
      <div className="profile-card">
        <div className="profile-top">
          <div className="avatar lg">{initials(user)}</div>
          <div>
            <h1>{formatDisplayName(user)}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>
        <div className="info-row">
          <span>First name</span>
          <strong>{user.name || '—'}</strong>
        </div>
        <div className="info-row">
          <span>Last name</span>
          <strong>{user.surname || '—'}</strong>
        </div>
        <div className="info-row">
          <span>User ID</span>
          <span className="mono">{user.id || 'Loading…'}</span>
        </div>
      </div>
    </section>
  );
}
