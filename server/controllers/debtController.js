const { validationResult } = require('express-validator');
const Debt = require('../models/Debt');

exports.getDebts = async (req, res, next) => {
  try {
    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    res.json(debts);
  } catch (err) {
    next(err);
  }
};

exports.getDebt = async (req, res, next) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json(debt);
  } catch (err) {
    next(err);
  }
};

exports.createDebt = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const debt = await Debt.create({ ...req.body, userId: req.user._id });
    res.status(201).json(debt);
  } catch (err) {
    next(err);
  }
};

exports.updateDebt = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json(debt);
  } catch (err) {
    next(err);
  }
};

exports.deleteDebt = async (req, res, next) => {
  try {
    const debt = await Debt.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json({ message: 'Debt deleted' });
  } catch (err) {
    next(err);
  }
};
