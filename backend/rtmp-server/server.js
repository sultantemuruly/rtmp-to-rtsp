import NodeMediaServer from 'node-media-server';

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 10,
    ping_timeout: 60
  },
};

const nms = new NodeMediaServer(config);

console.log('[SERVER STARTING] CONFIG:', JSON.stringify(config, null, 2));

nms.run();
