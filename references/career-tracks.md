# Career Tracks — From Beginner to Interview-Ready

Read this at **Phase 2** whenever the reader's goal (Phase 0, Question 3) goes beyond understanding
the project: becoming a better engineer, or passing technical interviews. These tracks add to the
course; they never replace the system modules.

The core course teaches a reader to *read* a codebase. Two gaps remain for this reader:

1. **Reading is not writing.** Most interview loops include live coding with no AI and someone
   watching. A course that only explains code does not prepare anyone for that.
2. **The on-ramp is short.** Module 0 is one page, and Module 1 assumes fluent reading of the
   language. Someone who has written "a few lines of Python" hits a wall on the first walkthrough.

Say this plainly when the goal is interviews, and scope the tracks with the reader. It is a large
build: on a real project the full set took the course from 19 pages to 41.

---

## Which tracks to build

| Reader's goal | Add |
|---|---|
| Understand the project | Core course only |
| Become a better engineer | General Skills modules, Foundations if the reader is new to code |
| Pass interviews | Everything below |

| Starting point | Foundations track | Default inline track |
|---|---|---|
| Little or no programming | Required | Simply |
| Knows another language | Language pages only, mapped from what they know | Simply |
| Working engineer | Skip | Technically |

## The reading order

```
index → 00-orientation → f1 … f5 → 01-overview … NN-deep-dive → s1-sql → capstone →
c1 … c5 → interview-prep → interview-practice → interview-plan → index
```

General Skills modules are numbered after the system modules (`08-…` onward) and use the normal
Overview and Deep Dive pair. Foundations, Coding, SQL and Interview pages are single pages, which
`check.sh` does not pair. Add sidebar groups to `_head.html` and syllabus entries to the index.

---

## Foundations track (`f1` to `f5`)

For readers who cannot yet read the codebase's language. Adapt to that language.

| Page | Covers |
|---|---|
| f1 Programming From Zero | How a program runs, values, variables, comparison, conditionals, loops, arrays, objects, functions |
| f2 Functions, Objects and Types | Higher-order functions, closures, destructuring, modules, errors, the type system from zero |
| f3 Asynchronous Code | Why programs wait, the event loop, promises, `async`/`await`, parallel vs sequential, timeouts, common bugs |
| f4 Terminal, Git and Tests | Shell, package manager, commits and branches, reading history, tests, debugger, stack traces |
| f5 Reading Code and Debugging | A repeatable method for each, practised on the project's own real bugs, symptom first |

If the reader knows a little of another language, show that language beside the new one the first
time each construct appears.

A good git exercise: a script builds a throwaway repo with fixed authors and dates (so SHAs are
the same on every machine) containing a planted bug, and the reader finds it with `bisect`,
`log -S` and `blame`. Check answers against hashes so the test file does not give them away.

## General Skills modules (Overview and Deep Dive pairs)

Each concept is taught from first principles and then anchored in the project's real code,
including where the project gets it wrong.

- **The Frontend** (or the project's client layer): component model, state, effects, rendering,
  forms, design system, accessibility.
- **The Language Through This Project:** the type system or language features, each mapped to a
  real `file:line`. Where the project has no example, say so and label a small illustration.
  Exercises can type-check with `@ts-expect-error` assertions.
- **Full-Stack Foundations:** HTTP and status codes, cookies vs headers, rendering models, caching,
  serverless or servers, databases, transactions, security basics, observability.
- **Engineering Principles:** data structures and algorithms actually in the code, SOLID with real
  examples **and real violations**, design patterns, smells, testing strategy, and system design
  practice with back-of-envelope estimates. Say plainly that LeetCode-style rounds need separate
  practice, and link verified lists.

## SQL (`s1`)

Interviews ask SQL even when the project does not use it. Model the project's real data
relationally, teach SELECT through window functions, keys, indexes, transactions, normalisation
and N+1. Node 22+ has `node:sqlite`, Python has `sqlite3`, so the exercise needs no install: a
`schema.sql`, a seed script, queries as strings, and tests comparing rows.

## Coding Interview track (`c1` to `c5`)

| Page | Covers |
|---|---|
| c1 Arrays, Hash Maps, Two Pointers | Big-O from zero, hashing, sliding window, prefix sums, an interview problem-solving method worked end to end |
| c2 Structures and Recursion | Stacks, queues, linked lists, recursion with a call-stack tracer, trees |
| c3 Search, Graphs, DP | Sorting, binary search, BFS/DFS, topological sort, greedy, dynamic programming, the **live coding protocol** (timeline, what is scored, thinking aloud, getting unstuck), a practice list by pattern |
| c4 Rebuild the Project | 8-10 real functions rewritten from a blank file, easiest first, ending in a whole request handler. Tests come from real behaviour, quirks included. The real code stays hidden in `<details>` until the attempt is done |
| c5 Owning AI-Assisted Work | Only when the history shows it (below) |

Every page has 12-15 problems with tests, a hint and a worked solution per problem, both inside
`<details>`. Add a speed test with a large input so a brute-force answer fails, sized so that a
wrong answer fails in about a second instead of hanging.

## Interview pages

- **`interview-prep.html`, the question bank.** How to answer (answer, evidence, tradeoff), a
  30-second and a 2-minute pitch, a spoken architecture walkthrough, and 80-100 questions by area
  with model answers of 60-120 words, each citing a file or commit and linking to the page that
  teaches it.
- **`interview-practice.html`.** Situation-task-action-result stories from real commits, a timed
  45-minute system design script, "defend a decision" drills (strongest case for, strongest case
  against, when you would switch), red flags and a readiness check.
- **`interview-plan.html`.** Each round explained, resume bullets with sources, a week-by-week
  schedule (offer two paces, with "ready to move on" tests and mock interview milestones), daily
  habits, a final checklist.

Every Deep Dive in a career build also ends its `#practice` section with:

```html
<h3 id="interview">Interview questions</h3>
<details class="interview-q">
  <summary>The question an interviewer would ask</summary>
  <div>
    <p>A 60-90 second spoken answer: direct answer first, then the example with file:line or
    commit, then the tradeoff or what you would do differently.</p>
    <p class="iq-source">Taught in <a href="04-deep-dive.html#failure">Module 4</a></p>
  </div>
</details>
```

These are not checkpoints and do not count toward the 3-5 budget.

---

## Honesty rules (non-negotiable)

An interviewer can probe anything in these pages, so an inflated claim hurts the reader.

- **Check authorship before attributing work.** Use `git log -1 --format='%an' <sha>` and
  `git shortlog -sn <pin>`. Where someone else wrote the original, the story says "we" and names
  the split.
- **Count AI co-authorship** (`git log --grep='Co-Authored-By' --author=<name>`). If it is
  substantial, add the Owning AI-Assisted Work page: what interviewers are checking, how to
  describe the role truthfully, phrases that work and backfire, how to prove understanding live.
- **Use the real scale.** Find usage figures in the project's docs and cite them. Never imply more
  users or traffic than the evidence shows.
- **Source every number on a resume bullet,** and mark any bullet whose wording depends on the
  reader's own role as *Confirm*, so they decide it.
- **Label estimates as estimates,** and separate measured figures from planned ones.
- **Do not hide the code's weak spots.** Honest violations and open defects make better interview
  answers than a tidy story, and an interviewer may find them anyway.
