const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'career_guidance_secret_key_2026';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token is invalid or expired' });
    }
    req.user = user;
    next();
  });
}

// Middleware to authorize admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required for this action' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
