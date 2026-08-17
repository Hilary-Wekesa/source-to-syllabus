# Annotated Code — Depth Axis, Walkthroughs, Provenance

Read this whenever you write code into a course page. It covers three
things: **how much** to annotate (the depth axis), **the element** that
delivers line-by-line teaching (the walkthrough), and **the stamps** that
make every snippet verifiable.

---

## 1. The Annotation Depth Axis

Annotation depth is **orthogonal to the learner level**. Level is *who
the reader is*; annotation is *how densely the code is explained*. A
beginner may want every line spelled out; a staff engineer reading an
unfamiliar consensus algorithm may want the same. Ask for both in Phase 0
and never fold one into the other.

| Mode | Element used | What every module gets |
|---|---|---|
| **Sparse** | Code↔English only | 1-2 punchy snippets (5-10 lines), one English line per 1-2 code lines. The pre-v4 default. |
| **Standard** | Code↔English + 1 walkthrough | Every function the module *teaches* gets a translation block; the module's single most important function gets a walkthrough. |
| **Line-by-line** | Walkthroughs lead | 1-2 **canonical files** per module rendered in full as walkthroughs, every meaningful line annotated. Translation blocks handle everything else. |
| **Exhaustive** | Walkthroughs lead, maximal notes | Every line of the canonical files including imports, type declarations, and error branches — plus `wt-note` asides naming the alternative that was rejected on that specific line. |

### Canonical files — the scoping rule

"Line-by-line explanation of everything" across a whole repository is
neither buildable nor readable. It means **exhaustive within the
module's canonical files**:

- Each module declares **1-2 canonical files** in its brief — the files
  that *are* the module. Module 3 "The core engine" might declare
  `src/scheduler.ts`; Module 5 "The outside world" might declare
  `src/db/pool.py` and `src/db/retry.py`.
- **Budget: ~400 annotated lines per module**, hard ceiling 600. Past
  that, readers skim and the notes degrade into narration. If a canonical
  file is 1,200 lines, walkthrough the two or three functions that carry
  the module's idea and translation-block the rest.
- Everything outside the canonical files stays at Standard density.
- Overview pages stay light regardless of mode — the walkthrough belongs
  on the Deep Dive unless the module's core concept genuinely needs it up
  front. Preserve the intuition/rigor split.

### What a good note says

The note is not a restatement of the line. `i++` does not need "increment
i". A note earns its place by answering one of:

- **Why this and not the obvious alternative.** "A `set` not a `list`
  because this is called inside the request loop — membership on a list
  would make the endpoint O(n²) under load."
- **What invariant is being maintained.** "After this line, `pending`
  and `inflight` are guaranteed disjoint. Everything below relies on it."
- **What breaks if it's wrong.** "Drop the `await` and you get a silent
  write-after-free: the buffer is recycled before the flush lands."
- **What the reader would trip on.** "`0` is falsy here, so a zero-length
  batch takes the error branch. That's the bug fixed in `a91f3c2`."

At Exhaustive, boilerplate lines still get notes, but mark them
`class="wt-note minor"` so readers can hide them with the density
control. Do not pad — an honest "standard import, nothing to see" as a
minor note beats an invented insight.

---

## 2. Annotated Source Walkthrough — the element

**HTML:**

```html
<div class="wt-density">
  Notes:
  <button type="button" class="active" onclick="setWalkthroughDensity('all', this)">every line</button>
  <button type="button" onclick="setWalkthroughDensity('key', this)">key lines only</button>
</div>

<div class="walkthrough"
     data-lang="python"
     data-src="app/cache.py"
     data-start="40"
     data-sha="a1b2c3d4e5f6"
     data-repo="https://github.com/user/repo"
     data-fold="44-49:imports and type aliases">
  <pre class="wt-source">
def get(self, key: str) -> Optional[bytes]:
    node = self._index.get(key)
    if node is None:
        self.misses += 1
        return None
    self._touch(node)
    return node.value
  </pre>
  <div class="wt-notes">
    <div class="wt-note" data-lines="40">
      The return type is <code>Optional[bytes]</code>, not <code>bytes</code> — a
      cache miss is a normal outcome here, not an exception. That choice
      ripples through every caller.
    </div>
    <div class="wt-note" data-lines="41-42">
      <code>_index</code> is a plain dict from key to linked-list node. The dict
      gives O(1) lookup; the node gives O(1) reordering. Neither alone
      would be enough.
    </div>
    <div class="wt-note minor" data-lines="43">
      Miss counter, read by the metrics endpoint.
    </div>
    <div class="wt-note" data-lines="45-46">
      <code>_touch</code> moves the node to the head of the recency list <em>before</em>
      returning. Doing it after the return would silently break LRU
      ordering on every read — a classic and very quiet bug.
    </div>
  </div>
</div>
```

**How the engine renders it** (all of this is automatic — `main.js`):

- Reads the raw text of `.wt-source`, tokenizes it per `data-lang`, and
  emits one `.wt-line` per line, numbered from `data-start`.
- Aligns each `.wt-note` vertically with its first anchor line.
- Hover a line → its note highlights, and vice versa. Click either → the
  pair pins until clicked again.
- `data-fold="44-49:label"` collapses that range behind a click-to-expand
  bar. Semicolon-separate multiple folds.
- Builds the header from `data-src` / `data-start` / `data-sha` /
  `data-repo`, including a deep link to the exact lines on the host.
- Below 900px the notes stack under the code.

**Authoring rules — these matter:**

1. **The text inside `.wt-source` is verbatim source.** No trimming, no
   re-indenting, no `# ...` elisions, no renaming a variable to make it
   read better. `verify_snippets.py` byte-compares it against the real
   file and `check.sh` fails the build on mismatch. If a snippet needs
   editing to teach well, you picked the wrong snippet.
2. **Never hand-write `<span class="code-keyword">` inside a
   walkthrough.** The tokenizer handles highlighting. Manual spans would
   also corrupt the byte-comparison.
3. `data-lines` on every note; ranges are inclusive and must fall inside
   the rendered range.
4. Aim to cover **≥65% of rendered lines** with notes — `check.sh`
   enforces this. A walkthrough that annotates six lines out of forty is
   a translation block wearing a costume; use the right element.
5. Keep a single walkthrough under ~120 lines. Split a long function
   across two walkthroughs with prose between them rather than shipping
   one enormous block.

**Supported `data-lang` values:** `js`, `ts`, `jsx`, `tsx`, `python`,
`go`, `rust`, `java`, `c`, `cpp`, `ruby`, `php`, `sql`, `sh`/`bash`,
`yaml`, `json`, `css`, `html`, `swift`, `kotlin`, `plain`. Unknown values
fall back to `plain` (strings and numbers only) — safe, just duller.

### Walkthrough vs. Code↔English — which to use

| Use a **walkthrough** when | Use **Code↔English** when |
|---|---|
| Teaching a whole function or file top to bottom | Illustrating one idea with a snippet |
| Line order and control flow are the lesson | The gist matters more than the sequence |
| The reader will want to map notes back to real line numbers | The code is short enough to hold in the head |
| Mode is Line-by-line or Exhaustive | Mode is Sparse, or you're on an Overview page |

---

## 3. Provenance on every code block

Any code block — walkthrough or translation block — should carry:

```html
data-src="app/cache.py" data-start="40" data-sha="a1b2c3d" data-repo="https://github.com/user/repo"
```

On a translation block, put them on the inner `<pre>` and add a visible
stamp underneath:

```html
<div class="translation-block">
  <div class="translation-code">
    <span class="translation-label">CODE</span>
    <pre data-src="app/cache.py" data-start="40" data-sha="a1b2c3d">...</pre>
  </div>
  <div class="translation-english">...</div>
</div>
<div class="code-provenance">
  <span class="cp-path">app/cache.py</span> · L40–L46 ·
  <a href="https://github.com/user/repo/blob/a1b2c3d/app/cache.py#L40-L46"
     target="_blank" rel="noopener">view source ↗</a>
</div>
```

**Get the SHA once, in Phase 1**, and record it at the top of the
analysis report:

```bash
git -C <repo> rev-parse --short HEAD
git -C <repo> remote get-url origin
```

Use that single SHA for the whole course — it pins every link to the code
the course was actually written against, so the course stays correct even
after the repo moves on.

**Then verify, before you show anyone:**

```bash
python3 verify_snippets.py --repo /path/to/repo              # from the course dir
python3 verify_snippets.py --repo /path/to/repo --fix-start  # if line numbers drifted
```

`DRIFT` means the code is right but `data-start` is wrong — fix the
number. `MISMATCH` means the rendered code is not what's in the file —
you paraphrased, and must paste the real lines instead. Both are hard
failures.
