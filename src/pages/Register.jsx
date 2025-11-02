import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const { register, oauthProviders } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(req => req === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    }

    if (name === 'confirmPassword' && formData.password) {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    // Validate password
    if (!validatePassword(formData.password)) {
      setAlert({ type: 'error', message: 'Password does not meet requirements.' });
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      setAlert({ type: 'success', message: 'Account created successfully! Redirecting to login...' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      setAlert({ type: 'error', message: result.message || 'Registration failed. Please check your information.' });
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
        <h1>Create Account</h1>
        <p className="subtitle">Sign up to get started</p>

        {alert && (
          <div className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="John Doe"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

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
              autoComplete="new-password"
              placeholder="Create a strong password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
            <div className="password-requirements">
              <ul>
                <li className={passwordRequirements.length ? 'valid' : ''}>
                  At least 8 characters
                </li>
                <li className={passwordRequirements.upper ? 'valid' : ''}>
                  One uppercase letter
                </li>
                <li className={passwordRequirements.lower ? 'valid' : ''}>
                  One lowercase letter
                </li>
                <li className={passwordRequirements.number ? 'valid' : ''}>
                  One number
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {oauthProviders.length > 0 && (
          <>
            <div className="divider">Or sign up with</div>
            <div className="oauth-buttons">
              {oauthProviders.map(provider => (
                <a
                  key={provider}
                  href={`/api/auth/${provider}`}
                  className={`oauth-btn ${provider}`}
                >
                  {providerIcons[provider]} Sign up with {providerNames[provider]}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="links">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

