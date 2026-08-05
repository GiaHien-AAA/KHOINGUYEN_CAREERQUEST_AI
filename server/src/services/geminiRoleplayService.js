const {
  getScenario,
  getActor,
} = require('./roleplayScenarioData');
const {
  buildRoleplaySystemInstruction,
  buildIntroInput,
  buildTurnInput,
} = require('./roleplayPrompt');

const INTRO_SCHEMA = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Lời giới thiệu và giao nhiệm vụ đúng vai nhân vật.',
    },
    question: {
      type: 'string',
      description: 'Câu hỏi mở đầu nếu stage là hội thoại mở; để trống nếu là task kéo thả.',
    },
    tone: {
      type: 'string',
      enum: ['calm', 'serious', 'encouraging', 'concerned', 'challenging', 'warning', 'happy', 'angry'],
    },
  },
  required: ['message', 'question', 'tone'],
};

const TURN_SCHEMA = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Phản ứng trực tiếp của nhân vật với hành động/câu trả lời người chơi.',
    },
    followUpQuestion: {
      type: 'string',
      description: 'Một câu hỏi tiếp nối phụ thuộc vào câu trả lời người chơi, hoặc chuỗi rỗng.',
    },
    hint: {
      type: 'string',
      description: 'Gợi ý cho task kéo thả, hoặc chuỗi rỗng.',
    },
    shouldContinue: {
      type: 'boolean',
    },
    stageComplete: {
      type: 'boolean',
    },
    observation: {
      type: 'string',
      description: 'Một quan sát ngắn, thận trọng về hành vi đã thể hiện, dùng cho đánh giá cuối.',
    },
    answerQuality: {
      type: 'string',
      enum: ['good', 'partial', 'vague', 'wrong', 'unsafe', 'off_topic'],
      description: 'Phân loại chất lượng câu trả lời của người chơi.',
    },
    decisionReason: {
      type: 'string',
      description: 'Lý do ngắn gọn vì sao cho tiếp tục hoặc hoàn thành stage. Không hiển thị trực tiếp nếu không cần.',
    },
    tone: {
      type: 'string',
      enum: ['calm', 'serious', 'encouraging', 'concerned', 'challenging', 'warning', 'happy', 'angry'],
    },
  },
  required: [
    'message',
    'followUpQuestion',
    'hint',
    'shouldContinue',
    'stageComplete',
    'observation',
    'answerQuality',
    'decisionReason',
    'tone',
  ],
};

let clientPromise = null;

async function createRoleplayIntroWithGemini({ stageId, playerProfile, scenarioOverride }) {
  const scenario = scenarioOverride || requireScenario(stageId);
  const actor = requireActor(scenario.actorId);
  const client = await getClient();

  const interaction = await client.interactions.create({
    model: getModel(),
    input: buildIntroInput({ scenario, actor, playerProfile }),
    system_instruction: buildRoleplaySystemInstruction({
      scenario,
      actor,
      playerProfile,
    }),
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: INTRO_SCHEMA,
    },
    generation_config: {
      temperature: 0.72,
      thinking_level: 'low',
      max_output_tokens: 700,
    },
    store: true,
  });

  const parsed = parseInteractionJson(interaction, 'GEMINI_ROLEPLAY_INTRO_INVALID_JSON');

  return {
    interactionId: String(interaction.id || ''),
    stageId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    actorAvatar: actor.avatar,
    missionTitle: scenario.missionTitle,
    missionObjective: scenario.missionObjective,
    message: sanitizeRoleplayText(normalizeText(parsed.message, scenario.context)),
    question: scenario.mode === 'open'
      ? sanitizeRoleplayText(normalizeText(parsed.question, scenario.initialQuestion || ''))
      : '',
    tone: normalizeTone(parsed.tone),
    source: 'gemini',
  };
}

async function createRoleplayTurnWithGemini(input) {
  const scenario = input.scenarioOverride || requireScenario(input.stageId);
  const actor = requireActor(scenario.actorId);
  const client = await getClient();

  const request = {
    model: getModel(),
    input: buildTurnInput({
      scenario,
      eventType: input.eventType,
      playerMessage: input.playerMessage,
      playerAction: input.playerAction,
      attemptNumber: input.attemptNumber,
      turnNumber: input.turnNumber,
    }),
    system_instruction: buildRoleplaySystemInstruction({
      scenario,
      actor,
      playerProfile: input.playerProfile,
    }),
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: TURN_SCHEMA,
    },
    generation_config: {
      temperature: 0.68,
      thinking_level: 'low',
      max_output_tokens: 850,
    },
    store: true,
  };

  if (input.previousInteractionId) {
    request.previous_interaction_id = input.previousInteractionId;
  }

  const interaction = await client.interactions.create(request);
  const parsed = parseInteractionJson(interaction, 'GEMINI_ROLEPLAY_TURN_INVALID_JSON');

  return {
    interactionId: String(interaction.id || ''),
    stageId: input.stageId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    actorAvatar: actor.avatar,
    message: sanitizeRoleplayText(normalizeText(parsed.message, 'Tôi cần bạn nói rõ hơn cách xử lý thực tế.')), 
    followUpQuestion: sanitizeRoleplayText(normalizeText(parsed.followUpQuestion, '')),
    hint: normalizeText(parsed.hint, ''),
    shouldContinue: Boolean(parsed.shouldContinue),
    stageComplete: Boolean(parsed.stageComplete),
    observation: buildObservation(parsed),
    tone: normalizeTone(parsed.tone),
    source: 'gemini',
  };
}

async function getClient() {
  if (!clientPromise) {
    clientPromise = createClient();
  }

  try {
    return await clientPromise;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
}

async function createClient() {
  const { GoogleGenAI } = await import('@google/genai');
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    const error = new Error('Chưa cấu hình GEMINI_API_KEY.');
    error.code = 'GEMINI_API_KEY_MISSING';
    throw error;
  }

  return new GoogleGenAI({ apiKey });
}

function parseInteractionJson(interaction, code) {
  const outputText = String(interaction && interaction.output_text ? interaction.output_text : '').trim();

  if (!outputText) {
    const error = new Error('Gemini không trả về nội dung roleplay.');
    error.code = 'GEMINI_EMPTY_RESPONSE';
    throw error;
  }

  try {
    return JSON.parse(outputText);
  } catch {
    const error = new Error('Gemini trả về JSON roleplay không hợp lệ.');
    error.code = code;
    throw error;
  }
}

function getModel() {
  return String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
}

function normalizeTone(value) {
  const allowed = ['calm', 'serious', 'encouraging', 'concerned', 'challenging', 'warning', 'happy', 'angry'];
  return allowed.includes(value) ? value : 'serious';
}

function normalizeText(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}


function buildObservation(parsed) {
  const observation = normalizeText(
    parsed.observation,
    'Người chơi đã tham gia xử lý tình huống roleplay.',
  );
  const quality = normalizeText(parsed.answerQuality, 'partial');
  const reason = normalizeText(parsed.decisionReason, '');

  return reason ? `${observation} Chất lượng: ${quality}. Lý do: ${reason}` : `${observation} Chất lượng: ${quality}.`;
}

function sanitizeRoleplayText(value) {
  let text = String(value || '').trim();
  const bannedPrefixes = [
    /^mini game\s*:?\s*/i,
    /^nói như[^:]*:\s*/i,
    /^dữ liệu nội bộ\s*:?\s*/i,
    /^stage\s*\d*\s*:?\s*/i,
  ];

  for (const pattern of bannedPrefixes) {
    text = text.replace(pattern, '').trim();
  }

  text = text
    .replace(/\bMini game\b/gi, 'tình huống')
    .replace(/\bstage\b/gi, 'ca')
    .replace(/\bprompt\b/gi, 'yêu cầu')
    .replace(/\bAI\b/g, 'nhân vật')
    .replace(/Nói như[^.。!?\n]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return text;
}

function requireScenario(stageId) {
  const scenario = getScenario(stageId);

  if (!scenario) {
    const error = new Error(`Không tìm thấy stage ${stageId}.`);
    error.code = 'ROLEPLAY_STAGE_NOT_FOUND';
    throw error;
  }

  return scenario;
}

function requireActor(actorId) {
  const actor = getActor(actorId);

  if (!actor) {
    const error = new Error(`Không tìm thấy actor ${actorId}.`);
    error.code = 'ROLEPLAY_ACTOR_NOT_FOUND';
    throw error;
  }

  return actor;
}

module.exports = {
  createRoleplayIntroWithGemini,
  createRoleplayTurnWithGemini,
};
