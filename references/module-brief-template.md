# Module Brief Template

> **When to read this:** During Phase 2.5 (planning checkpoint) for complex codebases. Fill in one brief per module, save to `course-name/briefs/0N-slug.md`. Each brief gives a parallel agent everything it needs to write one module without reading the codebase or SKILL.md.

---

## Module N: [Title]

### Teaching Arc
- **Metaphor:** [A fresh, specific metaphor — never "restaurant." See `references/content-philosophy.md` > Metaphors First]
- **Opening hook:** [1 sentence that connects to something the learner already knows from using the app]
- **Key insight:** [The one thing the learner should walk away understanding]
- **"Why should I care?":** [How this helps them steer AI / debug / make decisions]

### Code Snippets (pre-extracted)

Include the actual code the module will use in code↔English translation blocks. Copy-paste from the codebase with file path and line numbers. The writing agent will use these verbatim — it will NOT re-read the codebase.

File: src/example/file.ts (lines 12-24)
[paste actual code here]

File: src/another/file.ts (lines 45-52)
[paste actual code here]

### Interactive Elements

Check which elements this module needs. Include enough detail for the writing agent to build them.

- [ ] **Code↔English translation** — which snippet(s) from above
- [ ] **Quiz** — [number] questions, style: [scenario / debugging / architecture / tracing]. Brief description of each question's angle.
- [ ] **Group chat animation** — actors: [list]. Message flow summary: [who says what to whom, in what order]
- [ ] **Data flow animation** — actors: [list]. Steps: [sequence of highlights and packet movements]
- [ ] **Drag-and-drop** — items: [list], targets: [list]
- [ ] **Other** — [architecture diagram, layer toggle, pattern cards, etc.]

### Reference Files to Read

List only the sections the writing agent needs — not the whole file.

- `references/interactive-elements.md` → [section names, e.g., "Multiple-Choice Quizzes", "Group Chat Animation"]
- `references/design-system.md` → [only if needed for specific tokens not in the brief]
- `references/content-philosophy.md` → [always include — agent needs content rules]
- `references/gotchas.md` → [always include — agent needs the checklist]

### Connections

- **Previous module:** [Title — what it covered, so this module can build on it]
- **Next module:** [Title — what it will cover, so this module can set it up]
- **Tone/style notes:** [Any course-wide consistency notes: accent color name, actor naming convention, etc.]

---

## v2 Brief Additions (Dual-Track Build Journey)

Add these fields to every brief.

### Build-Journey Position
- **Implementation stage:** [e.g., "Stage 3 — the core engine"]
- **Depends on:** [what must already exist before this stage]
- **Build-steps (What / Why / How):** for each concrete step:
  - Step N — [title] · **TL;DR (inline):** [one sentence]
    - What: [artifact created] · Why: [reason / what breaks without it] · How: [mechanism, grounded in real code]

### Module TL;DR
[2-3 plain-English sentences: what this stage is and why it matters.]

### Dual-Track Pair(s)
For the module's central concept:
- **Concept:** [name]
- **Simply:** [the metaphor + why-you-care framing]
- **Technically:** [the mechanics, data structures, complexity, and the tradeoff/failure mode to mention]

### Level Up
- **Transferable concept (named precisely):** [e.g., idempotency, separation of concerns]
- **Best practices (2-4):** [...]
- **Common pitfalls (2-4):** [...]
- **Curated resources (2-4, VERIFIED URLs):** type · title · source · one-line why. Follow `references/resource-curation.md`.

---

## v4 Brief Additions (Annotated Code · Provenance · Exercises)

### Canonical Files
The 1-2 files that *are* this module. Required at Line-by-line and
Exhaustive annotation; useful at Standard.

- `path/to/file.ext` — walkthrough L`start`–L`end` (`N` lines)
  - Why this file carries the module's idea:
  - Churn rank from Phase 1 (commits touching it):
  - Fold ranges (boilerplate to collapse): `L44-49:imports`
- Annotation budget for this module: `___ / 400 lines`

### Code Snippets — provenance (pre-extracted, verbatim)
Every snippet below is pasted from the file, never re-typed. The
subagent writing this module copies these exactly.

| Where used | `data-src` | `data-start` | Lines | Element |
|---|---|---|---|---|
| Overview, core concept | `app/cache.py` | 40 | 7 | translation-block |
| Deep Dive, §complexity | `app/cache.py` | 88 | 34 | walkthrough |

Course-wide pin: `data-sha=` ______  `data-repo=` ______

### Real History (from Phase 1 git archaeology)
- Build-order evidence: files born ______ (dates), placing this module at position ___
- Bug-fix commits this module's **Failure Modes** section will use:
  - `<sha>` — what actually broke, and why it was quiet
- Reverts / deletions / rewrites feeding **Alternatives & Tradeoffs**:
  - `<sha>` — what was tried, why it was abandoned
- Evolution diff worth showing as a `.diff-card`: `<sha>` → `<sha>`

### Runnable Exercise
- Directory: `exercises/0N-slug/`
- Tier: make-the-test-pass / break-it-then-explain / measure-it
- What's hollowed out in `starter/`:
- The assertion that fails:
- Run command:
- Verified: starter FAILS ☐ · solution PASSES ☐

### Glossary Terms Introduced
Terms this module is the first to use, for `glossary.json`:
- `term` — plain-English definition (two sentences max)

---

## v5 Brief Additions (Comprehension Checkpoints)

Plan these *with* the page, not after it. A predict block bolted on at
the end is just a quiz; it has to come before the thing it's about.
Budget **3-5 checkpoints per page**. See `references/comprehension.md`.

### Retrieval practice (Overview, module 02+)
Two or three questions about the **previous two modules**. Prefer *why*
over *what*.

| Question | Concept label | Links back to |
|---|---|---|
|  |  | `0N-deep-dive.html#section` |

### Predict-before-reveal
| Where on the page | The question | Right answer | The tempting wrong answer, and why it tempts |
|---|---|---|---|
| Before the core snippet |  |  |  |

The wrong answers matter more than the right one — they should be what a
competent engineer would reasonably assume before reading the code.

### Explain-back (Deep Dive, one per module)
- Prompt:
- Model answer, in one paragraph:
- Rubric points (4-5, each checkable by the reader; at least one that a skimmer will have missed):
  1.
  2.
  3.

### Execution tracer (where the module warrants one)
- Journey traced (something the reader has actually done in the app):
- Steps (5-8), each with frame, push/pop, state, and `data-why` on every wrong option:

### Real-bug challenge
- Commit from Phase 1 archaeology: `<sha>`
- What broke, and why it was quiet:

### Ask Claude prompt
Names *this module's* specific concepts, and instructs the model to push
back on hand-wavy answers:

> 

### Quiz remediation
Each question's `data-remediate` target:

| Question | Sends a wrong answer to |
|---|---|
