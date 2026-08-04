const express = require('express');
const {
  handleCompleteSession,
  handleDashboard,
  handleDatabaseStatus,
  handleGetCareers,
  handleStartSession,
  handleUnlockCareer,
  handleUnlockPremiumReport,
} = require('../controllers/accountController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/database/status', handleDatabaseStatus);
router.get('/careers', requireAuth, handleGetCareers);
router.post('/careers/:careerId/unlock', requireAuth, handleUnlockCareer);
router.post('/sessions/start', requireAuth, handleStartSession);
router.post('/sessions/complete', requireAuth, handleCompleteSession);
router.post('/reports/premium', requireAuth, handleUnlockPremiumReport);
router.get('/dashboard', requireAuth, handleDashboard);

module.exports = router;
