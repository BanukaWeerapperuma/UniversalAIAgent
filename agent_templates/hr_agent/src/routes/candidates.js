const express = require('express');
const router = express.Router();
const candidatesController = require('../controllers/candidatesController');
const laborLawCompliance = require('../middleware/laborLawCompliance');

// Apply the labor law compliance middleware to all candidate routes
router.use(laborLawCompliance);

// POST /api/candidates/screen - Screen and rank a new candidate's resume
router.post('/screen', candidatesController.screenCandidate);

// GET /api/candidates/rankings - Retrieve ranked candidate list
router.get('/rankings', candidatesController.getRankings);

module.exports = router;
