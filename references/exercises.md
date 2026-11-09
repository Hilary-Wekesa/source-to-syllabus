# Runnable Exercises

Read this at Phase 3, when writing the **Exercises & Primary Sources**
section of a Deep Dive.

A prose exercise with a `<details>` hint is a suggestion. A failing test
the reader can run is an obligation — and the difference between someone
who read a course and someone who can now do the thing. Every Deep Dive
should ship at least one exercise the reader executes, not just reads.

---

## Directory layout

Exercises live beside the course, one directory per exercise:

```
course-name/
  exercises/
    README.md                      ← how to run them, written once
    03-eviction-policy/
      README.md                    ← the task, in the reader's terms
      starter/                     ← code with the gap
      test_eviction.py             ← fails against starter, passes against solution
      solution/                    ← the working implementation
      run.sh                       ← `bash run.sh` tests starter/, `bash run.sh solution` tests solution/
```

`run.sh` takes the target as its first argument and defaults to `starter`.
`check_exercises.sh` relies on this. One folder can hold many small problems
(Foundations and Coding pages do), each test named after its problem.

Number directories to match modules. Reader clones nothing extra — the
exercise is self-contained and runs against the course's own copy of the
starter code.

## The three exercise tiers

Pick per module; a Deep Dive usually wants two of these.

**1. Make the test pass.** A failing test plus a stubbed function. The
strongest tier — unambiguous success condition, no judgement call. Use it
for anything algorithmic: the eviction policy, the retry backoff, the
parser branch.

**2. Break it, then explain.** Working code plus a test that *passes*.
Ask the reader to introduce the specific race or off-by-one from the
module's Failure Modes section and observe what the test does — usually
nothing, which is the lesson. Then have them write the test that would
have caught it. This teaches why the bug shipped.

**Write it from a blank file.** For career builds: real functions with empty
bodies, tests from their real behaviour, quirks included, and the real code
hidden until the attempt is done. See `career-tracks.md`.

**3. Measure it.** A benchmark script and a hypothesis. "The Deep Dive
claims this is O(n log n). Run it at n = 10³, 10⁴, 10⁵ and check." Pairs
directly with the Complexity & Performance section and keeps that section
honest — if the numbers don't come out, your complexity analysis is
wrong, not the reader's run.

## Rules

- **The test must actually fail against the starter and pass against the
  solution.** Run both before shipping. A test that passes on an empty
  stub is worse than no exercise.
- **Zero-install where possible.** Use the language's built-in test
  runner (`python3 -m unittest`, `go test`, `node --test`, `cargo test`).
  If the project's own stack is needed, say so plainly in the exercise
  README and give the exact command.
- **`run.sh` is one command and prints something a beginner can read.**
  Not a raw stack trace with no framing.
- **Derive from the real codebase.** The starter should be the project's
  actual code with one function hollowed out — not a toy re-creation.
  That way solving it teaches *this* codebase, and the reader can diff
  their answer against the real implementation.
- **The solution is the real implementation** wherever possible, so the
  reader's "aha" is grounded in what the project actually does.

## HTML pattern

Extends the existing `.exercise` card — same class, plus the run command
and a link to the directory:

```html
<div class="exercise">
  <span class="exercise-tag">◆ Exercise 1 · runnable</span>
  <h5>Make eviction O(1)</h5>
  <p>
    <code>exercises/03-eviction-policy/starter/cache.py</code> has a working
    LRU cache with an <code>_evict()</code> that scans every entry. The test
    suite includes a timing assertion it fails. Rewrite <code>_evict()</code>
    so it runs in constant time, using the doubly-linked list already in
    the class.
  </p>
  <pre data-lang="bash">cd exercises/03-eviction-policy &amp;&amp; bash run.sh</pre>
  <details>
    <summary>Stuck? Open a hint</summary>
    <p>
      You never need to search for the least-recently-used node — the list
      already keeps it in a known place. Which end? And what has to be true
      about <code>_touch()</code> for that to hold?
    </p>
  </details>
  <details>
    <summary>Show the real implementation</summary>
    <p>
      <code>exercises/03-eviction-policy/solution/cache.py</code> — this is the
      project's actual code, at
      <code>app/cache.py</code> L88–L104.
    </p>
  </details>
</div>
```

Keep the two `<details>` distinct: a hint that nudges, and the answer.
Readers who peek at the answer immediately still learn something; readers
who don't get the harder, better path.

## When prose is fine

Not every exercise can be executable. Design questions ("sketch how you'd
shard this"), reading exercises ("compare this retry policy to the one in
the AWS architecture blog"), and extension prompts ("what would you have
to change to support multi-tenancy?") are legitimate and belong in the
mix. The rule is **at least one runnable exercise per Deep Dive**, not
that all of them must be.

## Verify before shipping

```bash
bash check_exercises.sh     # from the course root: all of them, both ways

cd exercises/03-eviction-policy
bash run.sh                 # expect: FAIL against starter
bash run.sh solution        # expect: PASS
```

Also try one deliberately wrong solution (brute force, the known bug): a test
suite that accepts it is too weak. Timing tests should be sized so a wrong
answer fails in about a second instead of hanging.

If you can't run the project's language in your environment, say so in
the exercise README rather than shipping a test you never executed.
