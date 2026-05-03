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

  async upsertDocument(id, text, metadata = {}) {
    if (!this.index || !this.genAI) {
      throw new Error('Pinecone index or Gemini AI not initialized');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      await this.index.upsert([{
        id: id,
        values: embedding,
        metadata: { ...metadata, text: text }
      }]);

      console.log(`✅ Document ${id} successfully ingested into Pinecone`);
      return true;
    } catch (error) {
      console.error('❌ Error ingesting document into Pinecone:', error);
      throw error;
    }
  }

  async queryDocuments(queryText, topK = 5) {
    if (!this.index || !this.genAI) {
      console.warn('Pinecone or Gemini not initialized, skipping vector search.');
      return [];
    }
    
    try {
      const embeddingModels = ["gemini-embedding-2", "gemini-embedding-001", "embedding-001"];
      let embedding = null;

      for (const modelName of embeddingModels) {
        try {
          const model = this.genAI.getGenerativeModel({ model: modelName });
          const result = await model.embedContent(queryText);
          embedding = result.embedding.values;
          if (embedding) break;
        } catch (err) {
          console.warn(`⚠️ Embedding model ${modelName} failed, trying next...`);
        }
      }

      if (!embedding) throw new Error('No embedding models available');

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
