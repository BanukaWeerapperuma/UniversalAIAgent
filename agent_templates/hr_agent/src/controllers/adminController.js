const pineconeService = require('../services/pineconeService');
const Candidate = require('../models/Candidate');
const Employee = require('../models/Employee');

exports.getStats = async (req, res) => {
  try {
    const candidateCount = await Candidate.countDocuments();
    const employeeCount = await Employee.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        candidatesRanked: candidateCount,
        activeOnboarding: employeeCount,
        complianceRate: 100
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.ingestData = async (req, res) => {
  try {
    const { id, text, category } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required for ingestion' });
    }

    const docId = id || `doc-${Date.now()}`;
    
    await pineconeService.upsertDocument(docId, text, { category: category || 'General' });

    res.status(200).json({
      success: true,
      message: `Document ${docId} successfully ingested into the knowledge base.`,
      id: docId
    });

  } catch (error) {
    console.error('Error in ingestData:', error);
    res.status(500).json({ error: 'Failed to ingest data into vector database.' });
  }
};
