import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [booths, setBooths] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, boothsRes, attendeesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/visits/stats`),
        axios.get(`${API_BASE_URL}/booths`),
        axios.get(`${API_BASE_URL}/attendees`)
      ]);

      setStats(statsRes.data);
      setBooths(boothsRes.data);
      setAttendees(attendeesRes.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Event statistics and management</p>
        </div>

        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>Total Booths</h3>
              <div className="stat-number">{stats.totalBooths}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Attendees</h3>
              <div className="stat-number">{stats.totalAttendees}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Total Visits</h3>
              <div className="stat-number">{stats.totalVisits}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Average Rating</h3>
              <div className="stat-number">
                {stats.ratingAnalytics?.averageRating || 0}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Total Ratings</h3>
              <div className="stat-number">
                {stats.ratingAnalytics?.totalRatings || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <div className="section-header">
              <h2>Booth Management</h2>
              <Link to="/admin/booths" className="btn btn-primary">
                Manage Booths
              </Link>
            </div>
            
            <div className="booths-preview">
              {booths.slice(0, 3).map((booth) => {
                const boothRating = stats.ratingAnalytics?.boothRatingStats?.find(
                  stat => stat.booth._id === booth._id
                );
                return (
                  <div key={booth._id} className="booth-item">
                    <h4>{booth.name}</h4>
                    <p>{booth.description}</p>
                    <div className="booth-meta">
                      <span className={`status ${booth.isActive ? 'active' : 'inactive'}`}>
                        {booth.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {boothRating && (
                        <span className="booth-rating">
                          ⭐ {boothRating.averageRating.toFixed(1)} ({boothRating.totalRatings} ratings)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {booths.length > 3 && (
                <div className="more-items">
                  <p>+{booths.length - 3} more booths</p>
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Rating Analytics</h2>
            </div>
            
            <div className="rating-analytics">
              <div className="rating-overview">
                <div className="rating-distribution">
                  <h4>Rating Distribution</h4>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = stats.ratingAnalytics?.ratingDistribution?.[stars] || 0;
                    const total = stats.ratingAnalytics?.totalRatings || 1;
                    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                    return (
                      <div key={stars} className="rating-bar">
                        <span className="stars">{'⭐'.repeat(stars)}</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/booths" className="action-card">
              <div className="action-icon">➕</div>
              <h3>Add New Booth</h3>
              <p>Create a new booth with QR code</p>
            </Link>
            
            <Link to="/scan" className="action-card">
              <div className="action-icon">📱</div>
              <h3>Test QR Scanner</h3>
              <p>Test the QR code scanning functionality</p>
            </Link>
            
            <div className="action-card">
              <div className="action-icon">📊</div>
              <h3>View Analytics</h3>
              <p>Detailed event analytics and reports</p>
            </div>
            
            <div className="action-card">
              <div className="action-icon">⚙️</div>
              <h3>Settings</h3>
              <p>Configure event settings and preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 