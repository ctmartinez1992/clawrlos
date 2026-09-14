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

Each link can have multiple visits logged against it (a `link_visits` table, one row per visit, linked via `link_id`), and each visit can in turn have any number of photos (a `visit_photos` table, one row per photo, linked via `visit_id`). When the user says they (re)visited a saved link — with or without a rating/notes/photos for that specific visit:

1. Find the link with `postgres_mcp_query` (match on `url` or `name` — ask the user to clarify if more than one plausible match comes back).
2. Rating for this visit is optional (0-10 integer) — only set it if the user gives one for this visit; don't invent one. This feeds into the link's overall `rating`, which the database automatically recalculates as the average of all rated visits every time one is added, changed, or removed — never set `links.rating` yourself.
3. Notes for this visit are optional — only include if the user gives context worth capturing.
4. If the user gives a specific date/time for the visit, use it for `visited_at`; otherwise omit that column so it defaults to the current time.
5. Photos are entirely optional, and there can be any number of them (e.g. several photos of what was eaten). For each photo attachment on the message:
   a. Download it (using your web-fetch tool, from its Discord attachment URL) to a temporary location.
   b. If the user says it's an invoice/receipt (or it's otherwise obvious from context that it is one), run OCR on the **original, uncompressed** download before touching it further:
      ```bash
      tesseract <downloaded-file> stdout
      ```
      (`tesseract-ocr` must be installed on the host). Parse the raw text yourself into line items (product name + price per line) — OCR output is noisy, so skip any line you can't confidently parse rather than guessing, and never invent an item or a price. Hang onto the extracted items; they get inserted after the visit row exists (step 7).
   c. Compress the photo with your shell tool before keeping it — e.g.:
      ```bash
      convert <downloaded-file> -resize '1600x1600>' -strip -quality 82 <final-path>
      ```
      This caps the largest dimension at 1600px and re-encodes at quality 82, cutting file size substantially with little visible quality loss (`imagemagick` must be installed on the host for `convert` to be available). Do this regardless of whether the photo was an invoice — the invoice photo is still kept like any other. Delete the temporary uncompressed download afterward.
   d. Save the final compressed file under `~/.nanobot/workspace/photos/` (create the directory first if it doesn't exist yet) with a unique filename — e.g. a timestamp plus the original file extension.
   Skip this whole step if the message has no photos. Only file paths are stored in the database — never the image bytes themselves.
6. Call `postgres_mcp_modify` to run the visit insert with `RETURNING id` so you get the new visit's id back:
   ```sql
   INSERT INTO link_visits (link_id, rating, notes) VALUES (<id>, <rating or NULL>, '<notes or NULL>') RETURNING id;
   ```
   (add `visited_at` to the column list and values only when the user specified a date/time)
7. If there were any photos, insert one row per photo into `visit_photos` using the visit id from the previous step (a single multi-row `INSERT` is fine when there are several):
   ```sql
   INSERT INTO visit_photos (visit_id, photo_path) VALUES (<visit_id>, '<photo path>'), (<visit_id>, '<photo path 2>');
   ```
8. If any invoice items were extracted in step 5b, insert one row per item into `invoice_items` using the same visit id (again, a single multi-row `INSERT` when there are several):
   ```sql
   INSERT INTO invoice_items (visit_id, product_name, price) VALUES (<visit_id>, '<product name>', <price>), (<visit_id>, '<product name 2>', <price 2>);
   ```
9. Confirm in Discord which link the visit was logged against, how many photos were saved, and how many invoice items were extracted (if any) — mentioning the extracted items lets the user catch obviously-wrong OCR and correct it in a follow-up message.

Don't run destructive statements (`DELETE`, `DROP`, etc.) against this database unless the user explicitly asks for it.
