# Analysis Report Template

> **When to read this:** Phase 1. Fill this in and save it to `course-name/analysis/codebase-analysis.md`. It is both a deliverable the user can read on its own and the single source of truth every page is written from. Depth here determines the quality of every Deep Dive — do not rush it.

Write in clear prose (this is a real document, not notes). Use the exact code from the repo when you quote it, with file paths and line numbers.

---

# Codebase Analysis: [Project Name]

## 1. What it is
One paragraph, plain-English: what the app does and who uses it. Then one paragraph on the end-to-end user journey (what happens from the user's first action to the result).

## 2. Tech stack & why
A table: each major technology, its role, and — as far as you can infer — why it was chosen over alternatives.

## 3. Architecture
The components/modules/services, each with its single responsibility, and how they communicate (calls, events, queues, HTTP). Include a description precise enough to draw a diagram from. Note the boundaries: what is pure logic, what does I/O, what is framework glue.

## 4. Data model & key structures
The core data: tables/schemas/types, their fields, keys, and indexes. Call out the important data-structure choices and their consequences.

## 5. Build order (the module arc)
If you were building this from an empty folder, what would you create first, second, third? List the stages in dependency order — this becomes the course's module sequence. For each stage, one line on what has to exist before it.

## 6. Deep technical notes (per significant piece)
For each non-trivial component or algorithm, capture the material the Deep Dives need:
- **Simple explanation** — the intuition / metaphor.
- **Mechanics** — how it actually works, with the real code.
- **Complexity & performance** — Big-O of hot paths, what dominates, scaling behavior.
- **Alternatives & tradeoffs** — designs not chosen, and why the current one wins (or where it's a compromise).
- **Failure modes & concurrency** — edge cases, races, error handling, what breaks at scale.

## 7. Clever patterns & gotchas
Notable engineering patterns (caching, batching, idempotency, retries, etc.) and real bugs/gotchas visible in comments, error handling, or git history. These seed Deep Dive sections and quizzes.

## 8. Primary sources & further reading
Canonical references for the concepts and tools in this codebase (specs, official docs, papers, respected write-ups) — verified URLs, per `resource-curation.md`. These feed the Deep Dive "Exercises & Primary Sources" sections.

## 9. Proposed curriculum
The final module list (4-7), each mapped to a build stage, with a one-line Overview focus and a one-line Deep Dive focus.

---

## 0. Course pin  (fill this first)

```
repo:   <git remote get-url origin>
commit: <git rev-parse --short HEAD>
date:   <YYYY-MM-DD>
```

Every code block in the course cites this commit via `data-sha` /
`data-repo`. Pinning once keeps the course correct after the repo moves on.

## 5b. Git archaeology  (evidence for section 5)

Run the commands in `references/git-archaeology.md` and record:

- **File-birth clusters** — dates and the module boundary drawn from each.
  If history is unusable, state that and mark the build order **inferred
  from dependency structure, not observed**.
- **Churn ranking** — the 5-10 most-modified files. These are Deep Dive
  and canonical-file candidates.
- **Real bug commits** — 3-6 entries: `<sha>`, one line on what broke,
  and which module's Failure Modes section will use it.
- **Reverts, deletions, rewrites** — what was tried and abandoned, and
  what that implies for Alternatives & Tradeoffs.
- **Evolution diffs** worth rendering as `.diff-card`s.

Never cite a SHA you didn't run `git show` on.

## 6b. Canonical files per module

For the annotation depth chosen in Phase 0, name the 1-2 files per module
that will be rendered as Annotated Source Walkthroughs, with line ranges
and a per-module annotation budget (~400 lines, ceiling 600).

| Module | Canonical file | Lines to walk | Why it carries the module |
|---|---|---|---|
