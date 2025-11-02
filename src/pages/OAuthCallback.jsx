import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OAuthCallback.css';

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to login with error
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Refresh auth state
      checkAuth().then(() => {
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      });
    } else {
      // No tokens, redirect to login
      navigate('/login?error=OAuth callback missing tokens', { replace: true });
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="oauth-callback-container">
      <div className="oauth-callback-content">
        <div className="spinner-large"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;

