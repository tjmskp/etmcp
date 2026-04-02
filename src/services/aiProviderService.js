const fetch = require('node-fetch');
const { openAIKey } = require('../config');
const settingsService = require('./settingsService');

function buildMessages(prompt, system) {
  return [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ];
}

async function openaiCompletion({ prompt, system, model }) {
  const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(prompt, system),
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }

  return response.json();
}

async function openrouterCompletion({ prompt, system, model, opts = {} }) {
  const settings = await settingsService.getSettings();
  const apiUrl = settings.openrouter_api_url || process.env.OPENROUTER_API_URL || 'https://api.openrouter.ai/v1/chat/completions';
  const apiKey = settings.openrouter_api_key || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OpenRouter API key is not configured');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: buildMessages(prompt, system),
      ...opts,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  return response.json();
}

async function ollamaCompletion({ prompt, system, model, opts = {} }) {
  const settings = await settingsService.getSettings();
  const apiUrl = settings.ollama_api_url || process.env.OLLAMA_API_URL || 'http://localhost:11434/v1/chat/completions';
  const body = {
    model: model || 'llama2',
    messages: buildMessages(prompt, system),
    ...opts,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error ${response.status}: ${text}`);
  }

  return response.json();
}

async function customGptCompletion({ prompt, system, model, opts = {} }) {
  const settings = await settingsService.getSettings();
  const apiUrl = settings.custom_gpt_api_url || process.env.CUSTOM_GPT_API_URL;
  const apiKey = settings.custom_gpt_api_key || process.env.CUSTOM_GPT_API_KEY;
  if (!apiUrl) throw new Error('Custom GPT API URL not configured');

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      prompt,
      system,
      ...opts,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Custom GPT error ${response.status}: ${text}`);
  }

  return response.json();
}

async function completion({ prompt, system, model }) {
  const settings = await settingsService.getSettings();
  const provider = settings.ai_provider || 'openai';

  switch (provider) {
    case 'openai':
      return openaiCompletion({ prompt, system, model });
    case 'openrouter':
      return openrouterCompletion({ prompt, system, model });
    case 'ollama':
      return ollamaCompletion({ prompt, system, model });
    case 'custom_gpt':
      return customGptCompletion({ prompt, system, model });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

module.exports = { completion };
