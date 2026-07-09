---
name: source-to-syllabus
description: "Turn any codebase into a beautiful, multi-page interactive HTML course that teaches how the project works AND how it was built — from plain-English intuition all the way to proper software-engineering depth. Use this skill whenever someone wants to create an interactive course, tutorial, guided build, deep-dive, or educational walkthrough from a codebase or project. Also trigger for 'turn this into a course,' 'explain this codebase,' 'teach me this code,' 'how was this built,' 'deep dive on this repo,' 'codebase walkthrough,' 'upskill me on this project,' 'make me a better engineer with this,' or 'make a course from this project.' The skill first performs a deep codebase analysis and saves it as a report, then generates a multi-page course: a landing/syllabus page, an architecture page, and per module an Overview page (plain-English + build journey) and a Deep Dive page (complexity, tradeoffs, failure modes, exercises, and primary-source reading). Includes a Simply/Technically toggle, TL;DRs, curated resources, animated visualizations, quizzes, and code-with-plain-English translations."
---

# Source-to-Syllabus

Transform any codebase into a **multi-page interactive course** that takes a learner from plain-English intuition to genuine software-engineering depth. It does three things:

1. **Explains the project simply and technically** — an Overview page per module builds intuition; a paired Deep Dive page delivers the rigor. Inline, a Simply/Technically toggle covers core concepts at both depths.
2. **Teaches how it was built, step by step** — modules follow the real implementation order. Each step answers *what it is, why it's done, how it's done*, with a **TL;DR** for every step.
3. **Upskills the reader as an engineer** — every Deep Dive covers complexity & performance, alternative designs & tradeoffs, failure modes & concurrency, and hands-on exercises with primary-source reading. This is the "proper SWE upskilling" layer.

**Output is a multi-page site** (standalone HTML files sharing one stylesheet, one script, and a persistent sidebar): a landing/syllabus page, an architecture page, and — per module — an Overview page and a Deep Dive page. It opens with `index.html`, runs offline (only external deps: Google Fonts CDN + curated resource links), and every page loads independently so deep modules stay fast.

## First-Run Welcome

When first triggered without a codebase specified, introduce yourself:

> **I turn a codebase into a multi-page interactive course — from plain-English intuition to real engineering depth.**
>
> Point me at a project:
> - **A local folder** — "turn ./my-project into a course"
> - **A GitHub link** — "make a course from https://github.com/user/repo"
> - **The current project** — "turn this into a course"
>
> First I'll ask how deep you want to go (beginner → advanced). Then I **analyze the codebase and save a written analysis report**, and build a multi-page course: a syllabus, an architecture page, and for each module an **Overview** page (how it works, plain-English, the build journey) plus a **Deep Dive** page (complexity, tradeoffs, failure modes, exercises, and primary-source reading). It runs in your browser — no setup.

If given a GitHub link, clone first (`git clone <url> /tmp/<repo-name>`). If they say "this codebase," use the current directory.

## Who This Is For

Someone using a real project to **level up as an engineer** — self-taught devs, bootcamp grads, AI-first builders who want real depth, or experienced engineers new to *this* codebase. The multi-page split serves the full range at once:

- **Overview pages** meet the learner where they are: what the module does, a metaphor, the build steps, one applied quiz. Plain-English, fast, intuition-first.
- **Deep Dive pages** are the engineering education: mechanics, complexity, the designs that were *not* chosen and why, concurrency and failure analysis, and exercises that make the reader *do* the work. Precise and correct enough that a working engineer learns something.

The inline **Simply/Technically toggle** still appears on core concepts so a reader can cross depths without leaving a page. The chosen **level** (Phase 0) sets defaults — how deep the Deep Dives go, which track shows first, tooltip density, quiz style.

## Why This Approach Works

Anchor every concept in a real, running project, then layer theory as "here's the general principle behind what you just saw." Multi-page makes depth sustainable: intuition and rigor get their own space instead of fighting inside one scroll. The **saved analysis report** forces genuine understanding before any teaching, which is what makes the Deep Dives trustworthy rather than hand-wavy.

---

## The Process

### Phase 0: Choose the Learner's Level

Ask how deep the course should go (in Cowork use `AskUserQuestion`; in a CLI just ask): **Beginner**, **Intermediate**, **Advanced**, or **Give me everything**. This sets DEFAULTS only — both Overview and Deep Dive pages always exist; the toggle always remains.

| Lever | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Deep Dive depth | gentle, focused | full | maximal: proofs, benchmarks, alternatives |
| Default inline track | Simply | Simply | Technically |
| Tooltip density | maximal | moderate | minimal |
| Quiz style | conceptual | applied (debug/architecture) | tradeoffs / spot-the-bug |
| Resources | one beginner + one deeper | mixed | primary sources first (specs, papers) |
| Exercises | guided | applied | open-ended / extension |

If the user already signaled a level ("I'm senior," "new to backend"), infer it. Record it — it appears in the sidebar badge and tunes every page. For **Advanced**, also default the inline toggle to *Technically* (see Phase 3).

### Phase 1: Deep Codebase Analysis → Saved Report

**This is the foundation. Do it thoroughly, and write it down.** Read the codebase deeply — entry points, core modules, data flows, dependencies, git history and comments for real bugs and decisions. Reconstruct the *build order*. Then write a saved report to `course-name/analysis/codebase-analysis.md` using `references/analysis-report-template.md`.

The report is both a **deliverable the user can read on its own** and the **single source of truth** every page is written from. Also render it as an **in-course page** (`src/analysis.html`) so the reader can open it from the sidebar/index alongside the other pages — same content, styled like the rest of the course, with a pager. Keep the `.md` as the portable copy in `analysis/`. It must capture:
- What the app does and its end-to-end user journey.
- The architecture: components, responsibilities, and how they communicate.
- The data model and key data structures.
- The **implementation order** (what must exist before what) — this becomes the module arc.
- For each significant piece: the *simple* explanation and the *technical* mechanics, including complexity, tradeoffs, alternatives considered, and failure modes.
- Clever patterns, gotchas, and real bugs.
- The tech stack and why each piece was chosen.

Do NOT ask the user to explain their own product — figure it out from the code. Quality here determines the quality of every Deep Dive; invest in it.

### Phase 2: Curriculum Design — Build Journey, Two Pages per Module

Structure **4-7 modules that follow the implementation order**. Each module becomes **two pages**: an **Overview** and a **Deep Dive**. Plus two standalone pages: the **index** (landing + syllabus) and the **architecture** page (the report distilled into a visual, navigable page).

| Position | Build-Journey purpose | Transferable skill |
|---|---|---|
| 1 | The product & end-to-end flow | Reading a system top-down |
| 2 | Foundations — data model, skeleton | Domain modeling; data structures |
| 3 | The core engine — central logic | Algorithms; separation of concerns |
| 4 | Wiring — how pieces communicate | Interface design; integration debugging |
| 5 | The outside world — deps, DB, I/O | Latency, rate limits, failure |
| 6 | Robustness — errors, perf, security | Production-readiness; concurrency |
| 7 | Big picture & what to build next | System design; tradeoff evaluation |

A menu adapted to the codebase, not a fixed list. **Don't present the curriculum for approval — build it.**

**Mandatory across the course:** the saved analysis report; an index/syllabus page; an architecture page; per module an Overview page and a Deep Dive page; TL;DRs (module + build-step); at least one Code↔English translation per module; at least one Group Chat animation and one Data-Flow animation across the course; a quiz per module; glossary tooltips; and every Deep Dive's four required sections (see Page Anatomy). The inline Simply/Technically toggle appears on each module's core concept.

**Choose the build path:** simple codebase (≤5 modules) → write pages sequentially. Complex codebase (6+ modules, full-stack) → Phase 2.5 briefs, then dispatch pages to subagents in batches.

### Phase 2.5: Module Briefs (complex codebases only)

One brief per module (`course-name/briefs/0N-slug.md`), using `references/module-brief-template.md`. Each brief must plan **both pages**: the Overview (TL;DR, build-steps, dual-track pair, quiz) and the Deep Dive (the four required sections with pre-extracted code, complexity numbers, the alternatives to contrast, the failure modes, exercises, and verified primary-source links). Pre-extracting snippets and links is what lets agents write without re-reading the codebase.

### Phase 3: Build the Course

Output is a directory of standalone pages. CSS/JS are pre-built — never regenerate them.

**Output structure:**
```
course-name/
  styles.css        ← copied verbatim from references/styles.css
  main.js           ← copied verbatim from references/main.js
  _head.html        ← customized shell head + sidebar (title, accent, module links)
  _foot.html        ← copied verbatim from references/_foot.html
  build.sh          ← copied verbatim from references/build.sh
  analysis/
    codebase-analysis.md   ← the saved analysis report (Phase 1)
  briefs/           ← complex codebases only
  src/              ← page fragments you write (inner HTML of <main class="page">)
    index.html
    analysis.html      ← the analysis report, as an in-course page
    architecture.html
    01-overview.html   01-deep-dive.html
    02-overview.html   02-deep-dive.html
    ...
  (built pages)     ← index.html, architecture.html, 0N-overview.html, 0N-deep-dive.html at root
```

**Step 1 — Setup:** Create the directory. Copy verbatim: `styles.css`, `main.js`, `_foot.html`, `build.sh`. Create `analysis/` and write the report there.

**Step 2 — Customize `_head.html`:** Read `references/_head.html`, write it to `course-name/_head.html` with:
- `COURSE_TITLE`, `COURSE_SUBTITLE`, `LEVEL` (the Phase 0 level).
- The four `ACCENT_*` values (pick a palette).
- `SIDEBAR_MODULES` → one `.sb-module` block per module (Overview + Deep Dive links; filenames must match `src/`). Keep the top-links to `index.html`, `analysis.html`, and `architecture.html`.
- Optionally override `--color-accent-2`, `--color-actor-*`, `--color-surface-warm` for a fuller brand.
- **Advanced level:** author each `.dual-track` block with its `technically` tab/pane marked `active` instead of `simply`.

**Step 3 — Write page fragments into `src/`.** Each fragment is the inner HTML of `<main class="page">` — no `<html>`, `<head>`, `<body>`, sidebar, `<style>`, or `<script>`. Every content page ends with a `.pager` (prev/next). Follow **Page Anatomy** below. Read `references/content-philosophy.md`, `references/interactive-elements.md`, `references/deep-dive-template.md`, `references/resource-curation.md`, and `references/gotchas.md`.

For complex codebases, dispatch pages to subagents in batches of ≤3 modules (each agent writes one module's Overview + Deep Dive from its brief).

**Step 4 — Assemble:** `cd course-name && bash build.sh`. It wraps every `src/*.html` into a standalone page at the root. Open `index.html`.

### Phase 4: Review and Open

Open `index.html`, click through the sidebar, spot-check one Deep Dive end-to-end. Run the `references/gotchas.md` checklist (all links resolve, sidebar filenames match, every module has both pages, each Deep Dive has all four sections). Walk the user through it and invite feedback.

---

## Page Anatomy

Every content fragment lives inside `<main class="page">`, wraps its body in `<div class="module-content">`, and ends with a `<nav class="pager">`.

### Index page (`src/index.html`)
A `.page-hero` (course title + one-paragraph lede: what the project is and what the reader will be able to do after), then a `.syllabus` list — one `.syllabus-item` per module with a one-line description and links to its Overview and Deep Dive. End with a pager whose "next" is Module 1 Overview.

### Analysis page (`src/analysis.html`)
The Phase 1 report rendered as a styled in-course page: the same sections (what it is, stack, architecture, data model, build order, deep technical notes, primary sources, curriculum), using prose, `.spec-table`s, callouts, and file trees rather than raw markdown. Linked from the sidebar top-links and the index. Ends with a pager into the Architecture page or Module 1.

### Architecture page (`src/architecture.html`)
The analysis report distilled into a **navigable, visual** page: an interactive architecture diagram or icon-rows of the components, at least one data-flow or group-chat animation of the primary journey, a visual file tree, and a short dual-track on the overall design. This is the map the rest of the course zooms into.

### Overview page (`src/0N-overview.html`) — intuition + build journey
- Module header + a module-level **`.tldr`**.
- The plain-English story: what this stage is, a fitting metaphor, why it matters.
- **Build-step cards** (What/Why/How) with inline TL;DRs — the build narrative.
- At least one **Code↔English** translation and one **Dual-Track** block on the core concept.
- One **applied quiz**.
- A pager: prev = previous module's Deep Dive (or index); **next = this module's Deep Dive**.

### Deep Dive page (`src/0N-deep-dive.html`) — the SWE upskilling
Open with a `.page-kicker` ("DEEP DIVE"), a one-line orientation, and a `.dd-toc`. Then **all four `.dd-section`s are required** (see `references/deep-dive-template.md` for full patterns):
1. **Complexity & Performance** — Big-O of the hot paths, what dominates, scaling behavior, a `.spec-table` of operations vs. cost, benchmarks/estimates where possible.
2. **Alternatives & Tradeoffs** — the designs that were *not* chosen, as `.tradeoff-card`s (chosen vs. alternatives, each with pros/cons). Name the decision and defend it honestly.
3. **Failure Modes & Concurrency** — edge cases, races (TOCTOU, lost updates), error handling, what breaks at scale; ideally a spot-the-bug challenge.
4. **Exercises & Primary Sources** — 2-4 `.exercise` cards ("try it yourself," with a `<details>` hint), and a `.spec-ref` / resource list pointing to specs, papers, and canonical docs (verified — see `references/resource-curation.md`).
- A pager: **next = the next module's Overview** (or, on the last module, back to index).

---

## Design Identity

A **beautiful developer notebook** with a persistent left **sidebar** for navigation. Read `references/design-system.md` for tokens. Non-negotiables: **Clash Display** (display), **Satoshi** (body), **Geist Mono** (code), loaded from Fontshare + Google Fonts CDNs; the default palette is **seaside** (stormy-teal + terracotta, cream warm surface); generous whitespace; dark IDE-style code blocks; soft shadows. A **light/dark mode toggle** lives in the sidebar — it flips the whole site, defaults to light, and remembers the reader's choice across pages (dark mode derives a lightened accent from the course palette, so it works with any palette). Other palettes (vermillion/teal/forest/lapis-velvet) remain available.

---

## Reference Files

Read only when you reach the relevant phase.

- **`references/analysis-report-template.md`** — Structure for the Phase 1 saved analysis report. Read at Phase 1.
- **`references/deep-dive-template.md`** — The four required Deep Dive sections with HTML patterns (complexity tables, tradeoff cards, exercises, spec-refs). Read at Phase 3 (and 2.5).
- **`references/content-philosophy.md`** — Dual-track, TL;DRs, build-steps, metaphors, quizzes, tooltips. Read at Phase 2.5 and 3.
- **`references/interactive-elements.md`** — HTML patterns for every element (dual-track, TL;DR, build-step, level-up, resources, code↔English, quizzes, chat, flow, diagrams, tooltips). Read at Phase 3.
- **`references/resource-curation.md`** — Finding, verifying, formatting external/primary-source links. Read whenever writing resources.
- **`references/module-brief-template.md`** — Brief template (now covering both pages). Complex codebases only.
- **`references/design-system.md`** — Full token system. Read at Phase 3.
- **`references/gotchas.md`** — Failure-point checklist. Read at Phase 3 and 4.
- **`references/_head.html` / `_foot.html` / `build.sh`** — The multi-page shell and assembler. Customize `_head.html`; copy the others verbatim.

> **Legacy single-page mode:** the original single-scroll shell (`references/_base.html` + `references/_footer.html`) is still present for compact courses. For the deep, multi-page course this skill is designed around, use `_head.html` / `_foot.html`.
