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
      console.error('Match not found:', matchError);
      return res.status(404).json({ error: 'Match not found' });
    }

    console.log('Accept match - User ID:', req.userId);
    console.log('Match user1_id:', match.user1_id, 'user2_id:', match.user2_id);

    // Check if user is part of the match
    const isUser1 = match.user1_id === req.userId;
    const isUser2 = match.user2_id === req.userId;

    if (!isUser1 && !isUser2) {
      console.error('Authorization failed - User not part of match');
      return res.status(403).json({ error: 'Not authorized' });
    }

    console.log('User is:', isUser1 ? 'user1' : 'user2');

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
    res.status(500).json({ error: 'Error accepting match', details: error.message });
  }
});

// Decline a match
router.post('/:matchId/decline', authMiddleware, async (req, res) => {
  try {
    const { data: match, error: matchError } = await findMatchById(req.params.matchId);

    if (matchError || !match) {
      console.error('Match not found:', matchError);
      return res.status(404).json({ error: 'Match not found' });
    }

    console.log('Decline match - User ID:', req.userId);
    console.log('Match user1_id:', match.user1_id, 'user2_id:', match.user2_id);

    // Check if user is part of the match
    const isUser1 = match.user1_id === req.userId;
    const isUser2 = match.user2_id === req.userId;

    if (!isUser1 && !isUser2) {
      console.error('Authorization failed - User not part of match');
      return res.status(403).json({ error: 'Not authorized' });
    }

    await updateMatch(req.params.matchId, { status: 'cancelled' });

    res.json({ message: 'Match declined' });
  } catch (error) {
    console.error('Error declining match:', error);
    res.status(500).json({ error: 'Error declining match', details: error.message });
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
