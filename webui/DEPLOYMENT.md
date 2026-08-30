# Archivist WebUI Deployment Guide

Production-ready end-user webUI for Archivist storage network. Built with React 18 + TypeScript + Vite.

## Architecture

```
Browser → WebUI (React SPA)
              ↓
          HTTP/REST
              ↓
    archivist-node API (localhost:8080)
              ↓
    P2P Network (Port 8070/TCP, 8090/UDP)
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+
- **Running archivist-node** sidecar on accessible hostname/port

## Local Development

```bash
cd webui

# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# In another terminal, verify archivist-node is running on localhost:8080
curl http://localhost:8080/api/archivist/v1/debug/info

# Navigate to http://localhost:5173 in browser
# Click "Connect" to authenticate with running node
```

## Production Build

```bash
cd webui

# Install dependencies
pnpm install

# Build optimized bundle (TypeScript check + Vite bundling)
pnpm build

# Output: dist/ folder (~500KB gzipped)
# Ready for deployment to static hosting or server
```

## Deployment Options

### 1. Static Hosting (Vercel, Netlify, GitHub Pages, AWS S3+CloudFront)

**Best for:** Decentralized/edge deployment

```bash
# Build locally
pnpm build

# Deploy dist/ folder to static host
# Set environment variable at build time or runtime:
VITE_API_URL=https://your-archivist-node.example.com/api/archivist/v1
```

**Vercel Example:**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from webui directory
cd webui
vercel

# 3. Set environment variable in Vercel dashboard:
# VITE_API_URL = https://your-api.example.com/api/archivist/v1

# 4. Redeploy to pick up environment variable
vercel --prod
```

**GitHub Pages Example:**

```json
// vercel.json or package.json scripts
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://your-archivist-node.example.com/api/archivist/v1"
  }
}
```

### 2. Docker Container

**Best for:** Self-hosted, containerized environments

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
worker_processes auto;
events { worker_connections 1024; }

http {
  server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    location /api/ {
      # Proxy to archivist-node (or set VITE_API_URL at build time)
      proxy_pass http://archivist-node:8080;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

**Build & Run:**

```bash
docker build -t archivist-webui:latest .
docker run -p 3000:80 -e VITE_API_URL=http://archivist-node:8080/api/archivist/v1 archivist-webui:latest
```

### 3. Standalone Server (Express, Node.js)

**Best for:** Full-stack control, custom middleware

**server.js:**

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy (optional)
app.all('/api/*', (req, res) => {
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8080/api/archivist/v1';
  fetch(`${apiUrl}${req.path.replace('/api', '')}`, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  })
    .then(r => r.json())
    .then(data => res.json(data))
    .catch(e => res.status(500).json({ error: e.message }));
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => console.log('WebUI on http://localhost:3000'));
```

**Run:**

```bash
VITE_API_URL=http://your-archivist-node:8080/api/archivist/v1 node server.js
```

## Environment Configuration

### Development (.env.local)

```bash
VITE_API_URL=http://localhost:8080/api/archivist/v1
```

### Production (.env.production)

```bash
VITE_API_URL=https://your-archivist-node.example.com/api/archivist/v1
```

### Build-time Configuration

```bash
# Inline environment variable at build
VITE_API_URL=https://api.example.com pnpm build

# Docker build arg
docker build --build-arg VITE_API_URL=https://api.example.com .
```

## CORS Configuration (archivist-node)

If hosting webUI on different domain, configure CORS headers in archivist-node:

```rust
// src-tauri/src/node_api.rs (or your node's REST server)
app.cors(|cors| {
  cors
    .allow_origin("https://your-webui-domain.com")
    .allow_methods(["GET", "POST", "DELETE", "OPTIONS"])
    .allow_headers(["Content-Type", "Authorization"])
})
```

For development, archivist-node typically runs on localhost and CORS is not needed.

## Features

✅ **Session Management** - localStorage persistence, 24-hour expiry  
✅ **File Upload/Download** - Progress tracking, real-time feedback  
✅ **Storage Monitoring** - Real-time space usage, peer count  
✅ **Error Handling** - Retry logic, user-friendly messages  
✅ **Responsive Design** - Mobile, tablet, desktop layouts  
✅ **TypeScript** - Full type safety, strict mode  
✅ **Production Build** - ~105KB gzipped JavaScript, ~15KB CSS  

## Testing

```bash
cd webui

# Unit tests
pnpm test

# E2E tests (if configured)
pnpm test:e2e

# Type checking
pnpm tsc --noEmit
```

## Troubleshooting

### "Failed to fetch node info" Error

**Cause:** archivist-node not running or incorrect API URL

**Fix:**

1. Verify node is running: `curl http://localhost:8080/api/archivist/v1/debug/info`
2. Check `VITE_API_URL` matches your node's address
3. For remote nodes, verify firewall/CORS settings

### "Session expired" After Reload

**Cause:** Session token in localStorage is expired (24 hours)

**Fix:** Login again. Session persists for 24 hours or until logout.

### File Download Fails

**Cause:** CID not synced to network yet, or node storage full

**Fix:**

1. Wait for file to fully sync to network
2. Check storage space: `GET /api/archivist/v1/space`
3. Delete unused files to free space

### Upload Stalls

**Cause:** Network connection lost or file too large

**Fix:**

1. Check network connection
2. Refresh page and retry
3. Upload smaller files first (test with 1MB file)
4. Check node API is responding: `curl http://localhost:8080/api/archivist/v1/debug/info`

## API Reference

See [archivist-desktop CLAUDE.md](../CLAUDE.md) for full archivist-node REST API documentation.

**Key Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/debug/info` | GET | Node info, peer ID, version |
| `/data` | GET | List stored files (CIDs) |
| `/data` | POST | Upload file (raw binary body) |
| `/data/{cid}` | GET | Download file by CID |
| `/data/{cid}` | DELETE | Delete file |
| `/space` | GET | Storage space summary |
| `/connect/{peerId}` | GET | Connect to peer |
| `/debug/info` | GET | Connected peers info |

## Performance

- **TypeScript Build:** ~1.4s (cached)
- **Bundle Size:** 371KB (gzip: 105KB)
- **CSS:** 100KB (gzip: 15KB)
- **First Paint:** <500ms on 3G connection
- **API Timeout:** 30 seconds per request

## Security

✅ Session tokens stored in localStorage with 24-hour expiry  
✅ All API requests over HTTPS in production  
✅ CORS configured to allowed domains only  
✅ No sensitive data in localStorage except session token  
✅ Input validation on file operations  
✅ Error messages don't leak system info  

## License

Same as archivist-desktop
