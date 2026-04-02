const crypto = require('crypto');
const repository = require('../database/mcpRepository');
const settingsService = require('../services/settingsService');

function generateApiKey() {
  return crypto.randomBytes(24).toString('hex');
}

async function setup(req, res, next) {
  try {
    const userCount = await repository.getUserCount();
    if (userCount > 0) {
      return res.status(409).json({ message: 'Setup already completed' });
    }

    const { email = 'admin@engineerstechbd.com', role = 'admin', api_key } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    const normalizedRole = role === 'system' ? 'system' : 'admin';
    const key = api_key || generateApiKey();

    const existing = await repository.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await repository.createUser(email, normalizedRole, key);

    const settingsPayload = {
      ai_provider: 'openrouter',
      openrouter_api_key: process.env.OPENROUTER_API_KEY || '',
      openrouter_webhook_secret: process.env.OPENROUTER_WEBHOOK_SECRET || '',
    };

    for (const [keyName, value] of Object.entries(settingsPayload)) {
      if (value) {
        await settingsService.upsertSetting(keyName, value);
      }
    }

    res.status(201).json({
      message: 'Setup completed',
      user,
      settings: settingsPayload,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { setup };
