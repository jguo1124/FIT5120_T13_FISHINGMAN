// src/services/repo/mysqlPool.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

const pools = {};

/**
 * Returns a MySQL connection pool.
 *
 * Usage (backward compatible):
 *   - getPool()        → defaults to "real" (DATABASE_URL_REAL or DATABASE_URL)
 *   - getPool("real")  → explicitly connect to the real database
 *   - getPool("mock")  → explicitly connect to the mock database
 *
 * @param {string} [which="real"] - Pool type: "real" or "mock".
 * @returns {Pool} A mysql2/promise connection pool.
 */
export function getPool(which = 'real') {
  if (pools[which]) return pools[which];

  // 1) Resolve connection string
  let url;
  if (which === 'real') {
    // Prefer DATABASE_URL_REAL; fallback to DATABASE_URL for backward compatibility
    url = process.env.DATABASE_URL_REAL || process.env.DATABASE_URL;
  } else if (which === 'mock') {
    url = process.env.DATABASE_URL_MOCK;
  } else {
    throw new Error(`Unknown pool name: ${which}`);
  }
  if (!url) throw new Error(`${which.toUpperCase()} database url not set`);

  // 2) Create pool from connection string (mysql2 supports URI format)
  pools[which] = mysql.createPool(url, {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // If RDS requires SSL, enable: ssl: { rejectUnauthorized: true }
  });
  return pools[which];
}
