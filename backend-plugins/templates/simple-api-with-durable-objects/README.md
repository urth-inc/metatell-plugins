# Simple API with Durable Objects

A starter project for a metatell backend plugin that keeps state: a Cloudflare
Worker with two small APIs, each backed by its own Durable Object class — a CRUD
API over items, and named counters.

Start here when your plugin has to remember something. If it does not, start
from [`../minimal`](../minimal) instead — everything below is state handling you
would otherwise delete.

## Start from this template

```bash
git clone git@github.com:urth-inc/metatell-plugins.git
cp -R metatell-plugins/backend-plugins/templates/simple-api-with-durable-objects \
  /path/to/your/plugin
cd /path/to/your/plugin
git init
git add .
git commit -m "Initial commit"
```

Set the package `name`, `version`, and `description`, and the `name` in
`wrangler.jsonc`.

## Files

| Path | Contents |
| --- | --- |
| `src/index.ts` | The Hono app. The routes, and the exports of both classes; add yours here. |
| `src/item-store.ts` | `ItemStore`. The SQL for `items`. |
| `src/counter-store.ts` | `CounterStore`. All counters, as rows of one table. |
| `src/migrations.ts` | The schema migration: each class's list of steps, and the code that applies them. |
| `src/env.d.ts` | The `Env` bindings. Add Durable Object bindings here and in `wrangler.jsonc`. |
| `wrangler.jsonc` | The Worker's configuration. Ships in the archive — see below. |
| `scripts/build.js` | Bundles `worker.js` with wrangler, ships `wrangler.jsonc`, and zips `dist/plugin.zip`. |

## Routes

| Method | Path | Result |
| --- | --- | --- |
| `GET` | `/items` | Up to 50 items, newest first |
| `POST` | `/items` | Creates one from `{"body": "..."}` |
| `GET` | `/items/:id` | One item, or 404 |
| `PUT` | `/items/:id` | Replaces its `body`, or 404 |
| `DELETE` | `/items/:id` | 204, or 404 |
| `GET` | `/counters` | Up to 50 counters, by name |
| `GET` | `/counters/:name` | The counter's value, 0 if it was never incremented |
| `POST` | `/counters/:name/increment` | Adds 1 and returns the new value |
| `GET` | `/health` | Reachability, and that a Durable Object can be read |

```bash
curl -X POST http://localhost:8787/items \
  -H 'content-type: application/json' -d '{"body":"first"}'   # pnpm dev
# {"item":{"id":"...","body":"first","createdAt":"...","updatedAt":"..."}}
```

`items` and `counters` are placeholders. Rename the tables, the routes, and the
classes to whatever you are storing.

## Which instance holds the state

A Durable Object namespace is not one object — it is as many as you ask for, one
per id, and **each instance has its own SQLite database**. `idFromName` turns a
string into an instance. Both classes here use a fixed name:

```ts
env.ITEM_STORE.get(env.ITEM_STORE.idFromName('items'))
env.COUNTER_STORE.get(env.COUNTER_STORE.idFromName('counters'))
```

So each class has exactly one instance per Worker: one database with ordinary
tables and rows, used the way you would use any DBMS. Since an organization
registers one Worker, that is the organization's data. Start here; one instance
holds up to 10 GB.

Split a class into many instances only when you need one of these:

- **Isolation per owner** — typically per room, with the room taken from the
  token's claims.
- **More throughput than one instance gives.** An instance handles one request
  at a time.

Splitting costs what a single database gives you for free. Every instance is a
separate database, so there is no query across them — no listing, no totals, no
joins — and the Worker cannot enumerate them. Each one is created, and migrated,
on its first access.

The two classes are separate instances, so items and counters never wait on
each other.

An instance handles one request at a time only within a single method call.
`increment()` reads and writes in one statement. Calling `get()` and then a
write from the Worker would let another request land in between and lose an
update — keep any read-then-write inside the Durable Object.

## Migrating the schema

Every Durable Object instance keeps its own tables, and the platform does not
touch them. When you change the schema, the instances that already exist have
to be brought forward by your code.

`src/migrations.ts` is that code. Each class has its own list of steps
(`ITEM_STORE_MIGRATIONS`, `COUNTER_STORE_MIGRATIONS`); its constructor passes
that list to `migrate`, which applies the steps the instance has not seen yet,
in order, and records how far it got in a `_schema_migrations` table. Each
instance has its own SQLite, so the records of the two classes never mix.
`ItemStore` ships two steps — the first creates `items`, the second adds
`updated_at` to it — so the path an old instance takes is the same path a new
one takes.

To change a class's schema, **append** a step to its list:

```ts
export const ITEM_STORE_MIGRATIONS: string[][] = [
  [`CREATE TABLE items (...)`],
  [`ALTER TABLE items ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`,
   `UPDATE items SET updated_at = created_at`],
  [`ALTER TABLE items ADD COLUMN ...`],   // your change
]
```

A few rules follow from how SQLite and Durable Objects behave:

- **Never edit or remove an applied step.** Instances that already ran it will
  not run it again, so an edit only reaches new instances and the two drift
  apart. The same rule as `migrations` in `wrangler.jsonc`.
- **A column added with `ALTER TABLE` cannot default to an expression** such as
  `datetime('now')`. SQLite rejects it as soon as the table has rows — which is
  exactly when a migration matters, and an empty test instance will not show
  it. Add the column with a constant default, fill the existing rows with an
  `UPDATE`, and set the value explicitly on `INSERT`.
- **`PRAGMA user_version` is not available** in a Durable Object's SQLite, which
  is why the applied step is kept in a table instead.
- **Do not drop columns.** Migrations are forward-only; dropping loses data.

### Testing a migration

`pnpm dev` keeps Durable Object state in `.wrangler/state`, so a step runs once
per state directory and is skipped on every later start. Seeing `pnpm dev`
come up after appending a step does not mean the whole path was exercised.

Run the new code against both kinds of instance before you register it — the
platform replaces the running version as soon as the upload succeeds, and keeps
no copy of the previous archive to go back to:

```bash
pnpm dev --persist-to /tmp/fresh          # an empty directory: every step, in order
pnpm dev --persist-to /tmp/upgraded       # state the previous version wrote
```

For the second, run the previous version of your plugin with the same
`--persist-to` first, write some data through it, then start the new version on
top. Keep the previous archive yourself; it is the only way back.

## Adding a binding

The platform accepts **Durable Object bindings only** for now. D1, R2, KV,
services, queues and the rest are rejected at registration with
`<field> is not supported yet` — even though `pnpm dev` runs them fine, so the
failure only shows up when you register.

To add another Durable Object class — the way `CounterStore` was added after
`ItemStore`:

1. Add it to `durable_objects` in `wrangler.jsonc`, and append a `migrations`
   entry with a new tag for its class (`v2` for `CounterStore` here). The list
   is cumulative: append a tag, never edit or remove an applied one.
   [`../../README.md`](../../README.md) covers why.
2. Add it to `Env` in `src/env.d.ts`.
3. Export the class from `src/index.ts`. Forget it and `pnpm dev` and
   `pnpm build` both stop with `Your Worker depends on the following Durable
   Objects, which are not exported`.
4. Give it its own list in `src/migrations.ts` and call `migrate` with it from
   its constructor.

`wrangler.jsonc` ships in the archive and the platform uploads the Worker with
it, so step 1 is what creates the binding in production — not just locally.

## Commands

This template uses pnpm. The version is pinned in `packageManager`, so Corepack
picks it up.

```bash
pnpm install
pnpm dev        # wrangler dev
pnpm lint:tsc   # typecheck
pnpm build      # writes dist/plugin.zip
```

`pnpm dev` runs the Worker locally in workerd, Durable Objects included. It
needs no Cloudflare credentials — only `wrangler deploy` and `--remote` do, and
neither is part of this workflow.

pnpm blocks dependency build scripts by default, so `esbuild` and `workerd` are
allowed explicitly under `pnpm.onlyBuiltDependencies` in `package.json`. Both
download a platform binary in `postinstall`; without that, `pnpm build` and
`pnpm dev` fail.

## Ship it

`pnpm build` writes `dist/plugin.zip`, holding the bundled `worker.js` and
`wrangler.jsonc`. That archive is the deliverable: register it with metatell and
the platform uploads the Worker into its dispatch namespace for you.

**You do not deploy this Worker yourself.** The dispatch namespace lives in the
platform's Cloudflare account, so `wrangler deploy` is not part of this
template's workflow — `wrangler` is here for `pnpm dev` and for bundling in
`pnpm build`.

See [`../../README.md`](../../README.md) for the archive's contents and for the
constraints that apply to every backend plugin.
