const pool = require('../config/db');
const { generateUUID } = require('../utils/uuid');

async function findUserByApiKey(apiKey) {
  const { rows } = await pool.query('SELECT id, email, role FROM mcp_users WHERE api_key = $1', [apiKey]);
  return rows[0] || null;
}

async function insertLog(request, response, error = null, platform = null, processing_time_ms = null) {
  const id = generateUUID();
  await pool.query(
    `INSERT INTO mcp_logs (id, request, response, error, platform, processing_time_ms, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [id, request, response, error, platform, processing_time_ms]
  );
  return id;
}

async function insertConversation(userId, platform) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_conversations (id, user_id, platform, created_at) VALUES ($1, $2, $3, NOW())', [id, userId, platform]);
  return id;
}

async function insertMessage(conversationId, sender, content, intent) {
  const id = generateUUID();
  await pool.query(
    'INSERT INTO mcp_messages (id, conversation_id, sender, content, intent, created_at) VALUES ($1,$2,$3,$4,$5,NOW())',
    [id, conversationId, sender, content, intent]
  );
  return id;
}

async function insertLead({ name, email, phone, intent, score, status, source }) {
  const id = generateUUID();
  await pool.query(
    'INSERT INTO mcp_leads (id, name, email, phone, intent, score, status, source, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())',
    [id, name, email, phone, intent, score, status, source]
  );
  return id;
}

async function getServiceMappingByIntent(intent) {
  const { rows } = await pool.query('SELECT id, intent, services FROM mcp_service_mapping WHERE intent = $1', [intent]);
  return rows[0] || null;
}

async function getAllServiceMappings() {
  const { rows } = await pool.query('SELECT id, intent, services FROM mcp_service_mapping ORDER BY intent');
  return rows;
}

async function createServiceMapping(intent, services) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_service_mapping (id, intent, services) VALUES ($1,$2,$3)', [id, intent, services]);
  return { id, intent, services };
}

async function updateServiceMapping(id, intent, services) {
  const { rows } = await pool.query(
    'UPDATE mcp_service_mapping SET intent=$1, services=$2 WHERE id=$3 RETURNING id, intent, services',
    [intent, services, id]
  );
  return rows[0] || null;
}

async function deleteServiceMapping(id) {
  await pool.query('DELETE FROM mcp_service_mapping WHERE id=$1', [id]);
  return true;
}

async function getLogs({ limit = 100, offset = 0 } = {}) {
  const { rows } = await pool.query('SELECT * FROM mcp_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
}

async function getLeads({ limit = 100, offset = 0 } = {}) {
  const { rows } = await pool.query('SELECT * FROM mcp_leads ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
}

async function getSettings() {
  const { rows } = await pool.query('SELECT key, value FROM mcp_settings');
  return rows.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
}

async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT id, email, role, api_key FROM mcp_users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function getUserCount() {
  const { rows } = await pool.query('SELECT COUNT(*) AS total FROM mcp_users');
  return Number(rows[0]?.total || 0);
}

async function createUser(email, role, apiKey) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_users (id, email, role, api_key) VALUES ($1, $2, $3, $4)', [id, email, role, apiKey]);
  return { id, email, role, api_key: apiKey };
}

async function upsertSetting(key, value) {
  await pool.query(
    `INSERT INTO mcp_settings(key, value) VALUES($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
  return { key, value };
}

async function listTrainingData({ limit = 100, offset = 0 } = {}) {
  const { rows } = await pool.query('SELECT * FROM mcp_training_data ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
}

async function getTrainingData(id) {
  const { rows } = await pool.query('SELECT * FROM mcp_training_data WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createTrainingData({ name, type, payload, created_by }) {
  const id = generateUUID();
  await pool.query(
    'INSERT INTO mcp_training_data (id, name, type, payload, created_by, created_at) VALUES ($1,$2,$3,$4,$5,NOW())',
    [id, name, type, payload, created_by]
  );
  return { id, name, type, payload, created_by };
}

async function updateTrainingData(id, { name, type, payload }) {
  const { rows } = await pool.query(
    'UPDATE mcp_training_data SET name = $1, type = $2, payload = $3 WHERE id = $4 RETURNING *',
    [name, type, payload, id]
  );
  return rows[0] || null;
}

async function deleteTrainingData(id) {
  await pool.query('DELETE FROM mcp_training_data WHERE id = $1', [id]);
  return true;
}

module.exports = {
  findUserByApiKey,
  insertLog,
  insertConversation,
  insertMessage,
  insertLead,
  getServiceMappingByIntent,
  getAllServiceMappings,
  createServiceMapping,
  updateServiceMapping,
  deleteServiceMapping,
  getLogs,
  getLeads,
  getSettings,
  upsertSetting,
  listTrainingData,
  getTrainingData,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
};
