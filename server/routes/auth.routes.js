const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth.middleware');

// Helper to sanitize user object
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, educationLevel, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const newUser = db.insert('users', {
      name,
      email: email.toLowerCase(),
      password_hash,
      role: 'student',
      phone: phone || '',
      education_level: educationLevel || '12th',
      city: city || '',
      marks_10th: 85,
      marks_12th: 82,
      stream: 'General'
    });

    const userPayload = sanitizeUser(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userPayload = sanitizeUser(user);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.findOne('users', u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Auth /me error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { marks10th, marks12th, stream, city, phone } = req.body;

    const updated = db.update('users', u => u.id === req.user.id, {
      marks_10th: parseFloat(marks10th) || 0,
      marks_12th: parseFloat(marks12th) || 0,
      ...(stream && { stream }),
      ...(city && { city }),
      ...(phone && { phone })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User profile update failed' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

module.exports = router;
