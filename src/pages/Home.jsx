import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <Navbar />
      
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Secure Authentication
            <span className="gradient-text"> Made Simple</span>
          </h1>
          <p className="hero-description">
            A robust authentication microservice with multiple login options.
            Secure your applications with email/password or OAuth providers.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">🔒</div>
            <div className="card-text">Secure</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">⚡</div>
            <div className="card-text">Fast</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">✨</div>
            <div className="card-text">Simple</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Why Choose Our Auth Service?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3 className="feature-title">Multiple Auth Methods</h3>
              <p className="feature-description">
                Support for email/password, Google, Facebook, and GitHub authentication.
                Choose what works best for your users.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Enterprise Security</h3>
              <p className="feature-description">
                Built with security best practices including JWT tokens, session management,
                rate limiting, and password hashing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Fast & Scalable</h3>
              <p className="feature-description">
                Built with Node.js and PostgreSQL for high performance and scalability.
                Perfect for microservices architecture.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3 className="feature-title">Easy Integration</h3>
              <p className="feature-description">
                Simple REST API with comprehensive documentation.
                Integrate with any frontend framework or mobile app.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Session Management</h3>
              <p className="feature-description">
                Flexible authentication with both JWT tokens and session-based auth.
                Use what fits your application needs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Modern UI</h3>
              <p className="feature-description">
                Beautiful, responsive React interface that works seamlessly
                on desktop and mobile devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of developers who trust our authentication service
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-large">
              Create Your Account
            </Link>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2024 Auth Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
