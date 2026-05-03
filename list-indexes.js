require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function listIndexes() {
  const apiKey = process.env.VECTOR_DB_API;
  if (!apiKey || apiKey === 'your_pinecone_api_key') {
    console.error("❌ Pinecone API key is missing");
    return;
  }

  const pc = new Pinecone({ apiKey });
  
  try {
    const indexes = await pc.listIndexes();
    console.log("Available Pinecone Indexes:", JSON.stringify(indexes, null, 2));
  } catch (error) {
    console.error("Failed to list Pinecone indexes:", error.message);
  }
}

listIndexes();
