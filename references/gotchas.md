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

---

## v4 Gotchas (Annotated Code · Provenance · Verification)

### Paraphrased Code
The single most damaging failure. A model writes code that *looks like*
the file instead of pasting the file. The course then teaches something
the repo doesn't do, and the reader's trust dies the first time they open
the real file. `verify_snippets.py` exists for exactly this — run it, and
treat every `MISMATCH` as a hard stop. Never "fix" a mismatch by editing
the note; fix it by pasting the real lines.

### Provenance Drift
`data-start` points at the wrong line because you counted from a
different revision. Symptom: `verify_snippets.py` reports `DRIFT` with a
corrected number. Always pin the whole course to one `data-sha` captured
in Phase 1 and use it everywhere.

### Manual Spans Inside a Walkthrough
Hand-writing `<span class="code-keyword">` inside `.wt-source` breaks the
byte-comparison and double-highlights. The tokenizer handles it. The only
place manual spans still belong is a legacy `.translation-block`.

### Walkthrough That Isn't a Walkthrough
Forty lines rendered, six annotated. That's a translation block with
extra chrome. `check.sh` fails below ~65% line coverage. Either annotate
properly or use the right element.

### Notes That Restate the Line
"`i++` — increments i." Worthless, and it's what a model produces when it
runs out of genuine insight. A note must say why-not-the-alternative,
what-invariant-holds, what-breaks-if-wrong, or what-trips-readers-up. If
you have nothing, mark it `.wt-note minor` and say so plainly rather than
inventing significance.

### Exhaustive Mode Applied to the Whole Repo
"Line by line for everything" means *within the module's canonical
files*, budgeted at ~400 annotated lines. Annotating every file produces
a course nobody finishes and a build nobody can review.

### Walkthroughs on Overview Pages
Dumping a 100-line annotated file onto the Overview collapses the
intuition/rigor split that the two-page structure exists to create.
Walkthroughs live on Deep Dives by default.

### Invented Commit SHAs
Citing `fixed in a91f3c2` for a commit you never ran `git show` on. If
the archaeology commands weren't run, don't cite history — say the
history was unavailable and mark the build order as inferred.

### Unrun Exercises
Shipping a test that was never executed. It usually passes against the
starter (so there's nothing to solve) or fails against the solution (so
it's unsolvable). Run both paths before shipping.

### Skipping check.sh Because It Looks Fine
Looking fine is precisely what these checks catch past: broken pager
links, a Deep Dive missing its `failure` section, a quiz with no
`data-correct`, a dead spec link. `check.sh` must exit 0 before Phase 4
is complete.

### Search Silently Missing
Opened over `file://`, browsers block `fetch('search-index.json')` and
the search box hides itself by design. Don't debug it — tell the user to
run `python3 -m http.server 8000` if they want search locally.

### Glossary Injecting Into Code
If terms start appearing highlighted inside code blocks, a fragment has
malformed HTML (an unclosed `<pre>` or `<code>`) that defeated the
injector's masking. Fix the HTML, not the glossary.

---

## v5 Gotchas (Comprehension Checkpoints)

### Checkpoints Written After the Page
The tell: predict blocks that appear *after* the explanation they're
about. A prediction placed after the reveal is just a quiz with extra
steps. Retrieval practice at the bottom of a page is the same mistake.
Write checkpoints while structuring the page, not as a garnish.

### Explain-Back With a Vague Rubric
"Showed deep understanding" is not a point a reader can check against
their own writing. Every rubric point must be concretely verifiable:
"named the problem it solves", "said why a queue rather than a lock".
Otherwise the rubric is decoration and the reader learns nothing from
scoring themselves.

### Model Answer Presented as "The" Answer
There are many good ways to explain a system. Label it *"one good
answer"*. A reader whose correct explanation differs from yours should
not conclude they were wrong.

### Implausible Distractors
A predict block whose wrong options nobody would pick teaches nothing.
The best distractor is what a competent engineer would assume before
reading the code — which means you have to know what that assumption is.

### Punishing Wrong Answers
Low rubric scores, "no idea" recall ratings, and failed predictions must
all still complete the checkpoint. The moment a reader can fail, they
start optimising the checkbox instead of their understanding. The
course's job is to locate the gap, not to grade.

### Removing the Reading-Mode Toggle
Without the escape hatch, a reader who wants a reference hits a wall of
gates and closes the tab. `check.sh` fails if `.gates-toggle` is missing
from `_head.html`. The gates are soft by contract — never make one block
navigation.

### Checkpoint Overload
More than five checkpoints on a page and it stops being a course and
starts being a form. Rotate types — predict → trace → explain → recall —
rather than stacking four explain-backs.

### Duplicate or Missing data-id
Two checkpoints sharing a `data-id` silently share stored state, so
answering one marks both. A checkpoint with no `data-id` can never be
recorded and quietly blocks page completion forever. `check.sh` catches
both.

### Fabricated Bug Commits
A `.bug-challenge` citing a commit that doesn't exist destroys the one
thing that makes the element powerful. If the archaeology found no real
bug, use an invented one and say plainly that it's illustrative.

### Vague Ask-Claude Prompts
"Quiz me on this codebase" produces a vague quiz. The prompt must name
the module's specific concepts and tell the model to push back on
hand-wavy answers — otherwise it's agreeable and the reader learns
nothing.

### Module 0 Skipped at Beginner Level
The most common way this course breaks its own promise. "Anyone at any
level" means someone who cannot yet read a function signature. If the
level is Beginner and there is no `00-orientation.html`, Module 1 is a
wall.

### Condescending to Beginners
Module 0's reader is new to code, not stupid, and is very often an expert
in something else. Explain plainly, skip the cheerleading, and never
apologise for the material.

### Scroll-Based Completion
If a page registers checkpoints, completion means *checkpoints met* —
never scroll position. A progress badge that measures scrolling is
decoration, and worse, it tells the reader they're done when they aren't.

---

## v6 Gotchas (Parallel Builds · Career Tracks)

### A Course That Only Trains Reading
The reader's goal is to get hired, and the course never asks them to write a function from a blank file. **Fix:** ask the goal in Phase 0. See `career-tracks.md`.

### "Give Me Everything" Read as "Advanced"
The inline toggle opens on Technically for someone who has written a few lines of code. **Fix:** depth and fluency are separate. Ask what they have actually built, and open on Simply unless they are an experienced engineer.

### Pinning a Feature Branch
The working copy was 30 commits behind main, so the course taught stale code. **Fix:** pin `origin/main` and read from a `git archive` export.

### Replacing a Placeholder That Also Appears in a Comment
A global replace of a template token also rewrites any comment naming it. **Fix:** the shipped `_head.html` keeps each token unique; keep it that way when customizing.

### Wrong Pager Classes
The pager is `.prev` / `.next` with `.pager-dir` and `.pager-title`. Other names render unstyled and pass `check.sh`.

### Agents Guessing Anchors
Each brief invents section ids for pages that do not exist yet. **Fix:** cross-page links use only the guaranteed Deep Dive anchors until those pages exist.

### Drag-and-Drop With Many Chips per Zone
`main.js` matches one chip to one zone. A 10-items-to-4-buckets exercise cannot work. **Fix:** use one-to-one pairs, or `.pattern-cards` with a `<details>` verdict.

### Trusting an Agent's "Done"
Each agent checked its own pages. Links between them, duplicate ids and glossary merges only exist once they are combined. **Fix:** the lead runs the full gate last.

### Overclaiming in Interview Material
A story credits the reader with code someone else wrote, or a bullet implies traffic the product never had. **Fix:** check authorship and cite usage. See the honesty rules in `career-tracks.md`.

### Common Words in the Glossary
"Module" or "value" as a glossary term gets a tooltip on nearly every page. **Fix:** remove words a reader of that page already has, and prefer specific terms.
