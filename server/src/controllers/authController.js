const {
  getUnlockedCareerIds,
  loginUser,
  mapAccount,
  registerUser,
} = require('../services/authService');

async function handleRegister(req, res) {
  try {
    const result = await registerUser(req.body || {});
    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    return res.status(result.status).json({
      success: true,
      data: {
        token: result.token,
        account: result.account,
      },
    });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleLogin(req, res) {
  try {
    const result = await loginUser(req.body || {});
    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    return res.status(result.status).json({
      success: true,
      data: {
        token: result.token,
        account: result.account,
      },
    });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleMe(req, res) {
  try {
    const unlockedCareerIds = await getUnlockedCareerIds(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        account: mapAccount(req.user, unlockedCareerIds),
      },
    });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

function handleDatabaseOrServerError(error, res) {
  if (error && error.code === 'DB_NOT_READY') {
    return res.status(503).json({
      success: false,
      message: error.message,
      error: { code: 'DB_NOT_READY' },
    });
  }

  console.error('[AUTH] Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Không xử lý được tài khoản lúc này.',
    error: { code: 'AUTH_INTERNAL_ERROR' },
  });
}

module.exports = {
  handleLogin,
  handleMe,
  handleRegister,
};
