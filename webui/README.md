# Archivist Standalone WebUI

This is a standalone web interface for the Archivist storage node. It can be used to interact with a running `archivist-node` instance via its REST API.

## Prerequisites

1. **Running Archivist Node**: You need a running instance of `archivist-node` with its API accessible on `http://127.0.0.1:8080`
   - You can use the Tauri desktop app to start the node
   - Or run `archivist-node` directly from the command line

2. **Node.js**: Version 20 or higher
3. **pnpm**: Package manager

## Setup

```bash
cd webui
pnpm install
```

## Development Mode

Development mode uses the Vite dev server with a proxy configured to forward API requests to the node:

```bash
pnpm dev
```

This will:
- Start the dev server on `http://localhost:3000`
- Proxy `/api/*` requests to `http://127.0.0.1:8080`
- Enable hot module replacement for fast development

## Production Build

Build the WebUI for production deployment:

```bash
pnpm build
```

The built files will be in the `webui/dist` directory.

## Preview Production Build

To test the production build locally:

```bash
pnpm preview
```

This will serve the production build on `http://localhost:4173`.

**Note**: The preview mode requires the node API to be accessible at `http://127.0.0.1:8080/api/archivist/v1`.

## Configuration

The API endpoint is configured via environment variables:

- **Development**: Uses `/api/archivist/v1` (proxied by Vite)
- **Production**: Uses `http://127.0.0.1:8080/api/archivist/v1` (direct connection)

You can override the API URL by creating a `.env.local` file:

```bash
VITE_API_URL=http://your-custom-host:8080/api/archivist/v1
```

## Troubleshooting

### "Unable to connect to storage node"

This error appears when the WebUI cannot reach the archivist-node API. Check:

1. **Node is running**: Verify the node is running on port 8080
   - Start it via the Tauri desktop app, OR
   - Run `archivist-node --api-port=8080` directly

2. **Correct port**: Check that the node is using port 8080 (default)
   - Look at the node logs or settings

3. **Firewall**: Ensure localhost connections are allowed

4. **CORS**: The node should accept requests from localhost origins
   - This is usually handled automatically for localhost

5. **Browser console**: Check the browser DevTools console for specific error messages

### Port Already in Use

If you get a port conflict when running `pnpm dev`:

```bash
# Use a different port
pnpm dev --port 3001
```

## Architecture

```
┌─────────────────────────────────────────┐
│   Browser (http://localhost:3000)      │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │   React WebUI                   │  │
│   │   - Login Page                  │  │
│   │   - Dashboard                   │  │
│   │   - File Management             │  │
│   └────────────┬────────────────────┘  │
│                │ HTTP                   │
└────────────────┼────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │   archivist-node           │
    │   (http://127.0.0.1:8080)  │
    │                            │
    │   REST API:                │
    │   - /api/archivist/v1/...  │
    └────────────────────────────┘
```

## Differences from Desktop App

This standalone WebUI is simpler than the full Tauri desktop app:

| Feature | WebUI | Desktop App |
|---------|-------|-------------|
| Node Management | ❌ Manual | ✅ Built-in |
| File Upload/Download | ✅ | ✅ |
| Marketplace | ✅ | ✅ |
| Wallet | ✅ | ✅ |
| Media Download | ❌ | ✅ |
| Torrents | ❌ | ✅ |
| P2P Chat | ❌ | ✅ |
| System Tray | ❌ | ✅ |
| Auto-Update | ❌ | ✅ |

The WebUI is useful for:
- Remote node management over the network
- Testing the node API
- Lightweight browser-based access
- Development and debugging

For full features, use the Tauri desktop app.
