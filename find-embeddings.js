require('dotenv').config();
const fetch = require('node-fetch');

async function findEmbeddings() {
  const apiKey = process.env.GOOGLE_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const embedModels = data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
    console.log("Embedding Models:", JSON.stringify(embedModels, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

findEmbeddings();
