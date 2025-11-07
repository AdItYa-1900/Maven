const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const Match = require('../models/Match');
const authMiddleware = require('../middleware/auth');

// Get classroom for a match
router.get('/match/:matchId', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify user is part of the match
    const isParticipant = 
      match.user1_id.toString() === req.userId.toString() || 
      match.user2_id.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const classroom = await Classroom.findOne({ match_id: req.params.matchId })
      .populate({
        path: 'match_id',
        populate: [
          { path: 'user1_id', select: 'name email avatar' },
          { path: 'user2_id', select: 'name email avatar' }
        ]
      });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found. Both users must accept the match first.' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ error: 'Error fetching classroom' });
  }
});

// Start session
router.post('/:classroomId/start', authMiddleware, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classroomId);

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    classroom.is_active = true;
    if (!classroom.session_started) {
      classroom.session_started = new Date();
    }
    await classroom.save();

    res.json({ message: 'Session started', classroom });
  } catch (error) {
    res.status(500).json({ error: 'Error starting session' });
  }
});

// End session
router.post('/:classroomId/end', authMiddleware, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classroomId);

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    classroom.is_active = false;
    classroom.session_ended = new Date();
    await classroom.save();

    res.json({ message: 'Session ended', classroom });
  } catch (error) {
    res.status(500).json({ error: 'Error ending session' });
  }
});

// Get chat history
router.get('/:classroomId/chat', authMiddleware, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classroomId)
      .populate('chat_history.sender_id', 'name avatar');

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json(classroom.chat_history);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Save whiteboard data
router.post('/:classroomId/whiteboard', authMiddleware, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classroomId);

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    classroom.whiteboard_data = req.body.data;
    await classroom.save();

    res.json({ message: 'Whiteboard saved' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving whiteboard' });
  }
});

module.exports = router;
