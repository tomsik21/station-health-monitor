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

## Frontend Dashboard
A simple React + TypeScript dashboard that connects to the backend and visualizes station state.

**Features:**
- Live health and device status
- Fault injection controls
- Station metrics preview
- Client-side image recognition demo (MobileNet, runs in browser)

The frontend communicates with the backend over HTTP and is designed to resemble an internal station monitoring UI.


## Endpoints
- `GET /` — service info
- `GET /health` — runtime + host health snapshot
- `GET /device` — simulated station device state
- `POST /simulate/fault` — inject a simulated fault (`camera_disconnect`, `sensor_timeout`, `gpu_overheat`)
- `GET /metrics` — Prometheus metrics

## Run (single port: backend serves frontend)
From repo root:

- cd station-health-ui
- npm install
- npm run build
- cd ..
- npm install
- npm run build
- npm start

Then open: http://localhost:8080
API is available at: http://localhost:8080/health

## Dev mode (two servers)
### Backend
- npm install
- npm run dev

### Frontend
- cd station-health-ui
- npm install
- npm run dev

