const fetch = require('node-fetch');
const { openAIKey } = require('../config');

async function callLovable(data) {
  const url = process.env.LOVABLE_API_URL;
  if (!url) throw new Error('Lovable API URL is not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LOVABLE_API_KEY}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Lovable API error ${response.status}`);
  }
  return response.json();
}

async function callManus(data) {
  const url = process.env.MANUS_API_URL;
  if (!url) throw new Error('Manus API URL is not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.MANUS_API_KEY}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Manus API error ${response.status}`);
  }
  return response.json();
}

async function callCustomGpt(data) {
  const url = process.env.CUSTOM_GPT_API_URL;
  if (!url) throw new Error('Custom GPT API URL is not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CUSTOM_GPT_API_KEY}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Custom GPT API error ${response.status}`);
  }
  return response.json();
}

async function send(provider, payload) {
  switch (provider) {
    case 'lovable':
      return callLovable(payload);
    case 'manus':
      return callManus(payload);
    case 'custom_gpt':
      return callCustomGpt(payload);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

module.exports = { send };
