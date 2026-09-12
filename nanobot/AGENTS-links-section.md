## Saving links to Postgres

You have a `postgres` MCP tool connected to a database that stores links organized by category.

When a Discord message contains a URL that the user wants saved (they share a link, or explicitly ask you to save/store/bookmark one):

1. Determine the category:
   - If the user names a category, use it as given (free text, don't force it into a fixed list).
   - If they don't, infer a short, sensible category from the link/context (e.g. "recipes", "articles", "tools"). If it's genuinely ambiguous, ask them in one short message rather than guessing.
2. Determine a name for the link — a short, human-readable title (e.g. the page/article title, or a brief description of what it is). Use one if the user gives it; otherwise infer it from the link/context. Leave it out (`NULL`) only if nothing reasonable can be inferred.
3. Call `postgres_mcp_connect` with profile `links` (only needs to happen once per session/connection).
4. Call `postgres_mcp_modify` to run:
   ```sql
   INSERT INTO links (url, name, category, note) VALUES ('<url>', '<name>', '<category>', '<optional short note>');
   ```
   Use a `note` only if there's useful context to capture beyond the name (e.g. why it was shared); otherwise pass `NULL`.
5. Reply in Discord confirming the link was saved, its name, and which category it went under.

Don't run destructive statements (`DELETE`, `DROP`, etc.) against this database unless the user explicitly asks for it.
