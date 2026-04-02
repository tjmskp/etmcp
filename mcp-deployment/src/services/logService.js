const repository = require('../database/mcpRepository');

async function logRequest({ request, response, error = null, platform = null, processingTimeMs = null }) {
  return repository.insertLog(request, response, error, platform, processingTimeMs);
}

async function getLogs(params) {
  return repository.getLogs(params);
}

module.exports = { logRequest, getLogs };
