#!/bin/bash

# Archivist Node Connection Checker
# This script verifies that the archivist-node is running and accessible

set -e

API_URL="${VITE_API_URL:-http://127.0.0.1:8080/api/archivist/v1}"
ENDPOINT="${API_URL}/debug/info"

echo "============================================="
echo "Archivist Node Connection Checker"
echo "============================================="
echo ""
echo "Checking connection to: $ENDPOINT"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is not installed"
    echo "Please install curl to run this check"
    exit 1
fi

# Check if the node API is accessible
echo "Testing connection..."
if response=$(curl -s -w "\n%{http_code}" --connect-timeout 5 "$ENDPOINT" 2>&1); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ SUCCESS: Node is running and accessible"
        echo ""
        echo "Node Info:"
        echo "$body" | head -c 500
        if [ ${#body} -gt 500 ]; then
            echo "..."
        fi
        echo ""
        echo ""
        echo "✅ You can now start the WebUI with: pnpm dev"
        exit 0
    else
        echo "❌ ERROR: Node returned HTTP $http_code"
        echo ""
        echo "Response:"
        echo "$body"
        exit 1
    fi
else
    echo "❌ ERROR: Cannot connect to node at $ENDPOINT"
    echo ""
    echo "Common causes:"
    echo "  1. Node is not running"
    echo "  2. Node is using a different port"
    echo "  3. Firewall is blocking the connection"
    echo ""
    echo "Solutions:"
    echo "  1. Start the node with the desktop app:"
    echo "     cd .. && pnpm tauri dev"
    echo ""
    echo "  2. Or start the node directly:"
    echo "     cd ../sidecars && ./archivist --api-port=8080"
    echo ""
    echo "  3. Check if port 8080 is in use:"
    echo "     lsof -i :8080  (Linux/macOS)"
    echo "     netstat -ano | findstr :8080  (Windows)"
    echo ""
    exit 1
fi
