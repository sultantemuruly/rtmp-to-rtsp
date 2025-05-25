import express from 'express';
import cors from 'cors';
import { startRtspConversion, stopRtspConversion, getStatus } from './converter.js';

const app = express();
app.use(cors());
app.use(express.json());

let conversionProcess = null;

// Health check route for browser or curl
app.get('/', (req, res) => {
  res.send('RTSP Converter Server is running.');
});

app.post('/start', (req, res) => {
  const { rtmpUrl, streamKey } = req.body;
  if (!rtmpUrl) return res.status(400).send('Missing rtmpUrl');
  if (conversionProcess) return res.status(400).send('Conversion already running');

  conversionProcess = startRtspConversion(rtmpUrl, streamKey);
  res.send('RTSP conversion started');
});

app.post('/stop', (req, res) => {
  if (!conversionProcess) return res.status(400).send('No conversion running');

  stopRtspConversion(conversionProcess);
  conversionProcess = null;
  res.send('RTSP conversion stopped');
});

app.get('/status', (req, res) => {
  res.json({ status: getStatus() });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`RTSP converter server running on http://localhost:${PORT}`);
});
