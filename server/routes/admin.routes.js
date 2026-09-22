const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// GET /api/admin/stats
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.getCollection('users');
    const studentsCount = users.filter(u => u.role === 'student').length;
    const assessmentsCount = db.getCollection('assessments').length;
    const careersCount = db.getCollection('careers').length;
    const collegesCount = db.getCollection('colleges').length;

    return res.json({
      success: true,
      stats: {
        totalStudents: studentsCount,
        totalAssessments: assessmentsCount,
        totalCareers: careersCount,
        totalColleges: collegesCount
      }
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/students
router.get('/students', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.getCollection('users');
    const students = users
      .filter(u => u.role === 'student')
      .map(u => {
        const { password_hash, ...rest } = u;
        const studentAssessments = db.find('assessments', a => a.user_id === u.id);
        return {
          ...rest,
          totalAssessments: studentAssessments.length,
          lastAssessment: studentAssessments.length > 0 ? studentAssessments[studentAssessments.length - 1].top_career : 'Not Taken'
        };
      });

    return res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('Fetch admin students error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch students list' });
  }
});

module.exports = router;
