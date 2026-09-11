# nanobot links store

Adds the ability to save links shared in Discord into a local Postgres database, organized by free-form categories, using [HKUDS/nanobot](https://github.com/HKUDS/nanobot) deployed via Dokku, and [`@microsoft/postgres-mcp`](https://github.com/microsoft/postgres-mcp) as the MCP tool nanobot's agent calls.

## What's here

- `db/` — a small [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) project managing the schema (see `db/README.md`); `db/migrations/` holds the migration files, starting with the `links` table.
- `nanobot/mcp-server-snippet.json` — the `tools.mcpServers` block to merge into `~/.nanobot/config.json`.
- `nanobot/AGENTS-links-section.md` — instructions to append to the agent workspace's `AGENTS.md` so it knows how to use the tool.
- `dokku/Dockerfile.node-patch.md` — the patch nanobot's Dockerfile needs: adds Node.js/npx (required by both `postgres-mcp` and `node-pg-migrate`, neither present in its final image) and bakes in `db/` so migrations can run inside the app container.
- `dokku/Procfile` — defines the Discord gateway as a Dokku `worker` process (no web/HTTP needed).
- `dokku/DEPLOY.md` — the full Dokku deployment sequence: app creation, Postgres provisioning, deploy, running migrations, persistent storage for config, process scaling, and verification.

## Deploy order

Follow `dokku/DEPLOY.md` end to end. In short:

1. Clone `HKUDS/nanobot`, copy this repo's `db/` directory in, apply the patch in `dokku/Dockerfile.node-patch.md`, and copy `dokku/Procfile` into its repo root.
2. Create the Dokku app and set the `NANOBOT_CHANNELS=discord` build arg.
3. Provision Postgres with `dokku postgres:create`/`postgres:link` (injects `DATABASE_URL`).
4. `git push dokku main`, then apply migrations with `dokku run nanobot sh -c "cd /opt/db-migrations && npx node-pg-migrate up"`.
5. Prepare `config.json` (with the `tools.mcpServers.postgres` block from `nanobot/mcp-server-snippet.json` merged in, referencing `${DATABASE_URL}`) and `AGENTS.md` (with `nanobot/AGENTS-links-section.md` appended), and mount them into the app via `dokku storage:mount`.
6. Scale to `worker=1 web=0`, restart.
7. Verify: send a link + category in Discord, then check it landed with `dokku postgres:connect nanobot-links -- -c 'SELECT * FROM links;'`.

To add a schema change later: `cd db && npx node-pg-migrate create <name>`, commit the new file, then repeat steps 1 and 4 on the next deploy.
# Clawrlos
