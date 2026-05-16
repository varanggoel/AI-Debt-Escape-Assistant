const Debt = require('../models/Debt');
const { simulatePayoff } = require('../services/simulatorService');

exports.simulate = async (req, res, next) => {
  try {
    const { extraPayment = 0 } = req.query;
    const debts = await Debt.find({ userId: req.user._id });
    if (!debts.length) return res.json({ avalanche: null, snowball: null });

    const extra = parseFloat(extraPayment) || 0;
    const avalanche = simulatePayoff(debts, extra, 'avalanche');
    const snowball = simulatePayoff(debts, extra, 'snowball');

    res.json({ avalanche, snowball, debtCount: debts.length, extra });
  } catch (err) { next(err); }
};
