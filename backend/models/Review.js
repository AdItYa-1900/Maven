const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  from_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  rating_teaching: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  rating_exchange: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  exchange_completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per match per user
reviewSchema.index({ from_user_id: 1, match_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
