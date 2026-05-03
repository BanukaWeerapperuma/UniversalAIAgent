const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require("@google/generative-ai");

class PineconeService {
  constructor() {
    this.client = null;
    this.index = null;
    this.genAI = null;
    this.init();
  }

  async init() {
    try {
      if (process.env.GOOGLE_API_KEY) {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      }

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
      console.error('❌ Pinecone initialization error:', error.message);
    }
  }

  async _getEmbedding(text) {
    const embeddingModels = ["gemini-embedding-2", "gemini-embedding-001", "embedding-001"];
    let embedding = null;

    for (const modelName of embeddingModels) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        // Requesting 1536 dimensions to match the 'codevector' index
        const result = await model.embedContent({
          content: { parts: [{ text }] },
          outputDimensionality: 1536
        });
        embedding = result.embedding.values;
        
        // Final safety check: Slice to 1536 to prevent dimension mismatch errors
        if (embedding && embedding.length > 1536) {
          console.warn(`Vector dimension ${embedding.length} too large, slicing to 1536.`);
          embedding = embedding.slice(0, 1536);
        }

        if (embedding) return embedding;
      } catch (err) {
        console.warn(`⚠️ Embedding model ${modelName} failed, trying next...`);
      }
    }
    throw new Error('All available Gemini embedding models failed.');
  }

  async upsertDocument(id, text, metadata = {}) {
    if (!this.index || !this.genAI) {
      throw new Error('Pinecone index or Gemini AI not initialized');
    }

    try {
      const embedding = await this._getEmbedding(text);

      await this.index.upsert([{
        id: id,
        values: embedding,
        metadata: { ...metadata, text: text }
      }]);

      console.log(`✅ Document ${id} successfully ingested into Pinecone`);
      return true;
    } catch (error) {
      console.error('❌ Error ingesting document into Pinecone:', error.message);
      throw error;
    }
  }

  async queryDocuments(queryText, topK = 5) {
    if (!this.index || !this.genAI) {
      console.warn('Pinecone or Gemini not initialized, skipping vector search.');
      return [];
    }
    
    try {
      const embedding = await this._getEmbedding(queryText);

      const queryResponse = await this.index.query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
      });
      
      return queryResponse.matches || [];
    } catch (error) {
      console.error('❌ Error querying Pinecone:', error.message);
      return [];
    }
  }
}

module.exports = new PineconeService();
