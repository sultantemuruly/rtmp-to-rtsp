import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';

import { startHlsConversion } from './hls-converter.js';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/live', express.static(path.join(process.cwd(), 'media/live')));

const CONVERTER_SERVER_URL = 'http://localhost:4001';

// RTMP + RTSP Streaming Endpoint
app.post('/stream', upload.single('video'), async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    console.log("[ERROR] No file uploaded");
    return res.status(400).send('No file uploaded');
  }

  const streamKey = 'stream';
  const rtmpUrl = `rtmp://localhost:1935/live/${streamKey}`;

  const ffmpegStream = ffmpeg(filePath)
    .inputOptions('-re')
    .format('flv')
    .videoCodec('libx264')
    .audioCodec('aac')
    .on('start', async command => {
      console.log('[RTMP] FFmpeg started:', command);

      // Start local HLS conversion
      startHlsConversion();

      // Trigger RTSP conversion via HTTP request to converter server
      try {
        const response = await fetch(`${CONVERTER_SERVER_URL}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rtmpUrl, streamKey }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`[RTSP] Failed to start RTSP conversion: ${text}`);
        } else {
          console.log('[RTSP] RTSP conversion started successfully');
        }
      } catch (err) {
        console.error('[RTSP] Error triggering RTSP conversion:', err);
      }
    })
    .on('stderr', line => {
      console.log('[RTMP] FFmpeg STDERR:', line);
    })
    .on('end', async () => {
      console.log('[RTMP] Streaming finished.');

      // Stop RTSP conversion when streaming ends
      try {
        const stopResponse = await fetch(`${CONVERTER_SERVER_URL}/stop`, { method: 'POST' });
        if (!stopResponse.ok) {
          const text = await stopResponse.text();
          console.error(`[RTSP] Failed to stop RTSP conversion: ${text}`);
        } else {
          console.log('[RTSP] RTSP conversion stopped successfully');
        }
      } catch (err) {
        console.error('[RTSP] Error stopping RTSP conversion:', err);
      }

      fs.unlinkSync(filePath);
      res.send('Streaming and conversion completed.');
    })
    .on('error', err => {
      console.error('[RTMP] Streaming error:', err);
      res.status(500).send('Error during RTMP streaming.');
    });

  ffmpegStream.output(rtmpUrl).run();
});

app.listen(4000, () => {
  console.log('[SERVER] Express running at http://localhost:4000');
});
