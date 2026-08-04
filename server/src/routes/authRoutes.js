const express = require('express');
const {
  handleLogin,
  handleMe,
  handleRegister,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/auth/register', handleRegister);
router.post('/auth/login', handleLogin);
router.get('/auth/me', requireAuth, handleMe);

module.exports = router;
