# AGENTS.md — Subtext

Guidance for agentic coding agents operating in this repository.

## Project Overview

**Subtext** — Turn YouTube talks into intelligence. An interactive research-to-intelligence skill paired with a YouTube MCP server.
The skill (`skill/SKILL.md`) defines a 6-stage interactive workflow for AI agents. The MCP server (`yt-mcp-server/`) exposes 14 YouTube tools via the Model Context Protocol.
TypeScript + Node.js ESM project. MCP server source lives in `yt-mcp-server/src/`.

## Build & Run Commands

All commands run from `yt-mcp-server/`.

```bash
npm run build          # Compile TS → build/ (tsc + chmod entry point)
npm run dev            # Watch mode (tsc --watch)
node build/index.js    # Run the server directly
```

There is no test framework, no linter, and no formatter configured.
If adding tests, prefer **Vitest** (ESM-native, fast) and add scripts to package.json.

## Project Structure

```
yt-mcp-server/
├── src/
│   ├── index.ts              # Entry point — MCP server setup + tool registration
│   ├── clients/              # External API client singletons
│   │   ├── youtube-api.ts    # YouTube Data API v3 (googleapis)
│   │   └── youtube-innertube.ts  # InnerTube API (youtubei.js) for transcripts
│   ├── tools/                # MCP tool implementations (one file per tool)
│   └── utils/                # Shared utilities (date, rate-limit, transcripts)
├── build/                    # Compiled output (gitignored)
├── tsconfig.json
└── package.json
```

## Code Style Guidelines

### TypeScript Configuration

- `strict: true` — no implicit any, strict null checks, the works
- Target: ES2022, Module: Node16, moduleResolution: Node16
- ESM project (`"type": "module"` in package.json)

### Imports

```typescript
// External packages first
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import pLimit from "p-limit";

// Internal imports second — ALWAYS include .js extension (Node16 ESM requirement)
import { getYoutubeClient } from "../clients/youtube-api.js";
import { TranscriptSegment } from "../utils/transcript-formatter.js";
```

**Critical:** Relative imports must end in `.js` even though source files are `.ts`.
This is a Node16 ESM requirement, not optional.

### Exports

- **Named exports only.** No default exports anywhere in this codebase.
- Use `export const`, `export async function`, `export type`, `export interface`.

### Naming Conventions

| Entity              | Convention             | Examples                                    |
|---------------------|------------------------|---------------------------------------------|
| Files               | `kebab-case`           | `get-transcript.ts`, `rate-limiter.ts`      |
| Functions           | `camelCase`            | `getYoutubeClient`, `withRetry`             |
| Zod schemas         | `camelCase` + `Schema` | `searchSchema`, `getTranscriptSchema`       |
| Inferred types      | `PascalCase` + `Params`| `SearchParams`, `GetTranscriptParams`       |
| Interfaces          | `PascalCase`           | `TranscriptSegment`, `CaptionTrack`         |
| Module constants    | `UPPER_SNAKE_CASE`     | `MIN_DELAY`, `MAX_DELAY`                    |
| Singleton instances | `_underscorePrefix`    | `_youtube`, `_innertube`                    |
| MCP tool names      | `snake_case` w/ prefix | `youtube_search`, `youtube_get_transcript`  |

### Schema + Type Pattern (used in every tool)

```typescript
export const getTranscriptSchema = z.object({
  videoId: z.string().describe("YouTube video ID (11 characters)"),
  lang: z.string().optional().describe("Language code"),
});
export type GetTranscriptParams = z.infer<typeof getTranscriptSchema>;

export async function getTranscript(params: GetTranscriptParams) {
  // ...
}
```

Always pair a Zod schema with an inferred type. Use `.describe()` on every field
for MCP tool documentation.

### Error Handling

- **All tool handlers are wrapped** by `wrapHandler()` in `index.ts` — provides
  consistent try/catch → MCP error response. Never add your own top-level try/catch
  in tool functions unless you need partial-result semantics.
- **Throw `Error` objects** for validation/state errors:
  `throw new Error("YOUTUBE_API_KEY environment variable is required");`
- **Bulk operations** use a partial-results pattern — collect successes and failures
  separately, return both in the response.
- **Log to stderr only** (`console.error`). Never log to stdout (MCP protocol uses it).
- **Retryable operations** use `withRetry()` from `utils/rate-limiter.ts` with
  exponential backoff + jitter.

### Function Signatures

- Explicit return types on exported functions.
- Generic types for reusable utilities: `withRetry<T>`, `wrapHandler<T>`.
- Use `as const` for literal types in MCP responses: `type: "text" as const`.

### Adding a New Tool

1. Create `src/tools/your-tool-name.ts`
2. Export: a Zod schema (`yourToolNameSchema`), inferred type, and async handler
3. Import and register in `src/index.ts` using the `reg()` helper:
   ```typescript
   import { yourToolNameSchema, yourToolName } from "./tools/your-tool-name.js";
   reg("youtube_your_tool_name", "Description", yourToolNameSchema, yourToolName);
   ```
4. Tool name format: `youtube_<snake_case_action>`

### Environment Variables

- `YOUTUBE_API_KEY` — Required for YouTube Data API v3 tools
- InnerTube (transcript) tools work without an API key

### Dependencies

- **Runtime:** `@modelcontextprotocol/sdk`, `googleapis`, `youtubei.js`, `zod`, `p-limit`
- **Dev:** `typescript`, `@types/node`
- **Package manager:** npm (uses `package-lock.json`)
- Do not add dependencies without good reason. Prefer the Node.js standard library.
