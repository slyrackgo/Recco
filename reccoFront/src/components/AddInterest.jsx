import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { INTEREST_META, prettyInterestCode } from '../utils/formatDisplayName.js';

export default function AddInterest() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get('code') || location.state?.code || '';
  const meta = INTEREST_META[code] || {};
  const [formData, setFormData] = useState({ label: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({ label: '', description: '' });
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) {
      setError('Choose a category from the dashboard first.');
      return;
    }
    if (!formData.label.trim()) {
      setError('Title is required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await userService.addInterestType({
        code,
        label: formData.label.trim(),
        icon: meta.icon || '',
        description: formData.description.trim(),
      });
      navigate('/dashboard', { state: { interestAdded: true } });
    } catch {
      setError('Could not save this recommendation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <button className="back-link" onClick={() => navigate('/dashboard')}>
        ← Back to dashboard
      </button>
      <div className="page-head">
        <p className="eyebrow">{meta.icon} {prettyInterestCode(code) || 'New item'}</p>
        <h1>Add a recommendation</h1>
        <p>Title becomes the name of the book, show, podcast, or game.</p>
      </div>
      {error && <div className="banner error">{error}</div>}
      <form className="form panel" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            name="label"
            value={formData.label}
            onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="e.g. The Left Hand of Darkness"
            required
          />
        </label>
        <label>
          Your take
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Why would you recommend this?"
          />
        </label>
        <div className="form-actions">
          <button className="solid-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
