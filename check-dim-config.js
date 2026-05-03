require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkConfigurableDimensions() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-embedding-2"];

  for (const modelName of models) {
    try {
      console.log(`Checking 1536 dimensionality for: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent({
        content: { parts: [{ text: "test" }] },
        outputDimensionality: 1536
      });
      console.log(`✅ ${modelName} with 1536 dimensionality: ${result.embedding.values.length}`);
    } catch (error) {
      console.error(`❌ ${modelName} dimensionality request failed:`, error.message);
    }
  }
}

checkConfigurableDimensions();
