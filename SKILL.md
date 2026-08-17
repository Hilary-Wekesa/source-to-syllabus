---
name: source-to-syllabus
description: "Turn any codebase into a beautiful, multi-page interactive HTML course that teaches how the project works AND how it was built — from plain-English intuition all the way to proper software-engineering depth. Use this skill whenever someone wants to create an interactive course, tutorial, guided build, deep-dive, or educational walkthrough from a codebase or project. Also trigger for 'turn this into a course,' 'explain this codebase,' 'teach me this code,' 'how was this built,' 'deep dive on this repo,' 'codebase walkthrough,' 'upskill me on this project,' 'make me a better engineer with this,' or 'make a course from this project.' The skill first performs a deep codebase analysis and saves it as a report, then generates a multi-page course: a landing/syllabus page, an architecture page, and per module an Overview page (plain-English + build journey) and a Deep Dive page (complexity, tradeoffs, failure modes, exercises, and primary-source reading). Includes a Simply/Technically toggle, TL;DRs, curated resources, animated visualizations, quizzes, code-with-plain-English translations, and an adjustable annotation depth that goes all the way to line-by-line annotated source walkthroughs. Also trigger for 'explain this code line by line,' 'annotate this file,' 'walk me through this function line by line,' or 'I want every line explained.'"
---

# Source-to-Syllabus

Transform any codebase into a **multi-page interactive course** that takes a learner from *"I have no idea what's going on"* to *"I understand this codebase and can explain it."*

That last word is the bar. A course that is merely read does not clear it, so the course asks the reader to produce before it explains: predict before reveal, retrieve before re-read, explain before comparing. It does four things:

1. **Explains the project simply and technically** — an Overview page per module builds intuition; a paired Deep Dive page delivers the rigor. Inline, a Simply/Technically toggle covers core concepts at both depths.
2. **Teaches how it was built, step by step** — modules follow the real implementation order. Each step answers *what it is, why it's done, how it's done*, with a **TL;DR** for every step.
3. **Upskills the reader as an engineer** — every Deep Dive covers complexity & performance, alternative designs & tradeoffs, failure modes & concurrency, and hands-on exercises with primary-source reading. This is the "proper SWE upskilling" layer.
4. **Checks that it actually landed** — explain-back gates, predict-before-reveal, retrieval practice across modules, an execution tracer, confidence calibration, and a capstone where the reader explains the whole system back. Pages complete when checkpoints are met, not when they're scrolled. See `references/comprehension.md`.

**Output is a multi-page site** (standalone HTML files sharing one stylesheet, one script, and a persistent sidebar): a landing/syllabus page, an architecture page, per module an Overview page and a Deep Dive page, and a capstone. It opens with `index.html`, runs offline (only external deps: Google Fonts CDN + curated resource links), and every page loads independently so deep modules stay fast.

## First-Run Welcome

When first triggered without a codebase specified, introduce yourself:

> **I turn a codebase into a multi-page interactive course — from plain-English intuition to real engineering depth.**
>
> Point me at a project:
> - **A local folder** — "turn ./my-project into a course"
> - **A GitHub link** — "make a course from https://github.com/user/repo"
> - **The current project** — "turn this into a course"
>
> First I'll ask two things: how deep you want to go (beginner → advanced), and how densely you want the code explained (a few key snippets → a full line-by-line annotation of the files that matter). Then I **analyze the codebase and save a written analysis report**, and build a multi-page course: a syllabus, an architecture page, for each module an **Overview** page (how it works, plain-English, the build journey) plus a **Deep Dive** page (complexity, tradeoffs, failure modes, runnable exercises, primary sources), and a **capstone** where you explain the whole system back.
>
> It's built to be worked through, not just read — it predicts, quizzes, and asks you to explain things in your own words before it hands over the answer. One toggle turns all of that off if you'd rather use it as a reference. Every code snippet is stamped with the file and line it came from and verified against the real source. It runs in your browser — no setup.

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

### Phase 0: Choose the Learner's Level *and* the Annotation Depth

Ask **two** questions (in Cowork use `AskUserQuestion` — both in one call; in a CLI just ask). They are orthogonal axes: level is *who the reader is*, annotation is *how densely the code is explained*. Never fold one into the other — a beginner may want every line spelled out, and so may a staff engineer reading an unfamiliar algorithm.

**Question 1 — Level:** **Beginner**, **Intermediate**, **Advanced**, or **Give me everything**. This sets DEFAULTS only — both Overview and Deep Dive pages always exist; the toggle always remains.

| Lever | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Deep Dive depth | gentle, focused | full | maximal: proofs, benchmarks, alternatives |
| Default inline track | Simply | Simply | Technically |
| Tooltip density | maximal | moderate | minimal |
| Quiz style | conceptual | applied (debug/architecture) | tradeoffs / spot-the-bug |
| Resources | one beginner + one deeper | mixed | primary sources first (specs, papers) |
| Exercises | guided | applied | open-ended / extension |
| **Module 0** | **required** | skip | skip |

**Beginner means beginner.** If the reader picks Beginner — or says anything like "I have no idea what's going on," "I'm not a developer," "I've never read code" — build **Module 0** (see Page Anatomy). Without it the course claims to serve absolute beginners while Module 1 quietly assumes they can already read a function signature. That gap is the difference between the promise and the artifact.

If the user already signaled a level ("I'm senior," "new to backend"), infer it. Record it — it appears in the sidebar badge and tunes every page. For **Advanced**, also default the inline toggle to *Technically* (see Phase 3).

**Question 2 — Annotation depth:** how densely should real code be explained?

| Mode | What it produces |
|---|---|
| **Sparse** | Code↔English only — 1-2 punchy snippets per module, one English line per 1-2 code lines. |
| **Standard** | Every taught function gets a translation block; the module's most important function gets a walkthrough. *Default if unspecified.* |
| **Line-by-line** | Each module names 1-2 **canonical files**, rendered in full as Annotated Source Walkthroughs with every meaningful line annotated. |
| **Exhaustive** | Every line of the canonical files — imports, type declarations, error branches — plus per-line asides naming the alternative rejected on that line. |

**Scoping rule (non-negotiable):** Line-by-line and Exhaustive mean exhaustive *within the module's canonical files*, budgeted at **~400 annotated lines per module** (hard ceiling 600). Annotating an entire repository is unbuildable and unreadable. Everything outside the canonical files stays at Standard density, and walkthroughs live on Deep Dive pages unless the Overview's core concept genuinely needs one — the intuition/rigor split is the point of the two-page structure.

Record the annotation mode too: it fills the second sidebar badge (`ANNOTATION` in `_head.html`) and drives Phase 2.5 and Phase 3. Read `references/annotated-code.md` before writing any code into a page.

### Phase 1: Deep Codebase Analysis → Saved Report

**This is the foundation. Do it thoroughly, and write it down.** Read the codebase deeply — entry points, core modules, data flows, dependencies, git history and comments for real bugs and decisions. Reconstruct the *build order*. Then write a saved report to `course-name/analysis/codebase-analysis.md` using `references/analysis-report-template.md`.

**Do the git archaeology first — read `references/git-archaeology.md`.** The build order, the real bugs, and the genuinely-rejected alternatives all come from history, not from guessing. Also capture the pin, which every code snippet in the course will cite:

```bash
git -C <repo> rev-parse --short HEAD        # → data-sha on every code block
git -C <repo> remote get-url origin         # → data-repo on every code block
```

If the project has no usable history, say so in the report and mark the build order as **inferred from dependency structure** rather than observed. Never present an inferred order as if it were evidence.

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

**Mandatory across the course:** the saved analysis report; an index/syllabus page; an architecture page; per module an Overview page and a Deep Dive page; a **capstone page**; TL;DRs (module + build-step); at least one Code↔English translation per module; at least one Group Chat animation and one Data-Flow animation across the course; a quiz per module; glossary tooltips; **provenance stamps on ≥80% of code blocks**; **at least one runnable exercise per Deep Dive**; and every Deep Dive's four required sections (see Page Anatomy). The inline Simply/Technically toggle appears on each module's core concept. At **Line-by-line** or **Exhaustive** annotation, add: canonical files declared per module and at least one Annotated Source Walkthrough per Deep Dive. At **Beginner** level, add Module 0.

**Comprehension checkpoints are mandatory too** — read `references/comprehension.md`. Per page: an **explain-back** on every Deep Dive, **predict-before-reveal** blocks placed before the thing they're about, **retrieval practice** at the top of every Overview from Module 2 on, an **Ask Claude** button per module, at least one **execution tracer** across the course, and a **mastery checklist** on the capstone. Budget 3-5 checkpoints per page — more and the course becomes a form to fill in. Every checkpoint soft-gates only; the sidebar Reading-mode toggle must always be able to open all of them.

**Choose the build path:** simple codebase (≤5 modules) → write pages sequentially. Complex codebase (6+ modules, full-stack) → Phase 2.5 briefs, then dispatch pages to subagents in batches.

### Phase 2.5: Module Briefs (complex codebases only)

One brief per module (`course-name/briefs/0N-slug.md`), using `references/module-brief-template.md`. Each brief must plan **both pages**: the Overview (TL;DR, build-steps, dual-track pair, quiz) and the Deep Dive (the four required sections with pre-extracted code, complexity numbers, the alternatives to contrast, the failure modes, exercises, and verified primary-source links). Pre-extracting snippets and links is what lets agents write without re-reading the codebase.

Each brief must also name the module's **canonical files** (1-2, with the line ranges to walk through and the annotation budget), the **real bug commits** from Phase 1 that its Failure Modes section will use, and the **runnable exercise** it will ship. Every pre-extracted snippet in the brief carries its `data-src` / `data-start` — subagents must never re-type code from memory.

### Phase 3: Build the Course

Output is a directory of standalone pages. CSS/JS are pre-built — never regenerate them.

**Output structure:**
```
course-name/
  styles.css        ← copied verbatim from references/styles.css
  main.js           ← copied verbatim from references/main.js
  _head.html        ← customized shell head + sidebar (title, accent, badges, module links)
  _foot.html        ← copied verbatim from references/_foot.html
  build.sh          ← copied verbatim from references/build.sh
  build_assets.py   ← copied verbatim (glossary injection + search index)
  check.sh          ← copied verbatim (pre-flight gate)
  verify_snippets.py← copied verbatim (code provenance verifier)
  glossary.json     ← terms → plain-English definitions (you write it)
  analysis/
    codebase-analysis.md   ← the saved analysis report (Phase 1)
  briefs/           ← complex codebases only
  exercises/        ← runnable exercises, one directory per exercise
    README.md
    03-eviction-policy/{README.md,starter/,solution/,run.sh,test_*}
  src/              ← page fragments you write (inner HTML of <main class="page">)
    index.html
    analysis.html      ← the analysis report, as an in-course page
    architecture.html
    00-orientation.html   ← Module 0, Beginner level only
    01-overview.html   01-deep-dive.html
    02-overview.html   02-deep-dive.html
    ...
    capstone.html      ← synthesis + mastery checklist
  (built pages)     ← index.html, architecture.html, 0N-overview.html, 0N-deep-dive.html at root
  search-index.json ← emitted by build.sh
```

**Step 1 — Setup:** Create the directory. Copy verbatim: `styles.css`, `main.js`, `_foot.html`, `build.sh`, `build_assets.py`, `check.sh`, `verify_snippets.py`. Create `analysis/` and write the report there. Create `glossary.json` (see `references/glossary-and-search.md`) — 30-60 terms, written as you draft pages rather than all at the end.

**Step 2 — Customize `_head.html`:** Read `references/_head.html`, write it to `course-name/_head.html` with:
- `COURSE_TITLE`, `COURSE_SUBTITLE`, `LEVEL` (the Phase 0 level), `ANNOTATION` (the Phase 0 annotation mode, e.g. "line-by-line"). If annotation is Standard, delete that badge span rather than leaving the placeholder.
- The four `ACCENT_*` values (pick a palette).
- `SIDEBAR_MODULES` → one `.sb-module` block per module (Overview + Deep Dive links; filenames must match `src/`). Keep the top-links to `index.html`, `analysis.html`, and `architecture.html`; add `00-orientation.html` (Beginner only) and `capstone.html`. Keep the `.gates-toggle` button — it is the reader's escape hatch from the checkpoints.
- Optionally override `--color-accent-2`, `--color-actor-*`, `--color-surface-warm` for a fuller brand.
- **Advanced level:** author each `.dual-track` block with its `technically` tab/pane marked `active` instead of `simply`.

**Step 3 — Write page fragments into `src/`.** Each fragment is the inner HTML of `<main class="page">` — no `<html>`, `<head>`, `<body>`, sidebar, `<style>`, or `<script>`. Every content page ends with a `.pager` (prev/next). Follow **Page Anatomy** below. Read `references/content-philosophy.md`, `references/comprehension.md`, `references/interactive-elements.md`, `references/annotated-code.md`, `references/deep-dive-template.md`, `references/exercises.md`, `references/resource-curation.md`, and `references/gotchas.md`.

**Write the checkpoints as you write the page, not afterwards.** A predict block bolted on after the explanation is just a quiz — it has to come *before* the thing it's about, which changes how the page is structured. Same for retrieval practice: it belongs at the top, asking about earlier modules, before any new content.

**Code discipline while writing:** every code block carries `data-src` / `data-start` / `data-sha` / `data-repo`. Paste real lines — never re-type from memory, never trim to make it read better. Inside a `.walkthrough`, never hand-write `<span class="code-keyword">`; the tokenizer in `main.js` handles highlighting, and manual spans corrupt the byte-comparison.

For complex codebases, dispatch pages to subagents in batches of ≤3 modules (each agent writes one module's Overview + Deep Dive from its brief).

**Step 4 — Build the exercises.** Write `exercises/` per `references/exercises.md`, then actually run each one: it must fail against `starter/` and pass against `solution/`. An exercise you didn't execute doesn't ship.

**Step 5 — Assemble:** `cd course-name && bash build.sh`. It injects glossary tooltips, wraps every `src/*.html` into a standalone page at the root, and emits `search-index.json`.

### Phase 4: Verify, Then Open

**Verification is a gate, not a glance. Run all three:**

```bash
cd course-name
bash check.sh                                    # structure, links, required sections
bash check.sh --links                            # also verifies every external URL
python3 verify_snippets.py --repo <path-to-repo> # every snippet byte-matches the source
```

`check.sh` must exit 0. `verify_snippets.py` must report zero failures — a `DRIFT` means a wrong `data-start` (fix the number), a `MISMATCH` means the rendered code isn't what's in the file (paste the real lines). Do not skip this because the pages look fine; looking fine is exactly the failure mode it catches.

Then open `index.html`, click through the sidebar, spot-check one Deep Dive end-to-end, and test one walkthrough's hover/pin behaviour. Note for the user that course search needs a local server (`python3 -m http.server 8000`) since browsers block `fetch()` over `file://` — everything else works offline. Walk them through it and invite feedback.

---

## Page Anatomy

Every content fragment lives inside `<main class="page">`, wraps its body in `<div class="module-content">`, and ends with a `<nav class="pager">`.

### Index page (`src/index.html`)
A `.page-hero` (course title + one-paragraph lede: what the project is and what the reader will be able to do after), a `<div class="progress-summary"></div>` (populated by `main.js` — pages completed, cumulative quiz score, and concepts flagged for revisiting), then a `.syllabus` list — one `.syllabus-item` per module with a one-line description and links to its Overview and Deep Dive. Include a short "how to use this course" note covering the sidebar search (`/` to focus), the Simply/Technically toggle, dark mode, and — importantly — **Reading mode**: state plainly that the course asks questions before it gives answers, and that one toggle turns all of that off for anyone who just wants a reference. End with a pager whose "next" is Module 0 (Beginner) or Module 1 Overview.

### Analysis page (`src/analysis.html`)
The Phase 1 report rendered as a styled in-course page: the same sections (what it is, stack, architecture, data model, build order, deep technical notes, primary sources, curriculum), using prose, `.spec-table`s, callouts, and file trees rather than raw markdown. Linked from the sidebar top-links and the index. Ends with a pager into the Architecture page or Module 1.

### Architecture page (`src/architecture.html`)
The analysis report distilled into a **navigable, visual** page: an interactive architecture diagram or icon-rows of the components, at least one data-flow or group-chat animation of the primary journey, a visual file tree, and a short dual-track on the overall design. This is the map the rest of the course zooms into. Include an **execution tracer** of the primary journey — watching an animation is recognition; reconstructing the path is understanding.

### Module 0 (`src/00-orientation.html`) — the on-ramp, Beginner level only
For someone who genuinely cannot read code yet. Without this, "anyone at any level" is a claim the course doesn't honour.
- What this project is, in one paragraph, with zero jargon.
- **How to read this language at all**: what a function, a call, an argument, a return, an import, and a file actually are — shown against three real lines from *this* codebase, not a toy example.
- **How to navigate the repo**: a visual file tree with "if you wanted to change the login button, you'd go here" annotations.
- What "running" the project even means for this stack.
- One very gentle **predict** block and one **explain-back** with a forgiving rubric — the goal is to prove to the reader that they can do this, not to test them.
- Pager: prev = index; next = Module 1 Overview.

Do not condescend. The reader is new to code, not stupid — and many of them are experts in something else.

### Overview page (`src/0N-overview.html`) — intuition + build journey
- **Retrieval practice** at the very top (from Module 2 onward): 2-3 `.recall-q` about the previous two modules, before any new content.
- Module header + a module-level **`.tldr`**.
- The plain-English story: what this stage is, a fitting metaphor, why it matters.
- **Build-step cards** (What/Why/How) with inline TL;DRs — the build narrative, drawn from the git archaeology.
- At least one **Code↔English** translation (with provenance) and one **Dual-Track** block on the core concept.
- 1-2 **predict-before-reveal** blocks, each placed *before* the code or explanation it's about.
- One **applied quiz** with `data-checkpoint` and `data-remediate` on each question.
- An **Ask Claude** button whose prompt names this module's specific concepts.
- A pager: prev = previous module's Deep Dive (or index); **next = this module's Deep Dive**.

Overview pages stay light on code even at Exhaustive annotation. Walkthroughs belong on the Deep Dive unless the core concept genuinely can't be taught without one.

### Deep Dive page (`src/0N-deep-dive.html`) — the SWE upskilling
Open with a `.page-kicker` ("DEEP DIVE"), a one-line orientation, and a `.dd-toc`. Then **all four `.dd-section`s are required** (see `references/deep-dive-template.md` for full patterns):
1. **Complexity & Performance** — Big-O of the hot paths, what dominates, scaling behavior, a `.spec-table` of operations vs. cost, benchmarks/estimates where possible.
2. **Alternatives & Tradeoffs** — the designs that were *not* chosen, as `.tradeoff-card`s (chosen vs. alternatives, each with pros/cons). Name the decision and defend it honestly. Prefer alternatives the project *actually* rejected — reverts, deletions, and rewrites found in Phase 1 — over speculative ones.
3. **Failure Modes & Concurrency** — edge cases, races (TOCTOU, lost updates), error handling, what breaks at scale; ideally a spot-the-bug challenge built from a **real bug-fix commit**, cited by short SHA.
4. **Exercises & Primary Sources** — 2-4 `.exercise` cards, **at least one of them runnable** (see `references/exercises.md`), plus a `.spec-ref` / resource list pointing to specs, papers, and canonical docs (verified — see `references/resource-curation.md`).
- At **Line-by-line** / **Exhaustive** annotation: at least one **Annotated Source Walkthrough** of a canonical file, placed in whichever section it teaches best (usually 1 or 3). See `references/annotated-code.md`.
- **Checkpoints:** one **predict** block before the hardest idea on the page, a `data-confidence` quiz, and an **explain-back** at the very end — the module's exit test. Where the module warrants it, add an **execution tracer** or a **real-bug challenge** built from a genuine fix commit.
- A pager: **next = the next module's Overview** (or, on the last module, the capstone).

### Capstone page (`src/capstone.html`) — the exit
The course currently would just stop; instead it ends by making the reader do the thing it promised.
- **Retrieval practice across all modules** — one `.recall-q` per module, self-rated.
- An **execution tracer** of the primary user journey, end to end, with no hints from earlier pages.
- One **explain-back on the whole system**: *"A new engineer joins tomorrow. Write the paragraph you'd send them."* Rubric covers architecture, the core design decision, and the main failure mode.
- A `.mastery-checklist` — the honest "can you now…" list (see `references/comprehension.md`).
- A short "where to go next" section: the parts of the codebase the course didn't cover, and what to read to go deeper.
- Pager: prev = last module's Deep Dive; next = index.

---

## Design Identity

A **beautiful developer notebook** with a persistent left **sidebar** for navigation. Read `references/design-system.md` for tokens. Non-negotiables: **Clash Display** (display), **Satoshi** (body), **Geist Mono** (code), loaded from Fontshare + Google Fonts CDNs; the default palette is **seaside** (stormy-teal + terracotta, cream warm surface); generous whitespace; dark IDE-style code blocks; soft shadows. A **light/dark mode toggle** lives in the sidebar — it flips the whole site, defaults to light, and remembers the reader's choice across pages (dark mode derives a lightened accent from the course palette, so it works with any palette). Other palettes (vermillion/teal/forest/lapis-velvet) remain available.

---

## Reference Files

Read only when you reach the relevant phase.

- **`references/git-archaeology.md`** — Reconstructing the real build order, real bugs, and genuinely-rejected alternatives from git history. Read at **Phase 1, first**.
- **`references/analysis-report-template.md`** — Structure for the Phase 1 saved analysis report. Read at Phase 1.
- **`references/annotated-code.md`** — The annotation depth axis, the Annotated Source Walkthrough element, and code provenance. Read at Phase 0 (for the axis) and **before writing any code into a page**.
- **`references/deep-dive-template.md`** — The four required Deep Dive sections with HTML patterns (complexity tables, tradeoff cards, exercises, spec-refs). Read at Phase 3 (and 2.5).
- **`references/exercises.md`** — Runnable exercises: layout, tiers, HTML pattern, verification. Read at Phase 3.
- **`references/comprehension.md`** — The checkpoint layer: explain-back, predict-before-reveal, retrieval practice, execution tracer, Ask Claude, calibration, remediation, mastery checklist, and the soft-gate contract. Read at **Phase 2.5 and 3, before writing any page**.
- **`references/content-philosophy.md`** — Dual-track, TL;DRs, build-steps, metaphors, quizzes, tooltips. Read at Phase 2.5 and 3.
- **`references/interactive-elements.md`** — HTML patterns for every element (dual-track, TL;DR, build-step, level-up, resources, code↔English, quizzes, chat, flow, diagrams, tooltips). Read at Phase 3.
- **`references/glossary-and-search.md`** — `glossary.json` auto-tooltips and the course search index. Read at Phase 3.
- **`references/resource-curation.md`** — Finding, verifying, formatting external/primary-source links. Read whenever writing resources.
- **`references/module-brief-template.md`** — Brief template (both pages, canonical files, exercises). Complex codebases only.
- **`references/design-system.md`** — Full token system. Read at Phase 3.
- **`references/gotchas.md`** — Failure-point checklist. Read at Phase 3 and 4.
- **`references/_head.html` / `_foot.html` / `build.sh` / `build_assets.py`** — The multi-page shell, assembler, and build helpers. Customize `_head.html`; copy the others verbatim.
- **`references/check.sh` / `verify_snippets.py`** — The Phase 4 gate: structural validation and snippet byte-verification. Copy verbatim; both must pass.

> **Legacy single-page mode:** the original single-scroll shell (`references/_base.html` + `references/_footer.html`) is still present for compact courses. For the deep, multi-page course this skill is designed around, use `_head.html` / `_foot.html`.
