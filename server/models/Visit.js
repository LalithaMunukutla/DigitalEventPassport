const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: true
  },
  booth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth',
    required: true
  },
  isVisited: {
    type: Boolean,
    default: false
  },
  answers: [{
    question: String,
    userAnswer: String,
    isCorrect: Boolean
  }],
  score: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  ratingComment: {
    type: String,
    maxlength: 500
  },
  visitedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique combination of attendee and booth
visitSchema.index({ attendee: 1, booth: 1 }, { unique: true });

module.exports = mongoose.model('Visit', visitSchema); 