const crypto = require('crypto');
const repository = require('../database/mcpRepository');
const settingsService = require('../services/settingsService');

function normalizeEventText(event) {
  if (!event) return null;

  if (typeof event === 'string') return event;
  if (event.text) return event.text;
  if (event.message) return event.message;
  if (event.result && typeof event.result === 'string') return event.result;
  if (event.data && event.data.content) return event.data.content;
  if (event.choices && Array.isArray(event.choices) && event.choices[0]?.message?.content) return event.choices[0].message.content;

  return null;
}

function getWebhookConversationId(event) {
  return (
    event.conversation_id ||
    event.metadata?.conversation_id ||
    event.data?.conversation_id ||
    event.payload?.conversation_id ||
    null
  );
}

async function validateOpenRouterSignature(req, secret) {
  if (!secret) return true;

  const signatureHeader = req.headers['x-openrouter-signature'] || req.headers['openrouter-signature'] || req.headers['x-signature'];
  if (!signatureHeader) return false;

  const payload = JSON.stringify(req.body);
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
}

async function openrouterWebhook(req, res, next) {
  try {
    const payload = req.body;

    const settings = await settingsService.getSettings();
    const secret = settings.openrouter_webhook_secret || process.env.OPENROUTER_WEBHOOK_SECRET;

    if (!(await validateOpenRouterSignature(req, secret))) {
      return res.status(401).json({ message: 'Invalid or missing OpenRouter webhook signature' });
    }

    const text = normalizeEventText(payload);
    const conversationId = getWebhookConversationId(payload);

    await repository.insertLog(JSON.stringify({ type: 'openrouter_webhook', payload }), JSON.stringify({ received: true }), null, 'openrouter', 0);

    if (conversationId && text) {
      try {
        await repository.insertMessage(conversationId, 'assistant', text, null);
      } catch (err) {
        console.warn('openrouterWebhook: failed to insert assistant message', err.message);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  openrouterWebhook,
};
