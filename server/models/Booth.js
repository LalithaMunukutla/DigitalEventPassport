const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }]
});

const boothSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    unique: true,
    required: true
  },
  hasQuestions: {
    type: Boolean,
    default: false
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booth', boothSchema); 