#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MCP_DIR="$REPO_ROOT/yt-mcp-server"

echo "=== Subtext: MCP Server Setup ==="

if [ ! -d "$MCP_DIR" ]; then
	echo "ERROR: MCP server directory not found at $MCP_DIR"
	echo "Ensure the yt-mcp-server/ directory exists alongside the skill/ directory."
	exit 1
fi

if ! command -v node &>/dev/null; then
	echo "ERROR: Node.js is not installed. Install it first: https://nodejs.org/"
	exit 1
fi

if ! command -v npm &>/dev/null; then
	echo "ERROR: npm is not installed. Install Node.js first."
	exit 1
fi

echo "[1/3] Installing dependencies..."
npm install --prefix "$MCP_DIR" --yes

echo "[2/3] Building MCP server..."
npm run build --prefix "$MCP_DIR"

ENTRY_POINT="$MCP_DIR/build/index.js"
if [ ! -f "$ENTRY_POINT" ]; then
	echo "ERROR: Build failed — $ENTRY_POINT not found."
	exit 1
fi

chmod +x "$ENTRY_POINT"
echo "[3/3] Build successful. Entry point: $ENTRY_POINT"

echo ""
echo "=== MCP Server Ready ==="
echo ""
echo "Add this to your MCP configuration:"
echo ""
echo '{'
echo '  "mcpServers": {'
echo '    "subtext-yt": {'
echo '      "command": "node",'
echo "      \"args\": [\"$ENTRY_POINT\"],"
echo '      "env": {'
echo '        "YOUTUBE_API_KEY": "YOUR_API_KEY_HERE"'
echo '      }'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "Get a YouTube API key: https://console.cloud.google.com/apis/credentials"
