import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/api';
import { INTEREST_META, prettyInterestCode } from '../utils/formatDisplayName.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [available, setAvailable] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    if (!user?.id) return;
    try {
      setBusy(true);
      const [catalog, mine] = await Promise.all([
        userService.getAvailableInterests().catch(() => userService.getUserDashboard(user.id)),
        userService.getUserInterests(user.id),
      ]);
      setAvailable(catalog || []);
      setUserInterests(mine || []);
      setError('');
    } catch {
      setError('Could not load your dashboard.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  useEffect(() => {
    if (location.state?.interestAdded && user?.id) {
      load();
      setSuccess('Recommendation saved.');
      setTimeout(() => setSuccess(''), 2500);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user?.id]);

  const myTypes = Array.from(
    new Set(userInterests.map((item) => item.interestType || item.code).filter(Boolean))
  );

  if (loading || busy) {
    return <div className="muted">Loading dashboard…</div>;
  }

  return (
    <section>
      <div className="page-head">
        <p className="eyebrow">Your shelf</p>
        <h1>Dashboard</h1>
        <p>Pick a category, add a title, and keep notes on what you would recommend.</p>
      </div>
      {error && <div className="banner error">{error}</div>}
      {success && <div className="banner ok">{success}</div>}

      <div className="grid-2">
        <div className="panel">
          <h2>Categories</h2>
          {available.length === 0 ? (
            <p className="empty">No categories available.</p>
          ) : (
            available.map((interest) => {
              const code = interest.code;
              const meta = INTEREST_META[code] || {};
              return (
                <div className="interest-row" key={code}>
                  <button className="interest-main" onClick={() => navigate(`/interests/${code}`)}>
                    <span>{meta.icon || '•'}</span>
                    <span>
                      <strong>{interest.label || prettyInterestCode(code)}</strong>
                      <div className="muted">{interest.description}</div>
                    </span>
                  </button>
                  <button
                    className="plus-btn"
                    title="Add a recommendation"
                    onClick={() => navigate(`/add-interest?code=${code}`)}
                  >
                    +
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="panel">
          <h2>My lists</h2>
          {myTypes.length === 0 ? (
            <p className="empty">Nothing saved yet. Use + on a category to add your first title.</p>
          ) : (
            myTypes.map((code) => {
              const count = userInterests.filter((item) => item.interestType === code).length;
              const meta = INTEREST_META[code] || {};
              return (
                <button
                  key={code}
                  className="my-interest-row"
                  onClick={() => navigate(`/interests/${code}`)}
                >
                  <span>
                    {meta.icon} {prettyInterestCode(code)}
                  </span>
                  <span className="muted">{count} saved</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
