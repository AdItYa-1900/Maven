const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Match = require('../models/Match');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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
    const match = await Match.findById(match_id);
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

    // Check if review already exists
    const existingReview = await Review.findOne({
      from_user_id: req.userId,
      match_id: match_id
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Review already submitted for this match' });
    }

    // Create review
    const review = new Review({
      from_user_id: req.userId,
      to_user_id,
      match_id,
      rating_teaching,
      rating_exchange,
      comment,
      exchange_completed
    });

    await review.save();

    // Update recipient's trust score
    const allReviews = await Review.find({ to_user_id });
    const avgTeaching = allReviews.reduce((sum, r) => sum + r.rating_teaching, 0) / allReviews.length;
    const avgExchange = allReviews.reduce((sum, r) => sum + r.rating_exchange, 0) / allReviews.length;
    const trustScore = (avgTeaching + avgExchange) / 2;

    await User.findByIdAndUpdate(to_user_id, {
      trust_score: parseFloat(trustScore.toFixed(2)),
      total_reviews: allReviews.length
    });

    // Check if both users submitted reviews and both marked as completed
    const partnerReview = await Review.findOne({
      from_user_id: to_user_id,
      to_user_id: req.userId,
      match_id: match_id
    });

    if (partnerReview && exchange_completed && partnerReview.exchange_completed) {
      match.status = 'completed';
      await match.save();
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
    const reviews = await Review.find({ to_user_id: req.params.userId })
      .populate('from_user_id', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Check if user has submitted review for a match
router.get('/check/:matchId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({
      from_user_id: req.userId,
      match_id: req.params.matchId
    });

    res.json({ hasReviewed: !!review });
  } catch (error) {
    res.status(500).json({ error: 'Error checking review status' });
  }
});

module.exports = router;
