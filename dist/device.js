"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceState = getDeviceState;
exports.simulateFault = simulateFault;
exports.startDeviceSimulation = startDeviceSimulation;
const logger_1 = require("./logger");
const metrics_1 = require("./metrics");
const state = {
    connected: true,
};
metrics_1.deviceConnectedGauge.set(1);
function getDeviceState() {
    return state;
}
function simulateFault(type) {
    const now = new Date().toISOString();
    state.lastFault = { type, at: now };
    metrics_1.faultsCounter.inc({ type });
    // A simple fault effect:
    // camera_disconnect -> device goes offline for a bit
    if (type === "camera_disconnect") {
        state.connected = false;
        metrics_1.deviceConnectedGauge.set(0);
        logger_1.logger.warn({ type }, "Simulated device disconnect");
        setTimeout(() => {
            state.connected = true;
            metrics_1.deviceConnectedGauge.set(1);
            logger_1.logger.info("Simulated device reconnected");
        }, 3000).unref();
        return;
    }
    // Other faults: keep connected but log them
    logger_1.logger.warn({ type }, "Simulated fault");
}
// Background jitter to feel “edge-like”
function startDeviceSimulation() {
    const intervalMs = 15000;
    const timer = setInterval(() => {
        // tiny random drift: once in a while flip connected for 1s
        if (Math.random() < 0.05) {
            state.connected = false;
            metrics_1.deviceConnectedGauge.set(0);
            logger_1.logger.warn("Simulated brief device blip");
            setTimeout(() => {
                state.connected = true;
                metrics_1.deviceConnectedGauge.set(1);
                logger_1.logger.info("Device recovered from blip");
            }, 1000).unref();
        }
    }, intervalMs);
    timer.unref();
    logger_1.logger.info({ intervalMs }, "Device simulation started");
}
