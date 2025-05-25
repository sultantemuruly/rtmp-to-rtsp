// for now just sending test video

import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

const form = new FormData();
form.append('video', fs.createReadStream('./test-video.mp4'));

fetch('http://localhost:4000/stream', {
  method: 'POST',
  body: form,
  headers: form.getHeaders(),
})
  .then(res => res.text())
  .then(body => console.log('Response from /stream:', body))
  .catch(err => console.error('Upload failed:', err));
