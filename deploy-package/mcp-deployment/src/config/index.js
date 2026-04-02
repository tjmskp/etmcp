require('dotenv').config();

const RequiredEnv = [
  'OPENAI_API_KEY',
  'PORT',
  // DB_URL is optional for testing
];

for (const key of RequiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dbUrl: process.env.DB_URL || 'postgresql://dummy:dummy@localhost:5432/dummy', // dummy for testing
  openAIKey: process.env.OPENAI_API_KEY,
  adminApiKey: process.env.ADMIN_API_KEY,
};
