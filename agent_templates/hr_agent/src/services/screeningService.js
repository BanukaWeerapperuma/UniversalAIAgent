const { GoogleGenerativeAI } = require("@google/generative-ai");

class ScreeningService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.init();
  }

  init() {
    if (process.env.GOOGLE_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      // Using gemini-1.5-flash as the primary model
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('✅ Gemini AI client initialized successfully');
    } else {
      console.warn('⚠️ GOOGLE_API_KEY is missing. Screening service will not work properly.');
    }
  }

  async rankCandidate(resumeText, jobDescription, context = []) {
    if (!this.genAI) {
      throw new Error('Gemini AI client is not initialized');
    }

    const contextText = context.length > 0 
      ? `\nRelevant historical context from Vector DB:\n${context.map(c => c.metadata.text || '').join('\n')}`
      : '';

    const prompt = `
    You are an expert HR AI Agent acting under the BMAD framework.
    Evaluate the following candidate resume against the provided job description and historical hiring context.
    Provide a score from 1 to 100 based on the match, and a brief reasoning.
    Do not consider any discriminatory factors like age, gender, or race.

    ${contextText}

    Job Description:
    ${jobDescription}

    Candidate Resume:
    ${resumeText}

    Return the response strictly as a JSON object:
    {
      "score": <number>,
      "reasoning": "<brief explanation>"
    }
    `;

    // Try multiple models in case of 404 (Aligned with 2026 model availability)
    const modelsToTry = [
      "gemini-flash-latest", 
      "gemini-2.0-flash", 
      "gemini-2.5-flash",
      "gemini-3-flash-preview"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting screening with model: ${modelName}...`);
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean JSON
        text = text.replace(/```json|```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid JSON structure');

        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.warn(`⚠️ Model ${modelName} failed:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }

    console.error('❌ All Gemini models failed during screening.');
    throw lastError || new Error('Failed to screen candidate with all available Gemini models');
  }
}

module.exports = new ScreeningService();
