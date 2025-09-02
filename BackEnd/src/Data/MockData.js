// Version number is used to build ETag: change it when data changes
export const REG_VERSION = 46; // 每次改数据 +1

// Minimal species metadata
export const SPECIES_META = {
  snapper: { code: "snapper", common_name: "Snapper" },
  garfish: { code: "garfish", common_name: "Garfish" }
};

// Per-species, per-zone rules
// Fields: size_limits, quotas (and its season_window), seasons (closed ranges)
export const MOCK = {
  snapper: {
    "VIC-BAY": {
      size_limits: { min_cm: 28, max_cm: null },
      quotas: {
        daily_limit: 3,
        seasonal_limit: 10,
        season_window: { start: "2025-11-01", end: "2026-03-31" }
      },
      seasons: [{ from: "2025-09-01", to: "2025-10-15" }]
    },
    "VIC-OFF": {
      size_limits: { min_cm: 30, max_cm: null },
      quotas: {
        daily_limit: 5,
        seasonal_limit: 12,
        season_window: { start: "2025-12-01", end: "2026-03-15" }
      },
      seasons: []
    }
  },
  garfish: {
    "VIC-BAY": {
      // No size_limit → placeholder
      quotas: { daily_limit: 20, seasonal_limit: null },
      seasons: []
    },
    "VIC-OFF": { quotas: null, seasons: [] }
  }
};

// Zone-level restrictions (Combination of Regulations dataset, simplified)
export const ZONE_RESTRICTIONS = {
  "VIC-BAY": [
    {
      code: "NO_NETTING",
      category: "Restriction",
      title: "No netting within marina area",
      details: "Cast nets and gill nets are prohibited inside the marked marina boundary.",
      effective_from: "2025-01-01",
      effective_to: null,
      references: ["https://example.org/vic-bay/marina"]
      // 没有 species_codes => 对 VIC-BAY 所有物种
    },
    // 仅对 snapper 生效（9-10 月）
    {
      code: "SNAPPER_NURSERY_PROHIBITION",
      category: "Species Restriction",
      title: "No targeting snapper in nursery area",
      details:
        "Targeted fishing for snapper is prohibited within the nursery area; incidental catch must be released.",
      effective_from: "2025-09-01",
      effective_to: "2025-10-31",
      references: ["https://example.org/vic-bay/snapper-nursery"],
      species_codes: ["snapper"]
    }
  ],
  "VIC-OFF": [
    {
      code: "OFFSHORE_REEF_NET_BAN",
      category: "Prohibited Gear",
      title: "Seasonal net ban around offshore reefs",
      details:
        "Use of gill nets is prohibited within 500m of reef markers during summer.",
      effective_from: "2025-12-01",
      effective_to: "2026-02-28",
      references: ["https://example.org/vic-off/reef-net-ban"]
      // 没有 species_codes => 对 VIC-OFF 所有物种
    }
  ]
};
