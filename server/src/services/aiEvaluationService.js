const {
  evaluateCareerMock,
} = require('./mockAiService');
const {
  evaluateCareerWithGemini,
} = require('./geminiEvaluationService');

async function evaluateCareer(input) {
  const provider = String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase();

  if (provider === 'gemini' && String(process.env.GEMINI_API_KEY || '').trim()) {
    try {
      console.log('[AI:EVALUATION] Provider: gemini');
      return await evaluateCareerWithGemini(input);
    } catch (error) {
      console.error('[AI:EVALUATION] Gemini failed:', safeError(error));
      console.warn('[AI:EVALUATION] Falling back to mock analysis.');
    }
  }

  console.log('[AI:EVALUATION] Provider: mock');
  return evaluateCareerMock(input);
}

function safeError(error) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error || 'Unknown error');
}

module.exports = {
  evaluateCareer,
};
