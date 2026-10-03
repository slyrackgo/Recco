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
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '' });
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
      const data = await userService.getInterestPosts(code, ownerId);
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
    loadPosts();
  }, [user?.id, code, ownerId]);

  const isOwnerPost = (post) =>
    !!(
      user &&
      ((post.user && (String(user.id) === String(post.user.id) || user.email === post.user.email)) ||
        (post.userId && String(user.id) === String(post.userId)))
    );

  const saveEdit = async (postId) => {
    try {
      setSavingId(postId);
      const updated = await userService.updateInterest(postId, editForm);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingId(null);
      setEditForm({ title: '', description: '', date: '' });
    } catch {
      setError('Could not update this recommendation.');
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
    <section className="interest-posts-page">
      <button className="back-link" onClick={() => navigate(userId ? `/profile/${userId}` : '/dashboard')}>
        ← Back
      </button>
      <div className="page-head">
        <h1>{prettyInterestCode(code)}</h1>
        <p>{userId ? 'Recommendations from this person.' : 'Your notes in this category.'}</p>
      </div>

      {!userId && (
        <div className="toolbar">
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
          <p className="recommendations-empty">
            {userId
              ? 'No recommendations have been shared here yet.'
              : 'Nothing in this list yet. Add your first recommendation.'}
          </p>
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
                    {`Added ${post.createdAt ? new Date(post.createdAt).toLocaleDateString('de-DE') : '—'}`}
                  </span>
                  {post.user?.email && <span>{post.user.email}</span>}
                  {post.rating && <span>Rating: {post.rating}</span>}
                </div>
                {editingId === post.id ? (
                  <div className="edit-panel">
                    <label>
                      Name of interest
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      Description
                    <textarea
                      className="edit-textarea"
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    </label>
                    <label>
                      Posted date
                      <input
                        type="date"
                        lang="de-DE"
                        value={editForm.date}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        onKeyDown={(e) => {
                          if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => e.preventDefault()}
                        required
                      />
                    </label>
                    <div className="inline-actions">
                      <button
                        className="solid-btn"
                        onClick={() => saveEdit(post.id)}
                        disabled={savingId === post.id || !editForm.title.trim() || !editForm.date}
                      >
                        {savingId === post.id ? 'Saving…' : 'Save'}
                      </button>
                      <button className="ghost-btn" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={post.description ? undefined : 'post-description-empty'}>
                      {post.description || 'No description added.'}
                    </p>
                    {isOwnerPost(post) && (
                      <div className="inline-actions">
                        <button
                          className="ghost-btn"
                          onClick={() => {
                            setEditingId(post.id);
                            setEditForm({
                              title: post.title || '',
                              description: post.description || '',
                              date: post.createdAt ? post.createdAt.slice(0, 10) : '',
                            });
                          }}
                        >
                          Update
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
