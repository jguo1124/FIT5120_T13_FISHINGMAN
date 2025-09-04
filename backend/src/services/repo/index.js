// src/services/repo/index.js
import * as sql from './sql_Repo.js';

const mode = (process.env.DB_MODE || 'mock').toLowerCase();
export const repo = mode === 'db' ? sql : mock;

export const {
  getSpeciesByCode,
  getZoneByCode,
  getRuleSnapshot,
  getZoneRulesSnapshotAll,
  getZoneMaxRegVersion,
} = repo;

export default repo;
