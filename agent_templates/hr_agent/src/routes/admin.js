const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST /api/admin/ingest - Ingest text data into Pinecone Knowledge Base
router.post('/ingest', adminController.ingestData);

module.exports = router;
