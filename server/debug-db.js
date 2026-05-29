require('dotenv').config();
console.log('ENV', {
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT,
});
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    const res = await pool.query('SELECT id, email, full_name, password FROM users WHERE email = $1', ['it.test@gmail.com']);
    console.log('ROWS', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('ERR', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
