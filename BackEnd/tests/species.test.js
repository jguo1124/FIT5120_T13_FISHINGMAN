import request from "supertest";
import app from "../src/app.js";

describe("EPIC1 - Species API Tests", () => {
  // US1.1 - Size Limits
  test("AC1.1 - Snapper (VIC-BAY) 返回 min/max", async () => {
    const res = await request(app)
      .get("/api/v1/species/snapper")
      .query({ zone: "VIC-BAY" });

    console.log("AC1.1 Response:", res.body);   
    expect(res.status).toBe(200);
    expect(res.body.size_limits).toBeDefined();
    expect(
      res.body.size_limits.min_cm !== null || res.body.size_limits.max_cm !== null
    ).toBe(true);
  });

  test("AC1.3 - Garfish (VIC-BAY) 无尺寸 → 占位文案", async () => {
    const res = await request(app)
      .get("/api/v1/species/garfish")
      .query({ zone: "VIC-BAY" });

    console.log("AC1.3 Response:", res.body);
    expect(res.status).toBe(200);
    expect(res.body.size_limits.message).toMatch(/No size limit available/i);
  });

  test("AC4.2 - 未传 zone → 400 错误", async () => {
    const res = await request(app).get("/api/v1/species/snapper");

    console.log("AC4.2 Response:", res.body);
    expect(res.status).toBe(400);
    expect(res.body.requires_zone).toBe(true);
  });

  // AC2.2 - 配额随分区变化
  test("AC2.2 - Snapper VIC-BAY vs VIC-OFF 配额不同", async () => {
    const bay = await request(app)
      .get("/api/v1/species/snapper")
      .query({ zone: "VIC-BAY" });
    const off = await request(app)
      .get("/api/v1/species/snapper")
      .query({ zone: "VIC-OFF" });

    console.log("AC2.2 BAY Response:", bay.body);
    console.log("AC2.2 OFF Response:", off.body);
    expect(bay.body.quotas.daily_limit).not.toEqual(off.body.quotas.daily_limit);
  });

  // AC3.1 - 封季检查
  test("AC3.1 - Snapper (VIC-BAY, 2025-09-10) → Closed Season", async () => {
    const res = await request(app)
      .get("/api/v1/species/snapper")
      .query({ zone: "VIC-BAY", onDate: "2025-09-10" });

    console.log("AC3.1 Response:", res.body);
    expect(res.body.season.ui_badge).toBe("Closed Season");
  });

  
  test("AC5.1 - 响应包含四类规则 (size, quotas, season, zone)", async () => {
    const res = await request(app)
      .get("/api/v1/species/snapper")
      .query({ zone: "VIC-BAY" });

    console.log("AC5.1 Response:", res.body);
    expect(res.body).toHaveProperty("size_limits");
    expect(res.body).toHaveProperty("quotas");
    expect(res.body).toHaveProperty("season");
    expect(res.body).toHaveProperty("zone");
  });
});
