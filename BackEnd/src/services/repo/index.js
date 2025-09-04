import * as sql from "./sql_Repo.js";


export const repo = sql;

export const {
  getSpeciesByCode,
  getZoneByCode,
  getRuleSnapshot,
  getZoneRulesSnapshotAll,
  getZoneMaxRegVersion,
} = sql;

export default sql;