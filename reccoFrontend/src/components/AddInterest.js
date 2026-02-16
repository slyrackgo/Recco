import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import './AddInterest.css';

function AddInterest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    icon: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [interestCode, setInterestCode] = useState('');

  useEffect(() => {
    // Get interest code from URL params or location state
    const params = new URLSearchParams(location.search);
    const code = params.get('code') || location.state?.code || '';
    setInterestCode(code);
    
    // Initialize form with empty values (not from previous entry)
    setFormData({
      code: code || '',
      label: '',
      icon: '',
      description: ''
    });
  }, [location]);

  const getPlaceholderForInterest = (code) => {
    const placeholders = {
      'BOOKS': 'e.g., Books and Reading',
      'TV_SHOWS': 'e.g., TV Shows and Series',
      'PODCASTS': 'e.g., Podcasts and Audio',
      'GAMES': 'e.g., Video Games and Gaming'
    };
    return placeholders[code] || 'e.g., Interest Name';
  };

  const getIconPlaceholder = (code) => {
    const icons = {
      'BOOKS': '📚',
      'TV_SHOWS': '📺',
      'PODCASTS': '🎧',
      'GAMES': '🎮'
    };
    return icons[code] || '📌';
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      setError('Code is required');
      return;
    }
    if (!formData.label.trim()) {
      setError('Label is required');
      return;
    }

    try {
      setError('');
      await userService.addInterestType({
        code: formData.code.trim(),
        label: formData.label.trim(),
        icon: formData.icon.trim(),
        description: formData.description.trim(),
        userId: user.id
      });
      
      setSuccessMessage('Interest added successfully!');
      setTimeout(() => {
        navigate('/dashboard', { state: { interestAdded: true } });
      }, 1500);
    } catch (err) {
      console.error('Error adding interest:', err);
      setError('Failed to add interest');
    }
  };

  if (loading) {
    return (
      <div className="add-interest-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="add-interest-container">
      <div className="add-interest-card">
        <div className="add-interest-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h1>Add Interest Details</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="add-interest-form">
          <div className="form-group">
            <label htmlFor="code">Code *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              placeholder="e.g., BOOKS"
              disabled
              required
            />
            <small className="field-hint">Code cannot be changed for existing interests</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="label">Label *</label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleFormChange}
              placeholder={getPlaceholderForInterest(interestCode)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="icon">Icon</label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleFormChange}
              placeholder={getIconPlaceholder(interestCode)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Add a description..."
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">Save Interest</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInterest;
