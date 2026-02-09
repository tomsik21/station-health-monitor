import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Station Health Monitor", () => {
  it("GET /health returns ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.system).toBeTruthy();
  });

  it("GET /metrics returns prometheus text", async () => {
    const app = createApp();
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.text).toContain("http_requests_total");
  });
});
