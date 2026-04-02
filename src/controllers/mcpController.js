const intentService = require('../services/intentService');
const mappingService = require('../services/mappingService');
const responseService = require('../services/responseService');
const leadService = require('../services/leadService');
const logService = require('../services/logService');
const repository = require('../database/mcpRepository');

async function processMessage(req, res, next) {
  const startTime = Date.now();

  try {
    const { user_id, message, platform, contact } = req.body;
    if (!user_id || !message || !platform) {
      return res.status(400).json({ message: 'user_id, message and platform are required' });
    }

    const conversationId = await repository.insertConversation(user_id, platform);
    await repository.insertMessage(conversationId, 'user', message, null);

    const detected = await intentService.detectIntent(message);
    const services = await mappingService.getServicesForIntent(detected.intent);
    const aiResponse = await responseService.generateResponse(message, detected.intent, services);

    await repository.insertMessage(conversationId, 'assistant', aiResponse, detected.intent);

    const lead = await leadService.qualifyLead({ intent: detected.intent, message, contact: { ...contact, source: platform } });

    const processingTimeMs = Date.now() - startTime;
    await logService.logRequest({
      request: req.body,
      response: { intent: detected.intent, services, response: aiResponse, lead },
      error: null,
      platform,
      processingTimeMs,
    });

    res.json({ intent: detected.intent, services, response: aiResponse, lead });
  } catch (err) {
    next(err);
  }
}

module.exports = { processMessage };
