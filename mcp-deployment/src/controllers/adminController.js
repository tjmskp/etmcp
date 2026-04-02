const mappingService = require('../services/mappingService');
const logService = require('../services/logService');
const repository = require('../database/mcpRepository');
const settingsService = require('../services/settingsService');
const trainingService = require('../services/trainingService');
const trainingExecutionService = require('../services/trainingExecutionService');
const integrationService = require('../services/integrationService');
const db = require('../config/db');
const fetch = require('node-fetch');

async function getLogs(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await logService.getLogs({ limit: Number(limit), offset: Number(offset) });
    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
}

async function getLeads(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const leads = await repository.getLeads({ limit: Number(limit), offset: Number(offset) });
    res.json({ data: leads });
  } catch (err) {
    next(err);
  }
}

async function getServiceMapping(req, res, next) {
  try {
    const mappings = await mappingService.listMappings();
    res.json({ data: mappings });
  } catch (err) {
    next(err);
  }
}

async function createServiceMapping(req, res, next) {
  try {
    const { intent, services } = req.body;
    const mapping = await mappingService.createMapping(intent, services);
    res.status(201).json({ data: mapping });
  } catch (err) {
    next(err);
  }
}

async function updateServiceMapping(req, res, next) {
  try {
    const { id } = req.params;
    const { intent, services } = req.body;
    const mapping = await mappingService.updateMapping(id, intent, services);
    if (!mapping) return res.status(404).json({ message: 'Mapping not found' });
    res.json({ data: mapping });
  } catch (err) {
    next(err);
  }
}

async function deleteServiceMapping(req, res, next) {
  try {
    const { id } = req.params;
    await mappingService.removeMapping(id);
    res.json({ message: 'Mapping deleted' });
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getSettings();
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
}

async function putSetting(req, res, next) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ message: 'key and value are required' });
    const setting = await settingsService.upsertSetting(key, value);
    res.json({ data: setting });
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const appSettings = await settingsService.getSettings();
    const dbStatus = await db.query('SELECT 1');
    const openaiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    let openAiStatus = 'unreachable';

    try {
      const ping = await fetch(openaiUrl, { method: 'OPTIONS' });
      openAiStatus = ping.ok ? 'reachable' : `unreachable(${ping.status})`;
    } catch (err) {
      openAiStatus = 'unreachable';
    }

    const logCountRow = await db.query('SELECT COUNT(*) AS count FROM mcp_logs');
    const leadCountRow = await db.query('SELECT COUNT(*) AS count FROM mcp_leads');

    res.json({
      status: 'ok',
      database: dbStatus.rowCount === 1 ? 'connected' : 'disconnected',
      openai: openAiStatus,
      provider: appSettings.ai_provider || 'openai',
      fallback_enabled: appSettings.fallback_enabled === 'true',
      settings: appSettings,
      logCount: Number(logCountRow.rows[0].count),
      leadCount: Number(leadCountRow.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
}

async function listTrainingData(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const data = await trainingService.listTrainingData({ limit: Number(limit), offset: Number(offset) });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function createTrainingData(req, res, next) {
  try {
    const { name, type, payload } = req.body;
    const created_by = req.user?.email || 'admin';
    const training = await trainingService.createTrainingData({ name, type, payload, created_by });
    res.status(201).json({ data: training });
  } catch (err) {
    next(err);
  }
}

async function updateTrainingData(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, payload } = req.body;
    const training = await trainingService.updateTrainingData(id, { name, type, payload });
    if (!training) return res.status(404).json({ message: 'Training record not found' });
    res.json({ data: training });
  } catch (err) {
    next(err);
  }
}

async function deleteTrainingData(req, res, next) {
  try {
    const { id } = req.params;
    await trainingService.deleteTrainingData(id);
    res.json({ message: 'Training data deleted' });
  } catch (err) {
    next(err);
  }
}

async function runTraining(req, res, next) {
  try {
    const result = await trainingExecutionService.executeTraining();
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

async function sendIntegration(req, res, next) {
  try {
    const { provider, payload } = req.body;
    if (!provider || !payload) {
      return res.status(400).json({ message: 'provider and payload are required' });
    }
    const result = await integrationService.send(provider, payload);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLogs,
  getLeads,
  getServiceMapping,
  createServiceMapping,
  updateServiceMapping,
  deleteServiceMapping,
  getSettings,
  putSetting,
  getStatus,
  listTrainingData,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
  runTraining,
  sendIntegration,
};
