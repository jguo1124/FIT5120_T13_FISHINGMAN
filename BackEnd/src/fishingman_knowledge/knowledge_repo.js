import { getPool } from '../services/repo/mysqlPool.js';

const pool = getPool("mock");

export async function getKnowledgeList({ category, sort, page, pageSize }) {
  const where = category ? 'WHERE category = ?' : '';
  const order = sort === 'date_asc'
    ? 'ORDER BY COALESCE(published_at, created_at) ASC, id ASC'
    : 'ORDER BY COALESCE(published_at, created_at) DESC, id DESC';

  const limit = 'LIMIT ? OFFSET ?';
  const params = [];
  if (category) params.push(category);
  params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

  const [rows] = await pool.query(
    `SELECT id, category, title, summary, url, published_at, source, created_at
     FROM resources
     ${where}
     ${order}
     ${limit}`,
    params
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM resources ${where}`,
    category ? [category] : []
  );

  return { items: rows, total: countRows[0].total };
}
