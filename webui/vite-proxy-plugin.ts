import type { Plugin } from 'vite';
import http from 'http';

export function proxyPlugin(): Plugin {
  return {
    name: 'archivist-proxy',
    enforce: 'pre', // Run before other plugins
    configureServer(server) {
      // Use the pre middleware hook to intercept before SPA fallback
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/')) {
            console.log('[Proxy] Intercepting:', req.url);
            const targetUrl = `http://127.0.0.1:8080${req.url}`;

            const proxyReq = http.request(targetUrl, {
              method: req.method,
              headers: req.headers,
            }, (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
              proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
              console.error('[Proxy] Error:', err);
              res.writeHead(502);
              res.end('Bad Gateway');
            });

            req.pipe(proxyReq);
          } else {
            next();
          }
        });
      };
    },
  };
}
