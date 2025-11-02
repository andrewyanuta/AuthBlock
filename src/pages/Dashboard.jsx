import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading, checkAuth } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Refresh user data when component mounts
    if (!loading) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    setRefreshing(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkAuth();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div>No user data available. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={handleRefresh} disabled={refreshing} className="btn-refresh">
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        <div className="dashboard-card">
          <h2>User Information</h2>
          <div className="user-info">
            <div className="info-item">
              <strong>ID:</strong>
              <span>{user.id}</span>
            </div>
            <div className="info-item">
              <strong>Name:</strong>
              <span>{user.name}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>Provider:</strong>
              <span className="provider-badge">{user.provider}</span>
            </div>
            <div className="info-item">
              <strong>Account Created:</strong>
              <span>{new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {user.updatedAt && (
              <div className="info-item">
                <strong>Last Updated:</strong>
                <span>{new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


