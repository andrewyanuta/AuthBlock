import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login, oauthProviders } = useAuth();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Check for error in URL params (from OAuth redirects)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setAlert({ type: 'error', message: decodeURIComponent(error) });
      // Clear URL params
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        const newErrors = {};
        result.errors.forEach(error => {
          const field = error.path || error.param;
          if (field) {
            newErrors[field] = error.msg;
          }
        });
        setErrors(newErrors);
      }
      setAlert({ type: 'error', message: result.message || 'Login failed. Please check your credentials.' });
    }

    setLoading(false);
  };

  const providerIcons = {
    google: '🔍',
    facebook: '📘',
    github: '💻',
  };

  const providerNames = {
    google: 'Google',
    facebook: 'Facebook',
    github: 'GitHub',
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account to continue</p>

        {alert && (
          <div className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {oauthProviders.length > 0 && (
          <>
            <div className="divider">Or continue with</div>
            <div className="oauth-buttons">
              {oauthProviders.map(provider => (
                <a
                  key={provider}
                  href={`/api/auth/${provider}`}
                  className={`oauth-btn ${provider}`}
                >
                  {providerIcons[provider]} Continue with {providerNames[provider]}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="links">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

