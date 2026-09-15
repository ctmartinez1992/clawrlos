#!/usr/bin/env bash
set -uo pipefail
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

status=0

echo "== Migration immutability =="
modified=$(git diff --name-status HEAD -- db/migrations 2>/dev/null | awk '$1 == "M" {print $2}')
if [ -n "$modified" ]; then
  echo "FAIL: already-committed migration file(s) modified (should be a new migration instead):"
  echo "$modified"
  status=1
else
  echo "OK"
fi

echo
echo "== Secret scan (DSNs with a non-placeholder credential) =="
matches=$(git grep -n --untracked -E -i "postgres(ql)?://[^[:space:]\"'<>]+:[^[:space:]\"'<>]+@" -- . 2>/dev/null || true)
if [ -n "$matches" ]; then
  echo "REVIEW NEEDED — possible real credential(s) in a connection string:"
  echo "$matches"
  echo
  echo "A placeholder like <password> or \${VAR} won't match this pattern; anything that did match needs a human look."
else
  echo "OK"
fi

exit $status
