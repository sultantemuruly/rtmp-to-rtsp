import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const INPUT_RTMP = 'rtmp://localhost:1935/live/stream';
const OUTPUT_HLS_DIR = './media/live/stream';
const OUTPUT_HLS_FILE = `${OUTPUT_HLS_DIR}/index.m3u8`;

const hlsDir = './media/live/stream';

function cleanHlsDirectory() {
  if (fs.existsSync(hlsDir)) {
    fs.readdirSync(hlsDir).forEach(file => {
      fs.unlinkSync(path.join(hlsDir, file));
    });
    console.log('✅ Cleaned old HLS files.');
  }
}

export function startHlsConversion() {
  cleanHlsDirectory()
  
  fs.mkdirSync(OUTPUT_HLS_DIR, { recursive: true });

  ffmpeg(INPUT_RTMP)
    .addOptions([
      '-c:v libx264',
      '-c:a aac',
      '-f hls',
      '-hls_time 2',
      '-hls_list_size 3',
      '-hls_flags delete_segments'
    ])
    .output(OUTPUT_HLS_FILE)
    .on('start', commandLine => {
      console.log('HLS FFmpeg started with command:', commandLine);
    })
    .on('stderr', line => {
      console.log('HLS FFmpeg log:', line);
    })
    .on('error', (err, stdout, stderr) => {
      console.error('HLS FFmpeg error:', err.message);
    })
    .on('end', () => {
      console.log('HLS stream ended.');
    })
    .run();
}
