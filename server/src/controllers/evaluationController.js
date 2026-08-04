const {
  evaluateCareer,
} = require('../services/aiEvaluationService');

async function handleEvaluateCareer(req, res) {
  const startedAt = Date.now();

  try {
    const input = validateEvaluationInput(req.body);

    console.log(
      `[EVALUATION] player="${input.playerProfile.fullName}" | roleplayTurns=${input.roleplayTurns.length} | behaviorEvents=${input.behaviorEvents.length}`,
    );

    const analysis = await evaluateCareer(input);

    return res.status(200).json({
      success: true,
      data: analysis,
      meta: {
        durationMs: Date.now() - startedAt,
        provider: getProvider(),
      },
    });
  } catch (error) {
    const statusCode = Number(error && error.statusCode) || 500;

    if (statusCode >= 500) {
      console.error('[EVALUATION] Error:', error);
    }

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode >= 500
          ? 'Hệ thống chưa thể hoàn thành phân tích. Vui lòng thử lại.'
          : String((error && error.message) || 'Dữ liệu đánh giá không hợp lệ.'),
      error: {
        code: String((error && error.code) || 'EVALUATION_ERROR'),
      },
    });
  }
}

function validateEvaluationInput(body) {
  if (!body || typeof body !== 'object') {
    throw createHttpError(400, 'INVALID_REQUEST_BODY', 'Dữ liệu đánh giá không hợp lệ.');
  }

  const playerProfile = validatePlayerProfile(body.playerProfile);
  const tutorialScore = normalizeNumber(body.tutorialScore, 0, 100, 'tutorialScore');
  const tutorialAttempts = normalizeNumber(body.tutorialAttempts, 0, 100, 'tutorialAttempts');
  const openAnswers = Array.isArray(body.openAnswers) ? body.openAnswers.map(normalizeOpenAnswer) : [];
  const roleplayTurns = Array.isArray(body.roleplayTurns) ? body.roleplayTurns.map(normalizeRoleplayTurn) : [];
  const behaviorEvents = Array.isArray(body.behaviorEvents) ? body.behaviorEvents.map(normalizeBehaviorEvent) : [];

  if (openAnswers.length !== 3) {
    throw createHttpError(422, 'INCOMPLETE_OPEN_ANSWERS', 'Cần đủ 3 open stage để phân tích.');
  }

  return {
    playerProfile,
    tutorialScore,
    tutorialAttempts,
    openAnswers,
    roleplayTurns,
    behaviorEvents,
  };
}

function validatePlayerProfile(value) {
  if (!value || typeof value !== 'object') {
    throw createHttpError(400, 'INVALID_PLAYER_PROFILE', 'Thông tin người chơi không hợp lệ.');
  }

  const fullName = String(value.fullName || '').trim();
  const email = String(value.email || '').trim();
  const userType = String(value.userType || '').trim();
  const gender = normalizeGender(value.gender);

  if (fullName.length < 2) {
    throw createHttpError(400, 'INVALID_PLAYER_NAME', 'Tên người chơi không hợp lệ.');
  }

  if (!['student', 'university', 'worker'].includes(userType)) {
    throw createHttpError(400, 'INVALID_USER_TYPE', 'Nhóm người dùng không hợp lệ.');
  }

  return { fullName, email, userType, gender };
}

function normalizeGender(value) {
  if (value === 'male' || value === 'female' || value === 'other') return value;
  return 'other';
}

function normalizeOpenAnswer(value) {
  const item = value && typeof value === 'object' ? value : {};
  return {
    stageId: String(item.stageId || '').trim(),
    question: String(item.question || '').trim(),
    answer: String(item.answer || '').trim(),
    timeTaken: Math.max(0, Number(item.timeTaken) || 0),
  };
}

function normalizeRoleplayTurn(value) {
  const item = value && typeof value === 'object' ? value : {};
  return {
    stageId: String(item.stageId || '').trim(),
    stageNumber: Math.max(0, Number(item.stageNumber) || 0),
    actorId: String(item.actorId || '').trim(),
    actorName: String(item.actorName || '').trim(),
    actorRole: String(item.actorRole || '').trim(),
    aiMessage: String(item.aiMessage || '').trim(),
    playerResponse: String(item.playerResponse || '').trim(),
    eventType: String(item.eventType || '').trim(),
    timeTaken: Math.max(0, Number(item.timeTaken) || 0),
    observation: String(item.observation || '').trim(),
  };
}

function normalizeBehaviorEvent(value) {
  const item = value && typeof value === 'object' ? value : {};
  return {
    stageId: String(item.stageId || '').trim(),
    stageNumber: Math.max(0, Number(item.stageNumber) || 0),
    eventType: String(item.eventType || '').trim(),
    attemptNumber: Math.max(0, Number(item.attemptNumber) || 0),
    blockSequence: Array.isArray(item.blockSequence)
      ? item.blockSequence.map((block) => String(block || '').trim()).filter(Boolean)
      : [],
    timeRemaining: Math.max(0, Number(item.timeRemaining) || 0),
  };
}

function normalizeNumber(value, minimum, maximum, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw createHttpError(400, 'INVALID_NUMBER_FIELD', `${fieldName} không hợp lệ.`);
  }

  return number;
}

function createHttpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function getProvider() {
  const provider = String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase();
  return provider === 'gemini' && String(process.env.GEMINI_API_KEY || '').trim()
    ? 'gemini'
    : 'mock';
}

module.exports = {
  handleEvaluateCareer,
};
