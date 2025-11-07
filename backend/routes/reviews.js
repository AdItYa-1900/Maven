const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { findMatchById, createReview, findReviewsByUserId, updateUserTrustScore, updateMatch } = require('../utils/supabaseHelpers');
const supabase = require('../config/supabase');

// Submit review for a match
router.post('/', authMiddleware, [
  body('match_id').notEmpty(),
  body('to_user_id').notEmpty(),
  body('rating_teaching').isInt({ min: 1, max: 5 }),
  body('rating_exchange').isInt({ min: 1, max: 5 }),
  body('exchange_completed').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { match_id, to_user_id, rating_teaching, rating_exchange, comment, exchange_completed } = req.body;

    // Check if match exists
    const { data: match, error: matchError } = await findMatchById(match_id);
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

    // Check if review already exists
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('from_user_id', req.userId)
      .eq('match_id', match_id);

    if (existingReviews && existingReviews.length > 0) {
      return res.status(400).json({ error: 'Review already submitted for this match' });
    }

    // Create review
    const { data: review, error: reviewError } = await createReview({
      from_user_id: req.userId,
      to_user_id,
      match_id,
      rating_teaching,
      rating_exchange,
      comment,
      exchange_completed
    });

    if (reviewError) throw reviewError;

    // Update recipient's trust score
    await updateUserTrustScore(to_user_id);

    // Check if both users submitted reviews and both marked as completed
    const { data: partnerReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('from_user_id', to_user_id)
      .eq('to_user_id', req.userId)
      .eq('match_id', match_id);

    const partnerReview = partnerReviews && partnerReviews[0];

    if (partnerReview && exchange_completed && partnerReview.exchange_completed) {
      await updateMatch(match_id, { status: 'completed' });
    }

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Error submitting review' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { data: reviews, error } = await findReviewsByUserId(req.params.userId);
    if (error) throw error;

    res.json(reviews || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Check if user has submitted review for a match
router.get('/check/:matchId', authMiddleware, async (req, res) => {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('from_user_id', req.userId)
      .eq('match_id', req.params.matchId);

    res.json({ hasReviewed: !!(reviews && reviews.length > 0) });
  } catch (error) {
    res.status(500).json({ error: 'Error checking review status' });
  }
});

module.exports = router;
