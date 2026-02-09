"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faultsCounter = exports.deviceConnectedGauge = exports.healthCheckCounter = exports.httpRequestCounter = exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: exports.register });
exports.httpRequestCounter = new prom_client_1.default.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [exports.register],
});
exports.healthCheckCounter = new prom_client_1.default.Counter({
    name: "health_checks_total",
    help: "Total health checks",
    registers: [exports.register],
});
// NEW: station-style metrics
exports.deviceConnectedGauge = new prom_client_1.default.Gauge({
    name: "station_device_connected",
    help: "Whether the simulated station device is connected (1) or disconnected (0)",
    registers: [exports.register],
});
exports.faultsCounter = new prom_client_1.default.Counter({
    name: "station_faults_total",
    help: "Total simulated station faults",
    labelNames: ["type"],
    registers: [exports.register],
});
