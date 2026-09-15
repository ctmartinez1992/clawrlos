# Why these checks exist

## The secret-leak incident

Earlier in this project, a real Postgres DSN with a plaintext password got pasted into `dokku/DEPLOY.md` and committed. It had to be stripped out and the password rotated (the Dokku Postgres service was recreated, since no real data existed yet — see git history around that point). The secret scan in `check.sh` exists so that doesn't happen silently again: it greps tracked and untracked files for connection strings that look like they carry a real credential rather than a placeholder.

The regex only flags a `postgres://` or `postgresql://` URL whose user/password segment doesn't contain whitespace, quotes, or angle brackets. This repo's own docs consistently use angle-bracket placeholders (`<password>`, `<user>`, `<container-ip-or-127.0.0.1>`), so they're excluded by design and won't trip the check. Anything that *does* match is either a genuine secret or an example written in an unusual style — either way it's worth a second look before the change is considered done.

This is a heuristic, not a guarantee: a clean run means nothing obviously secret-shaped was found, not that the file is provably free of sensitive values. Judgment still applies — an obviously fake example value (`abc123`) is fine; anything that looks like a real generated password or token is not.

## The migration-immutability pattern

Migrations in `db/migrations/` are never edited once committed — even to reverse or replace something an earlier migration did. The canonical example already in this repo:

- `1758200000000_add-photo-path-to-link-visits.js` added a `photo_path` column to `link_visits`.
- Later, photos became one-to-many (a visit can have several), which needed a proper `visit_photos` table instead. Rather than editing the first migration, `1758300000000_create-visit-photos.js` creates that table **and** drops the `link_visits.photo_path` column it superseded — as a brand new migration file.

If `check.sh` reports a modified (not added) file under `db/migrations/`, that's this rule being broken. The fix is always the same shape: `git checkout -- <the file>` to restore it, then write a new migration file (`npx node-pg-migrate create <name>` from `db/`) that makes whatever change was intended — including undoing a previous migration's column/table, if that's the actual goal.

Why this matters in practice: `node-pg-migrate` tracks which migration files have already run (in the `pgmigrations` table) by filename. Editing an already-applied migration's contents doesn't get re-run on environments where it already applied — the schema and the migration history silently diverge from what the file now says.
