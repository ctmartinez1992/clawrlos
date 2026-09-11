# nanobot links store

Adds the ability to save links shared in Discord into a Postgres database, organized by free-form categories, using [HKUDS/nanobot](https://github.com/HKUDS/nanobot) (running natively on the host) and [`@microsoft/postgres-mcp`](https://github.com/microsoft/postgres-mcp) as the MCP tool nanobot's agent calls.

nanobot itself stays a native/systemd process — it's not deployed via Dokku. Dokku is only used to run the Postgres database, exposed to `127.0.0.1` so the native nanobot process (and the migration tooling) can reach it.

## What's here

- `dokku/DEPLOY.md` — provisioning Postgres via Dokku's `postgres` plugin and exposing it to localhost.
- `db/` — a small [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) project managing the schema (see `db/README.md`); `db/migrations/` holds the migration files, starting with the `links` table.
- `nanobot/mcp-server-snippet.json` — the `tools.mcpServers` block to merge into `~/.nanobot/config.json`.
- `nanobot/AGENTS-links-section.md` — instructions to append to the agent workspace's `AGENTS.md` so it knows how to use the tool.
- `nanobot/DEPLOY.md` — wiring the above into the existing native nanobot install.

## Deploy order

1. Provision Postgres: follow `dokku/DEPLOY.md` (create the service, expose it to localhost, grab the DSN).
2. Wire it into nanobot: follow `nanobot/DEPLOY.md` (env var, migrations, MCP config, agent instructions, restart).
3. Verify: send a link + category in Discord, then check it landed with `psql "<dsn>" -c "SELECT * FROM links;"`.

To add a schema change later: `cd db && npx node-pg-migrate create <name>`, commit the new file, then apply it per `db/README.md`.
