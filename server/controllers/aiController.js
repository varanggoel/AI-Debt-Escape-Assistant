const Debt = require('../models/Debt');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');

exports.getRecommendations = async (req, res, next) => {
  try {
    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    if (!debts.length) {
      return res.json({
        advice: 'Add your debts first to get personalized advice.',
        provider: aiService.getProviderName(),
        alerts: [],
      });
    }
    const advice = await aiService.getDebtAdvice(debts, req.user);
    const alerts = generateAlerts(debts);
    res.json({ advice, provider: aiService.getProviderName(), alerts });
  } catch (err) {
    console.error('AI recommendations error:', err.message);
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    const reply = await aiService.chat(message, debts, req.user);

    // Persist chat history
    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', text: message },
              { role: 'ai', text: reply },
            ],
          },
        },
        updatedAt: Date.now(),
      },
      { upsert: true }
    );

    res.json({ reply, provider: aiService.getProviderName() });
  } catch (err) {
    next(err);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const history = await ChatHistory.findOne({ userId: req.user._id });
    res.json(history ? history.messages.slice(-50) : []);
  } catch (err) {
    next(err);
  }
};

exports.clearChatHistory = async (req, res, next) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id },
      { messages: [], updatedAt: Date.now() }
    );
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    next(err);
  }
};

function generateAlerts(debts) {
  const alerts = [];
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);

  debts.forEach((d) => {
    if (d.interestRate >= 25) {
      alerts.push({ type: 'danger', message: `${d.name} has a very high APR of ${d.interestRate}% — consider prioritizing this debt.` });
    }
    const monthlyInterest = (d.balance * d.interestRate) / 100 / 12;
    if (monthlyInterest > d.minPayment * 0.8) {
      alerts.push({ type: 'warning', message: `${d.name}: most of your minimum payment goes to interest ($${monthlyInterest.toFixed(0)}/mo). You may be in a debt trap.` });
    }
  });

  if (debts.length >= 5) {
    alerts.push({ type: 'info', message: `You have ${debts.length} active debts. Consolidation may reduce your total interest burden.` });
  }

  return alerts;
}
