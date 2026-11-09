# Parallel Build — How to Run a Large Course

Read this at **Phase 2.5** on any codebase with 6+ modules, or whenever more than one agent will
write pages. It records what worked on a real 120,000-line build (41 pages, 22 exercises, about
30 agents) and the failures that shaped each rule.

The lead's job is to set up the work so agents cannot collide or guess, and then to verify what
comes back. The lead does not write module pages.

---

## 1. Pin first, and read from the pin

```bash
git -C <repo> fetch origin
git -C <repo> rev-parse --short origin/main     # the pin, usually newer than local HEAD
mkdir -p <scratch>/pin
git -C <repo> archive <pin> | tar -x -C <scratch>/pin
```

- Pin the **latest default branch**, not whatever the working copy has checked out. A worktree can
  be on a feature branch, behind main, or dirty.
- Every agent reads code from the exported tree and history from `git log <pin>`. Nobody checks
  anything out, stashes, or runs the project's scripts.
- `verify_snippets.py --repo <scratch>/pin` then compares against exactly what the course teaches.
- If the export lives in a temporary folder it can vanish between sessions. Recreate it from the
  pin; nothing is lost.

**Rebuilding an existing course:** look at it first (what commit is it pinned to?), ask whether to
replace it or build alongside, and tar it somewhere safe before deleting anything.

## 2. Two rounds of agents

**Round 1, one brief agent per module, in parallel.** Each reads the code and history for its
area and writes two files: `analysis/sections/0N-slug.md` and `briefs/0N-slug.md`. The lead
assembles the report from the sections.

**Round 2, one page agent per module.** Each writes the two pages, the exercise and a glossary
part from its brief. Launch each page agent as soon as its brief lands, rather than waiting for
the whole round. For smaller additions, one agent can do both rounds for its own module.

The lead meanwhile writes the course-wide pages: index, architecture, Module 0, capstone.

Group related small pages into one agent (two Foundations pages, for example), and give a very
large page its own.

## 3. Put shared rules in a preamble file

Write `briefs/_AGENT_PREAMBLE.md` (and `_PAGE_AGENT_PREAMBLE.md`) once, and start every agent
prompt with "Read this file first and follow it exactly", then only what is specific to that
agent. A preamble must state:

- **Who the reader is and what they are trying to do.** This changes the writing more than
  anything else.
- The pinned tree path, the history command, the pin SHA and repo URL for `data-sha`/`data-repo`.
- Exactly which files the agent may write, and that it touches nothing else.
- The curriculum, so each agent knows its neighbours.
- Hard rules: verbatim snippets, no invented SHAs or URLs, the target project's own prose and
  naming rules, never run anything that touches production.
- The checks to run before replying, and what to report back.

## 4. Rules that prevent collisions

| Rule | What went wrong without it |
|---|---|
| **Only link to guaranteed anchors across pages being written in parallel:** `#complexity`, `#tradeoffs`, `#failure`, `#practice` on Deep Dives, and no anchor on Overviews or new pages. Once pages exist, agents may grep for real ids. | Every brief invented anchors such as `#mechanics` and `#billing`. |
| **Each agent gets its own scratch subfolder.** | One agent overwrote another's shared `expand.py`. |
| **Agents never run `build.sh` in the course folder.** To preview, copy the course to scratch and build there. | `build.sh` writes every page at the course root while others are still writing. |
| **Agents open at most one browser tab and close it.** | Leftover tabs hit the pane's limit, so later agents and the lead could not preview. |
| **`file://` previews do not run scripts.** Serve over localhost, or quizzes and walkthroughs look broken. | Several agents reported pages as "not checked in a browser". |
| **Unique checkpoint ids:** prefix every `data-id` with the page code (`m4-`, `f1-`). | Duplicate ids silently share saved state. |
| **Per-agent glossary files** (`glossary-parts/NN.json`), merged by the lead. | Concurrent writers would clobber one `glossary.json`. |
| **Drop very common words from glossaries** ("value", "module", "map"). | The injector tooltips the first match on every page, including headings. |

## 5. Generate pages from the pinned tree

Agents that wrote a small generator (a template with placeholders, plus a script that fills each
snippet with `sed -n 'A,Bp'` from the pin) had no snippet failures. Re-typing is how `MISMATCH`
happens. Two details:

- The verifier strips leading and trailing blank lines, so **start and end every range on a
  non-blank line** or the line numbers drift.
- Brief line numbers go stale or start out a line or two off. The page agent checks each range
  against the pin before writing notes.

## 6. Merging glossary parts

```bash
python3 - <<'EOF'
import json, glob
g = {}
for f in sorted(glob.glob('glossary-parts/*.json')):
    for k, v in json.load(open(f)).items():
        if k.lower() not in {x.lower() for x in g}:
            g[k] = v
json.dump(g, open('glossary.json', 'w'), indent=2, ensure_ascii=False)
EOF
```

## 7. Treat agent reports as claims

A report is not proof. The lead should:

- Run the whole gate itself after the last agent finishes (Phase 4). Each agent only checked its
  own pages.
- Spot-check surprising claims against the code before repeating them. A number quoted in an
  interview answer needs a source you have seen.
- Collect the defects agents find into the report's findings section, and say which were
  confirmed and which were only read from the code.
- Correct its own earlier statements when an agent disproves them, in the chat and on any page
  that repeated them.
- Check, when a brief asks for something the tooling cannot do, that the agent told you what it
  did instead (a drag-and-drop replaced by reveal cards, for example).

## 8. If a run is interrupted

A usage limit or crash leaves each agent's work on disk and its transcript resumable. Send each
stopped agent a message telling it to continue from where it stopped and to check what already
exists. Do not start fresh agents: they will redo finished work or overwrite it.

## 9. Wiring happens once

Agents do not edit the sidebar, the index or other pages' pagers. The lead does this while agents
write: `_head.html` groups, syllabus entries, pager links on neighbouring pages. Every agent's
pager is specified in its prompt, so the chain is complete once the last page lands.
