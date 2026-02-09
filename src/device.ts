import { logger } from "./logger";
import { deviceConnectedGauge, faultsCounter } from "./metrics";

export type FaultType = "camera_disconnect" | "sensor_timeout" | "gpu_overheat";

type DeviceState = {
  connected: boolean;
  lastFault?: { type: FaultType; at: string };
};

const state: DeviceState = {
  connected: true,
};

deviceConnectedGauge.set(1);

export function getDeviceState() {
  return state;
}

export function simulateFault(type: FaultType) {
  const now = new Date().toISOString();
  state.lastFault = { type, at: now };
  faultsCounter.inc({ type });

  // A simple fault effect:
  // camera_disconnect -> device goes offline for a bit
  if (type === "camera_disconnect") {
    state.connected = false;
    deviceConnectedGauge.set(0);
    logger.warn({ type }, "Simulated device disconnect");

    setTimeout(() => {
      state.connected = true;
      deviceConnectedGauge.set(1);
      logger.info("Simulated device reconnected");
    }, 3000).unref();
    return;
  }

  // Other faults: keep connected but log them
  logger.warn({ type }, "Simulated fault");
}

// Background jitter to feel “edge-like”
export function startDeviceSimulation() {
  const intervalMs = 15000;

  const timer = setInterval(() => {
    // tiny random drift: once in a while flip connected for 1s
    if (Math.random() < 0.05) {
      state.connected = false;
      deviceConnectedGauge.set(0);
      logger.warn("Simulated brief device blip");

      setTimeout(() => {
        state.connected = true;
        deviceConnectedGauge.set(1);
        logger.info("Device recovered from blip");
      }, 1000).unref();
    }
  }, intervalMs);

  timer.unref();
  logger.info({ intervalMs }, "Device simulation started");
}
