# WebUI Connection Fix

## Problem

The standalone WebUI (in `webui/` folder) was unable to connect to the archivist-node backend, showing the error:

> "Unable to connect to storage node. Please ensure the node is running."

## Root Cause

The issue had multiple layers:

1. **Incorrect API URL Configuration**: The `webui/.env` file was using a relative path `/api/archivist/v1` which only works when the Vite proxy is active (development mode with `pnpm dev`).

2. **CSP Restriction**: The Tauri app's Content Security Policy (`tauri.conf.json`) didn't allow connections to `http://127.0.0.1:8080` (the node API port).

3. **Missing Environment Configuration**: No environment-specific configuration files for development vs production builds.

4. **Lack of Documentation**: No clear instructions on how to properly run the standalone WebUI.

## Changes Made

### 1. Fixed API URL Configuration

**File: `webui/.env`**
- Changed from relative path `/api/archivist/v1`
- To absolute URL `http://127.0.0.1:8080/api/archivist/v1`

### 2. Created Environment-Specific Configs

**New File: `webui/.env.development`**
- Uses `/api/archivist/v1` (relies on Vite proxy)
- Active when running `pnpm dev`

**New File: `webui/.env.production`**
- Uses `http://127.0.0.1:8080/api/archivist/v1` (direct connection)
- Active when running `pnpm build` or `pnpm preview`

### 3. Updated CSP in Tauri Config

**File: `src-tauri/tauri.conf.json`**
- Added `http://127.0.0.1:8080` to the `connect-src` directive
- Allows the desktop app to make HTTP requests to the node API

**Before:**
```json
"csp": "... connect-src 'self' https://api.github.com https://github.com http://127.0.0.1:8087 http://127.0.0.1:8088 https:; ..."
```

**After:**
```json
"csp": "... connect-src 'self' https://api.github.com https://github.com http://127.0.0.1:8080 http://127.0.0.1:8087 http://127.0.0.1:8088 https:; ..."
```

### 4. Improved Error Messages

**File: `webui/src/lib/api.ts`**
- Added better error handling in `getNodeInfo()` method
- Provides detailed troubleshooting steps when connection fails

### 5. Added Documentation

**New File: `webui/README.md`**
- Comprehensive guide to the standalone WebUI
- Setup instructions for development and production
- Configuration details
- Troubleshooting section
- Architecture diagram

**New File: `webui/QUICKSTART.md`**
- Step-by-step guide to resolve connection issues
- Quick start instructions
- Common issues and solutions
- Verification steps

## How to Use

### For the Desktop App

No changes required! The desktop app works as before:

```bash
cd archivist-desktop
pnpm tauri dev
```

The CSP fix ensures the desktop app can properly connect to the node API.

### For the Standalone WebUI

**Development Mode:**
```bash
# Terminal 1: Start the node (via desktop app or directly)
cd archivist-desktop
pnpm tauri dev

# Terminal 2: Start the WebUI
cd webui
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser.

**Production Build:**
```bash
# Build
cd webui
pnpm build

# Preview
pnpm preview
```

Open http://localhost:4173 in your browser.

## Verification

To verify the fix works:

1. **Start the node** (via desktop app or CLI)
2. **Check node API** is accessible:
   ```bash
   curl http://127.0.0.1:8080/api/archivist/v1/debug/info
   ```
3. **Start the WebUI** in development mode:
   ```bash
   cd webui && pnpm dev
   ```
4. **Open browser** to http://localhost:3000
5. **Verify connection**: You should see node information on the login page

## Technical Details

### Vite Proxy Configuration

The `webui/vite.config.ts` includes a proxy for development:

```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
}
```

This allows the dev server to forward `/api/*` requests to the node API, avoiding CORS issues during development.

### Environment Variables

Vite supports `.env` files with the following precedence:

1. `.env.local` (highest priority, gitignored)
2. `.env.[mode]` (mode-specific: development or production)
3. `.env` (base configuration)

The `VITE_API_URL` environment variable is accessed in the code via:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/archivist/v1';
```

### Two Frontend Architectures

The project has two separate frontends:

1. **Tauri Desktop App** (`src/`)
   - Uses Tauri IPC for backend communication
   - Full feature set
   - Manages node lifecycle

2. **Standalone WebUI** (`webui/`)
   - Uses HTTP requests to node API
   - Lighter feature set
   - Requires external node management

## Future Improvements

Consider these enhancements:

1. **CORS Configuration**: Document CORS requirements if the node needs to accept requests from other origins
2. **Health Check Endpoint**: Add a dedicated health check that's faster than `/debug/info`
3. **Connection Status Indicator**: Show real-time connection status in the UI
4. **Auto-Discovery**: Implement mDNS/discovery to automatically find local nodes
5. **Configuration UI**: Add UI to change the API URL without editing `.env` files

## Related Files

- `webui/.env` - Base environment configuration
- `webui/.env.development` - Development-specific config
- `webui/.env.production` - Production-specific config
- `webui/vite.config.ts` - Vite proxy configuration
- `webui/src/lib/api.ts` - API client with improved error handling
- `webui/README.md` - WebUI documentation
- `webui/QUICKSTART.md` - Quick start guide
- `src-tauri/tauri.conf.json` - CSP configuration

## Testing Checklist

- [ ] Desktop app starts and connects to node (verified existing functionality)
- [ ] Standalone WebUI in dev mode (`pnpm dev`) connects successfully
- [ ] Standalone WebUI in preview mode (`pnpm preview`) connects successfully
- [ ] Error messages are helpful when node is not running
- [ ] CSP doesn't block legitimate requests
- [ ] Environment variables are correctly loaded in each mode

## Questions?

See the documentation files:
- [webui/README.md](webui/README.md) - Full WebUI documentation
- [webui/QUICKSTART.md](webui/QUICKSTART.md) - Quick troubleshooting guide
- [README.md](README.md) - Main project documentation
