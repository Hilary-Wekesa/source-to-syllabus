#!/usr/bin/env python3
"""
Build helper for source-to-syllabus courses. Copy verbatim into the
course directory alongside build.sh. Two subcommands:

  glossary  Wrap the first occurrence of each glossary term in each
            fragment with a <span class="term" data-definition="...">,
            so tooltips stop depending on the author remembering.

  index     Emit search-index.json from the built pages, so the sidebar
            search box has something to search.

Both are pure-stdlib and safe to skip: build.sh only calls them if
python3 exists.
"""
import argparse
import html
import json
import os
import re
import sys

# ── Regions we must never touch when injecting tooltips ──────────
# Code, existing links, existing terms, headings, and any attribute
# value. Everything here is masked out before matching.
SKIP_BLOCKS = re.compile(
    r'(<pre\b.*?</pre>'
    r'|<code\b.*?</code>'
    r'|<script\b.*?</script>'
    r'|<style\b.*?</style>'
    r'|<a\b.*?</a>'
    r'|<h[1-6]\b.*?</h[1-6]>'
    r'|<span class="term".*?</span>'
    r'|<div class="walkthrough".*?</div>\s*</div>\s*</div>'
    r'|<!--.*?-->'
    r'|<[^>]+>)',
    re.DOTALL | re.IGNORECASE)


def inject_glossary(src_dir, out_dir, glossary_path):
    with open(glossary_path, encoding='utf-8') as fh:
        glossary = json.load(fh)
    # Longest terms first so "service worker" wins over "service".
    terms = sorted(glossary.items(), key=lambda kv: -len(kv[0]))
    os.makedirs(out_dir, exist_ok=True)

    total = 0
    for name in sorted(os.listdir(src_dir)):
        if not name.endswith('.html'):
            continue
        with open(os.path.join(src_dir, name), encoding='utf-8') as fh:
            text = fh.read()

        # Mask protected regions with placeholders.
        stash = []

        def hide(m):
            stash.append(m.group(0))
            return '\x00%d\x00' % (len(stash) - 1)

        masked = SKIP_BLOCKS.sub(hide, text)

        used = 0
        for term, definition in terms:
            pattern = re.compile(r'(?<![\w-])(' + re.escape(term) + r')(?![\w-])',
                                 re.IGNORECASE)
            match = pattern.search(masked)
            if not match:
                continue
            repl = ('<span class="term" data-definition="%s">%s</span>'
                    % (html.escape(definition, quote=True), match.group(1)))
            masked = masked[:match.start()] + repl + masked[match.end():]
            used += 1

        restored = re.sub(r'\x00(\d+)\x00', lambda m: stash[int(m.group(1))], masked)
        with open(os.path.join(out_dir, name), 'w', encoding='utf-8') as fh:
            fh.write(restored)
        total += used
        print('  glossary: %-28s %d term(s) tagged' % (name, used))
    print('Glossary injection: %d tooltip(s) across the course.' % total)


# ── Search index ─────────────────────────────────────────────────
TAG = re.compile(r'<[^>]+>')
HEADING = re.compile(r'<h[1-3][^>]*>(.*?)</h[1-3]>', re.DOTALL | re.IGNORECASE)
TITLE = re.compile(r'<title[^>]*>(.*?)</title>', re.DOTALL | re.IGNORECASE)
MAIN = re.compile(r'<main class="page">(.*?)</main>', re.DOTALL | re.IGNORECASE)
DROP = re.compile(r'<(script|style|aside)\b.*?</\1>', re.DOTALL | re.IGNORECASE)


def strip(fragment):
    return html.unescape(TAG.sub(' ', fragment))


def build_index(paths, out_path):
    entries = []
    for path in paths:
        name = os.path.basename(path)
        if name in ('_head.html', '_foot.html'):
            continue
        with open(path, encoding='utf-8') as fh:
            page = fh.read()
        body = MAIN.search(page)
        body = body.group(1) if body else page
        body = DROP.sub(' ', body)

        headings = [re.sub(r'\s+', ' ', strip(h)).strip() for h in HEADING.findall(body)]
        title = headings[0] if headings else ''
        if not title:
            t = TITLE.search(page)
            title = re.sub(r'\s+', ' ', strip(t.group(1))).strip() if t else name
        text = re.sub(r'\s+', ' ', strip(body)).strip()

        entries.append({'u': name, 't': title, 'h': headings[:12], 'b': text[:6000]})

    with open(out_path, 'w', encoding='utf-8') as fh:
        json.dump(entries, fh, ensure_ascii=False, separators=(',', ':'))
    size = os.path.getsize(out_path)
    print('Search index: %d page(s), %.1f KB → %s' % (len(entries), size / 1024.0, out_path))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest='cmd', required=True)

    g = sub.add_parser('glossary')
    g.add_argument('--src', default='src')
    g.add_argument('--out', required=True)
    g.add_argument('--glossary', default='glossary.json')

    i = sub.add_parser('index')
    i.add_argument('pages', nargs='+')
    i.add_argument('--out', default='search-index.json')

    args = ap.parse_args()
    if args.cmd == 'glossary':
        inject_glossary(args.src, args.out, args.glossary)
    else:
        build_index(args.pages, args.out)
    return 0


if __name__ == '__main__':
    sys.exit(main())
