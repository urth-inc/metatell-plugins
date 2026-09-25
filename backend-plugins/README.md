# Backend plugins

This directory contains metatell plugins that run on the server as Cloudflare
Workers, deployed into a Workers for Platforms dispatch namespace. A request
reaches them through the platform dispatcher, not through a route of their own.

- [`templates`](./templates) holds the starter projects to copy — see
  [Templates](#templates) below.

Backend plugins share nothing with the frontend plugins under
[`../frontend-plugins`](../frontend-plugins) except the word "plugin". Those are
Module Federation remotes loaded by the browser at runtime; these are bundled
Workers. The build output, the deployment target, and the registration API
(`/client/api/v1/backend-plugins` rather than `/client/api/v1/plugins`) are all
different. Do not copy a build pipeline from one side to the other.

## Templates

| Template | What it has | Start from it when |
| --- | --- | --- |
| [`minimal`](./templates/minimal) | A health route, the TypeScript setup, and the packaging pipeline | You want the bare structure and nothing to delete |
| [`simple-api-with-durable-objects`](./templates/simple-api-with-durable-objects) | Two Durable Object classes — CRUD over items, and named counters — with the schema migration written out | The plugin has to remember something |
| [`simple-api-with-token-verification`](./templates/simple-api-with-token-verification) | The access token verified against JWKS before a route runs | A route needs to know who is calling |

Every template builds the same `dist/plugin.zip`; they differ only in what the
Worker does. Combining them — state and verification in one Worker — is
copying the pieces you need from one into the other.

## Unit of registration

An organization registers **one Worker**. One deployment per organization, with
every feature implemented inside that single Worker — composing features is the
developer's responsibility in their own code.

## The distributed archive

`pnpm build` writes `dist/plugin.zip`. Artifacts sit at the root of the
archive — there is no `dist/` level inside it.

```
plugin.zip
├── worker.js           the bundled User Worker (ESM)
└── wrangler.jsonc      the Worker's configuration, used as-is on upload
```

The platform uploads the Worker with the `wrangler.jsonc` from the archive, so
what a developer writes there — `compatibility_date`, `durable_objects`,
`migrations`, `vars` — is what takes effect in production.

Some keys ship with the file but are ignored: `name`, `main`, `routes`,
`account_id`, and anything under `env.*`. The platform names the Worker, always
uploads `worker.js` as its entry point, and has no environments. Overrides you
would normally put under `env.production` do not apply — put the production
values at the top level.

`pnpm build` bundles with wrangler, the same bundler `pnpm dev` uses, so code
that runs locally builds the same way.

## Constraints

These apply to every backend plugin. The templates are deliberately small, so
meeting them is your code's job rather than something you inherit by copying
one.

### Cron Triggers do not work

Cron Triggers are not supported for User Workers in a dispatch namespace.
Adding `triggers.crons` to `wrangler.jsonc` **deploys successfully, emits no
warning, and simply never fires**
([workers-sdk#13840](https://github.com/cloudflare/workers-sdk/issues/13840)).

Scheduled work will instead arrive as a `POST /__scheduled` dispatched by the
platform's own Cron. That design is not settled yet.

### Keep state in Durable Objects

Keep state in Durable Objects. D1 is not available — the platform rejects
`d1_databases` at registration. Durable Objects give serialized access, strong
consistency, and a path to pushing updates over WebSocket later.

Start with one instance per class — ordinary tables and rows in one database —
and split into many instances only when you need isolation per owner or more
throughput than one instance gives. Splitting gives up queries across instances.
[`templates/simple-api-with-durable-objects`](./templates/simple-api-with-durable-objects)
explains when.

New Durable Object namespaces **must use the SQLite backend**: use
`new_sqlite_classes`, not `new_classes`.

Deleting a class (`deleted_classes`) destroys all of that class's data. **The
platform does not stop you**: the step is forwarded to Cloudflare as written,
and the data is gone once the upload succeeds. Treat classes as
**append-only**. To rename one, use `renamed_classes`, which carries the data
over — deleting and recreating it does not.

#### `migrations` is cumulative — append to it, never rewrite it

`migrations` ships in the archive, so the entries a developer writes are the
ones that run. The list is cumulative: Cloudflare records which tag a Worker is
at and applies only the tags above it. An entry that has already been applied
stays in the list forever.

So on a re-upload, a class that already exists **stays where it is**, under its
original tag. A new class gets a new tag appended beside it:

```jsonc
"migrations": [
  { "tag": "v1", "new_sqlite_classes": ["RoomState"] },  // untouched
  { "tag": "v2", "new_sqlite_classes": ["NoteState"] }   // appended
]
```

Editing or removing an applied entry is what breaks an upload. Dropping `v1`
here does not say "`RoomState` already exists" — it says the Worker's history no
longer matches what is deployed.

### Migrate the schema inside a Durable Object yourself

The platform provisions the Worker and its bindings and **does nothing to the
tables inside a Durable Object instance**.

Every instance keeps its own tables, so a schema change has to bring the
instances that already exist forward, from your own code. Keep the changes as
an append-only list of steps and record in the instance how far it has got.
[`templates/simple-api-with-durable-objects`](./templates/simple-api-with-durable-objects)
does exactly that; start from its `src/migrations.ts` rather than checking
columns one by one.

Two traps that only show up on instances that already hold data:

- `ALTER TABLE ... ADD COLUMN` rejects an expression default such as
  `DEFAULT (datetime('now'))` as soon as the table has rows. An empty dev
  instance accepts it, so it passes locally and fails in production. Add the
  column with a constant default and fill the existing rows with an `UPDATE`.
- A failed migration throws from the constructor on every request, so the
  instance answers 500 until you register a fixed archive. The platform keeps
  no copy of the previous one.

Migrations are forward-only. Do not drop columns; it loses data.

### Read tenant boundaries from the token

Values that define a tenant boundary, such as the room, **must be read from the
token**. Trusting a client-supplied path or query lets a caller reach another
room's data.
