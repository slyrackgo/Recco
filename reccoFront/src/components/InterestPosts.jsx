import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/api';
import { prettyInterestCode, timeAgo } from '../utils/formatDisplayName.js';

const FOLLOWING_KEY = 'shelf-following';

export default function InterestPosts() {
  const { code, userId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState(userId ? 'theirs' : 'mine');
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const ownerId = userId || user?.id;
  const isLockedProfile = !!userId && !!user?.id && String(userId) !== String(user.id);
  const isFollowing = (() => {
    if (!isLockedProfile) return true;
    const followed = JSON.parse(localStorage.getItem(FOLLOWING_KEY) || '[]');
    return followed.includes(String(userId));
  })();

  const loadPosts = async () => {
    if (!user?.id) return;
    try {
      setBusy(true);
      const scopedId = tab === 'everyone' ? null : ownerId;
      const data = await userService.getInterestPosts(code, scopedId);
      const sorted = (data || []).sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
      setPosts(sorted);
      setError('');
    } catch {
      setError('Could not load posts for this category.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setTab(userId ? 'theirs' : 'mine');
  }, [userId, code]);

  useEffect(() => {
    loadPosts();
  }, [user?.id, code, tab, ownerId]);

  const isOwnerPost = (post) =>
    !!(
      user &&
      ((post.user && (String(user.id) === String(post.user.id) || user.email === post.user.email)) ||
        (post.userId && String(user.id) === String(post.userId)))
    );

  const saveEdit = async (postId) => {
    try {
      setSavingId(postId);
      const updated = await userService.updateInterestDescription(postId, editText || null);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingId(null);
      setEditText('');
    } catch {
      setError('Could not save the description.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (interestId) => {
    if (!window.confirm('Delete this recommendation?')) return;
    try {
      setDeletingId(interestId);
      const ok = await userService.deleteInterest(interestId);
      if (ok) setPosts((prev) => prev.filter((p) => p.id !== interestId));
      else setError('Could not delete this post.');
    } catch {
      setError('Could not delete this post.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || busy) return <div className="muted">Loading posts…</div>;

  return (
    <section>
      <button className="back-link" onClick={() => navigate(userId ? `/profile/${userId}` : '/dashboard')}>
        ← Back
      </button>
      <div className="page-head">
        <h1>{prettyInterestCode(code)}</h1>
        <p>{userId ? 'Recommendations from this person.' : 'Your notes in this category.'}</p>
      </div>

      {!userId && (
        <div className="tabs">
          <button className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
            Mine
          </button>
          <button className={`tab ${tab === 'everyone' ? 'active' : ''}`} onClick={() => setTab('everyone')}>
            Everyone
          </button>
          <button className="solid-btn" onClick={() => navigate(`/add-interest?code=${code}`)}>
            Add
          </button>
        </div>
      )}

      {isLockedProfile && !isFollowing && (
        <div className="banner muted" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
          Follow this person to view their recommendations.
        </div>
      )}

      {error && <div className="banner error">{error}</div>}

      {(!isLockedProfile || isFollowing) &&
        (posts.length === 0 ? (
          <p className="empty">No recommendations here yet.</p>
        ) : (
          posts.map((post) => {
            const updated = post.updatedAt && post.updatedAt !== post.createdAt;
            return (
              <article className="post-card" key={post.id}>
                <h3>
                  {post.title || prettyInterestCode(code)}
                  {updated && <span className="badge">Updated {timeAgo(post.updatedAt)}</span>}
                </h3>
                <div className="meta">
                  <span>
                    {updated
                      ? `Updated ${new Date(post.updatedAt).toLocaleDateString()}`
                      : `Added ${post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}`}
                  </span>
                  {post.user?.email && <span>{post.user.email}</span>}
                  {post.rating && <span>Rating: {post.rating}</span>}
                </div>
                {editingId === post.id ? (
                  <>
                    <textarea
                      className="edit-textarea"
                      rows={4}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="inline-actions" style={{ marginTop: 10 }}>
                      <button className="solid-btn" onClick={() => saveEdit(post.id)} disabled={savingId === post.id}>
                        {savingId === post.id ? 'Saving…' : 'Save'}
                      </button>
                      <button className="ghost-btn" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{post.description || 'No description yet.'}</p>
                    {isOwnerPost(post) && (
                      <div className="inline-actions">
                        <button
                          className="ghost-btn"
                          onClick={() => {
                            setEditingId(post.id);
                            setEditText(post.description || '');
                          }}
                        >
                          Edit note
                        </button>
                        <button
                          className="danger-btn"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })
        ))}
    </section>
  );
}
