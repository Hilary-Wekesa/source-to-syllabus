#!/usr/bin/env python3
"""
Snippet provenance verifier. Copy verbatim into the course directory.

Every code block that carries provenance attributes is re-read from the
real repository and byte-compared against what the course renders. This
turns "use the original code exactly as-is" from an instruction the
author might quietly violate into a check that fails loudly.

Provenance attributes (on .walkthrough, or on a <pre>/<code> inside a
.translation-block):

    data-src="app/cache.py"   path relative to the repo root  (required)
    data-start="40"           1-based first line              (required)
    data-sha="a1b2c3d"        commit the snippet was taken at (optional)
    data-repo="https://..."   repo URL, for "view source" links (optional)

Usage:
    python3 verify_snippets.py --repo /path/to/analysed/repo
    python3 verify_snippets.py --repo ../repo --pages 'src/*.html'
    python3 verify_snippets.py --repo ../repo --fix-start

--fix-start reports the correct data-start when a snippet matches the
file somewhere else (i.e. the code is right, the line number drifted).

Exit code 0 = all snippets verified, 1 = at least one mismatch.
"""
import argparse
import difflib
import glob
import html
import os
import re
import sys

BLOCK = re.compile(
    r'<(?P<tag>div|pre|code)\b(?P<attrs>[^>]*\bdata-src="[^"]+"[^>]*)>(?P<body>.*?)</(?P=tag)>',
    re.DOTALL | re.IGNORECASE)
SOURCE_PRE = re.compile(r'<pre[^>]*class="[^"]*wt-source[^"]*"[^>]*>(.*?)</pre>',
                        re.DOTALL | re.IGNORECASE)
TAG = re.compile(r'<[^>]+>')


def attr(attrs, name):
    m = re.search(r'\b%s="([^"]*)"' % re.escape(name), attrs)
    return m.group(1) if m else None


def rendered_text(body):
    """Recover the raw source from a block: strip tags, unescape entities."""
    inner = SOURCE_PRE.search(body)
    if inner:
        body = inner.group(1)
    text = html.unescape(TAG.sub('', body))
    return text.strip('\n').rstrip()


def normalise(lines):
    return [ln.rstrip() for ln in lines]


def verify(page_paths, repo, fix_start):
    checked = failed = skipped = 0
    for page in page_paths:
        with open(page, encoding='utf-8') as fh:
            content = fh.read()
        for m in BLOCK.finditer(content):
            src = attr(m.group('attrs'), 'data-src')
            start = attr(m.group('attrs'), 'data-start')
            if not src or not start:
                continue
            checked += 1
            where = '%s → %s' % (os.path.basename(page), src)

            real_path = os.path.join(repo, src)
            if not os.path.isfile(real_path):
                print('MISSING  %s: no such file in repo (%s)' % (where, real_path))
                failed += 1
                continue

            try:
                start_i = int(start)
            except ValueError:
                print('BAD      %s: data-start="%s" is not a number' % (where, start))
                failed += 1
                continue

            snippet = normalise(rendered_text(m.group('body')).split('\n'))
            with open(real_path, encoding='utf-8', errors='replace') as fh:
                file_lines = normalise(fh.read().split('\n'))

            actual = file_lines[start_i - 1: start_i - 1 + len(snippet)]
            if actual == snippet:
                continue

            # Does the snippet appear elsewhere in the file?
            found_at = None
            if snippet:
                for i in range(len(file_lines) - len(snippet) + 1):
                    if file_lines[i:i + len(snippet)] == snippet:
                        found_at = i + 1
                        break

            failed += 1
            if found_at:
                print('DRIFT    %s L%s: code matches the file at L%d, not L%s'
                      % (where, start, found_at, start))
                if fix_start:
                    print('         fix: data-start="%d"' % found_at)
            else:
                print('MISMATCH %s L%s: rendered code differs from the source file'
                      % (where, start))
                diff = difflib.unified_diff(actual, snippet,
                                            fromfile='repo:' + src,
                                            tofile='course', lineterm='', n=1)
                for line in list(diff)[:24]:
                    print('         ' + line)

    print('\n%d snippet(s) checked · %d failed · %d without provenance skipped'
          % (checked, failed, skipped))
    if checked == 0:
        print('No provenance attributes found. Add data-src/data-start to code blocks.')
    return 1 if failed else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--repo', required=True, help='path to the analysed repository')
    ap.add_argument('--pages', default='src/*.html', help='glob of pages to check')
    ap.add_argument('--fix-start', action='store_true',
                    help='report the corrected data-start on drift')
    args = ap.parse_args()

    pages = sorted(glob.glob(args.pages))
    if not pages:
        print('No pages matched %s' % args.pages)
        return 1
    return verify(pages, args.repo, args.fix_start)


if __name__ == '__main__':
    sys.exit(main())
