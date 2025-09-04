// src/services/repo/mysqlPool.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

let pool;

export function getPool() {
  if (pool) return pool;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');

  
  pool = mysql.createPool(url, {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}
