import ffmpeg from 'fluent-ffmpeg';

let currentProcess = null;

export function startRtspConversion(rtmpUrl, streamKey = 'stream') {
  const rtspUrl = `rtsp://localhost:8554/live/${streamKey}`;

  const command = ffmpeg(rtmpUrl)
    .output(rtspUrl)
    .outputOptions([
      '-c:v copy',
      '-c:a copy',
      '-f rtsp',
      '-rtsp_transport tcp',
    ])
    .on('start', commandLine => {
      console.log('FFmpeg started:', commandLine);
    })
    .on('stderr', stderrLine => {
      console.log('FFmpeg stderr:', stderrLine);
    })
    .on('error', (err, stdout, stderr) => {
      console.error('FFmpeg error:', err.message);
      currentProcess = null;
    })
    .on('end', () => {
      console.log('FFmpeg finished');
      currentProcess = null;
    });

  currentProcess = command.run();

  return currentProcess;
}

export function stopRtspConversion(process) {
  if (process) {
    process.kill('SIGINT');
    currentProcess = null;
    console.log('RTSP conversion stopped');
  }
}

export function getStatus() {
  return currentProcess ? 'running' : 'stopped';
}
