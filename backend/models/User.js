const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google login
    }
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  offer_skill: {
    type: String,
    trim: true
  },
  offer_level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  want_skill: {
    type: String,
    trim: true
  },
  want_level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  trust_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  profile_completed: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if profile is complete
userSchema.methods.checkProfileComplete = function() {
  this.profile_completed = !!(this.offer_skill && this.want_skill);
  return this.profile_completed;
};

module.exports = mongoose.model('User', userSchema);
