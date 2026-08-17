#!/bin/bash
# Pre-flight gate for a built course. Copy verbatim into the course
# directory. Run from there, after build.sh:
#
#     bash check.sh              structural checks only
#     bash check.sh --links      also verify every external URL (needs curl)
#
# This is references/gotchas.md turned into something that actually
# fails. Phase 4 is not done until this exits 0.
set -uo pipefail
shopt -s nullglob

FAIL=0
WARN=0
CHECK_LINKS=0
[ "${1:-}" = "--links" ] && CHECK_LINKS=1

red()  { printf '\033[31mFAIL\033[0m  %s\n' "$1"; FAIL=$((FAIL+1)); }
yell() { printf '\033[33mWARN\033[0m  %s\n' "$1"; WARN=$((WARN+1)); }
ok()   { printf '\033[32m ok \033[0m  %s\n' "$1"; }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

[ -d src ] || { echo "No src/ directory — run this from the course root."; exit 2; }

# ── 1. Required files present ────────────────────────────────
head_ "1. Course scaffolding"
for f in styles.css main.js _head.html _foot.html build.sh index.html; do
  [ -f "$f" ] && ok "$f present" || red "$f missing"
done
[ -f analysis/codebase-analysis.md ] && ok "analysis report saved" \
  || red "analysis/codebase-analysis.md missing — Phase 1 was skipped"
if [ -f analysis/codebase-analysis.md ]; then
  words=$(wc -w < analysis/codebase-analysis.md)
  [ "$words" -ge 800 ] && ok "analysis report has $words words" \
    || red "analysis report is only $words words — too thin to write Deep Dives from"
fi

# ── 2. Fragment purity ───────────────────────────────────────
head_ "2. Fragments contain no shell boilerplate"
for f in src/*.html; do
  bad=$(grep -oiE '<(html|head|body|aside|style|script)\b' "$f" | sort -u | tr '\n' ' ')
  [ -n "$bad" ] && red "$f contains shell markup: $bad"
done
[ "$FAIL" -eq 0 ] && ok "all fragments are pure inner-HTML"

# ── 3. Every module has both pages, and the sidebar agrees ───
head_ "3. Page pairing and sidebar wiring"
for f in src/[0-9][0-9]-overview.html; do
  n=$(basename "$f" -overview.html)
  [ -f "src/$n-deep-dive.html" ] && ok "module $n has both pages" \
    || red "module $n has an Overview but no Deep Dive"
done
for f in src/[0-9][0-9]-deep-dive.html; do
  n=$(basename "$f" -deep-dive.html)
  [ -f "src/$n-overview.html" ] || red "module $n has a Deep Dive but no Overview"
done

# ── 4. Every internal link resolves ──────────────────────────
head_ "4. Internal links resolve"
broken=0
for f in *.html; do
  while read -r target; do
    [ -z "$target" ] && continue
    case "$target" in http*|mailto:*|\#*) continue ;; esac
    file="${target%%#*}"
    [ -z "$file" ] && continue
    [ -e "$file" ] || { red "$f links to missing page: $target"; broken=$((broken+1)); }
  done < <(grep -oE 'href="[^"]+"' "$f" | sed 's/href="//;s/"$//' | sort -u)
done
[ "$broken" -eq 0 ] && ok "all internal links resolve"

# ── 5. Pagers ────────────────────────────────────────────────
head_ "5. Pager navigation"
for f in src/*.html; do
  grep -q 'class="pager"' "$f" || red "$(basename "$f") has no .pager — dead end"
done
grep -q 'class="pager"' src/index.html 2>/dev/null && ok "pagers present on content pages"

# ── 6. Deep Dive completeness ────────────────────────────────
head_ "6. Deep Dive required sections"
dd_count=0
for f in src/*-deep-dive.html; do
  dd_count=$((dd_count+1))
  for id in complexity tradeoffs failure practice; do
    grep -q "id=\"$id\"" "$f" || red "$(basename "$f") is missing the '$id' dd-section"
  done
  ex=$(grep -o 'class="exercise' "$f" | wc -l)
  [ "$ex" -ge 2 ] || red "$(basename "$f") has $ex exercise card(s) — need at least 2"
  grep -q 'class="dd-toc"' "$f" || yell "$(basename "$f") has no .dd-toc"
  grep -qE 'runnable|run\.sh|exercises/' "$f" || yell "$(basename "$f") has no runnable exercise"
done
[ "$dd_count" -gt 0 ] && ok "$dd_count Deep Dive(s) checked for all four sections" \
  || red "no Deep Dive pages found in src/"

# ── 7. Quiz sanity ───────────────────────────────────────────
head_ "7. Quizzes"
qtotal=0
for f in src/*.html; do
  n=$(grep -o 'class="quiz-question-block"' "$f" | wc -l)
  c=$(grep -o 'data-correct=' "$f" | wc -l)
  qtotal=$((qtotal+n))
  [ "$n" -ne "$c" ] && red "$(basename "$f"): $n question block(s) but $c data-correct attribute(s)"
  # Each data-correct value must match a data-value on an option in that file.
  while read -r want; do
    [ -z "$want" ] && continue
    grep -q "data-value=\"$want\"" "$f" || red "$(basename "$f"): data-correct=\"$want\" matches no option"
  done < <(grep -oE 'data-correct="[^"]+"' "$f" | sed 's/data-correct="//;s/"$//' | sort -u)
done
for f in src/[0-9][0-9]-overview.html; do
  grep -q 'quiz-container' "$f" || red "$(basename "$f") has no quiz"
done
ok "$qtotal quiz question(s) across the course"

# ── 8. Teaching elements present ─────────────────────────────
head_ "8. Teaching elements"
for f in src/[0-9][0-9]-overview.html; do
  b=$(basename "$f")
  grep -qE 'class="(translation-block|walkthrough)' "$f" || red "$b has no code↔English or walkthrough block"
  grep -q 'class="dual-track"' "$f" || red "$b has no dual-track block"
  grep -q 'class="tldr' "$f" || red "$b has no TL;DR"
done
# Count tooltips in the BUILT pages — glossary.json injection happens at
# build time, so counting src/ would undercount every auto-tagged term.
terms=$(cat ./*.html 2>/dev/null | grep -o 'class="term"' | wc -l)
[ "$terms" -ge 10 ] && ok "$terms glossary tooltip(s) in built pages" \
  || yell "only $terms glossary tooltip(s) — add more, or grow glossary.json"
grep -l 'class="chat-' src/*.html >/dev/null 2>&1 && ok "group-chat animation present" \
  || yell "no group-chat animation anywhere in the course"
grep -l 'class="flow-' src/*.html >/dev/null 2>&1 && ok "data-flow animation present" \
  || yell "no data-flow animation anywhere in the course"

# ── 9. Walkthrough integrity ─────────────────────────────────
head_ "9. Annotated walkthroughs"
python3 - <<'PY'
import glob, re, sys, html
bad = 0
for path in sorted(glob.glob('src/*.html')):
    page = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<div class="walkthrough"(.*?)</div>\s*</div>', page, re.S):
        blk = m.group(0)
        attrs = m.group(1)[:blk.find('>')]
        def a(n):
            g = re.search(r'\b%s="([^"]*)"' % n, blk)
            return g.group(1) if g else None
        src = re.search(r'<pre[^>]*wt-source[^>]*>(.*?)</pre>', blk, re.S)
        if not src:
            print('FAIL  %s: .walkthrough has no <pre class="wt-source">' % path); bad += 1; continue
        raw = html.unescape(re.sub(r'<[^>]+>', '', src.group(1))).strip('\n').rstrip()
        n = len(raw.split('\n'))
        start = int(a('data-start') or 1)
        last = start + n - 1
        if not a('data-lang'):
            print('FAIL  %s: .walkthrough has no data-lang' % path); bad += 1
        if not a('data-src'):
            print('FAIL  %s: .walkthrough has no data-src (provenance)' % path); bad += 1
        notes = re.findall(r'class="wt-note[^"]*"[^>]*data-lines="([^"]+)"', blk)
        if not notes:
            print('FAIL  %s: .walkthrough has no .wt-note entries' % path); bad += 1
        covered = set()
        for spec in notes:
            parts = [int(x) for x in spec.split('-')]
            lo, hi = parts[0], parts[-1]
            if lo < start or hi > last:
                print('FAIL  %s: wt-note data-lines="%s" is outside L%d-L%d'
                      % (path, spec, start, last)); bad += 1
            covered.update(range(max(lo, start), min(hi, last) + 1))
        gap = n - len(covered)
        if gap and gap / float(n) > 0.35:
            print('FAIL  %s: walkthrough annotates %d/%d lines — too sparse to be a walkthrough'
                  % (path, len(covered), n)); bad += 1
sys.exit(1 if bad else 0)
PY
wt_status=$?
if [ "$wt_status" -eq 0 ]; then
  ok "walkthroughs well-formed"
else
  FAIL=$((FAIL+1))
fi

# ── 10. Provenance coverage ──────────────────────────────────
head_ "10. Code provenance"
blocks=$(cat src/*.html | grep -oE 'class="(translation-block|walkthrough)' | wc -l)
stamped=$(cat src/*.html | grep -o 'data-src="' | wc -l)
if [ "$blocks" -gt 0 ]; then
  pct=$(( stamped * 100 / blocks ))
  [ "$pct" -ge 80 ] && ok "$stamped/$blocks code blocks carry provenance ($pct%)" \
    || red "only $stamped/$blocks code blocks carry data-src ($pct%) — run verify_snippets.py"
fi
echo "      verify the code itself with:  python3 verify_snippets.py --repo <path>"

# ── 11. Comprehension checkpoints ────────────────────────────
head_ "11. Comprehension checkpoints"
grep -qE 'class="gates-toggle"' _head.html \
  && ok "Reading-mode escape hatch present in sidebar" \
  || red "_head.html has no .gates-toggle button — readers cannot opt out of the checkpoints"

[ -f src/capstone.html ] && ok "capstone page present" || red "src/capstone.html missing — the course just stops"
if [ -f src/capstone.html ]; then
  grep -q 'mastery-checklist' src/capstone.html || red "capstone has no .mastery-checklist"
  grep -q 'explain-back'      src/capstone.html || red "capstone has no whole-system explain-back"
fi

for f in src/*-deep-dive.html; do
  b=$(basename "$f")
  grep -q 'class="explain-back"' "$f" || red "$b has no explain-back — nothing asks the reader to explain it"
  grep -q 'class="predict"'      "$f" || red "$b has no predict-before-reveal block"
done
for f in src/[0-9][0-9]-overview.html; do
  b=$(basename "$f"); n=${b:0:2}
  grep -q 'class="ask-claude"' "$f" || yell "$b has no Ask Claude button"
  # Retrieval practice is required from module 02 onward.
  if [ "$n" != "00" ] && [ "$n" != "01" ]; then
    grep -q 'class="recall"' "$f" || red "$b has no retrieval practice (required from module 02 on)"
  fi
done

grep -l 'class="tracer"' src/*.html >/dev/null 2>&1 \
  && ok "execution tracer present" \
  || red "no execution tracer anywhere — the strongest comprehension element is unused"

# Unique data-id on every checkpoint: duplicates silently share state.
dupes=$(grep -ohE 'class="(explain-back|predict|recall|tracer|bug-challenge|mastery-checklist)"[^>]*data-id="[^"]+"' src/*.html \
        | grep -oE 'data-id="[^"]+"' | sort | uniq -d)
[ -n "$dupes" ] && red "duplicate checkpoint data-id(s): $(echo $dupes | tr '\n' ' ')" \
  || ok "all checkpoint data-ids are unique"

# Missing data-id means the checkpoint can never be recorded.
for f in src/*.html; do
  miss=$(grep -oE '<div class="(explain-back|predict|recall|tracer|bug-challenge)"[^>]*>' "$f" | grep -vc 'data-id=' || true)
  [ "${miss:-0}" -gt 0 ] && red "$(basename "$f"): $miss checkpoint(s) without a data-id"
done

# Checkpoint budget — more than 5 per page and it reads like a form.
# Count occurrences, not lines: several checkpoints can share a line.
for f in src/*.html; do
  cp_n=$(grep -oE 'class="(explain-back|predict|recall|tracer|bug-challenge|mastery-checklist)"' "$f" | wc -l)
  [ "$cp_n" -gt 5 ] && yell "$(basename "$f") has $cp_n checkpoints — over the 3-5 budget, it will read like a worksheet"
done

# Quizzes should route wrong answers somewhere useful.
rem=$(cat src/*.html | grep -o 'data-remediate=' | wc -l)
qn=$(cat src/*.html | grep -o 'class="quiz-question-block"' | wc -l)
if [ "$qn" -gt 0 ]; then
  [ "$rem" -ge "$qn" ] && ok "$rem/$qn quiz questions have remediation links" \
    || yell "only $rem/$qn quiz questions link back to the section that teaches them"
fi

# ── 12. External links ───────────────────────────────────────
head_ "12. External links"
urls=$(cat src/*.html | grep -oE 'href="https?://[^"]+"' | sed 's/href="//;s/"$//' | sort -u)
count=$(printf '%s\n' "$urls" | grep -c . )
if [ "$CHECK_LINKS" -eq 1 ] && command -v curl >/dev/null 2>&1; then
  while read -r u; do
    [ -z "$u" ] && continue
    code=$(curl -o /dev/null -sIL -w '%{http_code}' --max-time 12 "$u" || echo 000)
    case "$code" in
      2*|3*) ;;
      000)   yell "unreachable (network?): $u" ;;
      4*|5*) red "dead link ($code): $u" ;;
    esac
  done <<< "$urls"
  ok "checked $count external URL(s)"
else
  ok "$count external URL(s) found (re-run with --links to verify them)"
fi

# ── Verdict ──────────────────────────────────────────────────
head_ "Result"
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32mPASS\033[0m  %d warning(s). Course is ready to open.\n' "$WARN"
  exit 0
else
  printf '\033[31m%d check(s) failed\033[0m, %d warning(s). Fix these before Phase 4.\n' "$FAIL" "$WARN"
  exit 1
fi
