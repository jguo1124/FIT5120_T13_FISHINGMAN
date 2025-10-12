// src/Endangered_species/routes.js
import { Router } from 'express';
import { listEndangered, getEndangeredById } from './repo.js';

const r = Router();

r.get('/species', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.max(parseInt(req.query.pageSize || '12', 10), 1);
    const q = (req.query.q || '').trim();
    const status = (req.query.status || '').trim(); 
    const data = await listEndangered({ q, page, pageSize, status });
    res.json(data); // { items, page, pageSize, total, totalPages }
  } catch (e) { next(e); }
});

r.get('/species/:id', async (req, res, next) => {
  try {
    const row = await getEndangeredById(req.params.id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(row);
  } catch (e) { next(e); }
});

export default r;
