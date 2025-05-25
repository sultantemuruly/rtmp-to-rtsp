// launch.js (place this file in the /backend folder)
const { spawn } = require('child_process');
const path = require('path');

// Keep track of child processes for cleanup
const children = [];

/**
 * Starts a subprocess and pipes its output to the parent console
 * @param {string} label  - Friendly name for the process
 * @param {string} cmd    - Executable command
 * @param {string[]} args - Arguments for the command
 * @param {string} cwd    - Working directory for the process
 */
function startProcess(label, cmd, args, cwd) {
  console.log(`[launcher] Starting ${label} in ${cwd}`);
  const proc = spawn(cmd, args, { cwd, stdio: 'inherit' });
  children.push(proc);

  proc.on('exit', (code, signal) => {
    const msg = signal
      ? `${label} killed by signal: ${signal}`
      : `${label} exited with code: ${code}`;
    console.log(`[launcher] ${msg}`);
  });
  proc.on('error', (err) => {
    console.error(`[launcher] ${label} failed to start:`, err);
  });
}

/**
 * Gracefully shut down all spawned subprocesses
 */
function shutdown() {
  console.log('[launcher] Shutting down all child processes...');
  children.forEach((proc) => {
    if (!proc.killed) proc.kill('SIGTERM');
  });
  process.exit();
}

// Handle termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Entry point
function main() {
  // __dirname points to /backend when this file is placed there
  const rootDir = __dirname;

  // 1. RTMP server: run server.js and app.js in /backend/rtmp-server
  const rtmpBase = path.join(rootDir, 'rtmp-server');
  startProcess('RTMP Server (server.js)', 'node', ['server.js'], rtmpBase);
  startProcess('RTMP App    (app.js)',   'node', ['app.js'],   rtmpBase);

  // 2. RTSP converter: run server.js in /backend/rtsp-converter
  const rtspBase = path.join(rootDir, 'rtsp-converter');
  startProcess('RTSP Converter (server.js)', 'node', ['server.js'], rtspBase);

  // 3. MediaMTX: launch in /backend with the config file
  startProcess('MediaMTX', 'mediamtx', ['mediamtx.yml'], rootDir);
}

main();
