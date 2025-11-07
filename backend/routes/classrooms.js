const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { findMatchById, findClassroomByMatchId, updateClassroom } = require('../utils/supabaseHelpers');
const supabase = require('../config/supabase');

// Get classroom for a match
router.get('/match/:matchId', authMiddleware, async (req, res) => {
  try {
    const { data: match, error: matchError } = await findMatchById(req.params.matchId);

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify user is part of the match
    const isParticipant = 
      match.user1_id === req.userId || 
      match.user2_id === req.userId;

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: classroom, error: classroomError } = await findClassroomByMatchId(req.params.matchId);

    if (classroomError || !classroom) {
      return res.status(404).json({ error: 'Classroom not found. Both users must accept the match first.' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ error: 'Error fetching classroom' });
  }
});

// Start session
router.post('/match/:matchId/start', authMiddleware, async (req, res) => {
  try {
    const { data: classroom, error } = await findClassroomByMatchId(req.params.matchId);

    if (error || !classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const updates = { is_active: true };
    if (!classroom.session_started) {
      updates.session_started = new Date().toISOString();
    }
    
    const { data: updated } = await updateClassroom(req.params.matchId, updates);

    res.json({ message: 'Session started', classroom: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error starting session' });
  }
});

// End session
router.post('/match/:matchId/end', authMiddleware, async (req, res) => {
  try {
    const { data: classroom, error } = await findClassroomByMatchId(req.params.matchId);

    if (error || !classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const { data: updated } = await updateClassroom(req.params.matchId, {
      is_active: false,
      session_ended: new Date().toISOString()
    });

    res.json({ message: 'Session ended', classroom: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error ending session' });
  }
});

// Get chat history
router.get('/match/:matchId/chat', authMiddleware, async (req, res) => {
  try {
    const { data: classroom, error } = await findClassroomByMatchId(req.params.matchId);

    if (error || !classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json(classroom.chat_history || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
});

// Save whiteboard data
router.post('/match/:matchId/whiteboard', authMiddleware, async (req, res) => {
  try {
    const { data: classroom, error } = await findClassroomByMatchId(req.params.matchId);

    if (error || !classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    await updateClassroom(req.params.matchId, {
      whiteboard_data: req.body.data
    });

    res.json({ message: 'Whiteboard saved' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving whiteboard' });
  }
});

module.exports = router;
