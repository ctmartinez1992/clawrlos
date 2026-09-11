# Schema migrations (node-pg-migrate)

Schema changes for the links store are managed with [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) instead of hand-run SQL files. It reads the connection from the `DATABASE_URL` env var, and tracks applied migrations itself in a `pgmigrations` table — so re-running `up` is always safe, it only applies what's new.

nanobot runs natively on the host, and Postgres runs as a Dokku-managed service exposed to `127.0.0.1` (see `../dokku/DEPLOY.md`) — migrations run directly on the host using its existing `npx`, no Docker involved.

## One-time local setup

```bash
cd db
npm install
```

This resolves `node-pg-migrate` and its `pg` driver into `db/node_modules` — required for `npx node-pg-migrate` to work at all (it doesn't resolve `pg` on a bare `npx` run with no local install).

## Adding a new migration

```bash
cd db
npx node-pg-migrate create <short-description>
```

This creates a new timestamped file under `db/migrations/`. Write plain JS using the `pgm` schema-builder API (see `db/migrations/1757606400000_create-links.js` for the existing example) — this format supports both `up` and `down`, unlike raw `.sql` migrations which only run forward. Commit the new file, then apply it (below) — no image/container to rebuild since nanobot and this migrations project both run natively on the host.

## Running migrations

Get the DSN from `dokku postgres:info nanobot-links --dsn` (see `../dokku/DEPLOY.md`), then:

```bash
cd db
DATABASE_URL="<the DSN>" npx node-pg-migrate up
```
