const Debt = require('../models/Debt');
const aiService = require('../services/aiService');

exports.getRecommendations = async (req, res, next) => {
  try {
    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    if (!debts.length) {
      return res.json({
        advice: 'Add your debts first to get personalized advice.',
        provider: aiService.getProviderName(),
      });
    }
    const advice = await aiService.getDebtAdvice(debts, req.user);
    res.json({ advice, provider: aiService.getProviderName() });
  } catch (err) {
    console.error('AI recommendations error:', err.message, err.stack);
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    const reply = await aiService.chat(message, debts, req.user);
    res.json({ reply, provider: aiService.getProviderName() });
  } catch (err) {
    next(err);
  }
};
