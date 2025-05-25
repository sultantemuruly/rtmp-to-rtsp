# RTMP to RTSP Converter

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
   - [Frontend](#frontend)
   - [RTMP Server](#rtmp-server)
   - [RTSP Converter](#rtsp-converter)
   - [Launcher Script (`launch.js`)](#launcher-script-launchjs)
4. [Technologies](#technologies)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Usage](#usage)
   - [Uploading and Streaming via RTMP](#uploading-and-streaming-via-rtmp)
   - [Accessing the RTSP Stream](#accessing-the-rtsp-stream)
   - [Starting All Services with `launch.js`](#starting-all-services-with-launchjs)
9. [Directory Structure](#directory-structure)
10. [Logging and Monitoring](#logging-and-monitoring)
11. [Support for Multiple Streams](#support-for-multiple-streams)
12. [Future Improvements](#future-improvements)

---

## Overview
This project implements a full-featured pipeline to convert RTMP video streams into RTSP format. It consists of:
- A web-based **Frontend** for uploading video files.
- An **RTMP Server** to ingest and publish RTMP streams.
- An **RTSP Converter** to pull RTMP streams and re-publish them as RTSP.
- A **Launcher Script (`launch.js`)** to start all components with a single command.

## Architecture
The system has four main services:
1. **Frontend** – Web UI for uploading videos.
2. **RTMP Server** – Ingests video via RTMP and publishes at `rtmp://<host>:1935/live/<streamKey>`.
3. **RTSP Converter** – Pulls from RTMP and publishes at `rtsp://<host>:8554/live/<streamKey>`.
4. **Launcher** – A Node.js script in `/backend` that starts the RTMP server, the converter, and the MediaMTX process.

![Architecture Diagram](architecture-diagram.png)

## Components

### Frontend
- **Location**: `/frontend`
- **Function**: Displays an upload form; on submit, sends the video to the backend for RTMP streaming.
- **Key Files**:
  - `src/App.js` – Main React component for file upload.
  - `public/index.html`, static assets.

### RTMP Server
- **Location**: `/backend/rtmp-server`
- **Function**: Uses **NodeMediaServer** to accept RTMP publishes and trigger FFmpeg to push the uploaded file as a stream.
- **Key Files**:
  - `server.js` – Configures and starts the RTMP server on port 1935.
  - `app.js` – HTTP endpoints for managing uploads and invoking FFmpeg.

### RTSP Converter
- **Location**: `/backend/rtsp-converter`
- **Function**: Uses **MediaMTX** and FFmpeg to pull from RTMP and re-publish the same stream as RTSP.
- **Key Files**:
  - `converter.js` – Spawns FFmpeg process to transcode (or copy) from RTMP to RTSP.
  - `server.js` – Express API reporting status.
  - `mediamtx.yml` – Configuration for MediaMTX server.

### Launcher Script (`launch.js`)
- **Location**: `/backend/launch.js`
- **Function**: Starts all services with one command:
  1. `node server.js` & `node app.js` in `/backend/rtmp-server`
  2. `node server.js` in `/backend/rtsp-converter`
  3. `mediamtx mediamtx.yml` in `/backend`
- **Features**:
  - Logs each child process startup and exit.
  - Pipes `stdout`/`stderr` of services to the console.
  - Handles `SIGINT`/`SIGTERM` for graceful shutdown.

```javascript
// Example invocation:
// cd backend
// node launch.js
```

## Technologies
- **Node.js** (v14+)
- **Express.js**
- **NodeMediaServer**
- **FFmpeg**
- **MediaMTX**
- **Docker** & **Docker Compose**

## Prerequisites
- **Node.js** & **npm** (for local development)
- **Docker** & **Docker Compose** (for containerized deployment)
- **FFmpeg** and **MediaMTX** installed system-wide (available in `$PATH`)

## Installation
1. **Clone the repo**:
   ```bash
   git clone https://github.com/sultantemuruly/rtmp-to-rtsp.git
   cd rtmp-to-rtsp
   ```
2. **Install dependencies**:
   - **Monorepo approach** (root-level `package.json` with workspaces):
     ```bash
     npm install
     ```
   - Or **per-service**:
     ```bash
     cd backend/rtmp-server && npm install
     cd ../rtsp-converter && npm install
     ```
3. **Run via Docker Compose** *(optional)*:
   ```bash
   docker-compose up --build -d
   ```

## Configuration
- **Frontend**: Adjust API endpoint in `frontend/src/config.js`.
- **RTMP Server**: Edit `backend/rtmp-server/server.js` for port or app settings.
- **RTSP Converter**: Update `backend/rtsp-converter/mediamtx.yml` for RTSP port, RTMP sources.
- **Launcher**: Ensure `mediamtx` binary is in `$PATH` for `launch.js`.

## Usage

### Uploading and Streaming via RTMP
1. Start services:
   ```bash
   cd backend
   node launch.js
   ```
2. Open frontend:
   ```bash
   http://localhost:3000
   ```
3. Upload a video; RTMP publish will begin automatically.

### Accessing the RTSP Stream
Use VLC or `ffplay`:
```bash
ffplay rtsp://localhost:8554/live/<streamKey>
```

### Starting All Services with `launch.js`
Instead of running each folder manually:
```bash
cd backend
node launch.js
```
All your RTMP, RTSP, and MediaMTX processes will launch together.

## Directory Structure
```
rtmp-to-rtsp/
├── backend/
│   ├── launch.js
│   ├── mediamtx.yml
│   ├── rtmp-server/
│   └── rtsp-converter/
├── frontend/
└── docker-compose.yml
```

## Logging and Monitoring
- **Console output** shows tagged logs:
  - `[RTMP] FFmpeg STDERR:` for RTMP push
  - `[RTSP] FFmpeg STDERR:` for RTSP conversion
  - `[launcher]` for service lifecycle
- **Docker logs** *(if used)*:
  ```bash
  docker-compose logs -f
  ```

## Support for Multiple Streams
- Generates a unique `streamKey` per upload.
- All services handle multiple concurrent streams without key collisions.

## Future Improvements
- Authentication & stream access control
- Web dashboard for live stream management
- Metrics integration (Prometheus/Grafana)
- Automatic cleanup of inactive streams

