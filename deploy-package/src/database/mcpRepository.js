const pool = require('../config/db');
const { generateUUID } = require('../utils/uuid');

async function findUserByApiKey(apiKey) {
  const [rows] = await pool.query('SELECT id, email, role FROM mcp_users WHERE api_key = ?', [apiKey]);
  return rows[0] || null;
}

async function insertLog(request, response, error = null, platform = null, processing_time_ms = null) {
  const id = generateUUID();
  await pool.query(
    'INSERT INTO mcp_logs (id, request, response, error, platform, processing_time_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [id, request, response, error, platform, processing_time_ms]
  );
  return id;
}

async function insertConversation(userId, platform) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_conversations (id, user_id, platform, created_at) VALUES (?, ?, ?, NOW())', [id, userId, platform]);
  return id;
}

async function insertMessage(conversationId, sender, content, intent) {
  const id = generateUUID();
  await pool.query(
    'INSERT INTO mcp_messages (id, conversation_id, sender, content, intent, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [id, conversationId, sender, content, intent]
  );
  return id;
}

async function insertLead({ name, email, phone, intent, score, status, source }) {
  const id = generateUUID();
  await pool.query(
    'INSERT INTO mcp_leads (id, name, email, phone, intent, score, status, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [id, name, email, phone, intent, score, status, source]
  );
  return id;
}

async function getServiceMappingByIntent(intent) {
  const [rows] = await pool.query('SELECT id, intent, services FROM mcp_service_mapping WHERE intent = ?', [intent]);
  return rows[0] || null;
}

async function getAllServiceMappings() {
  const [rows] = await pool.query('SELECT id, intent, services FROM mcp_service_mapping ORDER BY intent');
  return rows;
}

async function createServiceMapping(intent, services) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_service_mapping (id, intent, services) VALUES (?, ?, ?)', [id, intent, JSON.stringify(services)]);
  return { id, intent, services };
}

async function updateServiceMapping(id, intent, services) {
  const [result] = await pool.query('UPDATE mcp_service_mapping SET intent = ?, services = ? WHERE id = ?', [intent, JSON.stringify(services), id]);
  if (result.affectedRows === 0) return null;
  return { id, intent, services };
}

async function deleteServiceMapping(id) {
  await pool.query('DELETE FROM mcp_service_mapping WHERE id = ?', [id]);
  return true;
}

async function getLogs({ limit = 100, offset = 0 } = {}) {
  const [rows] = await pool.query('SELECT * FROM mcp_logs ORDER BY created_at DESC LIMIT ? OFFSET ?', [Number(limit), Number(offset)]);
  return rows;
}

async function getLeads({ limit = 100, offset = 0 } = {}) {
  const [rows] = await pool.query('SELECT * FROM mcp_leads ORDER BY created_at DESC LIMIT ? OFFSET ?', [Number(limit), Number(offset)]);
  return rows;
}

async function getSettings() {
  const [rows] = await pool.query('SELECT `key`, `value` FROM mcp_settings');
  return rows.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT id, email, role, api_key FROM mcp_users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function getUserCount() {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM mcp_users');
  return Number(rows[0]?.total || 0);
}

async function createUser(email, role, apiKey) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_users (id, email, role, api_key) VALUES (?, ?, ?, ?)', [id, email, role, apiKey]);
  return { id, email, role, api_key: apiKey };
}

async function upsertSetting(key, value) {
  await pool.query(
    'INSERT INTO mcp_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
    [key, value]
  );
  return { key, value };
}

async function listTrainingData({ limit = 100, offset = 0 } = {}) {
  const [rows] = await pool.query('SELECT * FROM mcp_training_data ORDER BY created_at DESC LIMIT ? OFFSET ?', [Number(limit), Number(offset)]);
  return rows;
}

async function getTrainingData(id) {
  const [rows] = await pool.query('SELECT * FROM mcp_training_data WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createTrainingData({ name, type, payload, created_by }) {
  const id = generateUUID();
  await pool.query('INSERT INTO mcp_training_data (id, name, type, payload, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [id, name, type, JSON.stringify(payload), created_by]);
  return { id, name, type, payload, created_by };
}

async function updateTrainingData(id, { name, type, payload }) {
  const [result] = await pool.query('UPDATE mcp_training_data SET name = ?, type = ?, payload = ? WHERE id = ?', [name, type, JSON.stringify(payload), id]);
  if (result.affectedRows === 0) return null;
  return { id, name, type, payload };
}

async function deleteTrainingData(id) {
  await pool.query('DELETE FROM mcp_training_data WHERE id = ?', [id]);
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
