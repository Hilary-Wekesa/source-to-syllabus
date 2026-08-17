# Glossary & Course Search

Both are build-time features driven by `build_assets.py`. Read at Phase 3.

---

## glossary.json — tooltips as data

Hand-tagging every technical term with `<span class="term">` is how "no
term left behind" fails: the model tags terms diligently in Module 1 and
forgets by Module 5. Instead, maintain one file and let the build do it.

**`course-name/glossary.json`:**

```json
{
  "service worker": "A background script that runs independently of the web page — a behind-the-scenes assistant that stays on even when you're not looking at the page.",
  "idempotent": "An operation you can safely run twice and get the same result. Deleting a file by name is idempotent; adding £10 to a balance is not.",
  "backpressure": "A signal from a slow consumer telling a fast producer to slow down, so queues don't grow without bound.",
  "TOCTOU": "Time-of-check to time-of-use — a race where a value is validated, then changes before it's used."
}
```

`build.sh` runs the injector before assembling pages: for each fragment
it wraps the **first occurrence** of each term in a `.term` span with the
definition. Later occurrences are left alone, so pages don't turn into a
sea of dashed underlines.

**It never touches** code (`<pre>`, `<code>`), links, headings, existing
`.term` spans, walkthroughs, HTML comments, or attribute values. That
masking is why the injector is safe to run on every build.

**Authoring rules:**

- Write the definition for someone who has never heard the term. Two
  sentences maximum; a concrete example beats a precise abstraction.
- Longer terms win over shorter ones ("service worker" over "service"),
  so you can safely define both.
- Matching is case-insensitive and respects word boundaries; the original
  casing in the page is preserved.
- 30-60 entries is a healthy course. Under 15 means you're under-serving
  non-expert readers; `check.sh` warns below 10 tooltips.
- You can still hand-tag a term inline when it needs a *module-specific*
  definition — the injector will skip that occurrence and any later ones.

Build without `glossary.json` and nothing changes — the feature is
strictly additive.

---

## Course search

Multi-page navigation removed the reader's ability to Ctrl-F the whole
course. The search box restores it.

`build.sh` emits `search-index.json` after assembling pages: one entry
per page with its title, its headings, and the first ~6,000 characters of
prose (tags stripped, sidebar and scripts excluded). A 15-page course
produces roughly 40-80 KB — small enough to fetch on load.

The sidebar `.sidebar-search` box (already in `_head.html`) filters it
client-side. Titles and headings are weighted above body text. Press `/`
anywhere to focus it; `Esc` clears; `Enter` opens the top hit.

**The one caveat worth knowing:** opened over `file://`, most browsers
block `fetch()` of a local JSON file, so the search box **hides itself**
rather than sitting there broken. Everything else in the course still
works offline. If the reader wants search locally:

```bash
cd course-name && python3 -m http.server 8000   # then open localhost:8000
```

Mention this once in the index page's "how to use this course" note —
don't repeat it on every page.
