import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../services/api';
import formatDisplayName, { initials } from '../utils/formatDisplayName.js';

export default function UserSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const allUsers = await userService.getAllUsers();
        const q = query.toLowerCase().trim();
        const matched = (allUsers || []).filter((user) => {
          const first = (user.name || '').toLowerCase();
          const last = (user.surname || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const full = [first, last].filter(Boolean).join(' ');
          const byName = full.startsWith(q) || first.startsWith(q) || last.startsWith(q) || full.includes(q);
          const byEmail = email.includes(q);
          return byName || byEmail;
        });
        setResults(matched);
      } catch {
        setError('Search failed.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [query]);

  return (
    <section>
      <div className="page-head">
        <h1>Find people</h1>
        <p>
          {query ? `Results for “${query}”` : 'Use the search bar in the header to look someone up.'}
        </p>
      </div>
      {error && <div className="banner error">{error}</div>}
      {loading && <p className="muted">Searching…</p>}
      {!loading && query && results.length === 0 && (
        <p className="empty">No users matched that search.</p>
      )}
      <div className="users-grid">
        {results.map((user) => (
          <button key={user.id} className="user-card" onClick={() => navigate(`/profile/${user.id}`)}>
            <div className="avatar">{initials(user)}</div>
            <h3>{formatDisplayName(user)}</h3>
            <p className="muted">{user.email}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
