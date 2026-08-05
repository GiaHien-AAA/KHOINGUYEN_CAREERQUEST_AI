require('dotenv').config();

const express = require('express');
const cors = require('cors');
const evaluationRoutes = require('./routes/evaluationRoutes');
const roleplayRoutes = require('./routes/roleplayRoutes');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const { getDatabaseStatus, initializeDatabase } = require('./config/database');

const app = express();
const PORT = getPort();
const NODE_ENV = String(process.env.NODE_ENV || 'development').trim().toLowerCase();
const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error('Nguồn truy cập không được phép.');
      error.code = 'CORS_ORIGIN_NOT_ALLOWED';
      callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    name: 'Career Quest AI Backend',
    provider: getProvider(),
    endpoints: {
      health: 'GET /health',
      roleplayStatus: 'GET /api/roleplay/status',
      roleplayIntro: 'POST /api/roleplay/intro',
      roleplayTurn: 'POST /api/roleplay/turn',
      evaluation: 'POST /api/evaluate-career',
      auth: 'POST /api/auth/register | POST /api/auth/login',
      dashboard: 'GET /api/dashboard',
      database: 'GET /api/database/status',
    },
  });
});

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'OK',
    provider: getProvider(),
    model: String(process.env.GEMINI_MODEL || null),
    environment: NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: getDatabaseStatus(),
  });
});

app.use('/api', authRoutes);
app.use('/api', accountRoutes);
app.use('/api', roleplayRoutes);
app.use('/api', evaluationRoutes);

app.get('/api/ai/status', (req, res) => {
  res.json({
    success: true,
    provider: process.env.AI_PROVIDER || 'mock',
    model: process.env.GEMINI_MODEL || null,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Không tìm thấy API này.',
    error: {
      code: 'ROUTE_NOT_FOUND',
      method: req.method,
      path: req.originalUrl,
    },
  });
});

app.use((error, req, res, next) => {
  void req;
  void next;

  if (error && error.code === 'CORS_ORIGIN_NOT_ALLOWED') {
    return res.status(403).json({
      success: false,
      message: 'Nguồn truy cập không được phép.',
      error: { code: 'CORS_ORIGIN_NOT_ALLOWED' },
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu JSON không hợp lệ.',
      error: { code: 'INVALID_JSON' },
    });
  }

  console.error('[SERVER] Unhandled error:', error);
  return res.status(500).json({
    success: false,
    message: 'Server gặp lỗi không mong muốn.',
    error: { code: 'INTERNAL_SERVER_ERROR' },
  });
});

const server = app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log('          CAREER QUEST AI ROLEPLAY');
  console.log('==============================================');
  console.log(`Server:      http://localhost:${PORT}`);
  console.log(`Health:      http://localhost:${PORT}/health`);
  console.log(`Roleplay:    http://localhost:${PORT}/api/roleplay/status`);
  console.log(`Database:    http://localhost:${PORT}/api/database/status`);
  console.log(`Provider:    ${getProvider()}`);
  console.log(`Model:       ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log('==============================================');
  console.log('');

  initializeDatabase();
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

function getProvider() {
  const provider = String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase();
  return provider === 'gemini' && String(process.env.GEMINI_API_KEY || '').trim()
    ? 'gemini'
    : 'mock';
}

function getPort() {
  const configured = Number(process.env.PORT);
  return Number.isInteger(configured) && configured > 0 ? configured : 3000;
}

function getAllowedOrigins() {
  const configured = String(process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(
    new Set([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      ...configured,
    ]),
  );
}
