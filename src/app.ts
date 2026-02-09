import express, { Request, Response, NextFunction } from "express";
import pinoHttp from "pino-http";
import { logger } from "./logger";
import { config } from "./config";
import { register, httpRequestCounter, healthCheckCounter } from "./metrics";
import os from "os";
import { getDeviceState, simulateFault, startDeviceSimulation, FaultType } from "./device";


export function createApp() {
  const app = express();

  app.use(express.json());

  // structured request logging
  app.use(
    pinoHttp({
      logger,
      customLogLevel: function (req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    })
  );

  // simple request metrics
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      const route = (req.route && req.route.path) ? String(req.route.path) : "unmatched";
      httpRequestCounter.inc({
        method: req.method,
        route,
        status: String(res.statusCode),
      });
    });
    next();
  });

   startDeviceSimulation();

  app.get("/health", async (_req, res) => {
    healthCheckCounter.inc();

    // edge-ish signals (safe + simple)
    const uptimeSec = process.uptime();
    const load = os.loadavg();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();

    res.status(200).json({
      status: "ok",
      service: config.serviceName,
      env: config.environment,
      uptimeSec,
      host: {
        hostname: os.hostname(),
        platform: process.platform,
        arch: process.arch,
      },
      system: {
        load1: load[0],
        load5: load[1],
        load15: load[2],
        memFreeBytes: freeMem,
        memTotalBytes: totalMem,
      },
      timestamp: new Date().toISOString(),
    });
  });

    app.get("/device", (_req, res) => {
    res.status(200).json({ device: getDeviceState() });
  });

  app.post("/simulate/fault", (req, res) => {
    const type = String(req.body?.type ?? "") as FaultType;

    const allowed: FaultType[] = ["camera_disconnect", "sensor_timeout", "gpu_overheat"];
    if (!allowed.includes(type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid type. Use one of: ${allowed.join(", ")}`,
      });
    }

    simulateFault(type);
    return res.status(200).json({ status: "ok", fault: type });
  });

  app.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", register.contentType);
    res.status(200).send(await register.metrics());
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      service: config.serviceName,
      endpoints: ["/health", "/metrics"],
    });
  });

  // minimal error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ status: "error" });
  });

  return app;
}
