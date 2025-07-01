import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AttendeeProfile.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AttendeeProfile = () => {
  const { email } = useParams();
  const location = useLocation();
  const [attendee, setAttendee] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkinResult, setCheckinResult] = useState(null);

  useEffect(() => {
    if (location.state?.checkinResult) {
      setCheckinResult(location.state.checkinResult);
    }
    fetchAttendeeData();
  }, [email]);

  const fetchAttendeeData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendees/email/${email}`);
      setAttendee(response.data);
      
      // Fetch visit history
      const visitsResponse = await axios.get(`${API_BASE_URL}/attendees/${response.data._id}/visits`);
      setVisits(visitsResponse.data.visits);
      setLoading(false);
    } catch (error) {
      setError('Attendee not found');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="attendee-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendee-profile">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const successfulVisits = visits.filter(visit => visit.isVisited);
  const completionRate = visits.length > 0 ? (successfulVisits.length / visits.length * 100).toFixed(1) : 0;

  return (
    <div className="attendee-profile">
      <div className="profile-container">
        {checkinResult && (
          <div className="checkin-success">
            <div className="success-icon">✅</div>
            <h2>Check-in Successful!</h2>
            <p>You have successfully checked into <strong>{checkinResult.booth.name}</strong></p>
            {checkinResult.visit.score !== undefined && (
              <p>Your score: <strong>{checkinResult.visit.score}%</strong></p>
            )}
          </div>
        )}

        <div className="profile-header">
          <div className="profile-avatar">
            {attendee.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{attendee.name}</h1>
            <p className="email">{attendee.email}</p>
            <p className="phone">{attendee.phoneNumber}</p>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Visits</h3>
            <div className="stat-number">{attendee.totalVisits}</div>
          </div>
          <div className="stat-card">
            <h3>Completion Rate</h3>
            <div className="stat-number">{completionRate}%</div>
          </div>
          <div className="stat-card">
            <h3>Total Booths</h3>
            <div className="stat-number">{visits.length}</div>
          </div>
        </div>

        <div className="visits-section">
          <h2>Visit History</h2>
          {visits.length === 0 ? (
            <div className="no-visits">
              <p>No booth visits yet. Start by scanning a QR code!</p>
            </div>
          ) : (
            <div className="visits-list">
              {visits.map((visit) => (
                <div key={visit._id} className={`visit-card ${visit.isVisited ? 'visited' : 'not-visited'}`}>
                  <div className="visit-header">
                    <h3>{visit.booth.name}</h3>
                    <span className={`status ${visit.isVisited ? 'success' : 'pending'}`}>
                      {visit.isVisited ? '✅ Visited' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="booth-description">{visit.booth.description}</p>
                  <div className="visit-details">
                    <span className="visit-date">
                      {new Date(visit.visitedAt).toLocaleDateString()}
                    </span>
                    {visit.score !== undefined && (
                      <span className="visit-score">
                        Score: {visit.score}%
                      </span>
                    )}
                    {visit.rating && (
                      <span className="visit-rating">
                        ⭐ {visit.rating}/5
                      </span>
                    )}
                  </div>
                  
                  {visit.ratingComment && (
                    <div className="rating-comment">
                      <p><strong>Your Review:</strong> {visit.ratingComment}</p>
                    </div>
                  )}
                  
                  {visit.answers && visit.answers.length > 0 && (
                    <div className="answers-summary">
                      <h4>Your Answers:</h4>
                      {visit.answers.map((answer, index) => (
                        <div key={index} className={`answer ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                          <span className="question">Q{index + 1}: {answer.question}</span>
                          <span className="answer-text">A: {answer.userAnswer}</span>
                          <span className="result">{answer.isCorrect ? '✅' : '❌'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeeProfile; 