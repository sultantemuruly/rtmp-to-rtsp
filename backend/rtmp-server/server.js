import NodeMediaServer from 'node-media-server';

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 10,
    ping_timeout: 60,
    host: '0.0.0.0',
  },
  http: {
    port: 8000,
    allow_origin: '*',
    host: '0.0.0.0',
  },
  trans: {
    ffmpeg: "/opt/homebrew/Cellar/ffmpeg/7.1.1_2/bin/ffmpeg",
    mediaRoot: "./media",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
        hlsKeep: false,
      },
    ],
  },
};

const nms = new NodeMediaServer(config);

console.log('[SERVER STARTING] CONFIG:', JSON.stringify(config, null, 2));

nms.run();
