const express = require('express');
const router = express.Router();
const Booth = require('../models/Booth');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Get all booths
router.get('/', async (req, res) => {
  try {
    const booths = await Booth.find({ isActive: true });
    res.json(booths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booth by QR code
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const booth = await Booth.findOne({ qrCode: req.params.qrCode, isActive: true });
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    res.json(booth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new booth
router.post('/', async (req, res) => {
  try {
    const { name, description, hasQuestions, questions } = req.body;
    
    // Generate unique QR code
    const qrCode = uuidv4();
    
    const booth = new Booth({
      name,
      description,
      qrCode,
      hasQuestions,
      questions: hasQuestions ? questions : []
    });
    
    const newBooth = await booth.save();
    res.status(201).json(newBooth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update booth
router.put('/:id', async (req, res) => {
  try {
    const booth = await Booth.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    res.json(booth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete booth (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const booth = await Booth.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    res.json(booth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate QR code for booth
router.get('/:qrCode/qr', async (req, res) => {
  try {
    const booth = await Booth.findOne({ qrCode: req.params.qrCode });
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    
    const qrCodeDataURL = await QRCode.toDataURL(booth.qrCode);
    res.json({ qrCode: qrCodeDataURL, boothId: booth.qrCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 