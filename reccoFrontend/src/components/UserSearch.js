import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '../services/api';
import './UserSearch.css';

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (term) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const allUsers = await userService.getAllUsers();
      const lowerTerm = term.toLowerCase();

      // Support multiple possible name field shapes (name/surname or firstName/lastName)
      const matchedUsers = allUsers.filter((user) => {
        const firstName = user.name || user.firstName || '';
        const lastName = user.surname || user.lastName || '';
        const email = user.email || '';

        return (
          firstName.toLowerCase().includes(lowerTerm) ||
          lastName.toLowerCase().includes(lowerTerm) ||
          email.toLowerCase().includes(lowerTerm)
        );
      });
      
      if (matchedUsers.length > 0) {
        setSearchResults(matchedUsers);
      } else {
        setError('User not found');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setError('');

    if (!value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    await performSearch(value);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="usersearch-container">
      <div className="search-header">
        <h2>Find Users</h2>
        <p>Search for other users by their name</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
          autoFocus
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Searching...</div>
      ) : hasSearched && searchResults.length === 0 ? (
        <div className="no-data">No users found matching "{searchTerm}"</div>
      ) : null}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="users-grid">
            {searchResults.map((user) => {
              const firstName = user.name || user.firstName || '';
              const lastName = user.surname || user.lastName || '';
              const displayName =
                [firstName, lastName].filter(Boolean).join(' ') ||
                user.email ||
                'Unknown user';

              return (
                <div
                  key={user.id}
                  className="user-card"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="user-avatar">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3>{displayName}</h3>
                  <p className="user-email">{user.email}</p>
                  <p className="user-id">ID: {user.id?.substring(0, 8)}...</p>
                  <button className="view-profile-btn">View Profile</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasSearched && searchResults.length === 0 && (
        <div className="empty-state">
          <p>Enter a name in the search bar to find users</p>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
