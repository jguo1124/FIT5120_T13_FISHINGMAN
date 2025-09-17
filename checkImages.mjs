import mysql from "mysql2/promise";
import fetch from "node-fetch";

const pool = await mysql.createPool("mysql://admin:guo001124@fishingman-mysql.c1e0gceqm4oy.ap-southeast-2.rds.amazonaws.com:3306/fishingman_db");

const [rows] = await pool.query(`
  SELECT
    scientific_name AS id,
    common_name     AS name,
    image           AS image_url
  FROM endangered_cards
`);

for (const row of rows) {
  if (!row.image_url) {
    console.log(`[MISSING] ${row.id} - ${row.name}`);
    continue;
  }
  try {
    const res = await fetch(row.image_url, { method: "HEAD" });
    if (!res.ok) {
      console.log(`[BROKEN] ${row.id} - ${row.name} -> ${row.image_url} (${res.status})`);
    }
  } catch (err) {
    console.log(`[ERROR] ${row.id} - ${row.name} -> ${row.image_url} (${err.message})`);
  }
}

process.exit(0);
