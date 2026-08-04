const { getDatabaseStatus, query } = require('../config/database');
const { careerCatalog, getCareerById, normalizeCareerId } = require('../services/careerCatalogService');
const { getUnlockedCareerIds, unlockCareer } = require('../services/authService');
const {
  completeCareerSession,
  getDashboardSnapshot,
  startCareerSession,
  unlockPremiumReport,
} = require('../services/sessionService');

async function handleDatabaseStatus(req, res) {
  void req;
  return res.status(200).json({
    success: true,
    data: getDatabaseStatus(),
  });
}

async function handleGetCareers(req, res) {
  try {
    const unlockedCareerIds = await getUnlockedCareerIds(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        careers: careerCatalog,
        unlockedCareerIds,
      },
    });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleUnlockCareer(req, res) {
  try {
    const careerId = normalizeCareerId(req.body?.careerId || req.params?.careerId);
    const career = getCareerById(careerId);
    if (!career) {
      return res.status(400).json({ success: false, message: 'Ngành không hợp lệ.' });
    }

    const unlockedCareerIds = await unlockCareer(req.user.id, careerId, career.isFree ? 'free' : 'purchase');

    if (!career.isFree) {
      await query(
        `INSERT INTO payments (user_id, career_id, amount, payment_type, status, note)
         VALUES (?, ?, ?, 'career_unlock', 'paid', 'MVP checkout simulated payment')`,
        [req.user.id, careerId, Number(career.price || 15000)],
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        careerId,
        unlockedCareerIds,
      },
    });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleStartSession(req, res) {
  try {
    const result = await startCareerSession(req.user.id, req.body?.careerId);
    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(result.status).json({ success: true, data: { session: result.session } });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleCompleteSession(req, res) {
  try {
    const result = await completeCareerSession(req.user.id, req.body?.careerId, req.body?.result);
    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(result.status).json({ success: true, data: { session: result.session } });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleUnlockPremiumReport(req, res) {
  try {
    const result = await unlockPremiumReport(req.user.id, req.body?.careerId);
    if (!result.ok) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    await query(
      `INSERT INTO payments (user_id, career_id, amount, payment_type, status, note)
       VALUES (?, ?, 20000, 'premium_report', 'paid', 'MVP premium report simulated payment')`,
      [req.user.id, req.body?.careerId || null],
    );

    return res.status(result.status).json({ success: true, data: { session: result.session } });
  } catch (error) {
    return handleDatabaseOrServerError(error, res);
  }
}

async function handleDashboard(req, res) {
  try {
    const snapshot = await getDashboardSnapshot(req.user.id);
    const unlockedCareerIds = await getUnlockedCareerIds(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        unlockedCareerIds,
        ...snapshot,
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

  console.error('[ACCOUNT] Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Không lưu được dữ liệu tài khoản lúc này.',
    error: { code: 'ACCOUNT_INTERNAL_ERROR' },
  });
}

module.exports = {
  handleCompleteSession,
  handleDashboard,
  handleDatabaseStatus,
  handleGetCareers,
  handleStartSession,
  handleUnlockCareer,
  handleUnlockPremiumReport,
};
