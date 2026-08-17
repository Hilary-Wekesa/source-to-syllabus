#!/bin/bash
# Multi-page assembler. Run from the course directory: bash build.sh
#
#   1. (optional) inject glossary tooltips into src/*.html  → build/
#   2. wrap each fragment with _head.html + _foot.html       → ./*.html
#   3. (optional) emit search-index.json from the built pages
#
# Steps 1 and 3 need python3. Without it the build still works —
# you just lose auto-tooltips and course search.
set -e
shopt -s nullglob

HELPER="build_assets.py"
SRC_DIR="src"
STAGE=".build-stage"

# ── 1. Glossary injection ────────────────────────────────────
if [ -f "glossary.json" ] && [ -f "$HELPER" ] && command -v python3 >/dev/null 2>&1; then
  rm -rf "$STAGE"; mkdir -p "$STAGE"
  python3 "$HELPER" glossary --src "$SRC_DIR" --out "$STAGE" --glossary glossary.json
  SRC_DIR="$STAGE"
fi

# ── 2. Assemble pages ────────────────────────────────────────
count=0
for f in "$SRC_DIR"/*.html; do
  name=$(basename "$f")
  cat _head.html "$f" _foot.html > "$name"
  count=$((count+1))
done
rm -rf "$STAGE"
echo "Built $count pages from src/."

# ── 3. Search index ──────────────────────────────────────────
if [ -f "$HELPER" ] && command -v python3 >/dev/null 2>&1; then
  python3 "$HELPER" index --out search-index.json ./*.html
fi

echo "Open index.html in your browser."
echo "Next: bash check.sh   (pre-flight validation)"
