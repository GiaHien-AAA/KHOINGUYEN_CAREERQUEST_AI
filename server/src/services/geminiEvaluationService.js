const {
  buildEvaluationPrompt,
} = require('./evaluationPrompt');

const CAREER_FIT_VALUES = [
  'RẤT PHÙ HỢP VỚI MÔI TRƯỜNG CNTT',
  'CÓ NHIỀU TỐ CHẤT PHÙ HỢP VỚI CNTT',
  'CÓ TIỀM NĂNG — NÊN TRẢI NGHIỆM THÊM',
  'CHƯA ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN',
];

const ALLOWED_ROLES = [
  'Software Developer',
  'Business Analyst',
  'QA / Tester',
  'Technical Support',
  'Project Coordinator',
];

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: { type: 'integer' },
    scores: {
      type: 'object',
      properties: {
        analyticalThinking: { type: 'integer' },
        problemSolving: { type: 'integer' },
        communication: { type: 'integer' },
        teamwork: { type: 'integer' },
        adaptability: { type: 'integer' },
        pressureHandling: { type: 'integer' },
        persistence: { type: 'integer' },
      },
      required: [
        'analyticalThinking',
        'problemSolving',
        'communication',
        'teamwork',
        'adaptability',
        'pressureHandling',
        'persistence',
      ],
    },
    strengths: {
      type: 'array',
      items: { type: 'string' },
    },
    improvements: {
      type: 'array',
      items: { type: 'string' },
    },
    thinkingStyle: { type: 'string' },
    personalizedSummary: { type: 'string' },
    careerFit: {
      type: 'string',
      enum: CAREER_FIT_VALUES,
    },
    suitableRoles: {
      type: 'array',
      items: {
        type: 'string',
        enum: ALLOWED_ROLES,
      },
    },
  },
  required: [
    'overallScore',
    'scores',
    'strengths',
    'improvements',
    'thinkingStyle',
    'personalizedSummary',
    'careerFit',
    'suitableRoles',
  ],
};

let clientPromise = null;

async function evaluateCareerWithGemini(input) {
  const client = await getClient();
  const interaction = await client.interactions.create({
    model: getModel(),
    input: buildEvaluationPrompt(input),
    system_instruction:
      'Bạn là hệ thống phân tích nghề nghiệp thận trọng. Chỉ suy luận từ bằng chứng được cung cấp, không chẩn đoán tâm lý và không gọi đây là đo IQ.',
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: ANALYSIS_SCHEMA,
    },
    generation_config: {
      temperature: 0.28,
      thinking_level: 'medium',
      max_output_tokens: 2200,
    },
    store: false,
  });

  const outputText = String(interaction.output_text || '').trim();

  if (!outputText) {
    const error = new Error('Gemini không trả về kết quả phân tích.');
    error.code = 'GEMINI_EMPTY_RESPONSE';
    throw error;
  }

  let parsed;

  try {
    parsed = JSON.parse(outputText);
  } catch {
    const error = new Error('Gemini trả về JSON phân tích không hợp lệ.');
    error.code = 'GEMINI_INVALID_JSON';
    throw error;
  }

  return normalizeAnalysis(parsed);
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

function normalizeAnalysis(analysis) {
  const safe = analysis && typeof analysis === 'object' ? analysis : {};
  const scores = safe.scores && typeof safe.scores === 'object' ? safe.scores : {};

  return {
    overallScore: normalizeScore(safe.overallScore),
    scores: {
      analyticalThinking: normalizeScore(scores.analyticalThinking),
      problemSolving: normalizeScore(scores.problemSolving),
      communication: normalizeScore(scores.communication),
      teamwork: normalizeScore(scores.teamwork),
      adaptability: normalizeScore(scores.adaptability),
      pressureHandling: normalizeScore(scores.pressureHandling),
      persistence: normalizeScore(scores.persistence),
    },
    strengths: normalizeStringArray(safe.strengths, 3),
    improvements: normalizeStringArray(safe.improvements, 4),
    thinkingStyle: normalizeText(
      safe.thinkingStyle,
      'Chưa đủ dữ liệu để xác định rõ phong cách tư duy.',
    ),
    personalizedSummary: normalizeText(
      safe.personalizedSummary,
      'Chưa đủ dữ liệu để tạo nhận xét cá nhân hóa.',
    ),
    careerFit: CAREER_FIT_VALUES.includes(safe.careerFit)
      ? safe.careerFit
      : 'CHƯA ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN',
    suitableRoles: normalizeStringArray(safe.suitableRoles, 3).filter((role) =>
      ALLOWED_ROLES.includes(role),
    ),
  };
}

function normalizeScore(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.round(Math.min(100, Math.max(0, number)))
    : 0;
}

function normalizeStringArray(value, limit) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item || '').trim()).filter(Boolean))).slice(0, limit);
}

function normalizeText(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function getModel() {
  return String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
}

module.exports = {
  evaluateCareerWithGemini,
};
