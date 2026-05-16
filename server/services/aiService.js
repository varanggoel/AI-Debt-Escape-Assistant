const geminiService = require('./geminiService');
const deepseekService = require('./deepseekService');

function getProvider() {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === 'deepseek') return deepseekService;
  return geminiService;
}

function buildDebtProfileText(debts, user) {
  if (!debts.length) return 'No debts recorded yet.';

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMin = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const weightedAPR = debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0) / totalBalance;

  const debtList = debts
    .map(
      (d) =>
        `  - ${d.name} (${d.type.replace(/_/g, ' ')}): $${d.balance.toFixed(2)} balance, ${d.interestRate}% APR, $${d.minPayment.toFixed(2)}/mo min payment${d.dueDate ? `, due ${d.dueDate}th` : ''}`
    )
    .join('\n');

  return `User: ${user.name}
Total Debt: $${totalBalance.toFixed(2)}
Weighted Average APR: ${weightedAPR.toFixed(2)}%
Total Minimum Payments: $${totalMin.toFixed(2)}/month

Individual Debts:
${debtList}`;
}

function buildRecommendationPrompt(profileText) {
  return `You are a certified financial counselor specializing in debt management.
Analyze the following debt profile and provide:
1. A prioritized list of 3-5 actionable recommendations
2. Identification of any high-risk "debt traps" (e.g., high-APR credit cards, minimum payment cycles)
3. One encouraging insight about their situation

Keep your response practical, empathetic, and under 400 words. Use plain language.

DEBT PROFILE:
${profileText}`;
}

module.exports = {
  async getDebtAdvice(debts, user) {
    const profileText = buildDebtProfileText(debts, user);
    const prompt = buildRecommendationPrompt(profileText);
    return getProvider().generateText(prompt);
  },

  async chat(userMessage, debts, user) {
    const profileText = buildDebtProfileText(debts, user);
    const systemContext = `You are a helpful debt management assistant. Answer questions concisely and practically.
The user's current debt profile is:
${profileText}`;
    return getProvider().generateChat(systemContext, userMessage);
  },

  getProviderName() {
    const provider = process.env.AI_PROVIDER?.toLowerCase();
    return provider === 'deepseek' ? 'deepseek' : 'gemini';
  },
};
