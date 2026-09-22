const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');

// POST /api/assessment/submit
router.post('/submit', authenticateToken, (req, res) => {
  try {
    const { category, answers } = req.body;
    const user = db.findOne('users', u => u.id === req.user.id);
    const careers = db.getCollection('careers');

    if (careers.length === 0) {
      return res.status(500).json({ success: false, message: 'No careers found in database' });
    }

    const selectedCategory = category || "Computer Science & IT";
    const student10th = user?.marks_10th || 80;
    const student12th = user?.marks_12th || 80;

    // Calculate match scores for all careers
    const matches = careers.map(c => {
      let score = 70; // baseline

      // Category alignment (+20 points)
      if (c.category.toLowerCase() === selectedCategory.toLowerCase()) {
        score += 20;
      }

      // Academic performance bonus (+5 to +10 points)
      const avgMarks = (student10th + student12th) / 2;
      if (avgMarks >= 85) score += 8;
      else if (avgMarks >= 70) score += 5;

      // Random factor fine-tuning based on popularity
      score += Math.min(c.popularity_score ? Math.round(c.popularity_score * 0.05) : 2, 5);

      // Cap at 98% maximum score
      const finalMatchScore = Math.min(score, 98);

      return {
        careerId: c.id,
        title: c.title,
        category: c.category,
        matchScore: finalMatchScore,
        overview: c.overview,
        fresherSalary: c.salary_fresher,
        courseDuration: c.course_duration
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);
    const topMatch = matches[0];

    // Save assessment result to DB
    const savedAssessment = db.insert('assessments', {
      user_id: req.user.id,
      selected_category: selectedCategory,
      top_career: topMatch.title,
      match_score: topMatch.matchScore,
      responses_json: JSON.stringify(answers || {}),
      breakdown_json: JSON.stringify({
        topCareer: topMatch.title,
        topScore: topMatch.matchScore,
        category: selectedCategory,
        allMatches: matches.slice(0, 6)
      })
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment evaluated and persisted successfully',
      result: {
        id: savedAssessment.id,
        topCareer: topMatch.title,
        matchScore: topMatch.matchScore,
        category: selectedCategory,
        matches: matches.slice(0, 6)
      }
    });
  } catch (err) {
    console.error('Assessment evaluation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process assessment' });
  }
});

// GET /api/assessment/latest
router.get('/latest', authenticateToken, (req, res) => {
  try {
    const assessments = db.find('assessments', a => a.user_id === req.user.id);
    if (assessments.length === 0) {
      return res.json({ success: true, assessment: null });
    }

    // Return the latest assessment
    const latest = assessments[assessments.length - 1];
    let breakdown = {};
    try {
      breakdown = JSON.parse(latest.breakdown_json || '{}');
    } catch (e) {}

    return res.json({
      success: true,
      assessment: {
        ...latest,
        breakdown
      }
    });
  } catch (err) {
    console.error('Fetch latest assessment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch assessment history' });
  }
});

// GET /api/assessment/history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const assessments = db.find('assessments', a => a.user_id === req.user.id);
    return res.json({ success: true, count: assessments.length, assessments });
  } catch (err) {
    console.error('Fetch assessment history error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch assessment history' });
  }
});

module.exports = router;
