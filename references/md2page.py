#!/usr/bin/env python3
"""Render analysis/codebase-analysis.md as the course's src/analysis.html fragment.

Copy verbatim into the course directory. Usage:
    python3 md2page.py analysis/codebase-analysis.md src/analysis.html

A deliberately small Markdown subset: headings, paragraphs, fenced code, pipe tables,
bullet and numbered lists, inline code, bold, italics, links. Rerun it whenever the
report changes, so the page and the portable .md never drift apart.
"""
import html
import re
import sys

src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding="utf-8").read().split("\n")


def inline(text):
    parts = re.split(r"(`[^`]+`)", text)
    res = []
    for p in parts:
        if p.startswith("`") and p.endswith("`") and len(p) > 1:
            res.append("<code>" + html.escape(p[1:-1]) + "</code>")
            continue
        p = html.escape(p, quote=False)
        p = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', p)
        p = re.sub(r"(?<![\"=>])(https?://[^\s<)]+[^\s<).,;:])", r'<a href="\1" target="_blank" rel="noopener">\1</a>', p)
        p = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", p)
        p = re.sub(r"(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])", r"<em>\1</em>", p)
        res.append(p)
    return "".join(res)


slug_seen = {}


def slug(text):
    s = re.sub(r"[^a-z0-9]+", "-", re.sub(r"<[^>]+>", "", text).lower()).strip("-")[:60] or "s"
    n = slug_seen.get(s, 0)
    slug_seen[s] = n + 1
    return s if n == 0 else f"{s}-{n}"


body, toc = [], []
i = 0
para = []


def flush():
    global para
    if para:
        body.append("<p>" + inline(" ".join(x.strip() for x in para)) + "</p>")
        para = []


def cells(row):
    return [c.strip() for c in row.strip().strip("|").split("|")]


LIST_ITEM = r"^\s*([-*]|\d+\.)\s+"

while i < len(lines):
    ln = lines[i]
    if ln.startswith("```"):
        flush()
        j = i + 1
        code = []
        while j < len(lines) and not lines[j].startswith("```"):
            code.append(lines[j])
            j += 1
        body.append('<pre class="report-code"><code>' + html.escape("\n".join(code), quote=False) + "</code></pre>")
        i = j + 1
        continue
    m = re.match(r"^(#{1,6})\s+(.*)$", ln)
    if m:
        flush()
        level = len(m.group(1))
        text = inline(m.group(2))
        if level == 1:
            i += 1
            continue  # the page has its own title
        tag = {2: "h2", 3: "h3"}.get(level, "h4")
        sid = slug(text)
        body.append(f'<{tag} id="{sid}">{text}</{tag}>')
        if level == 2:
            toc.append((sid, re.sub(r"<[^>]+>", "", text)))
        i += 1
        continue
    if ln.strip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
        flush()
        head = cells(ln)
        rows = []
        j = i + 2
        while j < len(lines) and lines[j].strip().startswith("|"):
            rows.append(cells(lines[j]))
            j += 1
        t = ['<div class="spec-table-wrap"><table class="spec-table"><thead><tr>']
        t += [f"<th>{inline(c)}</th>" for c in head]
        t.append("</tr></thead><tbody>")
        for r in rows:
            t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
        t.append("</tbody></table></div>")
        body.append("".join(t))
        i = j
        continue
    if re.match(LIST_ITEM, ln):
        flush()
        ordered = bool(re.match(r"^\s*\d+\.", ln))
        items = []
        j = i
        while j < len(lines) and (re.match(LIST_ITEM, lines[j]) or (lines[j].startswith("   ") and lines[j].strip() and items)):
            if re.match(LIST_ITEM, lines[j]):
                items.append(re.sub(LIST_ITEM, "", lines[j]))
            else:
                items[-1] += " " + lines[j].strip()
            j += 1
        tag = "ol" if ordered else "ul"
        body.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
        i = j
        continue
    if ln.strip() == "---" or not ln.strip():
        flush()
        i += 1
        continue
    para.append(ln)
    i += 1
flush()

toc_html = '<nav class="dd-toc"><h4>On this page</h4><ol>' + "".join(
    f'<li><a href="#{sid}">{html.escape(t)}</a></li>' for sid, t in toc) + "</ol></nav>"

pin = re.search(r"^commit:\s*(\S+)", "\n".join(lines), re.M)
pin_note = f" Pinned to commit <code>{pin.group(1)}</code>." if pin else ""
body_html = "\n".join("  " + b for b in body)

page = f"""<div class="module-content">

  <span class="page-kicker">The evidence</span>
  <h1 class="module-title">Codebase Analysis</h1>
  <p class="module-subtitle">
    The report every page of this course was written from.{pin_note}
    The same text is saved as <code>analysis/codebase-analysis.md</code>.
  </p>

  <div class="callout callout-info">
    <div class="callout-icon">📄</div>
    <div class="callout-content">
      <strong class="callout-title">How to read this</strong>
      <p>This is a reference, not a lesson: it has no checkpoints. Skim the front sections for
      the shape of the system, jump to a module's section when its Deep Dive sends you here,
      and read the findings section for the defects seen at this commit.</p>
    </div>
  </div>

  {toc_html}

{body_html}

  <nav class="pager">
    <a class="prev" href="index.html"><span class="pager-dir">← Back</span><span class="pager-title">Syllabus</span></a>
    <a class="next" href="architecture.html"><span class="pager-dir">Next →</span><span class="pager-title">Architecture</span></a>
  </nav>

</div>
"""
open(out, "w", encoding="utf-8").write(page)
print(f"{len(body)} blocks, {len(toc)} sections")
