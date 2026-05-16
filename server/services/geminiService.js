const { GoogleGenerativeAI } = require('@google/generative-ai');

let client;
function getClient() {
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client;
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

module.exports = {
  async generateText(prompt) {
    const model = getClient().getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  async generateChat(systemContext, userMessage) {
    const model = getClient().getGenerativeModel({
      model: MODEL,
      systemInstruction: systemContext,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text();
  },
};
