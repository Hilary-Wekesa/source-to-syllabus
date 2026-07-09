# Gotchas — Common Failure Points

> **When to read this:** During Phase 3 (writing module HTML) and Phase 4 (review). Check every one of these before considering a course complete.

These are real problems encountered when building courses. Check every one before considering a course complete.

### Tooltip Clipping
Translation blocks use `overflow: hidden` for code wrapping. If tooltips use `position: absolute` inside the term element, they get clipped by the container. **Fix:** Tooltips must use `position: fixed` and be appended to `document.body`. Calculate position from `getBoundingClientRect()`. This is already handled by `main.js` but is the #1 bug that appears in every build.

### Not Enough Tooltips
The most common failure is under-tooltipping. Non-technical learners don't know terms like REPL, JSON, flag, entry point, PATH, pip, namespace, function, class, module, PR, E2E, or even software names like Blender/GIMP. **Rule of thumb:** if a term wouldn't appear in everyday conversation with a non-technical friend, tooltip it. Err heavily on the side of too many. BUT: don't tooltip terms the user already knows well from their domain (e.g., AI/ML concepts for someone in AI).

### Walls of Text
The course looks like a textbook instead of an infographic. This happens when you write more than 2-3 sentences in a row without a visual break. Every screen must be at least 50% visual. Convert any list of 3+ items into cards, any sequence into step cards or flow diagrams, any code explanation into a code↔English translation block.

### Recycled Metaphors
Using "restaurant" or "kitchen" for everything. Every module needs its own metaphor that feels inevitable for that specific concept. If you catch yourself reaching for the same metaphor twice, stop and find one that fits the concept organically.

### Code Modifications
Trimming, simplifying, or "cleaning up" code snippets from the codebase. The learner should be able to open the real file and see the exact same code. Instead of editing code to be shorter, *choose* naturally short snippets (5-10 lines) from the codebase that illustrate the point.

### Quiz Questions That Test Memory
Asking "What does API stand for?" or "Which file handles X?" — those test recall, not understanding. Every quiz question should present a new scenario the learner hasn't seen and ask them to *apply* what they learned.

### Scroll-Snap Mandatory
Using `scroll-snap-type: y mandatory` traps users inside long modules. Always use `proximity`.

### Module Quality Degradation
Trying to write all modules in one pass causes later modules to be thin and rushed. Build one module at a time and verify each before moving on. For complex codebases, use the parallel path with module briefs.

### Missing Interactive Elements
A module with only text and code blocks, no interactivity. Every module needs at least one of: quiz, data flow animation, group chat, architecture diagram, drag-and-drop. These aren't decorations — they're how non-technical learners actually process information.

---

## v2 Gotchas (Dual-Track Build Journey)

### Dual-Track Imbalance
The Technically pane is just the Simply pane with fancier words, adding no real information. **Fix:** the Technically track must add mechanics the Simply track omitted — data structures, complexity, a protocol, and at least one tradeoff or failure mode. If you can't name something concrete it adds, the concept doesn't need a toggle.

### Two Different Concepts in One Toggle
The Simply and Technically panes describe different things. **Fix:** both panes explain the SAME concept at different depths. Simply = metaphor + why-you-care; Technically = the real mechanics of that same thing.

### Dual-Track Overuse
Every paragraph wrapped in a toggle, making the page a wall of tabs. **Fix:** 1-2 dual-track blocks per module, on the central concepts only.

### Missing Track / Broken Toggle
A `.dual-track` with only one tab, or no tab marked `active`. **Fix:** every block needs exactly two `.dt-tab`s (`data-track="simply"` and `"technically"`) and two matching `.dt-pane`s, with one tab AND its pane carrying `active`.

### Missing TL;DR or Level Up
A module with no opening `.tldr`, or no closing `.levelup`. Both are mandatory in every module. Every `build-step` also needs its `.tldr-inline`.

### Invented / Broken Resource Links
Making up a plausible-looking URL. This destroys trust instantly. **Fix:** every resource link must be a real, verified URL. Prefer canonical, stable sources (official docs, well-known channels, established sites). See `resource-curation.md`. When unsure, link the canonical docs/homepage rather than a guessed deep link.

### Build-Journey That Isn't a Build
Modules that describe the running system but never convey build ORDER. **Fix:** order modules by implementation dependency, and use What/Why/How build-steps so the learner could reconstruct the project from scratch.

---

## v3 Gotchas (Multi-Page + Deep Dive)

### Sidebar/Filename Drift
Sidebar links in `_head.html` point to files that don't exist in `src/` (or vice-versa). **Fix:** keep the `.sb-link` `href`s exactly matching the built filenames (`0N-overview.html`, `0N-deep-dive.html`). After building, click every sidebar link.

### Pager Dead-Ends
A page's `.pager` prev/next points to a missing or wrong file, or a page has no pager. **Fix:** every content page ends with a `.pager`; Overview→Deep Dive→next Overview; index is the first prev, last module loops back to index.

### Fragment Includes Boilerplate
A `src/` fragment contains `<html>`, `<head>`, `<body>`, the sidebar, or `<style>`/`<script>`. **Fix:** fragments are inner HTML of `<main class="page">` only — the shell adds the rest. Duplicated boilerplate breaks the build output.

### Missing Deep Dive Section
A Deep Dive page missing one of the four required sections (complexity, tradeoffs, failure modes, exercises+sources). All four are mandatory on every Deep Dive — scale depth by level, never drop a section.

### Analysis Report Skipped or Thin
Jumping to pages without writing `analysis/codebase-analysis.md`, or writing it too shallow. The report is the source of truth for the Deep Dives; a thin report produces hand-wavy deep dives. Invest in Phase 1.

### Deep Dive That Isn't Deep
A Deep Dive that just restates the Overview with longer words. **Fix:** it must add real information the Overview omitted — complexity numbers, named alternatives with tradeoffs, concrete failure/concurrency analysis, and exercises.

### Relative-Link Assumptions
Using absolute paths or subfolder paths in sidebar/pager links. All built pages live at the course root, so links are bare filenames (`02-deep-dive.html`). Opening via `file://` must work.
