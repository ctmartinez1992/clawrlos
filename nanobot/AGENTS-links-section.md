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

`links.rating` is **not** set here — it's an average the database maintains automatically from `link_visits.rating` (see below), so a brand-new link starts with `rating = NULL` until it has at least one rated visit. Never set it directly.

New links start with `no_longer_recommend = false` — you don't need to set this on insert.

## Marking a link as no longer recommended

When the user says a previously saved link shouldn't be recommended anymore (e.g. "that tool shut down", "don't recommend that article anymore, it's outdated"):

1. Find the link with `postgres_mcp_query` (match on `url` or `name` — ask the user to clarify if more than one plausible match comes back).
2. Call `postgres_mcp_modify` to run:
   ```sql
   UPDATE links
   SET no_longer_recommend = true,
       reason_for_no_longer_recommending = '<reason, or NULL if none given>',
       date_for_no_longer_recommending = CURRENT_DATE
   WHERE id = <id>;
   ```
   Only include a reason if the user actually gave one; don't invent one.
3. Confirm in Discord which link was updated.

## Recording a visit to a link

Each link can have multiple visits logged against it (a `link_visits` table, one row per visit, linked via `link_id`). When the user says they (re)visited a saved link — with or without a rating/notes for that specific visit:

1. Find the link with `postgres_mcp_query` (match on `url` or `name` — ask the user to clarify if more than one plausible match comes back).
2. Rating for this visit is optional (0-10 integer) — only set it if the user gives one for this visit; don't invent one. This feeds into the link's overall `rating`, which the database automatically recalculates as the average of all rated visits every time one is added, changed, or removed — never set `links.rating` yourself.
3. Notes for this visit are optional — only include if the user gives context worth capturing.
4. If the user gives a specific date/time for the visit, use it for `visited_at`; otherwise omit that column so it defaults to the current time.
5. Call `postgres_mcp_modify` to run:
   ```sql
   INSERT INTO link_visits (link_id, rating, notes) VALUES (<id>, <rating or NULL>, '<notes or NULL>');
   ```
   (add `visited_at` to the column list and values only when the user specified a date/time)
6. Confirm in Discord which link the visit was logged against.

Don't run destructive statements (`DELETE`, `DROP`, etc.) against this database unless the user explicitly asks for it.
