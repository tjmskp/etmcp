const repository = require('../database/mcpRepository');

async function getServicesForIntent(intent) {
  const mapping = await repository.getServiceMappingByIntent(intent);
  return mapping?.services || [];
}

async function listMappings() {
  return repository.getAllServiceMappings();
}

async function createMapping(intent, services) {
  if (!intent || !Array.isArray(services)) throw new Error('Invalid payload');
  return repository.createServiceMapping(intent, services);
}

async function updateMapping(id, intent, services) {
  if (!id || !intent || !Array.isArray(services)) throw new Error('Invalid payload');
  return repository.updateServiceMapping(id, intent, services);
}

async function removeMapping(id) {
  return repository.deleteServiceMapping(id);
}

module.exports = { getServicesForIntent, listMappings, createMapping, updateMapping, removeMapping };
