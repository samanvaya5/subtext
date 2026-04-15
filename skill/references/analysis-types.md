# Analysis Types Menu

This document describes the different analysis modes a user can choose in Stage 3. The user can select one, combine multiple, or define their own. The default is **Strategic Deep Dive**.

---

## Type 1: Strategic Deep Dive (Default)

The full opinionated analysis. Best for conference talks, product launches, keynotes — any content where there's strategic subtext to extract.

**Focus:** Hidden signals, what's NOT said, power dynamics, speaker positioning.

**Use when:** The user wants to understand what's REALLY going on in a set of talks/videos.

**Schema:** See `baseline-schemas.md` — this is the full default schema.

---

## Type 2: Technical Extraction

Focused on extracting concrete technical knowledge: architectures, tools, patterns, code approaches, benchmarks.

**Focus:** How things are built, what tech stack is used, what works and what doesn't.

**Sections:**
- Problem Statement (what technical challenge they're solving)
- Architecture Diagram (describe in text if not shown)
- Tech Stack (specific tools/libraries with versions)
- Key Technical Decisions (and why they made them)
- Benchmarks/Metrics (hard numbers)
- Gotchas & Failures (what broke, what they learned)
- Reusable Patterns (things the reader could apply)
- Code Samples (if any were shown)

**Use when:** The user wants to learn specific technical approaches from the videos.

---

## Type 3: Market Intelligence

Focused on competitive landscape: who's building what, market positioning, partnerships, acquisitions hinted at.

**Focus:** Company strategies, product positioning, market gaps, competitive threats.

**Sections:**
- Company Positioning (how they present themselves vs. reality)
- Product/Motion Announcements (anything new revealed)
- Competitive Landscape (who they're competing with, according to them)
- Partnership Signals (who they mention favorably, integrations highlighted)
- Market Claims (TAM, growth rates, adoption numbers — with fact-checking)
- Customer Signals (who's using their product, case studies mentioned)
- Market Gaps (problems mentioned that nobody is solving well)

**Use when:** The user is doing competitive research or market analysis.

---

## Type 4: Sentiment & Trend Analysis

Focused on tracking how topics, opinions, and sentiments evolve across videos over time.

**Focus:** What's trending up, what's trending down, emerging topics, dying topics.

**Sections:**
- Topic Classification (primary topics discussed)
- Sentiment Assessment (optimistic/cautious/bearish per topic)
- Trend Direction (emerging/peak/declining per topic)
- Buzzword Tracker (hype terms and their actual substance)
- Prediction Tracker (specific predictions made, with timeframes)
- Consensus vs. Contrarian (where speakers agree/disagree)

**Use when:** The user wants to understand the zeitgeist — what the conversation is about and where it's heading.

---

## Type 5: Idea Evaluator

A special mode where the user provides THEIR OWN idea/product/proposal and the analysis is framed around evaluating it against the corpus.

**Focus:** Strengths, weaknesses, blind spots, opportunities for the user's specific idea.

**Sections:**
- Idea Summary (the user's idea, as they described it)
- Corpus Alignment (does the corpus support or contradict the idea?)
- Validation Points (evidence from videos that supports the idea)
- Challenge Points (evidence that contradicts or challenges the idea)
- Gap Identification (what the idea is missing based on corpus insights)
- Competitive Threats (who in the corpus is building something similar)
- Enhancement Opportunities (features/directions the corpus suggests)
- Verdict: Lead or Chase (is this idea ahead of the market or following it?)

**Use when:** The user has a specific product/idea they want to pressure-test against the intelligence.

---

## Type 6: Custom

The user describes what they want in their own words. You interpret their description into a structured schema, show it back to them, and get confirmation before proceeding.

When a user says something like "I want to focus on the business models" or "extract all the AI safety concerns" or "just give me the action items" — this is a custom analysis. Build the schema collaboratively.

---

## Combining Types

Users can combine types. For example:
- "Strategic Deep Dive + Market Intelligence" — full analysis with extra focus on competitive dynamics
- "Technical Extraction + Sentiment" — technical deep-dive with trend context
- "Idea Evaluator using insights from Strategic Deep Dive" — per-talk analysis first, then idea evaluation in Stage 6

When combining, merge the sections from both types into a single schema, noting which sections come from which type.
