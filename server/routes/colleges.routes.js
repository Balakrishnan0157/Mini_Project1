const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /api/colleges
router.get('/', (req, res) => {
  try {
    const { city, state, type, search } = req.query;
    let list = db.getCollection('colleges');

    if (city) {
      list = list.filter(c => c.city.toLowerCase() === city.toLowerCase());
    }

    if (state) {
      list = list.filter(c => c.state.toLowerCase() === state.toLowerCase());
    }

    if (type) {
      list = list.filter(c => c.type.toLowerCase() === type.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: list.length, colleges: list });
  } catch (err) {
    console.error('Fetch colleges error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch colleges' });
  }
});

// POST /api/colleges (Admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, city, state, type, courses, fees, rating, website } = req.body;

    if (!name || !city || !state || !type) {
      return res.status(400).json({ success: false, message: 'Name, city, state, and type are required' });
    }

    const newCollege = db.insert('colleges', {
      name,
      city,
      state,
      type,
      courses: Array.isArray(courses) ? courses : [courses],
      fees: fees || 'Variable',
      rating: parseFloat(rating) || 4.5,
      website: website || '#'
    });

    return res.status(201).json({ success: true, message: 'College added successfully', college: newCollege });
  } catch (err) {
    console.error('Add college error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add college' });
  }
});

// DELETE /api/colleges/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const deleted = db.delete('colleges', c => String(c.id) === String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'College not found for deletion' });
    }
    return res.json({ success: true, message: 'College removed successfully' });
  } catch (err) {
    console.error('Delete college error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete college' });
  }
});

module.exports = router;
