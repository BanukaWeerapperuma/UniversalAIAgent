require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkDimensions() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-embedding-2", "gemini-embedding-001"];

  for (const modelName of models) {
    try {
      console.log(`Checking dimension for: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent("test");
      console.log(`✅ ${modelName} dimension: ${result.embedding.values.length}`);
    } catch (error) {
      console.error(`❌ ${modelName} failed:`, error.message);
    }
  }
}

checkDimensions();
