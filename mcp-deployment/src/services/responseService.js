const { completion } = require('./aiProviderService');
const settingsService = require('./settingsService');

async function generateResponse(message, detectedIntent, services) {
  const settings = await settingsService.getSettings();
  const model = settings.openai_model || 'gpt-4o-mini';
  const fallbackEnabled = settings.fallback_enabled === 'true';

  const prompt = `Generate a concise, professional, non-generic marketing/sales assistant response.\n- Message: ${message}\n- Intent: ${detectedIntent}\n- Services: ${JSON.stringify(services)}\nReturn only the response text.`;

  try {
    const data = await completion({ prompt, system: 'You are a business marketing assistant.', model });
    const text = data.choices?.[0]?.message?.content || (data?.result ?? '');
    return text.trim();
  } catch (err) {
    if (fallbackEnabled) {
      return `Default fallback response for intent ${detectedIntent}.`; 
    }
    throw err;
  }
}

module.exports = { generateResponse };
