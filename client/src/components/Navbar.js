import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const isAuthenticated = localStorage.getItem('adminToken') === 'admin-authenticated';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎫 Digital Event Passport
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/scan" className="nav-link">
              Scan QR
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 