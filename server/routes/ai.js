const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/recommendations', aiController.getRecommendations);
router.post('/chat', aiController.chat);

module.exports = router;
