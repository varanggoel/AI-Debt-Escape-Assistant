const OpenAI = require('openai');

let client;
function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    });
  }
  return client;
}

// deepseek/deepseek-chat for OpenRouter, deepseek-chat for direct API
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat';

module.exports = {
  async generateText(prompt) {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
    });
    return completion.choices[0].message.content;
  },

  async generateChat(systemContext, userMessage) {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 600,
    });
    return completion.choices[0].message.content;
  },
};
