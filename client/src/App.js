import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import QRScanner from './components/QRScanner';
import BoothCheckin from './components/BoothCheckin';
import AttendeeProfile from './components/AttendeeProfile';
import AdminDashboard from './components/AdminDashboard';
import BoothManagement from './components/BoothManagement';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import BoothRating from './components/BoothRating';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(token === 'admin-authenticated');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar onLogout={handleLogout} />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<QRScanner />} />
            <Route path="/checkin/:qrCode" element={<BoothCheckin />} />
            <Route path="/profile/:email" element={<AttendeeProfile />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/rating/:visitId" element={<BoothRating />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/booths" 
              element={
                <ProtectedRoute>
                  <BoothManagement />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
