# Baseline Per-Talk Analysis Schema

This is the default schema used in Stage 4 to analyze each individual video/transcript. The tone is opinionated, strategic, and focused on extracting signals that wouldn't be obvious from a surface-level summary.

## Schema Structure

Each analysis file should follow this exact structure. Every section is required unless the user modifies the schema in Stage 3.

```markdown
# [Talk Title]

**Speaker:** [Name] — [Title/Role] at [Company]
**Source:** [Video URL or reference]
**Date:** [Publication date]
**Duration:** [Length]

---

## One-Line Thesis
[One sentence that captures the REAL point of this talk — not the title, but the subtext. What are they actually selling, advocating, or warning against?]

## Core Beliefs (What the speaker assumes is true)
- [Belief 1 — stated or implied]
- [Belief 2]
- [Belief 3]
- ...

For each belief, note whether it's **explicitly stated** or **implied through framing**.

## Pain Points (What keeps this person up at night)
- [Pain point 1 — with severity: Critical/High/Medium]
- [Pain point 2]
- ...

Prioritize pain points that affect more than just the speaker's company. Universal pains are stronger signals.

## Architecture & Technical Patterns (If applicable)
- [Key technical approach or pattern mentioned]
- [Tools/frameworks referenced]
- [How their system works at a high level]

If the talk is non-technical, replace this section with **Operational Patterns** — how they organize work, teams, or processes.

## Hidden Signals (Reading between the lines)
- [Signal 1]: [What they said → what it actually means]
- [Signal 2]: [What they deliberately didn't address]
- [Signal 3]: [Unexpected admission or slip]

This is the highest-value section. Focus on:
- **Unstated assumptions** — things they treat as obvious that aren't
- **Strategic positioning** — who they're competing with, what they're selling
- **Accidental revelations** — offhand comments that reveal more than the main thesis
- **Omissions** — what's conspicuously absent from their narrative

## What's NOT Being Said (Notable absences)
- [Topic they avoided]
- [Obvious counter-argument they didn't address]
- [Risk they downplayed or ignored]

## Speaker's Worldview (The lens they see through)
[2-3 sentences describing how this person sees the industry. What's their mental model? What tribe do they belong to? What paradigm are they operating from?]

## Key Quotes (Verbatim, high-signal)
> "[Exact quote 1]" — [context/timestamp if available]
> "[Exact quote 2]"
> "[Exact quote 3]"

Only include quotes that are genuinely insightful or revealing. Skip platitudes.

## Verdict (Your assessment)
[2-3 sentences. How important is this talk? Is the speaker ahead of the curve, riding the wave, or behind? What should someone building a product or making investment decisions take away from this?]

---
*Analyzed with Subtext*
```

## Tone Guidelines

The analysis voice should feel like a smart, slightly skeptical friend who's been in the industry for a while — not an academic reviewer, not a fan, not a hater. Specifically:

- **Direct.** Say "this is a sales pitch disguised as a technical talk" if that's what it is.
- **Specific.** "They mentioned a 40% reduction in latency" is useful. "They mentioned improvements" is not.
- **Honest about uncertainty.** If you can't tell whether something is a signal or noise, say so.
- **Connected.** Note when a speaker's claims contradict or confirm other talks in the corpus.
- **Anti-hype.** Default to skepticism for bold claims. Require evidence.
