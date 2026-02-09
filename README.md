# Station Health Monitor (TypeScript + Node.js)

A lightweight, edge-inspired service that exposes station health + Prometheus metrics and simulates device faults.  
Built to demonstrate reliability patterns used in factory-floor / station applications.

## Features
- Health endpoint with host/runtime snapshot (`/health`)
- Prometheus metrics (`/metrics`)
- Simulated device state (`/device`)
- Fault injection to test failure handling (`/simulate/fault`)
- Structured logging (pino)
- Dockerized build/run
- Graceful shutdown (SIGINT/SIGTERM)

## Endpoints
- `GET /` — service info
- `GET /health` — runtime + host health snapshot
- `GET /device` — simulated station device state
- `POST /simulate/fault` — inject a simulated fault (`camera_disconnect`, `sensor_timeout`, `gpu_overheat`)
- `GET /metrics` — Prometheus metrics

## Run locally
```bash
npm install
npm run dev
