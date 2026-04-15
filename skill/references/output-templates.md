# Output Templates

File naming conventions and folder structure for all artifacts produced by Subtext.

---

## Folder Structure

```
research/
├── transcripts/          # Raw transcripts from Stage 2
│   ├── [source-name]/    # Grouped by source (channel, playlist, topic)
│   │   ├── video-title-slugified.md
│   │   └── ...
│   └── ...
├── per-talk/             # Individual analyses from Stage 4
│   ├── [source-name]/    # Same grouping as transcripts
│   │   ├── video-title-slugified.md
│   │   └── ...
│   └── ...
└── analysis/             # Synthesis artifacts from Stage 5-6
    ├── cross-talk-synthesis.md
    ├── opportunity-map.md
    ├── idea-evaluation.md
    └── ...
```

## File Naming

### Transcript Files
Format: `{video-title-slugified}.md`

Slugify rules:
- Lowercase
- Spaces → hyphens
- Remove special characters (keep a-z, 0-9, hyphens)
- Max 80 characters
- If title is too generic, prefix with speaker name: `{speaker-name}-{title-slug}.md`

Examples:
- `agentic-engineering-working-with-ai-not-just-using-it.md`
- `bending-a-public-mcp-server-without-breaking-it.md`
- `tuomas-artman-linear-zero-bug-policy.md`

### Per-Talk Analysis Files
Same filename as the corresponding transcript file. Placed in `per-talk/{source-name}/`.

### Synthesis Files
- `cross-talk-synthesis.md` — always this name
- `opportunity-map.md` — if generated
- `idea-evaluation.md` — if generated
- Custom names for other Stage 6 artifacts

## Transcript File Format

Each transcript file should have this header:

```markdown
# [Video Title]

- **Speaker:** [Name]
- **Published:** [Date]
- **Channel:** [Channel name] ([Handle])
- **URL:** [YouTube URL]
- **Duration:** [Duration]

---

[Transcript text]
```

## Session Resume

When resuming an interrupted session, check the filesystem:
1. Files in `research/transcripts/` → Stage 2 is complete for those
2. Files in `research/per-talk/` → Stage 4 is complete for those (match by filename)
3. Files in `research/analysis/` → Stage 5 is complete

Compare what's in `per-talk/` against `transcripts/` to find what still needs analysis. Resume from the first missing file.
