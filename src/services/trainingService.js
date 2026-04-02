const repository = require('../database/mcpRepository');

async function listTrainingData(params) {
  return repository.listTrainingData(params);
}

async function getTrainingData(id) {
  return repository.getTrainingData(id);
}

async function createTrainingData({ name, type, payload, created_by }) {
  if (!name || !type || !payload) {
    throw new Error('name, type, payload are required');
  }
  if (!['json', 'text'].includes(type)) {
    throw new Error('type must be json or text');
  }
  return repository.createTrainingData({ name, type, payload, created_by });
}

async function updateTrainingData(id, data) {
  if (!id) throw new Error('id required');
  return repository.updateTrainingData(id, data);
}

async function deleteTrainingData(id) {
  if (!id) throw new Error('id required');
  return repository.deleteTrainingData(id);
}

module.exports = {
  listTrainingData,
  getTrainingData,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
};
