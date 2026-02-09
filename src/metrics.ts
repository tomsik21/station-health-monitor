import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

export const healthCheckCounter = new client.Counter({
  name: "health_checks_total",
  help: "Total health checks",
  registers: [register],
});

// NEW: station-style metrics
export const deviceConnectedGauge = new client.Gauge({
  name: "station_device_connected",
  help: "Whether the simulated station device is connected (1) or disconnected (0)",
  registers: [register],
});

export const faultsCounter = new client.Counter({
  name: "station_faults_total",
  help: "Total simulated station faults",
  labelNames: ["type"] as const,
  registers: [register],
});
