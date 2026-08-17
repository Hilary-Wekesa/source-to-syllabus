# Comprehension — Checkpoints That Prove the Reader Got It

Read this at Phase 2.5 and Phase 3, before writing any page.

The course exists to move someone from *"I have no idea what's going on"*
to *"I understand this codebase and can explain it."* A beautiful page
that is read passively does not do that. Everything in this file asks the
reader to **produce something before the course gives anything away**.

Three findings drive the design, and they're worth knowing rather than
just following:

1. **Retrieval beats review.** Being asked to recall something strengthens
   memory far more than re-reading it. Re-reading *feels* like learning,
   which is exactly why it's the default trap.
2. **Prediction beats presentation.** Committing to a guess — even a
   wrong one — before seeing the answer makes the answer stick. Showing
   the answer first feels efficient and teaches much less.
3. **Explaining beats recognising.** Multiple choice tests recognition,
   the weakest rung. The goal says *explain*, so the course has to make
   the reader explain.

## The hard constraint

The course runs offline as static HTML with no model attached. **It
cannot grade free text.** Everything below is designed around that:
self-explanation with a model answer to compare against, self-rated
retrieval, mechanically-checkable prediction, and — for real grading —
handing a prompt to Claude via the clipboard.

Don't pretend otherwise. A fake "your answer is correct!" would be worse
than honest self-assessment.

## The soft-gate contract

Every checkpoint may hide content. **No checkpoint may block
navigation.** The sidebar carries a **Reading mode** toggle that opens
every gate on every page and remembers the choice.

This matters more than it sounds. Some readers want a reference, not a
course, and a wall of mandatory checkpoints will make them close the tab.
The toggle is the pressure valve that lets the course be demanding by
default without being hostile. Never remove it, and mention it once on
the index page.

Budget: **3-5 checkpoints per page.** More than that and the course
becomes a form to fill in, which teaches its own kind of nothing.

---

## 1. Explain-Back — the flagship

One per module, at the end of the Deep Dive. This is the only element
that trains the stated goal directly.

```html
<div class="explain-back" data-id="m3-explain">
  <span class="checkpoint-tag">◆ Explain it back</span>
  <h4>Say it in your own words</h4>
  <p class="eb-prompt">
    A teammate has never seen this codebase. In a short paragraph: what does
    the scheduler do, and why does it exist at all?
  </p>
  <textarea rows="6" placeholder="Write it as if they're sitting next to you…"></textarea>
  <button class="eb-reveal">I've written mine — compare</button>
  <div class="eb-body" data-gated hidden>
    <div class="eb-model">
      <h5>One good answer</h5>
      <p>The scheduler exists because …</p>
    </div>
    <div class="eb-rubric">
      <h5>Did you cover these?</h5>
      <label><input type="checkbox"> Named the problem it solves (unbounded concurrent writes)</label>
      <label><input type="checkbox"> Said <em>why</em> a queue rather than a lock</label>
      <label><input type="checkbox"> Mentioned what happens when it's full</label>
      <label><input type="checkbox"> Could explain it without using the word "scheduler"</label>
    </div>
    <div class="eb-score"></div>
  </div>
</div>
```

**Rules:**

- The reveal button **soft-gates**: under 15 words it nudges once
  ("that's 6 words — click again to compare anyway") and then lets them
  through. Never hard-block.
- The model answer is *"one good answer"*, never *"the correct answer"*.
  There are many ways to explain a system well.
- **Rubric points must be checkable by the reader**, not vague. "Named
  the problem it solves" works; "showed deep understanding" doesn't.
- Include one rubric point that's genuinely hard — the thing a reader
  who skimmed will have missed. That's the point of the exercise.
- Scoring low still completes the checkpoint. Honesty about a gap *is*
  the learning; punishing it teaches people to lie to a checkbox.

## 2. Predict Before Reveal

Two or three per module, placed **before** the thing they're about.

```html
<div class="predict" data-id="m2-predict" data-answer="b">
  <span class="predict-tag">◆ Predict first</span>
  <h4>What happens when two writers hit this at once?</h4>
  <p>Here's the signature and the one place it's called from …</p>
  <div class="predict-options">
    <button class="predict-option" data-value="a">The second writer blocks until the first finishes.</button>
    <button class="predict-option" data-value="b">Both proceed, and the second silently overwrites the first.</button>
    <button class="predict-option" data-value="c">The second writer gets an error.</button>
  </div>
  <button class="predict-commit">Lock in my answer</button>
  <div class="predict-reveal" data-gated hidden>
    <p>…the actual behaviour, and why…</p>
  </div>
</div>
```

**Rules:**

- Drop `data-answer` for an open-ended prediction and put a `<textarea>`
  in instead. There's then no right answer — the value is in committing.
- **Distractors must be plausible.** An option nobody would pick teaches
  nothing. The best wrong answers are what a competent engineer would
  reasonably assume before reading the code.
- The reveal must explain *why the tempting wrong answer is tempting*.
  That's where the mental model actually gets corrected.
- Put these before code, before diagrams, before explanations — never
  after. A prediction after the reveal is just a quiz.

## 3. Retrieval Practice

One per module, at the **top** of the Overview, asking about **earlier**
modules. Module 1 has none; from Module 2 onwards it's mandatory.

```html
<div class="recall" data-id="m4-recall">
  <span class="recall-tag">↺ From earlier</span>
  <h4>Two questions before we start</h4>
  <div class="recall-q" data-concept="Ring buffer vs list"
       data-source="02-deep-dive.html#tradeoffs">
    <p>Why a ring buffer here and not a plain list?</p>
    <button class="recall-show">Show the answer</button>
    <div class="recall-a" data-gated hidden>
      <p>Because eviction has to be O(1) on the request path …</p>
    </div>
  </div>
</div>
```

The engine adds a self-rating row (*I had it / Fuzzy / No idea*) and,
from `data-source`, a "revisit where this was taught" link. Anything
below "I had it" surfaces on the index as a concept to revisit.

**Rules:**

- Ask about the **previous two modules**, not the current one.
- Prefer *why* questions over *what* questions. "Why did we choose X"
  retrieves reasoning; "what is X called" retrieves a label.
- `data-concept` is what shows up on the index revisit list — make it a
  human phrase, not an ID.
- Two or three questions. This is a warm-up, not an exam.

## 4. Ask Claude

One per module, near the end. The clipboard trick that solves the one
thing static HTML genuinely can't do.

```html
<button class="ask-claude" data-prompt="I'm learning the codebase at github.com/user/repo. I just finished a module on the job scheduler, covering: the bounded queue, backpressure, and why it uses a queue rather than a lock. Quiz me on it Socratically — ask one question at a time, start easy, get harder, and push back when my answers are vague or hand-wavy. Don't accept 'it handles concurrency' as an answer.">
  Get quizzed on this module by Claude
</button>
```

**Rules:**

- The prompt must name the **specific concepts** of that module, not the
  project generally. A vague prompt gets a vague quiz.
- Always include the instruction to push back on hand-wavy answers —
  otherwise the model is agreeable and the reader learns nothing.
- Keep it under ~120 words; long prompts get edited down by users anyway.

## 5. Execution Tracer

One per course minimum, ideally on the architecture page and again in the
module covering the core engine. The strongest single activity for
grasping a system.

```html
<div class="tracer" data-id="arch-trace">
  <h4>Follow one real request all the way through</h4>
  <div class="tracer-input">POST /jobs {"n": 3}</div>

  <div class="tracer-step" data-answer="b" data-frame="validate(payload)" data-op="push"
       data-state="queue=[] · inflight=0">
    <p class="tracer-q">The router has the request. What runs next?</p>
    <button class="tracer-opt" data-value="a"
            data-why="The DB write happens, but not yet — something has to check the payload first.">db.write(job)</button>
    <button class="tracer-opt" data-value="b">validate(payload)</button>
    <button class="tracer-opt" data-value="c"
            data-why="The scheduler never sees a request it hasn't been handed a validated job for.">scheduler.enqueue(job)</button>
    <div class="tracer-why" data-gated hidden>
      Validation runs first so that nothing downstream has to defend against
      a malformed payload. That assumption is load-bearing …
    </div>
  </div>
  <!-- more .tracer-step blocks -->
</div>
```

The engine builds a sticky call-stack panel from `data-frame` /
`data-op` (`push` or `pop`), shows `data-state` as a variable bar,
reveals steps one at a time, and lets wrong answers retry without
penalty — the goal is converging on a correct model, not scoring.

**Rules:**

- Trace something the reader has **actually done** in the app. "You know
  that button you click?" is worth ten abstract traces.
- 5-8 steps. Beyond that, attention goes.
- `data-why` on wrong options is where most of the teaching happens.
  Write those before you write the correct path.
- Keep `data-state` short — it's a glance, not a debugger.

## 6. Real-Bug Challenge

One per course minimum, in a Failure Modes section, built from an actual
bug-fix commit found in Phase 1 (see `git-archaeology.md`).

```html
<div class="bug-challenge" data-id="m5-bug" data-commit="a91f3c2"
     data-repo="https://github.com/user/repo">
  <h4>This code shipped. It had a bug. Find it.</h4>
  <div class="bug-line" data-bug="false"
       data-hint="This line is fine — the guard above already handled null.">if node is None:</div>
  <div class="bug-line" data-bug="true"
       data-explanation="The boundary used &gt; where it needed &gt;=, so a full queue accepted exactly one job too many.">if len(self.queue) &gt; self.cap:</div>
  <div class="bug-feedback"></div>
  <div class="bug-reveal" data-gated hidden>
    <p>You found it. This is the real thing — it shipped and stayed hidden because the overflow was exactly one item …</p>
  </div>
</div>
```

Prefer `data-bug="true|false"` over the legacy
`onclick="checkBugLine(this, true)"` form — the engine binds its own
handlers, so no inline script is needed. Include `.bug-feedback`; if you
forget it the engine creates one, but you lose control of placement.

Finding a bug that really shipped lands completely differently from
finding an invented one. Never fabricate the commit — if the archaeology
didn't turn one up, use an invented bug and say plainly that it's
illustrative.

## 7. Confidence Calibration

Add `data-confidence` to any `.quiz-container`. The engine injects a
*Guessing / Fairly sure / Certain* row per question, and a
confident-and-wrong answer gets called out specifically rather than
buried under a generic "not quite".

```html
<div class="quiz-container" id="quiz-m3" data-confidence data-checkpoint="m3-quiz">
```

Use it on Deep Dive quizzes, where being wrong matters. Skip it on
Overview quizzes, where it adds friction to a warm-up.

## 8. Adaptive Remediation

On any `.quiz-question-block`:

```html
<div class="quiz-question-block" data-correct="b"
     data-remediate="03-deep-dive.html#complexity"
     data-remediate-label="Re-read: why the hot path dominates">
```

A wrong answer then links to the exact section that teaches it. Every
question should have one — "here's the explanation" is weaker than
"here's where to go fix your model."

## 9. Mastery Checklist (capstone only)

```html
<div class="mastery-checklist" data-id="mastery">
  <h3>Can you now…</h3>
  <label><input type="checkbox"> Explain what this project does to a non-engineer in two minutes</label>
  <label><input type="checkbox"> Draw the architecture from memory and name what each piece is responsible for</label>
  <label><input type="checkbox"> Trace a request end to end without looking</label>
  <label><input type="checkbox"> Name one design decision and argue honestly for the alternative</label>
  <label><input type="checkbox"> Point at the part most likely to break under load, and say why</label>
  <label><input type="checkbox"> Find your way to the right file for a bug report you've never seen</label>
</div>
```

Tick honestly. Unticked boxes are a reading list, not a failure — say so.

---

## Checkpoints per page type

| Page | Required checkpoints |
|---|---|
| **Module 0** (beginners) | 1 predict, 1 explain-back (very gentle) |
| **Overview** | 1 recall (from Module 2 on), 1-2 predict, 1 quiz with remediation |
| **Deep Dive** | 1 predict, 1 explain-back, 1 quiz with `data-confidence`, and — where the module warrants it — a tracer or bug challenge |
| **Architecture** | 1 tracer of the primary journey |
| **Capstone** | recall across all modules, 1 tracer, 1 explain-back on the whole system, mastery checklist |
| **Index / Analysis** | none — these are orientation, not instruction |

Add `data-checkpoint="<id>"` to each module quiz so it counts toward
page completion. A page is complete when every checkpoint on it is met —
not when it's been scrolled.

## Writing checkpoints well

- **Specific beats broad.** "Why does this use a queue rather than a
  lock?" teaches; "what did you learn?" doesn't.
- **Target the misconception, not the fact.** The best checkpoint
  attacks the thing a reader most plausibly gets wrong.
- **One idea per checkpoint.** A prediction with two questions in it
  can't be answered cleanly.
- **Never punish.** Wrong answers, low rubric scores, and "no idea"
  ratings all complete the checkpoint. The course's job is to show the
  reader where the gap is, not to grade them.
- **Vary the type.** Four explain-backs in a row is a worksheet. Rotate:
  predict → trace → explain → recall.
