const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { runMatchingEngine } = require('../services/matchingEngine');

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Update user profile (Offer & Want)
router.put('/profile', authMiddleware, [
  body('offer_skill').trim().notEmpty().withMessage('Offer skill is required'),
  body('want_skill').trim().notEmpty().withMessage('Want skill is required'),
  body('offer_level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('want_level').optional().isIn(['Beginner', 'Intermediate', 'Advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { offer_skill, offer_level, want_skill, want_level, timezone, name } = req.body;

    const user = await User.findById(req.userId);
    
    if (offer_skill) user.offer_skill = offer_skill;
    if (offer_level) user.offer_level = offer_level;
    if (want_skill) user.want_skill = want_skill;
    if (want_level) user.want_level = want_level;
    if (timezone) user.timezone = timezone;
    if (name) user.name = name;

    user.checkProfileComplete();
    await user.save();

    // Trigger matching engine when profile is updated
    if (user.profile_completed) {
      await runMatchingEngine(user._id);
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        offer_skill: user.offer_skill,
        offer_level: user.offer_level,
        want_skill: user.want_skill,
        want_level: user.want_level,
        timezone: user.timezone,
        profile_completed: user.profile_completed,
        trust_score: user.trust_score
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Get user by ID (for viewing match partner profile)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

module.exports = router;
