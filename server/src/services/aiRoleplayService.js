const {
  createRoleplayIntroMock,
  createRoleplayTurnMock,
} = require('./mockRoleplayService');
const {
  createRoleplayIntroWithGemini,
  createRoleplayTurnWithGemini,
} = require('./geminiRoleplayService');

async function createRoleplayIntro(input) {
  if (shouldUseGemini()) {
    try {
      return await createRoleplayIntroWithGemini(input);
    } catch (error) {
      console.error('[ROLEPLAY:GEMINI] Intro failed:', safeError(error));
      console.warn('[ROLEPLAY] Falling back to mock intro.');
    }
  }

  return createRoleplayIntroMock(input);
}

async function createRoleplayTurn(input) {
  if (shouldUseGemini()) {
    try {
      return await createRoleplayTurnWithGemini(input);
    } catch (error) {
      console.error('[ROLEPLAY:GEMINI] Turn failed:', safeError(error));
      console.warn('[ROLEPLAY] Falling back to mock turn.');
    }
  }

  return createRoleplayTurnMock(input);
}

function shouldUseGemini() {
  return (
    String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase() === 'gemini' &&
    Boolean(String(process.env.GEMINI_API_KEY || '').trim())
  );
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
