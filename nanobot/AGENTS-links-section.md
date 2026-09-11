## Saving links to Postgres

You have a `postgres` MCP tool connected to a database that stores links organized by category.

When a Discord message contains a URL that the user wants saved (they share a link, or explicitly ask you to save/store/bookmark one):

1. Determine the category:
   - If the user names a category, use it as given (free text, don't force it into a fixed list).
   - If they don't, infer a short, sensible category from the link/context (e.g. "recipes", "articles", "tools"). If it's genuinely ambiguous, ask them in one short message rather than guessing.
2. Call `postgres_mcp_connect` with profile `links` (only needs to happen once per session/connection).
3. Call `postgres_mcp_modify` to run:
   ```sql
   INSERT INTO links (url, category, note) VALUES ('<url>', '<category>', '<optional short note>');
   ```
   Use a `note` only if there's useful context to capture (e.g. why it was shared); otherwise pass `NULL`.
4. Reply in Discord confirming the link was saved and which category it went under.

Don't run destructive statements (`DELETE`, `DROP`, etc.) against this database unless the user explicitly asks for it.
