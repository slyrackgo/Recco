import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import './InterestPosts.css';

function InterestPosts() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  // inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      if (!user?.id) return;

      try {
        setLoadingPosts(true);
        // Call server endpoint that returns ALL users' UserInterest rows for this interest code
        const allInterests = await userService.getInterestPosts(code);

        // Server already returns only the requested interest code, sort newest-first
        const sorted = (allInterests || []).sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Newest first
        });

        setPosts(sorted);
        setError('');
      } catch (err) {
        console.error('Error loading interest posts:', err);
        setError('Failed to load posts for this interest');
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [user?.id, code]);

  if (loading || loadingPosts) {
    return (
      <div className="interest-posts-container">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  const prettyCode = code?.replace(/_/g, ' ') || 'Interest';

  return (
    <div className="interest-posts-container">
      <div className="interest-posts-header">
        <button
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to dashboard
        </button>
        <h1>{prettyCode}</h1>
        <p>All posts for this interest</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {posts.length === 0 ? (
        <div className="no-posts-message">
          No posts for this interest yet.
        </div>
      ) : (
        <div className="interest-posts-list">
          {posts.map((post, index) => {
            const title = post.title || prettyCode;
            const description = post.description || '';
            const rating = post.rating || 'No rating';
            const createdAt = post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : 'Unknown date';

            const updatedAtIso = post.updatedAt || null;
            const isUpdated = updatedAtIso && updatedAtIso !== post.createdAt;
            const recentMs = 1000 * 60 * 5; // 5 minutes
            const isRecent = isUpdated && (Date.now() - new Date(updatedAtIso).getTime()) < recentMs;

            const timeAgo = (iso) => {
              if (!iso) return '';
              const diff = Date.now() - new Date(iso).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return 'just now';
              if (mins < 60) return `${mins}m`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h`;
              const days = Math.floor(hrs / 24);
              return `${days}d`;
            };

            // ownership check: support multiple shapes returned by backend (user object, userId, snake_case)
            const isOwner = !!(user && (
              (post.user && (String(user.id) === String(post.user.id) || user.email === post.user.email)) ||
              (post.userId && String(user.id) === String(post.userId)) ||
              (post.user_id && String(user.id) === String(post.user_id))
            ));

            // DEBUG: uncomment to diagnose ownership mismatches in browser console
            // console.debug('post.owner check', { currentUser: user?.id || user?.email, postUserId: post.user?.id || post.userId || post.user_id, postUserEmail: post.user?.email });

            const startEdit = () => {
              setEditingId(post.id);
              setEditText(post.description || '');
            };

            const cancelEdit = () => {
              setEditingId(null);
              setEditText('');
            };

            const saveEdit = async () => {
              try {
                setSavingId(post.id);
                const updated = await userService.updateInterestDescription(post.id, editText || null);
                // replace post in list with updated object returned from server
                setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                setEditingId(null);
                setEditText('');
                setError('');
              } catch (err) {
                console.error('Failed to save description', err);
                setError('Failed to save description');
              } finally {
                setSavingId(null);
              }
            };

            return (
              <div
                key={post.id || index}
                className={`interest-post-card ${isRecent ? 'highlight-updated' : ''}`}
              >
                <div className="interest-post-title">
                  {title}
                  {isUpdated && (
                    <span className="interest-updated-badge">Updated {timeAgo(updatedAtIso)}</span>
                  )} 
                </div>

                <div className="interest-post-meta">
                  <span>{isUpdated ? `Updated on: ${new Date(updatedAtIso).toLocaleDateString()}` : `Added on: ${createdAt}`}</span>
                  <span>Rating: {rating}</span>
                </div>

                {/* debug: show owner info so you can verify ownership */}
                <div className="post-owner">
                  Owner: {post.user?.email || post.user?.id || post.userId || post.user_id || 'unknown'}
                </div>

                {editingId === post.id ? (
                  <div>
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                    />
                    <div style={{ marginTop: 10 }}>
                      <button className="save-btn" onClick={saveEdit} disabled={savingId === post.id}>
                        {savingId === post.id ? 'Saving...' : 'Save'}
                      </button>
                      <button className="cancel-btn" onClick={cancelEdit} style={{ marginLeft: 8 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="interest-post-description">
                      {description || 'No description'}
                    </div>

                    {isOwner && editingId !== post.id && (
                      <button className="update-btn" onClick={startEdit} aria-label="Update description">Update</button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InterestPosts;

