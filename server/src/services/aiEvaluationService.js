const {
  evaluateCareerMock,
} = require('./mockAiService');
const {
  evaluateCareerWithGemini,
} = require('./geminiEvaluationService');

async function evaluateCareer(input) {
  const provider = getProvider();
  const strict = isStrictAi();

  console.log('[AI:EVALUATION] Start', {
    provider,
    strict,
    model: process.env.GEMINI_MODEL || null,
    hasGeminiKey: hasGeminiKey(),
  });

  if (provider === 'gemini') {
    try {
      const result = await evaluateCareerWithGemini(input);

      console.log('[AI:EVALUATION] Gemini success');

      return result;
    } catch (error) {
      console.error('[AI:EVALUATION] Gemini failed:', safeError(error));

      if (strict) {
        throw createAiUnavailableError(error);
      }

      console.warn('[AI:EVALUATION] Falling back to mock analysis.');
    }
  }

  console.warn('[AI:EVALUATION] Using mock analysis.');
  return evaluateCareerMock(input);
}

function getProvider() {
  const provider = String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase();

  if (provider === 'gemini' && hasGeminiKey()) {
    return 'gemini';
  }

  return 'mock';
}

function hasGeminiKey() {
  return Boolean(String(process.env.GEMINI_API_KEY || '').trim());
}

function isStrictAi() {
  return String(process.env.AI_STRICT || 'false').trim().toLowerCase() === 'true';
}

function createAiUnavailableError(error) {
  const nextError = new Error(
    'Gemini đang lỗi hoặc chưa kết nối được. Hệ thống đã chặn fallback mock để kiểm tra AI thật.',
  );

  nextError.statusCode = 503;
  nextError.code = 'GEMINI_UNAVAILABLE';
  nextError.cause = error;

  return nextError;
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