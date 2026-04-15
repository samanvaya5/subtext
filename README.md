# Subtext

Turn YouTube talks into intelligence. We analyze what's said — and what's not.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-compatible-purple.svg)](https://modelcontextprotocol.io)
[![npm](https://img.shields.io/npm/v/@rethink-paradigms/subtext-mcp.svg)](https://www.npmjs.com/package/@rethink-paradigms/subtext-mcp)

---

**Install:** `npx skills add samanvaya5/subtext`

Works with Claude Code, Cursor, Codex, Gemini, Cline, Windsurf, OpenCode, and 20+ other agents.

---

## What it does

Feed it YouTube videos. Get strategic intelligence — hidden signals, what speakers don't say, cross-talk patterns, blind spots. Not summaries.

## How it works

```
Discovery ──> Ingest ──> Schema Negotiation ──> Batch Analysis ──> Synthesis ──> Application
(You pick)    (Bulk)     (YOU approve)         (3-5 at a time)   (Cross-talk)  (Your call)
```

Every stage has a **checkpoint**. The AI stops. You review. You redirect. Then it continues.

The key innovation is **Schema Negotiation** (Stage 3): the AI proposes an analysis framework, you modify it until it's right, and only then does analysis begin. This is not a prompt — it's a negotiation.

## Install

```bash
# 1. Install the skill
npx skills add samanvaya5/subtext

# 2. Say "use subtext" to your agent
#    It will detect the MCP server isn't connected and walk you through setup
#    One script: detects your agent, asks for API key, writes config. No JSON editing.
```

Requires: Node.js 18+, a [YouTube Data API key](https://console.cloud.google.com/apis/credentials) (free).

### Manual MCP server setup

If you prefer to configure manually, add this to your agent's MCP config:

```json
{
  "mcpServers": {
    "subtext": {
      "command": "npx",
      "args": ["-y", "@rethink-paradigms/subtext-mcp"],
      "env": { "YOUTUBE_API_KEY": "your-key" }
    }
  }
}
```

Or install from source: `git clone https://github.com/samanvaya5/subtext.git && cd subtext && ./install.sh`

## Analysis modes

| Mode | What it extracts |
|------|-----------------|
| **Strategic Deep Dive** (default) | Hidden signals, power dynamics, omissions, framing |
| Technical Extraction | Architecture, stack, benchmarks, replicable patterns |
| Market Intelligence | Positioning, competitive signals, market gaps |
| Sentiment & Trend | Trending up/down, buzzwords, consensus vs contrarian |
| Idea Evaluator | Pressure-test your idea against the corpus |
| Custom | You define it during Schema Negotiation |

## How it compares

| | Batch | Interactive | Hidden Signals | You control the schema |
|---|:---:|:---:|:---:|:---:|
| ChatGPT + URL | - | - | - | - |
| GPT Researcher | Yes | - | - | - |
| Manual AI chat | Yes | Sort of | If you're skilled | - |
| **Subtext** | **Yes** | **6 checkpoints** | **Default** | **Yes** |

## Under the hood

Two things in one package:

- **The Skill** (`skill/SKILL.md`) — teaches your agent the 6-stage workflow. Checkpoints, schemas, synthesis patterns — all defined.
- **The MCP Server** ([`@rethink-paradigms/subtext-mcp` on npm](https://www.npmjs.com/package/@rethink-paradigms/subtext-mcp)) — 14 YouTube tools: search, transcripts (single/bulk), channel videos, playlists, comments, activities, subscriptions, categories.

The skill tells the agent *what to do*. The MCP server gives it *the tools to do it*.

## Example

```
You: Research how AI founders talk about regulation. Last 30 days, these 3 channels.

Agent: [Stage 1] Found 14 videos. Here are the titles. Remove any?

You: Drop the product launches. Keep interviews and panels.

Agent: [Stage 2] 9 transcripts fetched. 2 are low-signal Q&A. Skip them?

You: Yes. What schema are you proposing?

Agent: [Stage 3] Proposed framework:
       - Regulatory positioning (avoidance vs engagement)
       - Competitive moat language
       - Fear appeal patterns
       - What they DON'T mention

You: Add "coalition language" — who they frame as allies vs opponents.

Agent: Updated. Consensus reached. Starting analysis.
       ...
       [Stage 5] Cross-talk pattern: 7 of 9 speakers avoid mentioning EU
       regulation entirely while focusing on US policy. Likely a coordinated
       framing choice across channels.

You: Build an opportunity map for a regulatory compliance startup.

Agent: [Stage 6] Done. Saved to research/analysis/opportunity-map.md
```

## License

[MIT](LICENSE)
