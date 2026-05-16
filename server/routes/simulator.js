const express = require('express');
const router = express.Router();
const simulatorController = require('../controllers/simulatorController');

router.get('/', simulatorController.simulate);

module.exports = router;
