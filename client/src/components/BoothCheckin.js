import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BoothCheckin.css';
import BoothRating from './BoothRating';

const API_BASE_URL = 'http://localhost:5000/api';

const BoothCheckin = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [booth, setBooth] = useState(null);
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  const [step, setStep] = useState(1);
  
  // Form data
  const [attendeeData, setAttendeeData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBoothData();
  }, [qrCode]);

  const fetchBoothData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booths/qr/${qrCode}`);
      setBooth(response.data);
      setLoading(false);
    } catch (error) {
      setError('Booth not found or inactive');
      setLoading(false);
    }
  };

  const handleAttendeeDataChange = (e) => {
    setAttendeeData({
      ...attendeeData,
      [e.target.name]: e.target.value
    });
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleAttendeeSubmit = (e) => {
    e.preventDefault();
    if (booth.hasQuestions && booth.questions.length > 0) {
      setStep(2);
    } else {
      handleCheckin();
    }
  };

  const handleQuestionsSubmit = (e) => {
    e.preventDefault();
    handleCheckin();
  };

  const handleCheckin = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/visits/checkin`, {
        boothQrCode: qrCode,
        attendeeData,
        answers: booth.hasQuestions ? answers : undefined
      });

      setCheckinResult(response.data);
      setAttendee(response.data.attendee);
      
      // Show rating component after successful check-in
      setShowRating(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingComplete = () => {
    // Navigate to profile with checkin result
    navigate(`/profile/${attendeeData.email}`, {
      state: { checkinResult }
    });
  };

  if (loading) {
    return (
      <div className="booth-checkin">
        <div className="loading">Loading booth information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booth-checkin">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/scan')} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show rating component if check-in was successful
  if (showRating && checkinResult) {
    return (
      <BoothRating
        visit={checkinResult.visit}
        booth={checkinResult.booth}
        attendee={checkinResult.attendee}
        onRatingComplete={handleRatingComplete}
      />
    );
  }

  return (
    <div className="booth-checkin">
      <div className="checkin-container">
        <div className="booth-info">
          <h2>{booth.name}</h2>
          <p>{booth.description}</p>
          {booth.hasQuestions && (
            <div className="questions-notice">
              ⚠️ This booth requires you to answer questions to complete your visit
            </div>
          )}
        </div>

        {step === 1 && (
          <form onSubmit={handleAttendeeSubmit} className="attendee-form">
            <h3>Enter Your Details</h3>
            
            <div className="input-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={attendeeData.name}
                onChange={handleAttendeeDataChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={attendeeData.email}
                onChange={handleAttendeeDataChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={attendeeData.phoneNumber}
                onChange={handleAttendeeDataChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {booth.hasQuestions ? 'Continue to Questions' : 'Complete Check-in'}
            </button>
          </form>
        )}

        {step === 2 && booth.hasQuestions && (
          <form onSubmit={handleQuestionsSubmit} className="questions-form">
            <h3>Answer the Questions</h3>
            <p>Please answer the following questions to complete your booth visit:</p>
            
            {booth.questions.map((question, index) => (
              <div key={index} className="question-group">
                <label className="question-label">
                  {index + 1}. {question.question}
                </label>
                {question.options && question.options.length > 0 ? (
                  <div className="options-group">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="option-label">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          required
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Enter your answer..."
                    required
                  />
                )}
              </div>
            ))}

            <div className="form-buttons">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn btn-secondary"
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Complete Check-in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BoothCheckin; 