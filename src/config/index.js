require('dotenv').config();

const RequiredEnv = [
  'DB_URL',
  'OPENAI_API_KEY',
  'PORT',
  // Optional keys for integrations, not required for base
  // 'LOVABLE_API_URL',
  // 'LOVABLE_API_KEY',
  // 'MANUS_API_URL',
  // 'MANUS_API_KEY',
  // 'CUSTOM_GPT_API_URL',
  // 'CUSTOM_GPT_API_KEY',
];

for (const key of RequiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dbUrl: process.env.DB_URL,
  openAIKey: process.env.OPENAI_API_KEY,
  adminApiKey: process.env.ADMIN_API_KEY,
};
