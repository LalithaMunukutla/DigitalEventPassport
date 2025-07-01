import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BoothRating.css';

const API_BASE_URL = 'http://localhost:5000/api';

const BoothRating = ({ visit, booth, attendee, onRatingComplete }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/visits/${visit._id}/rate`, {
        rating,
        comment: comment.trim() || undefined
      });

      // Call the callback to update parent component
      if (onRatingComplete) {
        onRatingComplete();
      }

      // Navigate to attendee profile
      navigate(`/profile/${attendee.email}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (onRatingComplete) {
      onRatingComplete();
    }
    navigate(`/profile/${attendee.email}`);
  };

  return (
    <div className="booth-rating">
      <div className="rating-container">
        <div className="rating-header">
          <h1>⭐ Rate Your Experience</h1>
          <p>How was your visit to <strong>{booth.name}</strong>?</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleRatingSubmit} className="rating-form">
          <div className="rating-stars">
            <label>Your Rating:</label>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${rating >= star ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="rating-text">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Additional Comments (Optional):</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this booth..."
              maxLength={500}
              rows={4}
            />
            <span className="char-count">{comment.length}/500</span>
          </div>

          <div className="rating-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSkip}
              disabled={submitting}
            >
              Skip Rating
            </button>
          </div>
        </form>

        <div className="rating-footer">
          <p>Your feedback helps us improve the event experience!</p>
        </div>
      </div>
    </div>
  );
};

export default BoothRating; 