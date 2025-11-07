const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { findMatchesByUserId, findMatchById, updateMatch, createClassroom } = require('../utils/supabaseHelpers');
const supabase = require('../config/supabase');

// Get all matches for current user
router.get('/my-matches', authMiddleware, async (req, res) => {
  try {
    const { data: matches, error } = await findMatchesByUserId(req.userId);
    
    if (error) throw error;

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Error fetching matches' });
  }
});

// Accept a match
router.post('/:matchId/accept', authMiddleware, async (req, res) => {
  try {
    const { data: match, error: matchError } = await findMatchById(req.params.matchId);

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user is part of the match
    const isUser1 = match.user1_id === req.userId;
    const isUser2 = match.user2_id === req.userId;

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update acceptance status
    const updates = {};
    if (isUser1) {
      updates.user1_accepted = true;
    } else {
      updates.user2_accepted = true;
    }

    // If both accepted, create classroom
    const user1Accepted = isUser1 ? true : match.user1_accepted;
    const user2Accepted = isUser2 ? true : match.user2_accepted;
    
    if (user1Accepted && user2Accepted) {
      updates.status = 'active';

      // Create classroom
      await createClassroom({
        match_id: match.id,
        video_call_room_id: uuidv4(),
        whiteboard_session_id: uuidv4()
      });
    }

    const { data: updatedMatch, error: updateError } = await updateMatch(req.params.matchId, updates);
    if (updateError) throw updateError;

    // Fetch full match with user details
    const { data: fullMatch } = await findMatchById(req.params.matchId);

    res.json({
      message: 'Match accepted',
      match: fullMatch
    });
  } catch (error) {
    console.error('Error accepting match:', error);
    res.status(500).json({ error: 'Error accepting match' });
  }
});

// Decline a match
router.post('/:matchId/decline', authMiddleware, async (req, res) => {
  try {
    const { data: match, error: matchError } = await findMatchById(req.params.matchId);

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user is part of the match
    const isUser1 = match.user1_id === req.userId;
    const isUser2 = match.user2_id === req.userId;

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await updateMatch(req.params.matchId, { status: 'cancelled' });

    res.json({ message: 'Match declined' });
  } catch (error) {
    console.error('Error declining match:', error);
    res.status(500).json({ error: 'Error declining match' });
  }
});

// Get match details
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { data: match, error } = await findMatchById(req.params.matchId);

    if (error || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching match details' });
  }
});

module.exports = router;
