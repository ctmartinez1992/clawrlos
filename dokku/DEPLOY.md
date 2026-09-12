# Postgres via Dokku

nanobot itself runs natively on this host (systemd), not as a Dokku app. Dokku here only manages the Postgres database, which nanobot (and the migration tooling) reach over localhost.

## 1. Create the database

```bash
dokku postgres:create nanobot-links
```

## 2. Connect over the Docker bridge (not `postgres:expose`)

`dokku postgres:expose` publishes the port via a `dokku/ambassador` sidecar container that auto-detects its target through legacy Docker `--link` env vars. On current Docker Engine that mechanism is deprecated and, on at least one host we tested this on, outright broken — the ambassador crash-loops with `Failed to autodetect target host/container and port using --link environment`, and the exposed port never actually listens.

If you hit that (check with `docker ps --filter name=<service>-ambassador` — `Restarting` means it's broken), skip `expose` entirely and connect straight to the container's Docker bridge IP instead, which the host can reach directly without any port publishing:

```bash
dokku postgres:unexpose nanobot-links   # stop the crash-looping ambassador, if you'd tried expose
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' dokku.postgres.nanobot-links
```

That prints an IP like `172.17.0.x`. If `expose` *does* work cleanly on your host, `127.0.0.1:5432` (from `dokku postgres:expose nanobot-links 127.0.0.1:5432`) is the simpler, more stable option — prefer it if it works, and only fall back to the container IP if it doesn't.

One caveat with the container-IP approach: that IP can change if the container is ever recreated (upgrade, `destroy`/`create`, etc.) — re-run the `docker inspect` command above to check it after any such change.

## 3. Get the connection string

```bash
dokku postgres:info nanobot-links --dsn
```

This prints the *internal* Docker DSN, e.g. `postgres://postgres:<password>@dokku-postgres-nanobot-links:5432/nanobot_links` — that hostname only resolves inside Docker's network, not from the native host. Swap the host portion to whichever address worked in step 2 (the container IP, or `127.0.0.1` if `expose` worked), keeping the same user/password/port/dbname:

```
postgres://postgres:<password>@<container-ip-or-127.0.0.1>:5432/nanobot_links
```

You'll need this corrected DSN twice:
- As `POSTGRES_LINKS_DSN` in nanobot's environment — see `../nanobot/DEPLOY.md`.
- As `DATABASE_URL` when running migrations — see `../db/README.md`.

**Never paste the real DSN/password into a file in this repo.** Export it in your shell (`export POSTGRES_LINKS_DSN=...`) or put it in a local, gitignored file — not a tracked doc.
