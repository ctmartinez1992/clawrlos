---
name: verify-repo-safety
description: Run after changing anything under db/migrations/, dokku/, or nanobot/ (or any doc containing a connection string) in this repo — checks that no already-committed migration was edited instead of adding a new one, and that no real secret/DSN password was pasted into a tracked file. Use before considering such a change done.
---

# Verify repo safety rules

This repo has two non-negotiable conventions (see CLAUDE.md): never edit an already-committed migration, and never commit a real secret. This skill checks both mechanically instead of relying on remembering to.

1. Run the check script from the repo root:
   ```bash
   .claude/skills/verify-repo-safety/check.sh
   ```
2. Read its output:
   - **Migration immutability** — a FAIL means an already-committed file under `db/migrations/` was modified. Revert it to the committed version and express the change as a new migration instead (see `reference.md` for the pattern this repo already uses).
   - **Secret scan** — anything under "REVIEW NEEDED" needs an actual look. A placeholder (`<password>`, `${VAR}`) won't match this pattern in the first place; if something did match, remove the real value from the file and replace it with a placeholder or env-var reference.
3. State the result explicitly — which checks passed, which needed a fix, and what you changed — before reporting the change as done.

See `reference.md` for why these rules exist and worked examples of both violation types.
