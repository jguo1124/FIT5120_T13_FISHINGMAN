import { getPool } from "../services/repo/mysqlPool.js";

const MAX_PAGE_SIZE = Number.parseInt(process.env.PROTECTED_MAX_PAGE_SIZE || "50", 10);

function pool() {
  return getPool("mock");
}

export async function listEndangered({
  q = "",
  page = 1,
  pageSize = 12,
  status = "",
  sort = "common_name",
  order = "asc",
}) {
  const p = pool();

  const safePage = Number.isFinite(page) ? Math.max(Math.trunc(page), 1) : 1;
  const requestedSize = Number.isFinite(pageSize) ? Math.max(Math.trunc(pageSize), 1) : 12;
  const safePageSize = Math.min(requestedSize, MAX_PAGE_SIZE);

  const sortWhitelist = new Set([
    "common_name",
    "scientific_name",
    "conservation_status",
  ]);
  sort = sortWhitelist.has(sort) ? sort : "common_name";
  order = order.toLowerCase() === "desc" ? "DESC" : "ASC";

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

  const [[{ total }]] = await p.query(
    `SELECT COUNT(*) AS total FROM endangered_cards ${whereSql}`,
    params
  );

  const offset = (safePage - 1) * safePageSize;
  const [rows] = await p.query(
    `
    SELECT
      scientific_name AS id,
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
    [...params, safePageSize, offset]
  );

  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: safePageSize > 0 ? Math.ceil(total / safePageSize) : 0,
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
