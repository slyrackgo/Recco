import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import formatDisplayName from '../utils/formatDisplayName';
import './UserList.css';

function UserList({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // sync typed value into the header search so header always shows the same query
    window.dispatchEvent(new CustomEvent('syncHeaderSearch', { detail: value }));

    if (!value.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      // fetch all users and filter client-side using prefix matching for consistency
      const all = await userService.getAllUsers();
      const q = value.toLowerCase().trim();
      const filtered = (all || []).filter(u => {
        const first = (u.name || u.firstName || '').toLowerCase();
        const last = (u.surname || u.lastName || '').toLowerCase();
        const full = [first, last].filter(Boolean).join(' ');
        return full.startsWith(q) || first.startsWith(q) || last.startsWith(q);
      });
      setUsers(filtered);
      setError(filtered.length === 0 ? 'User not found' : '');
    } catch (err) {
      setError('User not found');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    // populate header with the full display name before navigation
    const found = users.find(u => u.id === userId);
    if (found) window.dispatchEvent(new CustomEvent('syncHeaderSearch', { detail: formatDisplayName(found) }));
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="userlist-container">
      <div className="userlist-header">
        <h2>Users</h2>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="no-data">No users found</div>
      ) : (
        <div className="users-grid">
          {users.map((user) => {
            const displayName = formatDisplayName(user);

            return (
              <div 
                key={user.id} 
                className="user-card"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="user-info">
                  <h3>{displayName}</h3>
                  <p className="email">{user.email}</p>
                  <p className="id">ID: {user.id.substring(0, 8)}...</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserList;
