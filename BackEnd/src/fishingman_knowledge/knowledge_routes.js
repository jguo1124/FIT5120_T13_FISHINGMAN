import express from 'express';
import { fetchKnowledgeList } from './knowledge_service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await fetchKnowledgeList(req.query);
    res.json(result);
  } catch (err) {
    console.error('[GET /knowledge] error:', err.message);
    res.status(400).json({ error: err.message || 'Invalid request' });
  }
});

export default router;
