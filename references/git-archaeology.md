# Git Archaeology — Reconstructing the Real Build Journey

Read this during **Phase 1**, before writing the analysis report.

The skill promises that modules follow the *real* implementation order
and that Deep Dives cover *real* bugs. Without evidence, a model will
reconstruct a plausible-sounding order and invent tidy bugs — which is
exactly the hand-waviness this course format exists to avoid. Git history
is the evidence. Spend twenty minutes here; it changes the whole course.

If the project has no git history (a zip, a single commit, a fresh
export), say so explicitly in the analysis report under *Build order* and
mark the order as **inferred from dependency structure, not history**.
Never present an inferred order as if it were observed.

---

## 1. Shape of the history

```bash
git -C <repo> log --oneline | wc -l                    # how much history exists
git -C <repo> log --reverse --format='%h %ad %s' --date=short | head -40
git -C <repo> shortlog -sn --all | head                # who built it
```

A repo with 12 commits tells you almost nothing; a repo with 2,000 tells
you everything. Calibrate how much of the below is worth doing.

## 2. When each file first appeared → the module arc

```bash
git -C <repo> log --reverse --diff-filter=A --format='%h %ad' --date=short --name-only \
  | awk '/^[0-9a-f]{7,} /{c=$1; d=$2; next} NF{print d, c, $0}' \
  | sort | head -60
```

This is the **actual build order**. Cluster the file-birth dates: files
born in the same week are the same stage of the project. Those clusters
are your modules, and they usually differ from the tidy 7-row table in
`SKILL.md` — trust the history over the template.

Per subsystem:

```bash
git -C <repo> log --reverse --diff-filter=A --format='%h %ad %s' --date=short -- src/scheduler/
```

## 3. Which files churn → where the difficulty lives

```bash
git -C <repo> log --format= --name-only | sort | uniq -c | sort -rn | head -25
```

The top of this list is where the project fought itself. High-churn files
deserve the deepest Deep Dive treatment and are strong candidates for
**canonical files** in Line-by-line mode. A file with 90 commits has a
story; a file with 2 does not.

## 4. Real bugs → real "Failure Modes" sections

```bash
git -C <repo> log --format='%h %ad %s' --date=short \
  --grep='fix\|bug\|regression\|race\|leak\|deadlock\|off-by\|revert\|hotfix' -i | head -40
```

Then read the good ones:

```bash
git -C <repo> show <sha> --stat
git -C <repo> show <sha>
```

A bug-fix commit gives you, for free: the broken code, the correct code,
and usually a message explaining the failure. That is a complete
spot-the-bug challenge and a truthful Failure Modes entry. Quote the
short SHA in the course — `fixed in a91f3c2` — so the reader can go read
it themselves.

Prefer fixes that are *conceptually* interesting (a race, a wrong
invariant, an unhandled boundary) over typos and lint fixes.

## 5. Reverts and rewrites → real "Alternatives & Tradeoffs"

```bash
git -C <repo> log --format='%h %ad %s' --date=short --grep='revert\|rewrite\|replace\|migrate\|drop ' -i | head -20
git -C <repo> log --format='%h %s' --diff-filter=D --name-only | head -40   # deleted files
```

A deleted module or a revert is a design that was tried and abandoned —
the single most valuable input to a Tradeoffs section, because it's an
alternative the project *actually* rejected, with a reason, rather than
one you speculated about. Read the commit message and the diff.

## 6. Evolution diffs → the `.diff-card` element

When a core function was rewritten, show the before and after. Find it:

```bash
git -C <repo> log --oneline -L :function_name:path/to/file.py | head -60
```

Then render it with the diff card:

```html
<div class="diff-card">
  <div class="diff-head">src/cache.py · a91f3c2 → 4d0e7b1 — "make eviction O(1)"</div>
  <div class="diff-line del">for k in sorted(self.items, key=lambda x: x.used):</div>
  <div class="diff-line del">    if len(self.items) &lt;= self.cap: break</div>
  <div class="diff-line add">while len(self.items) &gt; self.cap:</div>
  <div class="diff-line add">    self._evict(self.tail.prev)</div>
  <div class="diff-line ctx">    self.evictions += 1</div>
</div>
```

Use `.del` / `.add` / `.ctx`. Follow it with one paragraph on *why* the
rewrite happened — the diff shows what changed, you supply the reason.

## 7. What to record in the analysis report

Add these to the *Build order* and *Clever patterns & gotchas* sections:

- The commit SHA and remote URL the course is pinned to (also used for
  every provenance stamp — see `annotated-code.md`).
- The file-birth clusters, with dates, and the module boundary you drew
  from each.
- The 5-10 highest-churn files, flagged as Deep Dive candidates.
- 3-6 real bug-fix commits: SHA, one-line description, which module's
  Failure Modes section will use it.
- Any reverts, deletions, or rewrites, with what they imply about
  alternatives the team rejected.

## 8. Honesty rules

- Never invent a SHA. If you didn't run the command, don't cite a commit.
- Never present a commit message as a quote unless you read it.
- If history was squashed, rewritten, or starts with "initial commit"
  containing the whole app, say that in the report and fall back to
  dependency-order inference. An honest "the history doesn't tell us"
  is worth more than a confident fabrication.
