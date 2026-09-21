import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/api';
import formatDisplayName, { initials, INTEREST_META, prettyInterestCode } from '../utils/formatDisplayName.js';

const FOLLOWING_KEY = 'shelf-following';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [profile, items] = await Promise.all([
          userService.getUserById(userId),
          userService.getUserInterests(userId),
        ]);
        setUser(profile);
        setInterests(items || []);
      } catch {
        setError('Could not load this profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!userId || !me?.id) {
      setIsFollowing(false);
      return;
    }
    const followed = JSON.parse(localStorage.getItem(FOLLOWING_KEY) || '[]');
    const normalized = String(userId);
    setIsFollowing(followed.includes(normalized));
  }, [userId, me?.id]);

  useEffect(() => {
    if (me?.id && user?.id && String(me.id) === String(user.id)) {
      navigate('/my-profile', { replace: true });
    }
  }, [me?.id, user?.id, navigate]);

  if (loading) return <div className="muted">Loading profile…</div>;
  if (error || !user) {
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="banner error">{error || 'User not found'}</div>
      </div>
    );
  }

  const types = Array.from(new Set(interests.map((item) => item.interestType).filter(Boolean)));

  const toggleFollow = () => {
    if (!userId) return;
    const followed = JSON.parse(localStorage.getItem(FOLLOWING_KEY) || '[]');
    const normalized = String(userId);
    const next = followed.includes(normalized)
      ? followed.filter((id) => id !== normalized)
      : [...followed, normalized];
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(next));
    setIsFollowing(!followed.includes(normalized));
  };

  const canViewInterests = !me || !userId || String(me.id) === String(userId) || isFollowing;

  return (
    <section>
      <button className="back-link" onClick={() => navigate(-1)}>
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

        {me && userId && String(me.id) !== String(userId) && (
          <div className="inline-actions" style={{ marginBottom: 20 }}>
            <button className="solid-btn" onClick={toggleFollow}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        )}

        <h2>Their lists</h2>
        {!canViewInterests ? (
          <div className="banner muted" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
            Follow this person to unlock their interests.
          </div>
        ) : types.length === 0 ? (
          <p className="empty">This person has not saved any recommendations yet.</p>
        ) : (
          types.map((code) => {
            const items = interests.filter((item) => item.interestType === code);
            const meta = INTEREST_META[code] || {};
            return (
              <button
                key={code}
                className="my-interest-row"
                onClick={() => navigate(`/profile/${userId}/interests/${code}`)}
              >
                <span>
                  {meta.icon} {prettyInterestCode(code)}
                </span>
                <span className="muted">{items.length} saved</span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
