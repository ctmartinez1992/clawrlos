# Google Calendar MCP tool (native)

This assumes the [`@cocal/google-calendar-mcp`](https://github.com/cocal/google-calendar-mcp) MCP server is already wired into `~/.nanobot/config.json` on the host, with its OAuth client credentials JSON saved somewhere like `/root/.nanobot/google-calendar-oauth.json` — setting that up initially is outside this repo's scope, same as `clawrlos-ops-mcp` in `nanobot/DEPLOY-ai-news.md`. This doc only covers **re-authenticating** once the stored token expires or is revoked.

## Re-authenticating

You'll know this is needed when the bot's calendar tool starts failing in Discord, or when running the auth command below prints `Invalid grant. Token likely expired or revoked. Please re-authenticate.`

On the server:

```bash
export GOOGLE_OAUTH_CREDENTIALS="/root/.nanobot/google-calendar-oauth.json"
npx @cocal/google-calendar-mcp auth
```

This prints a Google OAuth consent URL and starts a local callback server on port 3500 (`http://localhost:3500`). The server has no browser, so open an SSH local port-forward from your own machine before visiting that URL:

```bash
ssh -o IdentitiesOnly=yes -i ~/.ssh/<your-key> -L 3500:localhost:3500 root@<server-ip>
```

With the tunnel open, visit the printed `https://accounts.google.com/o/oauth2/v2/auth?...` URL in your local browser and complete the Google consent screen. On success, the CLI prints:

```
Tokens saved successfully for normal account to: /root/.config/google-calendar-mcp/tokens.json
```

No restart of nanobot is needed — the MCP server picks up the refreshed token file on its next call.
