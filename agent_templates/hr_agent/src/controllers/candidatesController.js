const screeningService = require('../services/screeningService');
const pineconeService = require('../services/pineconeService');
const Candidate = require('../models/Candidate');

exports.screenCandidate = async (req, res) => {
  try {
    const { candidateName, resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'resumeText and jobDescription are required.' });
    }

    console.log(`Screening candidate: ${candidateName || 'Unknown'}`);

    // RAG: Fetch relevant context from Pinecone
    let context = [];
    try {
      console.log('RAG: Querying Pinecone for historical context...');
      context = await pineconeService.queryDocuments(jobDescription);
    } catch (e) {
      console.warn('Pinecone context retrieval failed, proceeding with direct LLM screening.');
    }

    const rankingResult = await screeningService.rankCandidate(resumeText, jobDescription, context);

    // Save to MongoDB
    const candidate = new Candidate({
      name: candidateName || 'Unknown',
      resumeText: resumeText,
      score: rankingResult.score,
      reasoning: rankingResult.reasoning
    });
    await candidate.save();

    res.status(200).json({
      success: true,
      data: {
        candidateName: candidate.name,
        id: candidate._id,
        ...rankingResult
      }
    });

  } catch (error) {
    console.error('Error in screenCandidate:', error);
    res.status(500).json({ error: 'Internal server error during candidate screening.' });
  }
};

exports.getRankings = async (req, res) => {
  try {
    const rankings = await Candidate.find().sort({ score: -1 }).limit(10);
    res.status(200).json({
      success: true,
      data: rankings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
};
