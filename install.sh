#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Subtext: Full Installation ==="
echo ""

echo "[1/2] Running MCP server setup..."
bash "$REPO_ROOT/skill/scripts/setup-mcp.sh"
echo ""

echo "[2/2] Installing Subtext skill..."

SKILL_TARGET="$HOME/.agents/skills/subtext"
mkdir -p "$SKILL_TARGET"
cp -r "$REPO_ROOT/skill/"* "$SKILL_TARGET/"
echo "Skill installed to: $SKILL_TARGET"
echo ""

echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "  1. Restart your AI tool"
echo "  2. Say 'use subtext' to start researching"
echo ""
