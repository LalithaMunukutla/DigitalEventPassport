import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/visits/stats`);
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load event statistics');
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to Digital Event Passport</h1>
        <p>Scan QR codes at event booths to track your journey and earn your digital passport!</p>
        
        <div className="hero-buttons">
          <Link to="/scan" className="btn btn-primary">
            📱 Scan QR Code
          </Link>
          {localStorage.getItem('adminToken') === 'admin-authenticated' && (
            <Link to="/admin" className="btn btn-secondary">
              🛠️ Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>How it works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Scan QR Code</h3>
            <p>Point your camera at any booth's QR code to start your check-in process.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Enter Details</h3>
            <p>Provide your name, email, and phone number to register or check-in.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">❓</div>
            <h3>Answer Questions</h3>
            <p>Some booths may have questions to test your knowledge about their content.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Get Marked</h3>
            <p>Successfully complete the booth visit and get marked in your digital passport.</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Event Statistics</h2>
        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Booths</h3>
              <p className="stat-number">{stats.totalBooths}</p>
            </div>
            <div className="stat-card">
              <h3>Total Attendees</h3>
              <p className="stat-number">{stats.totalAttendees}</p>
            </div>
            <div className="stat-card">
              <h3>Total Visits</h3>
              <p className="stat-number">{stats.totalVisits}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 