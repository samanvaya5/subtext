#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$REPO_ROOT/skill"
MCP_DIR="$REPO_ROOT/yt-mcp-server"

echo "=== Subtext: Full Installation ==="
echo ""

# --- Step 1: Build MCP Server ---
echo "[1/3] Building YouTube MCP server..."
bash "$SKILL_DIR/scripts/setup-mcp.sh"
echo ""

# --- Step 2: Install Skill ---
echo "[2/3] Installing Subtext skill..."

SKILL_TARGET="$HOME/.agents/skills/subtext"
mkdir -p "$SKILL_TARGET"

cp -r "$SKILL_DIR/"* "$SKILL_TARGET/"

echo "Skill installed to: $SKILL_TARGET"
echo ""

# --- Step 3: Detect AI Tool & Configure MCP ---
echo "[3/3] Configuring MCP server..."

ENTRY_POINT="$MCP_DIR/build/index.js"

detect_and_configure() {
	# Claude Code
	if [ -d "$HOME/.claude" ] || command -v claude &>/dev/null; then
		echo "Detected: Claude Code"
		CLAUDE_MCP_CONFIG="$HOME/.claude/mcp.json"
		if [ ! -f "$CLAUDE_MCP_CONFIG" ]; then
			mkdir -p "$HOME/.claude"
			echo '{}' >"$CLAUDE_MCP_CONFIG"
		fi
		echo ""
		echo "Add this to $CLAUDE_MCP_CONFIG:"
		echo ""
		echo "  \"subtext-yt\": {"
		echo "    \"command\": \"node\","
		echo "    \"args\": [\"$ENTRY_POINT\"],"
		echo "    \"env\": { \"YOUTUBE_API_KEY\": \"YOUR_KEY\" }"
		echo "  }"
		echo ""
		return
	fi

	# Gemini CLI
	if [ -d "$HOME/.gemini" ] || command -v gemini &>/dev/null; then
		echo "Detected: Gemini CLI"
		GEMINI_CONFIG="$HOME/.gemini/settings.json"
		echo ""
		echo "Add this to your Gemini CLI MCP configuration:"
		echo ""
		echo "  \"subtext-yt\": {"
		echo "    \"command\": \"node\","
		echo "    \"args\": [\"$ENTRY_POINT\"],"
		echo "    \"env\": { \"YOUTUBE_API_KEY\": \"YOUR_KEY\" }"
		echo "  }"
		echo ""
		return
	fi

	# Cursor
	if [ -d "$HOME/.cursor" ]; then
		echo "Detected: Cursor"
		echo ""
		echo "Add this to your Cursor MCP settings (Settings → MCP):"
		echo ""
		echo "  \"subtext-yt\": {"
		echo "    \"command\": \"node\","
		echo "    \"args\": [\"$ENTRY_POINT\"],"
		echo "    \"env\": { \"YOUTUBE_API_KEY\": \"YOUR_KEY\" }"
		echo "  }"
		echo ""
		return
	fi

	# Generic
	echo "No specific AI tool detected."
	echo ""
	echo "Configure your AI tool's MCP settings with:"
	echo "  Command: node"
	echo "  Args: [\"$ENTRY_POINT\"]"
	echo "  Env: YOUTUBE_API_KEY=YOUR_KEY"
	echo ""
}

detect_and_configure

echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "  1. Set YOUTUBE_API_KEY in your MCP configuration"
echo "     Get a key: https://console.cloud.google.com/apis/credentials"
echo "  2. Restart your AI tool"
echo "  3. Say 'use subtext' or ask it to research a YouTube channel or topic"
echo ""
