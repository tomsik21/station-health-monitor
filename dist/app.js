"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("./logger");
const config_1 = require("./config");
const metrics_1 = require("./metrics");
const os_1 = __importDefault(require("os"));
const device_1 = require("./device");
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // structured request logging
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        customLogLevel: function (req, res, err) {
            if (err || res.statusCode >= 500)
                return "error";
            if (res.statusCode >= 400)
                return "warn";
            return "info";
        },
    }));
    // simple request metrics
    app.use((req, res, next) => {
        res.on("finish", () => {
            const route = (req.route && req.route.path) ? String(req.route.path) : "unmatched";
            metrics_1.httpRequestCounter.inc({
                method: req.method,
                route,
                status: String(res.statusCode),
            });
        });
        next();
    });
    (0, device_1.startDeviceSimulation)();
    app.get("/health", async (_req, res) => {
        metrics_1.healthCheckCounter.inc();
        // edge-ish signals (safe + simple)
        const uptimeSec = process.uptime();
        const load = os_1.default.loadavg();
        const freeMem = os_1.default.freemem();
        const totalMem = os_1.default.totalmem();
        res.status(200).json({
            status: "ok",
            service: config_1.config.serviceName,
            env: config_1.config.environment,
            uptimeSec,
            host: {
                hostname: os_1.default.hostname(),
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
        res.status(200).json({ device: (0, device_1.getDeviceState)() });
    });
    app.post("/simulate/fault", (req, res) => {
        const type = String(req.body?.type ?? "");
        const allowed = ["camera_disconnect", "sensor_timeout", "gpu_overheat"];
        if (!allowed.includes(type)) {
            return res.status(400).json({
                status: "error",
                message: `Invalid type. Use one of: ${allowed.join(", ")}`,
            });
        }
        (0, device_1.simulateFault)(type);
        return res.status(200).json({ status: "ok", fault: type });
    });
    app.get("/metrics", async (_req, res) => {
        res.setHeader("Content-Type", metrics_1.register.contentType);
        res.status(200).send(await metrics_1.register.metrics());
    });
    app.get("/", (_req, res) => {
        res.status(200).json({
            service: config_1.config.serviceName,
            endpoints: ["/health", "/metrics"],
        });
    });
    // minimal error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        logger_1.logger.error({ err }, "Unhandled error");
        res.status(500).json({ status: "error" });
    });
    return app;
}
