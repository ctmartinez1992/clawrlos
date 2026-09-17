# Adding the ai-news feature to nanobot (native)

This wires the already-installed `clawrlos-ops-mcp` server (assumed present at `/root/clawrlos-ops-mcp/.venv/bin/clawrlos-ops-mcp` on the host — installing that server itself is outside this repo's scope, same as nanobot's own install) into nanobot as a second MCP tool, alongside the existing `postgres` one from `nanobot/DEPLOY.md`. It's independent of the Postgres links feature — no shared state, no dependency order between the two.

## 1. Set the Supabase credentials as environment variables

Add `SUPABASE_URL` and `SUPABASE_KEY` to whatever environment nanobot's systemd service runs under — the same root-owned, `chmod 600` `EnvironmentFile=` used for `POSTGRES_LINKS_DSN` in `nanobot/DEPLOY.md` works fine; just add these two lines to it:

```
SUPABASE_URL=<your supabase project url>
SUPABASE_KEY=<your supabase key>
```

`SUPABASE_KEY` is a real secret — treat it exactly like the Postgres DSN: never paste the real value into a tracked file.

## 2. Wire in the MCP server

Merge the block from `ai-news-mcp-snippet.json` into `~/.nanobot/config.json` on the server, under `tools.mcpServers`. This is additive: if the `postgres` entry from the links feature is already there, keep it and add `ai-news` alongside it, e.g.:

```json
{
  "tools": {
    "mcpServers": {
      "postgres": { "...": "..." },
      "ai-news": {
        "command": "/root/clawrlos-ops-mcp/.venv/bin/clawrlos-ops-mcp",
        "args": [],
        "env": {
          "SUPABASE_URL": "${SUPABASE_URL}",
          "SUPABASE_KEY": "${SUPABASE_KEY}"
        }
      }
    }
  }
}
```

## 3. Teach the agent

Append the contents of `AGENTS-ai-news-section.md` to the agent workspace's `AGENTS.md` (default `~/.nanobot/workspace/AGENTS.md`).

## 4. Restart and verify

```bash
systemctl --user restart nanobot-gateway   # or your service's actual name
```

In Discord, ask the bot something like "what's new in AI today?" and confirm it responds with a ranked, recent set of stories (routed through `get_top_picks`). Optionally also ask a source-specific question (e.g. "anything new on Hacker News?") to spot-check that it routes to `get_trending_news` instead.
