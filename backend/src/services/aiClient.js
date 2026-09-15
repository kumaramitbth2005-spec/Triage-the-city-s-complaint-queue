const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Call the Python FastAPI AI service to analyze a complaint.
 * Returns null if the AI service is unavailable.
 */
async function analyzeComplaint(text, language = 'English', location = null) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      text,
      language,
      location: location || null,
      metadata: {}
    }, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.warn('AI Service unavailable:', error.message);
    return null;
  }
}

module.exports = { analyzeComplaint };
