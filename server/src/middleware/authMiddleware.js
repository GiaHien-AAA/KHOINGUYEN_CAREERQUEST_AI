const { findUserById, verifyToken } = require('../services/authService');

async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu token đăng nhập.',
        error: { code: 'AUTH_TOKEN_MISSING' },
      });
    }

    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ.',
        error: { code: 'AUTH_USER_NOT_FOUND' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error && error.code === 'DB_NOT_READY') {
      return res.status(503).json({
        success: false,
        message: error.message,
        error: { code: 'DB_NOT_READY' },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
      error: { code: 'AUTH_TOKEN_INVALID' },
    });
  }
}

function extractBearerToken(authorization) {
  const value = String(authorization || '').trim();
  if (!value.toLowerCase().startsWith('bearer ')) return '';
  return value.slice(7).trim();
}

module.exports = { requireAuth };
