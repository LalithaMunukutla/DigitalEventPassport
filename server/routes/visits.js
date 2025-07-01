const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const Attendee = require('../models/Attendee');
const Booth = require('../models/Booth');

// Check-in to booth
router.post('/checkin', async (req, res) => {
  try {
    const { boothQrCode, attendeeData, answers } = req.body;
    
    // Find booth by QR code
    const booth = await Booth.findOne({ qrCode: boothQrCode, isActive: true });
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    
    // Find or create attendee
    let attendee = await Attendee.findOne({ email: attendeeData.email.toLowerCase() });
    if (!attendee) {
      attendee = new Attendee({
        name: attendeeData.name,
        email: attendeeData.email.toLowerCase(),
        phoneNumber: attendeeData.phoneNumber
      });
      await attendee.save();
    }
    
    // Check if visit already exists
    let visit = await Visit.findOne({ attendee: attendee._id, booth: booth._id });
    if (!visit) {
      visit = new Visit({
        attendee: attendee._id,
        booth: booth._id
      });
    }
    
    // If booth has questions, validate answers
    if (booth.hasQuestions && booth.questions.length > 0) {
      if (!answers || answers.length === 0) {
        return res.status(400).json({ message: 'Answers are required for this booth' });
      }
      
      let correctAnswers = 0;
      const visitAnswers = [];
      
      booth.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctAnswers++;
        
        visitAnswers.push({
          question: question.question,
          userAnswer: userAnswer,
          isCorrect: isCorrect
        });
      });
      
      const score = (correctAnswers / booth.questions.length) * 100;
      const isVisited = score >= 70; // 70% threshold to mark as visited
      
      visit.answers = visitAnswers;
      visit.score = score;
      visit.isVisited = isVisited;
    } else {
      // No questions required, mark as visited
      visit.isVisited = true;
    }
    
    await visit.save();
    
    // Update attendee's total visits
    const totalVisits = await Visit.countDocuments({ 
      attendee: attendee._id, 
      isVisited: true 
    });
    await Attendee.findByIdAndUpdate(attendee._id, { totalVisits });
    
    res.json({
      success: true,
      visit,
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        totalVisits
      },
      booth: {
        id: booth._id,
        name: booth.name,
        description: booth.description
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get visit history for an attendee
router.get('/attendee/:attendeeId', async (req, res) => {
  try {
    const visits = await Visit.find({ attendee: req.params.attendeeId })
      .populate('booth', 'name description')
      .sort({ visitedAt: -1 });
    
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all visits (for admin)
router.get('/', async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate('attendee', 'name email')
      .populate('booth', 'name description')
      .sort({ visitedAt: -1 });
    
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate a booth visit
router.post('/:visitId/rate', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const visit = await Visit.findById(req.params.visitId);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!visit.isVisited) {
      return res.status(400).json({ message: 'Cannot rate a visit that is not completed' });
    }

    visit.rating = rating;
    if (comment) {
      visit.ratingComment = comment;
    }

    await visit.save();
    
    res.json({
      success: true,
      visit,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get visit statistics
router.get('/stats', async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments({ isVisited: true });
    const totalAttendees = await Attendee.countDocuments();
    const totalBooths = await Booth.countDocuments({ isActive: true });
    
    // Rating analytics
    const ratingStats = await Visit.aggregate([
      { $match: { isVisited: true, rating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    const boothStats = await Visit.aggregate([
      { $match: { isVisited: true } },
      { $group: { _id: '$booth', visitCount: { $sum: 1 } } },
      { $lookup: { from: 'booths', localField: '_id', foreignField: '_id', as: 'booth' } },
      { $unwind: '$booth' }
    ]);

    // Booth rating analytics
    const boothRatingStats = await Visit.aggregate([
      { $match: { isVisited: true, rating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$booth',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      },
      { $lookup: { from: 'booths', localField: '_id', foreignField: '_id', as: 'booth' } },
      { $unwind: '$booth' }
    ]);

    res.json({
      totalVisits,
      totalAttendees,
      totalBooths,
      boothStats,
      ratingAnalytics: {
        totalRatings: ratingStats.length > 0 ? ratingStats[0].totalRatings : 0,
        averageRating: ratingStats.length > 0 ? parseFloat(ratingStats[0].averageRating.toFixed(1)) : 0,
        ratingDistribution,
        boothRatingStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 