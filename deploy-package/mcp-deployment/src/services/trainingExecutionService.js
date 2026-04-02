const repository = require('../database/mcpRepository');
const { openAIChatCompletion } = require('../utils/openaiClient');

async function executeTraining() {
  const trainingData = await repository.listTrainingData({ limit: 1000, offset: 0 });
  if (!trainingData.length) {
    return { status: 'skipped', message: 'No training data found' };
  }

  const sample = trainingData.slice(0, 10).map((item) => item.payload);

  try {
    const prompt = `Training check: validate and summarize ${sample.length} items.`;
    await openAIChatCompletion(prompt, 'You are a training assistant.', 'gpt-4o-mini');

    return { status: 'success', trainingCount: trainingData.length };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

module.exports = { executeTraining };
