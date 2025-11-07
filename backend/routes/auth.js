const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { findUserByEmail, createUser, comparePassword } = require('../utils/supabaseHelpers');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const { data: existingUser } = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const { data: user, error } = await createUser({
      name,
      email,
      password
    });

    if (error) {
      throw error;
    }

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_completed: user.profile_completed
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const { data: user, error } = await findUserByEmail(email);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        offer_skill: user.offer_skill,
        want_skill: user.want_skill,
        profile_completed: user.profile_completed,
        trust_score: user.trust_score
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Google OAuth (placeholder - requires passport setup)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
const supabase = require('../config/supabase');
const { updateUser } = require('../utils/supabaseHelpers');

    // Find by google_id
    let { data: user } = await supabase.from('users').select('*').eq('google_id', googleId).single();
    
    if (!user) {
      // Find by email
      const { data: emailUser } = await findUserByEmail(email);
      
      if (emailUser) {
        // Update existing user with google_id
        const { data: updated } = await updateUser(emailUser.id, { google_id: googleId, avatar: avatar || emailUser.avatar });
        user = updated;
      } else {
        // Create new user
        const { data: newUser } = await createUser({
          google_id: googleId,
          email,
          name,
          avatar: avatar || ''
        });
        user = newUser;
      }
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        offer_skill: user.offer_skill,
        want_skill: user.want_skill,
        profile_completed: user.profile_completed,
        trust_score: user.trust_score
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

module.exports = router;
