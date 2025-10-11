// BackEnd/src/Endangered_species/repo.js
import { getPool } from "../services/repo/mysqlPool.js";

/**
 * Epic2 Repository — reads data from the endangered_cards table
 * Table schema:
 *   common_name, scientific_name, conservation_status, distribution, image, sources
 *
 * Convention: since the table does not have an auto-increment id,
 * we use scientific_name as a stable primary key (id).
 * If duplicate scientific_name values exist, consider using
 * CONCAT(scientific_name, '-', common_name) as a unique identifier.
 */

function pool() {
  return getPool("mock"); // Connect to your fishingman_db (DATABASE_URL_MOCK in .env)
}

export async function listEndangered({
  q = "",
  page = 1,
  pageSize = 12,
  status = "",             // filter by conservation_status
  sort = "common_name",
  order = "asc",
}) {
  const p = pool();

  // Only allow sorting by whitelisted columns
  const sortWhitelist = new Set([
    "common_name",
    "scientific_name",
    "conservation_status",
  ]);
  sort = sortWhitelist.has(sort) ? sort : "common_name";
  order = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  // Build WHERE clause dynamically
  const where = [];
  const params = [];
  if (q) {
    where.push("(common_name LIKE ? OR scientific_name LIKE ? OR distribution LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status) {
    where.push("conservation_status = ?");
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Query total count
  const [[{ total }]] = await p.query(
    `SELECT COUNT(*) AS total FROM endangered_cards ${whereSql}`,
    params
  );

  // Query paginated rows
  const offset = (page - 1) * pageSize;
  const [rows] = await p.query(
    `
    SELECT
      scientific_name AS id,            -- used by frontend as species_code
      common_name,
      scientific_name,
      conservation_status,
      distribution,
      image        AS image_url,
      sources      AS source
    FROM endangered_cards
    ${whereSql}
    ORDER BY ${sort} ${order}
    LIMIT ? OFFSET ?
    `,
    [...params, pageSize, offset]
  );

  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    items: rows,
  };
}

export async function getEndangeredById(id) {
  const p = pool();
  const [rows] = await p.query(
    `
    SELECT
      scientific_name AS id,
      common_name,
      scientific_name,
      conservation_status,
      distribution,
      image   AS image_url,
      sources AS source
    FROM endangered_cards
    WHERE scientific_name = ?
    `,
    [id]
  );
  return rows[0] || null;
}