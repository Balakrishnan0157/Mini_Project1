const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./config/db');
const seedDatabase = require('./config/seed');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Seed initial database records
seedDatabase();

// Mount REST API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/careers', require('./routes/careers.routes'));
app.use('/api/colleges', require('./routes/colleges.routes'));
app.use('/api/assessment', require('./routes/assessment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CareerGuide AI Backend Server is live and healthy',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API Endpoint not found' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CareerGuide AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoints mounted at http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
