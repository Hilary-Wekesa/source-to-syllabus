# Source-to-Syllabus

A **Claude Code / Cowork skill** that turns any codebase into a beautiful, **multi-page interactive HTML course** — taking a reader from *"I have no idea what's going on"* to *"I understand this codebase and can explain it."*

That last word is the bar, and it's why the course is built to be worked through rather than read: it predicts before it reveals, asks you to recall earlier modules before starting new ones, and makes you explain things in your own words before showing you a model answer. One sidebar toggle turns all of that off if you'd rather use it as a reference.

For each project it:

1. **Analyzes the codebase first** and saves a written analysis report (also rendered as an in-course page).
2. **Teaches how it was built**, module by module, in real implementation order — each step with a *what / why / how* and a TL;DR.
3. **Upskills you as an engineer** — every module has an **Overview** page (intuition, build journey, one quiz) and a **Deep Dive** page (complexity & performance, alternatives & tradeoffs, failure modes & concurrency, and hands-on exercises with primary-source reading).

The output is a self-contained multi-page site (shared stylesheet + script + sidebar): an index/syllabus, a codebase-analysis page, an architecture page, and per module an Overview + Deep Dive. It runs in the browser with **no build step**, has a **light/dark toggle**, a **Simply/Technically** inline toggle, and adapts depth to a **beginner → advanced** level you pick up front.

### Annotation depth — up to line-by-line

Separately from the learner level, you choose how densely real code gets explained: **Sparse** (a few key snippets), **Standard**, **Line-by-line**, or **Exhaustive**. At the deeper settings each module names 1-2 *canonical files* and renders them as **Annotated Source Walkthroughs** — numbered lines with a note beside each one, hover-to-pair, click-to-pin, and collapsible boilerplate. Syntax highlighting is automatic, so snippets stay byte-identical to the source.

### Comprehension checkpoints

A course that's merely read teaches much less than one that asks you to produce something first. Three findings drive the design: retrieval beats review, prediction beats presentation, and explaining beats recognising.

- **Explain-back gates** — write your own explanation, *then* compare against a model answer and score yourself against a concrete rubric. This is the only element that trains the stated goal directly.
- **Predict-before-reveal** — commit to a guess before the code appears. Wrong guesses work; the gap is the point.
- **Retrieval practice** — every module opens with questions about the previous two. Anything you rate below "I had it" surfaces on the index as a concept to revisit.
- **Execution tracer** — follow one real request through the code, predicting each hop, with a live call stack. Watching an animation is recognition; reconstructing the path is understanding.
- **Real-bug challenges** built from actual fix commits, **confidence calibration** that names confident-and-wrong for what it is, and **remediation links** that send a wrong answer to the exact section that teaches it.
- **A capstone** where you trace the system with no hints, explain the whole thing back, and tick an honest "can you now…" checklist.
- **Module 0** for genuine beginners — what a function, an import, and a file actually are, shown against real lines from *this* codebase.

Pages complete when their checkpoints are met, not when they're scrolled. And every gate is soft: nothing blocks navigation, and **Reading mode** in the sidebar opens all of them at once.

### Everything is verified, not vibes

- **Provenance on every snippet** — each code block carries its file, line range, and the commit SHA the course was written against, with a deep link to the real source. `verify_snippets.py` byte-compares the rendered code against the repo, so paraphrased or drifted code fails loudly instead of quietly teaching you something the project doesn't do.
- **`check.sh` is a gate** — link resolution, fragment purity, all four Deep Dive sections, quiz sanity, walkthrough coverage, provenance coverage, and (with `--links`) every external URL.
- **The build journey comes from git history** — real file-birth order, real high-churn files, real bug-fix commits behind the Failure Modes sections, and real reverts behind the Tradeoffs sections.
- **Runnable exercises** — at least one per Deep Dive ships as a failing test you actually run, with the project's real implementation as the solution.
- **Course-wide search** and **`glossary.json`** auto-tooltips, both generated at build time.

### From reading to hireable (optional)

Tell it what the course is for. If the goal is to become a better engineer or pass interviews, it adds programming from zero, general skills taught through the project, SQL, write-it-yourself coding practice with tests, rebuilding the project's real functions from a blank file, and interview preparation: a question bank with cited answers, true stories from the commit history (with authorship checked), a system design round, and a study plan.

## Install

### Option A — Claude Code plugin (one command, auto-updates)

```
/plugin marketplace add Hilary-Wekesa/source-to-syllabus
/plugin install source-to-syllabus@source-to-syllabus
```

Update later with:

```
/plugin marketplace update source-to-syllabus
```

### Option B — copy into your skills folder (no plugin system)

```
git clone https://github.com/Hilary-Wekesa/source-to-syllabus ~/.claude/skills/source-to-syllabus
```

Both methods work off the same `SKILL.md` at the repo root, so either one enables the skill. The `.claude-plugin/` directory is used only by the plugin installer and is ignored by the plain skills loader.

## Usage

Once installed, just point the skill at a project:

- "Turn this codebase into a course"
- "Make a course from https://github.com/user/repo"
- "Teach me how this project was built and make me a better engineer"
- "Explain this codebase line by line"

It asks two things — how deep you want to go, and how densely you want the code annotated — then analyzes the code and generates the course.

Course search needs a local server, since browsers block `fetch()` over `file://`:

```
cd course-name && python3 -m http.server 8000
```

Everything else works offline straight from `index.html`.

## Repository layout

```
SKILL.md                     # the skill definition (auto-discovered at plugin root)
README.md
LICENSE                      # MIT
.claude-plugin/
  marketplace.json           # plugin catalog (source: "./")
  plugin.json                # plugin manifest
references/
  content-philosophy.md      # teaching principles
  comprehension.md           # checkpoints: explain-back, predict, recall, tracer
  annotated-code.md          # annotation depth axis, walkthroughs, provenance
  parallel-build.md          # running a large course with many agents
  career-tracks.md           # beginner, coding interview and interview tracks
  check_exercises.sh         # every starter fails, every solution passes
  md2page.py                 # renders the saved report as a course page
  git-archaeology.md         # reconstructing the real build order from history
  exercises.md               # runnable exercises
  glossary-and-search.md     # glossary.json + search index
  deep-dive-template.md      # the four required Deep Dive sections
  interactive-elements.md    # HTML pattern for every element
  design-system.md           # tokens, palettes, light/dark
  gotchas.md                 # failure-point checklist
  analysis-report-template.md
  module-brief-template.md
  resource-curation.md
  styles.css  main.js        # pre-built, copied verbatim into each course
  _head.html  _foot.html     # multi-page shell
  build.sh  build_assets.py  # assembler + glossary/search generation
  check.sh  verify_snippets.py  # the Phase 4 verification gate
```

## Versioning

`plugin.json` intentionally has **no `version` field**, so Claude Code uses the **commit SHA** as the version — every push to `main` is picked up as an update (`/plugin marketplace update`), no manual bumps. If you prefer explicit releases, add a semver `"version"` to `plugin.json` and bump it each release. (A pinned-but-stale version silently blocks updates for existing users.)

## License

MIT © 2026 Hilary Wekesa
