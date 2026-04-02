const repository = require('../database/mcpRepository');

async function getSettings() {
  return repository.getSettings();
}

async function upsertSetting(key, value) {
  return repository.upsertSetting(key, value);
}

module.exports = { getSettings, upsertSetting };
