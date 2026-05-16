const Budget = require('../models/Budget');

exports.getBudget = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();
    const budget = await Budget.findOne({ userId: req.user._id, month: m, year: y });
    res.json(budget || null);
  } catch (err) { next(err); }
};

exports.upsertBudget = async (req, res, next) => {
  try {
    const { month, year, income, expenses } = req.body;
    if (!month || !year || income == null) return res.status(400).json({ message: 'month, year, and income are required' });
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month, year },
      { income, expenses: expenses || [], updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(budget);
  } catch (err) { next(err); }
};
