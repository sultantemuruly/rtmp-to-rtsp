import React, { useState } from 'react';
import RtmpPlayer from './rtmp-player';

function VideoUploader() {
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video) {
      alert('Please select a video file first.');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);

    setStatus('⏳ Uploading and streaming...');
     setShowPlayer(false);

    try {
      const response = await fetch('http://localhost:4000/stream', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();

      if (response.ok) {
        setStatus(`✅ Success: ${text}`);
        setTimeout(() => setShowPlayer(true), 2000); // give time for HLS segments
      } else {
        setStatus(`❌ Error: ${text}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>📤 Upload & Stream Video</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Upload & Stream
          </button>
        </form>

        {status && <p style={styles.status}>{status}</p>}
      </div>
      {showPlayer && <RtmpPlayer streamKey="stream" />}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  status: {
    marginTop: '1.5rem',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#374151',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem',
    textAlign: 'center',
  },
};

export default VideoUploader;
