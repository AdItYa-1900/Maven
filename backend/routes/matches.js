const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all matches for current user
router.get('/my-matches', authMiddleware, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1_id: req.userId },
        { user2_id: req.userId }
      ]
    })
    .populate('user1_id', 'name email offer_skill want_skill trust_score avatar')
    .populate('user2_id', 'name email offer_skill want_skill trust_score avatar')
    .sort({ createdAt: -1 });

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Error fetching matches' });
  }
});

// Accept a match
router.post('/:matchId/accept', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user is part of the match
    const isUser1 = match.user1_id.toString() === req.userId.toString();
    const isUser2 = match.user2_id.toString() === req.userId.toString();

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update acceptance status
    if (isUser1) {
      match.user1_accepted = true;
    } else {
      match.user2_accepted = true;
    }

    // If both accepted, create classroom
    if (match.user1_accepted && match.user2_accepted) {
      match.status = 'active';

      // Create classroom
      const classroom = new Classroom({
        match_id: match._id,
        video_call_room_id: uuidv4(),
        whiteboard_session_id: uuidv4()
      });

      await classroom.save();
    }

    await match.save();

    const updatedMatch = await Match.findById(match._id)
      .populate('user1_id', 'name email offer_skill want_skill trust_score avatar')
      .populate('user2_id', 'name email offer_skill want_skill trust_score avatar');

    res.json({
      message: 'Match accepted',
      match: updatedMatch
    });
  } catch (error) {
    console.error('Error accepting match:', error);
    res.status(500).json({ error: 'Error accepting match' });
  }
});

// Decline a match
router.post('/:matchId/decline', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user is part of the match
    const isUser1 = match.user1_id.toString() === req.userId.toString();
    const isUser2 = match.user2_id.toString() === req.userId.toString();

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    match.status = 'cancelled';
    await match.save();

    res.json({ message: 'Match declined' });
  } catch (error) {
    console.error('Error declining match:', error);
    res.status(500).json({ error: 'Error declining match' });
  }
});

// Get match details
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('user1_id', 'name email offer_skill want_skill trust_score avatar')
      .populate('user2_id', 'name email offer_skill want_skill trust_score avatar');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching match details' });
  }
});

module.exports = router;
