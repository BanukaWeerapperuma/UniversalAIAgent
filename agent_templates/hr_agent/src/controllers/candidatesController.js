const screeningService = require('../services/screeningService');
const pineconeService = require('../services/pineconeService');

exports.screenCandidate = async (req, res) => {
  try {
    const { candidateName, resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'resumeText and jobDescription are required.' });
    }

    console.log(`Screening candidate: ${candidateName || 'Unknown'}`);

    // RAG: Fetch relevant context from Pinecone (simulated with dummy vector for now)
    let context = [];
    try {
      console.log('RAG: Querying Pinecone for historical context...');
      context = await pineconeService.queryDocuments(jobDescription);
    } catch (e) {
      console.warn('Pinecone context retrieval failed, proceeding with direct LLM screening.');
    }

    const rankingResult = await screeningService.rankCandidate(resumeText, jobDescription, context);

    res.status(200).json({
      success: true,
      data: {
        candidateName,
        ...rankingResult
      }
    });

  } catch (error) {
    console.error('Error in screenCandidate:', error);
    res.status(500).json({ error: 'Internal server error during candidate screening.' });
  }
};

exports.getRankings = async (req, res) => {
  // Dummy data representing candidates that would normally be fetched from MongoDB
  const mockRankings = [
    { candidateName: 'John Doe', score: 85, reasoning: 'Strong technical skills, matches 90% of requirements.' },
    { candidateName: 'Jane Smith', score: 72, reasoning: 'Good background but lacks direct experience in Pinecone.' }
  ];

  res.status(200).json({
    success: true,
    data: mockRankings
  });
};
