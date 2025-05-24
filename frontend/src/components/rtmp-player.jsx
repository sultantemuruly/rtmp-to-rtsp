import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const RtmpPlayer = ({ streamKey = 'stream' }) => {
  const videoRef = useRef(null);
  const streamUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });

      return () => hls.destroy();
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play();
      });
    }
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      style={{ width: '100%', borderRadius: '10px', marginTop: '1rem' }}
    />
  );
};

export default RtmpPlayer;
