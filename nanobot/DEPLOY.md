# Adding the links feature to nanobot (native)

nanobot already runs natively on the host via systemd — this doesn't change that. It just adds the postgres MCP tool and the agent instructions for saving links. Node.js/`npx` is already installed on the host, so no runtime changes are needed there either.

## 1. Set the DB connection as an environment variable

Get the DSN from the Postgres side first (`../dokku/DEPLOY.md`), then add it to whatever environment nanobot's systemd service runs under — e.g. an `EnvironmentFile=` referenced by the unit (root-owned, `chmod 600`), containing:

```
POSTGRES_LINKS_DSN=postgresql://<user>:<pass>@127.0.0.1:5432/<db>
```

## 2. Apply schema migrations

From this repo (see `../db/README.md` for details):

```bash
cd db
npm install   # one-time
DATABASE_URL="<the DSN from step 1>" npx node-pg-migrate up
```

## 3. Wire in the MCP server

Merge the block from `mcp-server-snippet.json` into `~/.nanobot/config.json` on the server, under `tools.mcpServers`.

## 4. Teach the agent

Append the contents of `AGENTS-links-section.md` to the agent workspace's `AGENTS.md` (default `~/.nanobot/workspace/AGENTS.md`).

## 5. Restart and verify

```bash
systemctl --user restart nanobot-gateway   # or your service's actual name
```

Send a link with a category to the bot in Discord, confirm it acknowledges, then check it landed:

```bash
psql "<the DSN from step 1>" -c "SELECT * FROM links;"
psql "<the DSN from step 1>" -c "SELECT category, count(*) FROM links GROUP BY category;"
```
