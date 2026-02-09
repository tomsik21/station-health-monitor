import http from "http";
import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./logger";

const app = createApp();
const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info({ port: config.port }, "Server listening");
});

function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown started");
  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during shutdown");
      process.exit(1);
    }
    logger.info("Shutdown complete");
    process.exit(0);
  });

  // hard stop (edge-friendly)
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
