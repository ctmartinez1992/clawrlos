# Browsing the links database with pgweb

A read-only web UI for browsing the `nanobot-links` Postgres tables (`links`, `link_visits`, `visit_photos`, `invoice_items`), deployed as its own Dokku app from the official [pgweb](https://github.com/sosedoff/pgweb) image. It's never exposed to the internet — only reachable from the server itself, so you view it through an SSH tunnel.

This is independent of the nanobot deploy steps in `../nanobot/DEPLOY.md` — it only needs the `nanobot-links` Postgres service from `DEPLOY.md` to already exist.

## 1. Deploy pgweb from its Docker image

```bash
dokku apps:create nanobot-links-viewer
dokku git:from-image nanobot-links-viewer sosedoff/pgweb:latest
```

## 2. Connect it to the Postgres service

```bash
dokku postgres:link nanobot-links nanobot-links-viewer
```

This sets `DATABASE_URL` on the app and attaches the service container to the app's network. pgweb reads `DATABASE_URL` automatically on startup — no manual login screen.

**If it can't reach the database** (this host's Docker version is known to break the ambassador container `postgres:expose` relies on — see `DEPLOY.md` — and `postgres:link` could hit the same class of issue): fall back to wiring the DSN manually, same as `DEPLOY.md` does for nanobot itself:

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' dokku.postgres.nanobot-links
dokku config:set nanobot-links-viewer DATABASE_URL="postgres://postgres:<password>@<container-ip>:5432/nanobot_links"
```

## 3. Make it read-only

```bash
dokku config:set nanobot-links-viewer PGWEB_READONLY=true
```

pgweb will refuse any modifying SQL (`INSERT`/`UPDATE`/`DELETE`/DDL) run from its query box — this is meant purely for looking at data.

## 4. Keep it off the public internet

By default Dokku would publish a new app on a public nginx vhost. Instead, disable that and bind pgweb's port straight to the host's loopback interface — the same pattern `DEPLOY.md` uses for Postgres itself:

```bash
dokku proxy:disable nanobot-links-viewer
dokku docker-options:add nanobot-links-viewer deploy "-p 127.0.0.1:8082:8081"
dokku ps:rebuild nanobot-links-viewer
```

(pgweb listens on container port `8081` by default.) After this, port 8082 only answers on the server itself, never externally.

## 5. Use it

From your own machine:

```bash
ssh -L 8082:127.0.0.1:8082 <user>@<server>
```

Then open `http://localhost:8082` in a local browser. All tables appear in the sidebar automatically — click one to browse its rows, or use the SQL tab for ad-hoc (read-only) queries.

## Verify

```bash
dokku ps:report nanobot-links-viewer   # confirm it's running
curl -sI http://127.0.0.1:8082         # run on the server itself — should return a valid HTTP response
```

Then open the tunnel above and confirm the tables show data, and that a test write (e.g. `DELETE FROM links WHERE false;` in the SQL tab) is rejected.
