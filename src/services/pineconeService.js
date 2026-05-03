const { Pinecone } = require('@pinecone-database/pinecone');

class PineconeService {
  constructor() {
    this.client = null;
    this.index = null;
    this.init();
  }

  async init() {
    try {
      if (!process.env.VECTOR_DB_API || process.env.VECTOR_DB_API === 'your_pinecone_api_key') {
        console.warn('⚠️ VECTOR_DB_API is not set. Pinecone client not initialized.');
        return;
      }

      this.client = new Pinecone({
        apiKey: process.env.VECTOR_DB_API,
      });

      const indexName = process.env.PINECONE_INDEX || 'hr-index';
      this.index = this.client.index(indexName);
      
      console.log('✅ Pinecone client initialized successfully');
    } catch (error) {
      console.error('❌ Pinecone initialization error:', error);
    }
  }

  async queryDocuments(queryVector, topK = 5) {
    if (!this.index) {
      throw new Error('Pinecone index is not initialized');
    }
    
    // Example query
    const queryResponse = await this.index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
    });
    
    return queryResponse;
  }
}

module.exports = new PineconeService();
