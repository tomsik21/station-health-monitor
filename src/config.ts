export const config = {
  port: parseInt(process.env.PORT ?? "8080", 10),
  serviceName: process.env.SERVICE_NAME ?? "station-health-monitor",
  environment: process.env.NODE_ENV ?? "development",
};
