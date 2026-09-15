# CLAUDE.md

## What this is

A Postgres-backed "links" feature for a self-hosted [HKUDS/nanobot](https://github.com/HKUDS/nanobot) Discord bot on a Hetzner server. Architecture: nanobot runs natively via systemd (not in Dokku); only Postgres runs in Dokku, via the `dokku-postgres` plugin. See `README.md` for the full picture and deploy order.

## Deploy model — read this before assuming you have server access

This working directory does not have SSH/shell access to the production server. Every change here is a doc, a migration file, or a config snippet — never a command run directly against the Hetzner box. The actual workflow is: write/update the relevant file(s) here, hand the user the exact commands to run on the server, and wait for them to paste back the output (or an error) if something needs debugging. Don't assume you can `ssh` in, check `systemctl` status, or query the live database yourself.

## Layout

- `README.md` — start here: overview and deploy order.
- `dokku/DEPLOY.md` — provisioning Postgres via Dokku.
- `dokku/DB-VIEWER.md` — pgweb table viewer, deployed as its own Dokku app (SSH-tunnel access only).
- `nanobot/DEPLOY.md`, `mcp-server-snippet.json`, `AGENTS-links-section.md` — wiring nanobot to Postgres and the agent's instructions for using it.
- `db/` — the [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) project; `db/migrations/` holds the schema history, `db/README.md` covers adding/applying migrations.

## Conventions

- **Never edit a migration that's already been committed.** Add a new one instead, even to reverse or replace a previous migration's column — e.g. `db/migrations/1758300000000_create-visit-photos.js` drops the column that `1758200000000_add-photo-path-to-link-visits.js` had added, rather than editing that file. Migration filenames are `<timestamp>_<name>.js`; pick a new timestamp higher than the current highest.
- **Never put a real secret in a tracked file** — no DSNs, passwords, or connection strings with credentials. Export them in your shell or use a local, gitignored file, and say so explicitly in any doc that needs one filled in.
- **Dokku's `postgres:expose` is known broken on this host** (its ambassador container relies on deprecated Docker `--link` autodetection and crash-loops). `dokku/DEPLOY.md` documents the container-IP workaround — check that before treating a connection failure as something else.
