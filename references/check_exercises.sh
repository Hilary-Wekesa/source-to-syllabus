#!/bin/bash
# Exercise gate. Copy verbatim into the course directory and run from there:
#
#     bash check_exercises.sh
#
# Every exercises/<name>/run.sh must FAIL against starter/ (bash run.sh) and
# PASS against solution/ (bash run.sh solution). A starter that passes teaches
# nothing; a solution that fails is a broken promise.
set -uo pipefail
shopt -s nullglob

bad=0
total=0
for dir in exercises/*/; do
  name=$(basename "$dir")
  [ -f "$dir/run.sh" ] || { printf 'SKIP  %s (no run.sh)\n' "$name"; continue; }
  total=$((total+1))
  ( cd "$dir" && bash run.sh ) >/dev/null 2>&1; starter=$?
  ( cd "$dir" && bash run.sh solution ) >/dev/null 2>&1; solution=$?
  if [ "$starter" -ne 0 ] && [ "$solution" -eq 0 ]; then
    printf ' ok   %s\n' "$name"
  else
    printf 'FAIL  %s (starter exit %s, want non-zero; solution exit %s, want 0)\n' "$name" "$starter" "$solution"
    bad=$((bad+1))
  fi
done
printf '\n%d exercise(s) checked, %d failed\n' "$total" "$bad"
[ "$total" -gt 0 ] && [ "$bad" -eq 0 ]
