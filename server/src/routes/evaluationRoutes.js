const express = require('express');
const {
  handleEvaluateCareer,
} = require('../controllers/evaluationController');

const router = express.Router();

router.get('/evaluate-career', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Career evaluation API is ready.',
    endpoint: 'POST /api/evaluate-career',
  });
});

router.post('/evaluate-career', handleEvaluateCareer);

module.exports = router;
