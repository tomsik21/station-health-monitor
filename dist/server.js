"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./logger");
const app = (0, app_1.createApp)();
const server = http_1.default.createServer(app);
server.listen(config_1.config.port, () => {
    logger_1.logger.info({ port: config_1.config.port }, "Server listening");
});
function shutdown(signal) {
    logger_1.logger.info({ signal }, "Shutdown started");
    server.close((err) => {
        if (err) {
            logger_1.logger.error({ err }, "Error during shutdown");
            process.exit(1);
        }
        logger_1.logger.info("Shutdown complete");
        process.exit(0);
    });
    // hard stop (edge-friendly)
    setTimeout(() => {
        logger_1.logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
