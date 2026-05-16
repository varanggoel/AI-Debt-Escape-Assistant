const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const debtController = require('../controllers/debtController');

const DEBT_TYPES = ['credit_card', 'student_loan', 'personal_loan', 'mortgage', 'auto_loan', 'medical', 'other'];

const debtValidation = [
  body('name').notEmpty().withMessage('Debt name is required'),
  body('type').isIn(DEBT_TYPES).withMessage('Invalid debt type'),
  body('balance').isFloat({ min: 0 }).withMessage('Balance must be 0 or greater'),
  body('interestRate').isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('minPayment').isFloat({ min: 0 }).withMessage('Minimum payment must be 0 or greater'),
  body('dueDate').optional().isInt({ min: 1, max: 31 }).withMessage('Due date must be between 1 and 31'),
];

router.get('/', debtController.getDebts);
router.post('/', debtValidation, debtController.createDebt);
router.get('/:id', debtController.getDebt);
router.put('/:id', debtValidation, debtController.updateDebt);
router.delete('/:id', debtController.deleteDebt);

module.exports = router;
