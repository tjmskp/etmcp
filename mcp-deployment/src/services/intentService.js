const { completion } = require('./aiProviderService');
const settingsService = require('./settingsService');
const { fallbackIntentDetection } = require('../utils/keywordBackup');

async function detectIntent(message) {
  const settings = await settingsService.getSettings();
  const model = settings.openai_model || 'gpt-4o-mini';
  const fallbackEnabled = settings.fallback_enabled === 'true';

  const prompt = `You are an intent classifier. Return strictly JSON (no markdown) with keys intent, confidence, entities.\nUser message: ${message}`;

  try {
    const data = await completion({ prompt, system: 'Classify user intent for marketing/sales assistant', model });
    const text = data.choices?.[0]?.message?.content || (data?.result ?? '');
    const parsed = JSON.parse(text);

    if (!parsed.intent || typeof parsed.confidence !== 'number') {
      throw new Error('Intent output missing required fields');
    }

    return {
      intent: parsed.intent,
      confidence: parsed.confidence,
      entities: parsed.entities || {},
    };
  } catch (err) {
    const fallback = fallbackIntentDetection(message);

    if (fallbackEnabled) {
      return fallback;
    }

    throw err;
  }
}

module.exports = { detectIntent };
