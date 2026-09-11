# Postgres via Dokku

nanobot itself runs natively on this host (systemd), not as a Dokku app. Dokku here only manages the Postgres database, which nanobot (and the migration tooling) reach over localhost.

## 1. Create the database

```bash
dokku postgres:create nanobot-links
```

## 2. Expose it to localhost only

nanobot runs natively on the same box, so bind the exposed port to loopback rather than all interfaces — this keeps it unreachable from outside the host:

```bash
dokku postgres:expose nanobot-links 127.0.0.1:5432
```

(Reverse this later with `dokku postgres:unexpose nanobot-links` if you ever need to.)

## 3. Get the connection string

```bash
dokku postgres:info nanobot-links --dsn
```

This DSN's host/port will be `127.0.0.1:5432` (from the loopback bind above). You'll need it twice:
- As `POSTGRES_LINKS_DSN` in nanobot's environment — see `../nanobot/DEPLOY.md`.
- As `DATABASE_URL` when running migrations — see `../db/README.md`.

postgres://postgres:c4f8811a6c92ab2a518c26a433b0c875@dokku-postgres-nanobot-links:5432/nanobot_links
