#!/usr/bin/env node

/**
 * Simple CORS proxy for Archivist WebUI
 * Forwards requests from localhost:3000 to localhost:8080 with CORS headers
 */

const http = require('http');

const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 8080;
const PROXY_PORT = 3002;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Disposition');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[Proxy] ${req.method} ${req.url}`);

  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward status and headers (except CORS, we set our own)
    const headers = { ...proxyRes.headers };
    delete headers['access-control-allow-origin'];
    delete headers['access-control-allow-methods'];
    delete headers['access-control-allow-headers'];

    res.writeHead(proxyRes.statusCode, {
      ...headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Disposition',
    });

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy Error]:', err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Bad Gateway: Cannot connect to archivist-node at ${TARGET_HOST}:${TARGET_PORT}\n${err.message}`);
  });

  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  Archivist CORS Proxy Running                              ║`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);
  console.log(`║  Proxy:  http://127.0.0.1:${PROXY_PORT}                            ║`);
  console.log(`║  Target: http://127.0.0.1:${TARGET_PORT}                            ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
  console.log(`\nForwarding API requests to archivist-node...`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down proxy server...');
  server.close(() => {
    console.log('Proxy server stopped.');
    process.exit(0);
  });
});
