const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /api/careers
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let list = db.getCollection('careers');

    if (category) {
      list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.overview.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    return res.json({ success: true, count: list.length, careers: list });
  } catch (err) {
    console.error('Fetch careers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch careers' });
  }
});

// GET /api/careers/:id
router.get('/:id', (req, res) => {
  try {
    const career = db.findOne('careers', c => String(c.id) === String(req.params.id) || c.slug === req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career profile not found' });
    }
    return res.json({ success: true, career });
  } catch (err) {
    console.error('Fetch single career error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch career' });
  }
});

// POST /api/careers (Admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, slug, category, overview, required_education, eligibility, course_duration, entrance_exams, important_skills, favourite_subjects, career_opportunities, salary_fresher, salary_experienced, future_scope } = req.body;

    if (!title || !category || !overview) {
      return res.status(400).json({ success: false, message: 'Title, category, and overview are required' });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCareer = db.insert('careers', {
      slug: generatedSlug,
      title,
      category,
      overview,
      required_education: required_education || '12th Standard',
      eligibility: eligibility || 'Pass 10+2',
      course_duration: course_duration || '3-4 Years',
      entrance_exams: Array.isArray(entrance_exams) ? entrance_exams : [],
      important_skills: Array.isArray(important_skills) ? important_skills : [],
      favourite_subjects: Array.isArray(favourite_subjects) ? favourite_subjects : [],
      career_opportunities: Array.isArray(career_opportunities) ? career_opportunities : [],
      salary_fresher: salary_fresher || '₹4 - ₹8 LPA',
      salary_experienced: salary_experienced || '₹12 - ₹25 LPA',
      future_scope: future_scope || 'Promising growth in digital era.',
      popularity_score: 90
    });

    return res.status(201).json({ success: true, message: 'Career added successfully', career: newCareer });
  } catch (err) {
    console.error('Create career error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create career profile' });
  }
});

// PUT /api/careers/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const updated = db.update('careers', c => String(c.id) === String(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Career not found for update' });
    }
    return res.json({ success: true, message: 'Career updated successfully', career: updated });
  } catch (err) {
    console.error('Update career error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update career' });
  }
});

// DELETE /api/careers/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const deleted = db.delete('careers', c => String(c.id) === String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Career not found for deletion' });
    }
    return res.json({ success: true, message: 'Career deleted successfully' });
  } catch (err) {
    console.error('Delete career error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete career' });
  }
});

module.exports = router;
