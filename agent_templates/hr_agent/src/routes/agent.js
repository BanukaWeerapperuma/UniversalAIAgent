const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// POST /agent/workflow
// Trigger an HR workflow (e.g., hiring)
router.post('/workflow', agentController.runWorkflow);

module.exports = router;
