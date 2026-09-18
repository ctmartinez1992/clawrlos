# nanobot links store

Adds the ability to save links shared in Discord into a Postgres database, organized by free-form categories, using [HKUDS/nanobot](https://github.com/HKUDS/nanobot) (running natively on the host) and [`@microsoft/postgres-mcp`](https://github.com/microsoft/postgres-mcp) as the MCP tool nanobot's agent calls.

It also wires in a second, unrelated MCP tool for the same nanobot install: `clawrlos-ops-mcp`, a self-hosted AI/tech news aggregator cached in Supabase (see `nanobot/DEPLOY-ai-news.md`).

nanobot itself stays a native/systemd process — it's not deployed via Dokku. Dokku is only used to run the Postgres database, exposed to `127.0.0.1` so the native nanobot process (and the migration tooling) can reach it.

## What's here

- `dokku/DEPLOY.md` — provisioning Postgres via Dokku's `postgres` plugin and exposing it to localhost.
- `dokku/DB-VIEWER.md` — optional: deploying [pgweb](https://github.com/sosedoff/pgweb) as its own Dokku app for browsing the tables in a read-only web UI (SSH-tunnel access only, never public).
- `db/` — a small [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) project managing the schema (see `db/README.md`); `db/migrations/` holds the migration files, starting with the `links` table.
- `nanobot/mcp-server-snippet.json` — the `tools.mcpServers` block to merge into `~/.nanobot/config.json`.
- `nanobot/AGENTS-links-section.md` — instructions to append to the agent workspace's `AGENTS.md` so it knows how to use the tool.
- `nanobot/DEPLOY.md` — wiring the above into the existing native nanobot install.
- `nanobot/ai-news-mcp-snippet.json`, `nanobot/AGENTS-ai-news-section.md`, `nanobot/DEPLOY-ai-news.md` — the same three-piece pattern, for the separate `ai-news` MCP tool (assumes `clawrlos-ops-mcp` is already installed on the host).
- `nanobot/DEPLOY-google-calendar.md` — re-authenticating the Google Calendar MCP tool when its OAuth token expires or is revoked.

## Host dependencies

Beyond Node.js (used for `npx`), the agent's invoice handling in `nanobot/AGENTS-links-section.md` shells out to one more tool that must be installed on the host:
- `tesseract-ocr` (for `tesseract`, used to extract text from invoice/receipt photos) — `sudo apt install -y tesseract-ocr`

## Deploy order

1. Provision Postgres: follow `dokku/DEPLOY.md` (create the service, expose it to localhost, grab the DSN).
2. Wire it into nanobot: follow `nanobot/DEPLOY.md` (env var, migrations, MCP config, agent instructions, restart).
3. Verify: send a link + category in Discord, then check it landed with `psql "<dsn>" -c "SELECT * FROM links;"`.

To add a schema change later: `cd db && npx node-pg-migrate create <name>`, commit the new file, then apply it per `db/README.md`.

Optional: follow `dokku/DB-VIEWER.md` any time after step 1 to deploy a browsable table viewer instead of using `psql` directly.

Independently of the above (no ordering dependency), follow `nanobot/DEPLOY-ai-news.md` any time to add the `ai-news` MCP tool, once `clawrlos-ops-mcp` is installed on the host.
