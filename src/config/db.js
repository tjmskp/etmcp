const { Pool } = require('pg');
const { dbUrl } = require('./index');

const pool = new Pool({
  connectionString: dbUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
});

module.exports = pool;
