#!/bin/bash
# Multi-page assembler. Run from the course directory: bash build.sh
# Wraps each fragment in src/*.html with the shared shell (_head.html + _foot.html)
# and writes a standalone page to the course root.
set -e
shopt -s nullglob
count=0
for f in src/*.html; do
  name=$(basename "$f")
  cat _head.html "$f" _foot.html > "$name"
  count=$((count+1))
done
echo "Built $count pages from src/. Open index.html in your browser."
