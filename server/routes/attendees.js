const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const Visit = require('../models/Visit');

// Get all attendees
router.get('/', async (req, res) => {
  try {
    const attendees = await Attendee.find().sort({ createdAt: -1 });
    res.json(attendees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendee by email
router.get('/email/:email', async (req, res) => {
  try {
    const attendee = await Attendee.findOne({ email: req.params.email.toLowerCase() });
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendee with visit history
router.get('/:id/visits', async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    
    const visits = await Visit.find({ attendee: req.params.id })
      .populate('booth', 'name description')
      .sort({ visitedAt: -1 });
    
    res.json({ attendee, visits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new attendee
router.post('/', async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    
    // Check if attendee already exists
    const existingAttendee = await Attendee.findOne({ email: email.toLowerCase() });
    if (existingAttendee) {
      return res.status(400).json({ message: 'Attendee with this email already exists' });
    }
    
    const attendee = new Attendee({
      name,
      email: email.toLowerCase(),
      phoneNumber
    });
    
    await attendee.save();
    res.status(201).json(attendee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendee with this email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update attendee
router.put('/:id', async (req, res) => {
  try {
    const attendee = await Attendee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    res.json(attendee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendee statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }
    
    const visits = await Visit.find({ attendee: req.params.id });
    const totalVisits = visits.filter(visit => visit.isVisited).length;
    const totalBooths = await Visit.countDocuments({ attendee: req.params.id });
    
    res.json({
      attendee,
      totalVisits,
      totalBooths,
      completionRate: totalBooths > 0 ? (totalVisits / totalBooths * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 