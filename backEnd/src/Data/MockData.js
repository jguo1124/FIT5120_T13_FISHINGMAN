export const REG_VERSION = 42; 

export const MOCK = {
  // Snapper
  snapper: {
    "VIC-BAY": {
      size_limits: { min_cm: 28, max_cm: null },                  // AC1.1
      quotas: { daily_limit: 3, seasonal_limit: 10,
                season_window: { start: "2025-11-01", end: "2026-03-31" } }, // AC2.1
      seasons: [ { from: "2025-09-01", to: "2025-10-15" } ]       //  AC3.1/3.2
    },
    "VIC-OFF": {
      size_limits: { min_cm: 30, max_cm: null },
      quotas: { daily_limit: 2, seasonal_limit: 6,
                season_window: { start: "2025-11-15", end: "2026-02-28" } }, // AC2.2
      seasons: [ { from: "2025-08-20", to: "2025-09-20" } ]
    }
  },

  // Garfish
  garfish: {
    "VIC-BAY": {
      size_limits: { min_cm: null, max_cm: null },                
      quotas: { daily_limit: null, seasonal_limit: null },         
      seasons: []                                                 
    },
    "VIC-OFF": {
      size_limits: { min_cm: 20, max_cm: 35 },
      quotas: { daily_limit: null, seasonal_limit: 50,
                season_window: { start: "2025-12-01", end: "2026-01-31" } },
      seasons: []
    }
  }
};


export const SPECIES_META = {
  snapper: { code: "snapper", common_name: "Snapper" },
  garfish: { code: "garfish", common_name: "Garfish" }
};
