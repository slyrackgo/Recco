import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose, mode = 'login' }) {
  const { login } = useAuth();
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
  });

  useEffect(() => {
    setCurrentMode(mode);
    setError('');
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(formData.email, formData.password);
      await login(response.token);
      setFormData({ email: '', password: '', name: '', surname: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
      });
      const loginResponse = await authService.login(formData.email, formData.password);
      await login(loginResponse.token);
      setFormData({ email: '', password: '', name: '', surname: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        {currentMode === 'login' ? (
          <>
            <h2>Sign in</h2>
            <p className="muted">Welcome back to Shelf.</p>
            {error && <div className="banner error">{error}</div>}
            <form className="form" onSubmit={handleLogin}>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                Password
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </label>
              <button className="solid-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p className="toggle-mode">
              New here? <button onClick={() => setCurrentMode('register')}>Create an account</button>
            </p>
          </>
        ) : (
          <>
            <h2>Join Shelf</h2>
            <p className="muted">Create an account to start collecting recommendations.</p>
            {error && <div className="banner error">{error}</div>}
            <form className="form" onSubmit={handleRegister}>
              <label>
                First name
                <input name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>
                Last name
                <input name="surname" value={formData.surname} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                Password
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </label>
              <button className="solid-btn" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p className="toggle-mode">
              Already have an account? <button onClick={() => setCurrentMode('login')}>Sign in</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
