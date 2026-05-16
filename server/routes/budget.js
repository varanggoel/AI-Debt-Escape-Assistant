const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

router.get('/', budgetController.getBudget);
router.post('/', budgetController.upsertBudget);

module.exports = router;
