import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
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

    if (!value.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      const user = await userService.getUserByName(value);
      setUsers([user]);
    } catch (err) {
      setError('User not found');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
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
          {users.map((user) => (
            <div 
              key={user.id} 
              className="user-card"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="user-info">
                <h3>{user.name} {user.surname}</h3>
                <p className="email">{user.email}</p>
                <p className="id">ID: {user.id.substring(0, 8)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;
