# Station Health Monitor 

A lightweight edge-inspired monitoring service that exposes system health, Prometheus metrics, simulated device state, and a React dashboard — designed to resemble reliability patterns used in factory-floor station applications.

## Overview
This project demonstrates:
- Edge-style system monitoring
- Device fault simulation
- Observability with Prometheus metrics
- Structured logging
- Single-port deployment (API + UI)
- Clean clone-and-run setup
It is designed as a minimal, production-style example of how in-factory or on-premise stations can expose health, metrics, and fault states for monitoring and debugging.

## Features
Backend (TypeScript + Node.js)
- GET /health — runtime + host snapshot
- GET /device — simulated station device state
- POST /simulate/fault — inject device faults
- GET /metrics — Prometheus metrics endpoint
- Structured logging (pino)
- Graceful shutdown handling
- Docker support

Frontend (React + TypeScript)
- Live health and device status
- Fault injection controls
- Prometheus station metrics preview
- Client-side image recognition demo (MobileNet running in-browser)

**Features:**
- Live health and device status
- Fault injection controls
- Station metrics preview
- Client-side image recognition demo (MobileNet, runs in browser)

## Architecture
- Express backend serves REST API
- Prometheus metrics exposed at /metrics
- React frontend built with Vite
- Backend serves the built frontend for single-port deployment
Everything runs on port 8080 in production mode.

## Quickstart (Single-Port Mode)
From the repository root:
1. Install dependencies
- npm install

2. Start everything (builds frontend + backend automatically)
- npm run start:all

3. Open in browser
- http://localhost:8080

## Endpoints
- `GET /` — service info
- `GET /health` — runtime + host health snapshot
- `GET /device` — simulated station device state
- `POST /simulate/fault` — inject a simulated fault (`camera_disconnect`, `sensor_timeout`, `gpu_overheat`)
- `GET /metrics` — Prometheus metrics

## Dev mode (two servers)
### Backend
- npm install
- npm run dev

### Frontend
- cd station-health-ui
- npm install
- npm run dev

## Docker
Build:
- docker build -t station-health-monitor .
Run:
- docker run -p 8080:8080 station-health-monitor

## Why This Project?
This project simulates reliability patterns common in:
- Edge computing environments
- Factory-floor inspection stations
- Camera-based monitoring systems
- On-prem inference nodes
- Long-running device monitoring services
It demonstrates ownership of:
- Observability design
- Health modeling
- Fault injection patterns
- Frontend-backend integration
- Production-style setup hygiene

## Tech Stack
- TypeScript
- Node.js
- Express
- React
- Prometheus (prom-client)
- Pino
- Docker
- Vite


