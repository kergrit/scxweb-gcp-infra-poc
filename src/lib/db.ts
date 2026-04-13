import { Pool } from 'pg';

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  // Production: Direct TCP to Cloud SQL PSC endpoint (SSL required)
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Development: Use Cloud SQL Proxy (TCP)
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
  });
}

export default pool;
