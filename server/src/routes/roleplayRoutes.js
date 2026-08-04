const express = require('express');
const {
  handleRoleplayIntro,
  handleRoleplayTurn,
} = require('../controllers/roleplayController');

const router = express.Router();

router.get('/roleplay/status', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Roleplay API is ready.',
    provider: getProvider(),
    endpoints: [
      'POST /api/roleplay/intro',
      'POST /api/roleplay/turn',
    ],
  });
});

router.post('/roleplay/intro', handleRoleplayIntro);
router.post('/roleplay/turn', handleRoleplayTurn);

function getProvider() {
  const provider = String(process.env.AI_PROVIDER || 'mock').trim().toLowerCase();
  return provider === 'gemini' && String(process.env.GEMINI_API_KEY || '').trim()
    ? 'gemini'
    : 'mock';
}

module.exports = router;
