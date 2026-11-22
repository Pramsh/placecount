# placecount

## Overview

Placecount is a project for tracking how many people are at a location in real time. The idea is simple: scan one QR code when you arrive and another when you leave. The entry and exit count lets people check how busy a place is before they head there.

A gym, for example, could display its current occupancy on its own website. Staff can encourage members to scan at the door on the way in and out, since the count depends on people recording both.

**Project status:** Placecount is an early TypeScript backend scaffold built with Fastify and PostgreSQL. The occupancy API, QR code check-in and check-out, and website integration are planned.

## Development and test databases

Start Docker and set `POSTGRES_PASSWORD` in `.env`. PostgreSQL is available at `127.0.0.1:5432` with the username `placecount_test`.

`corepack yarn test`, `corepack yarn test:watch`, `corepack yarn dev:test`, and `corepack yarn dev:run` all use the same database setup.

```text
scripts/test-seed.sql → placecount_test → placecount_test_run
```

Each run loads the seed into the base database, `placecount_test`, and recreates its working copy, `placecount_test_run`. The development app and tests write to the working copy. If the seed fails to load, the scripts keep the existing databases.

Watch mode runs the suite at startup and after changes to application code or the seed. When you edit test files, it reruns only those files. If you pass arguments to `test:watch`, it uses those arguments for every run. Each rerun recreates the working copy.

The working copy is shared. Before switching from `dev:run` to tests, export any data you want to keep and stop the app with `docker compose --profile test stop dev-app`. The scripts block test runs while the app is active and prevent commands from rebuilding or exporting the copy at the same time.

### Save development data

1. Start the app with `corepack yarn dev:run`.
2. Insert records into `placecount_test_run` while the container is running.
3. Run `corepack yarn dev:export-test-seed` before stopping or restarting the app.
4. On the next run, the exported records will appear in both the base database and its working copy.

The export preserves records already in the seed. If a record has the same key in both places, the seed value takes precedence. Edit the SQL file to change or remove an existing seed record.

`dev:run` starts the server from the `dev-app` image. `dev:test` runs `node --test` from that same image in a temporary container that exits when the suite finishes. Rows created by tests stay in the working copy until it is recreated.

### Add data directly to the seed

Add `INSERT` statements to the manual section of `scripts/test-seed.sql`, above `BEGIN EXPORTED DATABASE ROWS`. The next run or watch cycle loads them automatically. To rebuild both databases with the app stopped, run `corepack yarn dev:reset-db`.
