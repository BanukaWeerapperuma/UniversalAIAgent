require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  console.log("Starting Gemini Test...");
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY is missing in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-pro"];

  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, are you working?");
      const response = await result.response;
      console.log(`✅ ${modelName} responded: ${response.text()}`);
      return;
    } catch (error) {
      console.error(`❌ ${modelName} failed:`, error.message);
    }
  }
}

testGemini();
