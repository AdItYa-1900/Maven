const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  user1_accepted: {
    type: Boolean,
    default: false
  },
  user2_accepted: {
    type: Boolean,
    default: false
  },
  skill_match: {
    user1_teaches: String,
    user1_learns: String,
    user2_teaches: String,
    user2_learns: String
  },
  match_score: {
    type: Number,
    default: 0
  },
  scheduled_time: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
matchSchema.index({ user1_id: 1, user2_id: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
