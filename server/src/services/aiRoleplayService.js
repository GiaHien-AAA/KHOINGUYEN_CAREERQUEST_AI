const {
  createRoleplayIntroMock,
  createRoleplayTurnMock,
} = require('./mockRoleplayService');
const {
  createRoleplayIntroWithGemini,
  createRoleplayTurnWithGemini,
} = require('./geminiRoleplayService');

async function createRoleplayIntro(input) {
  const provider = getProvider();
  const strict = isStrictAi();

  console.log('[ROLEPLAY:INTRO] Start', {
    provider,
    strict,
    model: process.env.GEMINI_MODEL || null,
    hasGeminiKey: hasGeminiKey(),
    stageId: input.stageId,
  });

  if (provider === 'gemini') {
    try {
      const result = await createRoleplayIntroWithGemini(input);
      console.log('[ROLEPLAY:INTRO] Gemini success', { stageId: input.stageId });
      return { ...result, source: 'gemini' };
    } catch (error) {
      console.error('[ROLEPLAY:GEMINI] Intro failed:', safeError(error));
      if (strict) throw createAiUnavailableError(error);
      console.warn('[ROLEPLAY] Falling back to mock intro.');
    }
  }

  console.warn('[ROLEPLAY:INTRO] Using mock intro.');
  return createRoleplayIntroMock(input);
}

async function createRoleplayTurn(input) {
  const provider = getProvider();
  const strict = isStrictAi();

  console.log('[ROLEPLAY:TURN] Start', {
    provider,
    strict,
    model: process.env.GEMINI_MODEL || null,
    hasGeminiKey: hasGeminiKey(),
    stageId: input.stageId,
    eventType: input.eventType,
    turnNumber: input.turnNumber,
  });

  if (provider === 'gemini') {
    try {
      const result = await createRoleplayTurnWithGemini(input);
      console.log('[ROLEPLAY:TURN] Gemini success', {
        stageId: input.stageId,
        shouldContinue: result.shouldContinue,
        stageComplete: result.stageComplete,
      });
      return { ...result, source: 'gemini' };
    } catch (error) {
      console.error('[ROLEPLAY:GEMINI] Turn failed:', safeError(error));
      if (strict) throw createAiUnavailableError(error);
      console.warn('[ROLEPLAY] Falling back to mock turn.');
    }
  }

  console.warn('[ROLEPLAY:TURN] Using mock turn.');
  return createRoleplayTurnMock(input);
}

function getProvider() {
  const provider = String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase();
  if (provider === 'gemini' && hasGeminiKey()) return 'gemini';
  return 'mock';
}

function hasGeminiKey() {
  return Boolean(String(process.env.GEMINI_API_KEY || '').trim());
}

function isStrictAi() {
  return String(process.env.AI_STRICT || 'false').trim().toLowerCase() === 'true';
}

function createAiUnavailableError(error) {
  const nextError = new Error('Gemini đang lỗi hoặc chưa kết nối được. Hệ thống đã chặn fallback mock để kiểm tra AI thật.');
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
  createRoleplayIntro,
  createRoleplayTurn,
};
