# Quick Start Guide

## Problem: "Unable to connect to storage node"

If you're seeing this error, it means the WebUI cannot connect to the archivist-node API.

## Solution

### Option 1: Use the Desktop App (Recommended)

The easiest way to use Archivist is with the Tauri desktop app, which manages the node automatically:

```bash
cd ..  # Go to project root
pnpm tauri dev
```

The desktop app will:
- Automatically start and manage the archivist-node
- Handle all API communication
- Provide the full feature set

### Option 2: Standalone WebUI

If you specifically want to use the standalone WebUI:

#### Step 1: Start the Archivist Node

**Using the Desktop App:**
```bash
cd ..  # Go to project root
pnpm tauri dev
```
Wait for the node to start (you'll see "Running" in the Dashboard).

**OR Using the Binary Directly:**
```bash
cd ../sidecars
./archivist --api-port=8080 --data-dir=/path/to/data
```

#### Step 2: Start the WebUI

In a separate terminal:

```bash
cd webui
pnpm install  # First time only
pnpm dev
```

#### Step 3: Open in Browser

Open http://localhost:3000 in your browser.

The WebUI will connect to the node at http://127.0.0.1:8080.

## Verifying the Node is Running

Before starting the WebUI, verify the node API is accessible:

```bash
curl http://127.0.0.1:8080/api/archivist/v1/debug/info
```

You should see a JSON response with node information. If you get "Connection refused", the node is not running.

## Common Issues

### 1. Port 3000 Already in Use

```bash
pnpm dev --port 3001
```

### 2. Port 8080 Already in Use

Check if another application is using port 8080:

**Linux/macOS:**
```bash
lsof -i :8080
```

**Windows (PowerShell):**
```powershell
netstat -ano | findstr :8080
```

Either stop the conflicting application or configure the node to use a different port.

### 3. Node Starts But WebUI Can't Connect

Check the browser console (F12) for specific errors:

- **CORS error**: The node needs to allow requests from your origin
- **Network error**: Check firewall settings
- **Timeout**: The node might be starting up slowly

### 4. Running in Production Mode

If you built the WebUI (`pnpm build`) and want to serve it:

```bash
pnpm preview
```

This will serve the production build on http://localhost:4173.

**Note**: Production mode requires the full URL in the API configuration:
```bash
VITE_API_URL=http://127.0.0.1:8080/api/archivist/v1 pnpm build
pnpm preview
```

## Architecture

```
Step 1: Start Node          Step 2: Start WebUI
┌──────────────────┐        ┌──────────────────┐
│ archivist-node   │◄───────│ Browser          │
│                  │ HTTP   │                  │
│ :8080/api/...    │        │ localhost:3000   │
└──────────────────┘        └──────────────────┘
```

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the [project README](../README.md) for architecture details
- Open an issue on GitHub if you're stuck
