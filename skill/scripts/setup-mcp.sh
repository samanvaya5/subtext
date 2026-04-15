#!/usr/bin/env bash
set -euo pipefail

SUBTEXT_VERSION="1.0.0"
MCP_SERVER="@rethink-paradigms/subtext-mcp"

echo ""
echo "=== Subtext MCP Server Setup ==="
echo ""

API_KEY="${YOUTUBE_API_KEY:-}"
if [ -z "$API_KEY" ]; then
	echo "You need a YouTube Data API key."
	echo "Get one free: https://console.cloud.google.com/apis/credentials"
	echo ""
	printf "Paste your API key: "
	read -rs API_KEY
	echo ""
	if [ -z "$API_KEY" ]; then
		echo "No key provided. Exiting."
		exit 1
	fi
fi

write_mcp_json() {
	local config_path="$1"
	local top_key="${2:-mcpServers}"

	python3 -c "
import json, sys
config_path = '$config_path'
top_key = '$top_key'
api_key = '$API_KEY'
try:
    with open(config_path) as f:
        data = json.load(f)
except:
    data = {}
if top_key not in data:
    data[top_key] = {}
data[top_key]['subtext'] = {
    'command': 'npx',
    'args': ['-y', '@rethink-paradigms/subtext-mcp'],
    'env': {'YOUTUBE_API_KEY': api_key}
}
with open(config_path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
"
}

write_goose_yaml() {
	local config_path="$1"
	local entry="extensions:
  subtext:
    name: subtext
    type: stdio
    cmd: npx
    args:
      - \"-y\"
      - \"@rethink-paradigms/subtext-mcp\"
    envs:
      YOUTUBE_API_KEY: $API_KEY"

	if [ -f "$config_path" ]; then
		if grep -q "subtext" "$config_path" 2>/dev/null; then
			echo "  subtext already configured in $config_path — skipping"
			return
		fi
		echo "$entry" >>"$config_path"
	else
		mkdir -p "$(dirname "$config_path")"
		echo "$entry" >"$config_path"
	fi
}

configure_claude_code() {
	if command -v claude &>/dev/null; then
		echo "Configuring Claude Code..."
		claude mcp add-json subtext "{\"command\":\"npx\",\"args\":[\"-y\",\"@rethink-paradigms/subtext-mcp\"],\"env\":{\"YOUTUBE_API_KEY\":\"$API_KEY\"}}" 2>/dev/null &&
			echo "  Added via 'claude mcp add'" ||
			echo "  Could not add via CLI. Add manually to ~/.claude.json"
	fi
}

configure_agent() {
	local name="$1"
	local config_path="$2"
	local top_key="${3:-mcpServers}"
	local format="${4:-json}"

	if [ ! -f "$config_path" ] && [ ! -d "$(dirname "$config_path")" ]; then
		return
	fi

	echo "Configuring $name..."
	mkdir -p "$(dirname "$config_path")"

	if [ "$format" = "yaml" ]; then
		write_goose_yaml "$config_path"
	else
		write_mcp_json "$config_path" "$top_key"
	fi
	echo "  Written to $config_path"
}

detect_and_configure() {
	local configured=0

	if command -v claude &>/dev/null; then
		configure_claude_code
		configured=$((configured + 1))
	fi

	local claude_desktop_config="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
	if [ -f "$claude_desktop_config" ] || [ -d "$HOME/Library/Application Support/Claude" ]; then
		configure_agent "Claude Desktop" "$claude_desktop_config"
		configured=$((configured + 1))
	fi

	if [ -f "$HOME/.cursor/mcp.json" ] || [ -d "$HOME/.cursor" ]; then
		configure_agent "Cursor" "$HOME/.cursor/mcp.json"
		configured=$((configured + 1))
	fi

	if [ -f "$HOME/.config/opencode/mcp.json" ] || [ -d "$HOME/.config/opencode" ]; then
		configure_agent "OpenCode" "$HOME/.config/opencode/mcp.json"
		configured=$((configured + 1))
	fi

	if [ -f "$HOME/.codeium/windsurf/mcp_config.json" ] || [ -d "$HOME/.codeium/windsurf" ]; then
		configure_agent "Windsurf" "$HOME/.codeium/windsurf/mcp_config.json"
		configured=$((configured + 1))
	fi

	if [ -f "$HOME/.gemini/settings.json" ] || [ -d "$HOME/.gemini" ]; then
		configure_agent "Gemini CLI" "$HOME/.gemini/settings.json"
		configured=$((configured + 1))
	fi

	if command -v code &>/dev/null; then
		echo "Configuring VS Code / Copilot..."
		code --add-mcp "{\"name\":\"subtext\",\"command\":\"npx\",\"args\":[\"-y\",\"@rethink-paradigms/subtext-mcp\"],\"env\":{\"YOUTUBE_API_KEY\":\"$API_KEY\"}}" 2>/dev/null &&
			echo "  Added via 'code --add-mcp'" ||
			echo "  Could not add via CLI. Add manually to .vscode/mcp.json"
		configured=$((configured + 1))
	fi

	if [ -f "$HOME/.config/goose/config.yaml" ] || [ -d "$HOME/.config/goose" ]; then
		configure_agent "Goose" "$HOME/.config/goose/config.yaml" "extensions" "yaml"
		configured=$((configured + 1))
	fi

	if [ "$configured" -eq 0 ]; then
		echo "No AI agents detected."
		echo ""
		echo "Add this to your agent's MCP config:"
		echo ""
		echo '{'
		echo '  "mcpServers": {'
		echo '    "subtext": {'
		echo '      "command": "npx",'
		echo '      "args": ["-y", "@rethink-paradigms/subtext-mcp"],'
		echo '      "env": { "YOUTUBE_API_KEY": "'"$API_KEY"'" }'
		echo '    }'
		echo '  }'
		echo '}'
		echo ""
	fi
}

echo "Detecting AI agents..."
echo ""
detect_and_configure
echo ""
echo "=== Done ==="
echo ""
echo "Restart your AI tool and say 'use subtext' to get started."
echo ""
