import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import cors from 'cors';
import path from 'path';

import { startHlsConversion } from './hls-converter.js';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use('/live', express.static(path.join(process.cwd(), 'media/live')));

app.post('/stream', upload.single('video'), (req, res) => {
  const filePath = req.file.path;

  if (!req.file) {
    console.log("No file uploaded")
    return res.status(400).send('No file uploaded');
  }

  const rtmpUrl = 'rtmp://localhost:1935/live/stream';

  const ffmpegStream = ffmpeg(filePath)
    .inputOptions('-re')
    .format('flv')
    .videoCodec('libx264')
    .audioCodec('aac')
    .on('start', cmd => {
      console.log('FFmpeg started: ', cmd);
      startHlsConversion();
    })
    .on('stderr', stderrLine => {
      console.log('FFmpeg STDERR:', stderrLine);
    })
    .on('end', () => {
      console.log('Streaming finished.');
      fs.unlinkSync(filePath);
      res.send('Streaming done.');
    })
    .on('error', err => {
      console.error('Streaming error:', err);
      res.status(500).send('Error during streaming.');
    });

  ffmpegStream.output(rtmpUrl).run();
});

app.listen(4000, () => {
  console.log('Express server running on http://localhost:4000');
});
