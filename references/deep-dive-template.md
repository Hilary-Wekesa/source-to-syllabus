# Deep Dive Template

> **When to read this:** Phase 2.5 (planning Deep Dive pages) and Phase 3 (writing them). The Deep Dive is the "proper SWE upskilling" layer — the reason a serious learner uses this course. Every Deep Dive page MUST contain all four sections below. CSS/JS for these components live in `styles.css`/`main.js`; use only the HTML patterns here.

## Page frame

Each `src/0N-deep-dive.html` fragment is the inner HTML of `<main class="page">`. Structure:

```html
<div class="module-content">
  <span class="page-kicker">⚙️ Deep Dive</span>
  <h1 class="module-title">Module Title — Under the Hood</h1>
  <p class="module-subtitle">One line orienting the reader: what this page proves or teaches.</p>

  <div class="dd-toc">
    <h4>In this deep dive</h4>
    <ol>
      <li><a href="#complexity">Complexity &amp; performance</a></li>
      <li><a href="#tradeoffs">Alternatives &amp; tradeoffs</a></li>
      <li><a href="#failure">Failure modes &amp; concurrency</a></li>
      <li><a href="#practice">Exercises &amp; primary sources</a></li>
    </ol>
  </div>

  <!-- the four dd-sections -->

  <nav class="pager">
    <a class="prev" href="0N-overview.html"><span class="pager-dir">← Overview</span><span class="pager-title">Back to the overview</span></a>
    <a class="next" href="0M-overview.html"><span class="pager-dir">Next →</span><span class="pager-title">Module M: Title</span></a>
  </nav>
</div>
```

## Section 1 — Complexity & Performance  (`id="complexity"`)

State the Big-O of the hot paths, what dominates, and how it scales. Use a `.spec-table`.

```html
<section class="dd-section" id="complexity">
  <span class="dd-section-label">01 · Complexity &amp; performance</span>
  <h3>What it costs</h3>
  <p>Prose: identify the hot path and the operation that dominates. Be concrete — cite the line.</p>
  <table class="spec-table">
    <thead><tr><th>Operation</th><th>Cost</th><th>Why</th></tr></thead>
    <tbody>
      <tr><td>Lookup by key</td><td><span class="complexity">O(log n)</span></td><td>B-tree index on the primary key</td></tr>
      <tr><td>Full scan fallback</td><td><span class="complexity">O(n)</span></td><td>No index on that column</td></tr>
    </tbody>
  </table>
  <p>Scaling note: what changes at 10×, 1000× the data or traffic. Include a back-of-envelope estimate where you can.</p>
</section>
```

## Section 2 — Alternatives & Tradeoffs  (`id="tradeoffs"`)

Name the real decision and show the design space. Mark the chosen approach and contrast honest pros/cons.

```html
<section class="dd-section" id="tradeoffs">
  <span class="dd-section-label">02 · Alternatives &amp; tradeoffs</span>
  <h3>The decision that was made</h3>
  <p>State the decision in one sentence, then show what else was on the table.</p>
  <div class="tradeoffs">
    <div class="tradeoff-card chosen">
      <span class="tradeoff-tag">Chosen</span>
      <h5>Content-derived hash key</h5>
      <p class="pro">Idempotent: duplicates collapse for free.</p>
      <p class="pro">Non-enumerable — links can't be scraped sequentially.</p>
      <p class="con">Truncation reintroduces collisions; needs a probe.</p>
    </div>
    <div class="tradeoff-card alt">
      <span class="tradeoff-tag">Alternative</span>
      <h5>Auto-increment counter</h5>
      <p class="pro">Shorter slugs, zero collisions.</p>
      <p class="con">Enumerable; leaks volume; not idempotent.</p>
    </div>
  </div>
  <p>Close with the judgment: under what conditions the alternative would actually win.</p>
</section>
```

## Section 3 — Failure Modes & Concurrency  (`id="failure"`)

Edge cases, races, error handling, what breaks at scale. Ideally include a spot-the-bug challenge (see `interactive-elements.md`).

```html
<section class="dd-section" id="failure">
  <span class="dd-section-label">03 · Failure modes &amp; concurrency</span>
  <h3>Where it breaks</h3>
  <p>Walk the unhappy paths: the miss case, the race, the error boundary. Name the class of bug (e.g. TOCTOU, lost update) and the mitigation.</p>
  <div class="callout callout-warning">
    <div class="callout-icon">⚠️</div>
    <div class="callout-content"><strong class="callout-title">Concurrency hazard</strong><p>Describe a concrete race and the fix (constraint, transaction, atomic update).</p></div>
  </div>
  <!-- optional: a .bug-challenge spot-the-bug here -->
</section>
```

## Section 4 — Exercises & Primary Sources  (`id="practice"`)

Make the reader DO something, then point them to authoritative reading. 2-4 exercises; each with a `<details>` hint. Then a `.spec-ref` or resource list of verified primary sources.

```html
<section class="dd-section" id="practice">
  <span class="dd-section-label">04 · Exercises &amp; primary sources</span>
  <h3>Make it yours</h3>

  <div class="exercise">
    <span class="exercise-tag">🛠 Exercise 1</span>
    <h5>Extend the collision probe to log its salt count</h5>
    <p>Modify the loop so it records how many probes each insert needed, then reason about the distribution you'd expect as the table fills.</p>
    <details><summary>Hint</summary><p>Expected probes stay near 1 while load factor is low; relate it to the birthday bound from Section 1.</p></details>
  </div>

  <div class="spec-ref">
    <span class="spec-ref-icon">📖</span>
    <div>
      <a href="https://REAL-VERIFIED-URL" target="_blank" rel="noopener">RFC / spec / paper title — source</a>
      <p>One line on exactly what to read and why it matters here.</p>
    </div>
  </div>
  <!-- or reuse the .resource-list pattern from interactive-elements.md -->
</section>
```

## Depth rules

- **Advanced** courses: proofs/estimates, benchmarks, and at least two alternatives per decision; lead resources with specs/papers.
- **Beginner** courses: keep all four sections but make each gentle — one complexity fact, one alternative, one failure mode, one guided exercise. Never drop a section; scale its depth.
- Every Deep Dive still obeys the visual-density rules: convert lists to cards/tables, keep prose tight, at least one hero visual (a table, tradeoff grid, or animation) per section.
- Never invent a URL in a `.spec-ref` — verify per `resource-curation.md`.
