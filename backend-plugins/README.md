# Backend plugins

This directory contains metatell plugins that run on the server as Cloudflare
Workers, deployed into a Workers for Platforms dispatch namespace. A request
reaches them through the platform dispatcher, not through a route of their own.

- [`templates`](./templates) holds the starter projects to copy.
  [`minimal`](./templates/minimal) is the bare one: a health route, the
  TypeScript setup, and the packaging pipeline.

Backend plugins share nothing with the frontend plugins under
[`../frontend-plugins`](../frontend-plugins) except the word "plugin". Those are
Module Federation remotes loaded by the browser at runtime; these are bundled
Workers. The build output, the deployment target, and the registration API
(`/client/api/v1/backend-plugins` rather than `/client/api/v1/plugins`) are all
different. Do not copy a build pipeline from one side to the other.

> **Status:** backend plugin support is under development. The package format
> and the registration flow described here are provisional and may change.

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
`migrations`, `vars` — is what takes effect in production. It is not a
local-development-only file.

`src/` is not in the archive, so `main` is rewritten to `worker.js` when the
archive is assembled. Everything else ships verbatim, comments included.

## Constraints

These apply to every backend plugin. The `minimal` template is deliberately
bare — it has a health route and nothing else — so meeting them is your code's
job, not something you inherit by copying it.

### Cron Triggers do not work

Cron Triggers are not supported for User Workers in a dispatch namespace.
Adding `triggers.crons` to `wrangler.jsonc` **deploys successfully, emits no
warning, and simply never fires**
([workers-sdk#13840](https://github.com/cloudflare/workers-sdk/issues/13840)).

Scheduled work will instead arrive as a `POST /__scheduled` dispatched by the
platform's own Cron. That design is not settled yet.

### Keep state in Durable Objects

Keep state in a per-room Durable Object rather than D1. Durable Objects give
serialized access, strong consistency, and a path to pushing updates over
WebSocket later.

New Durable Object namespaces **must use the SQLite backend**: use
`new_sqlite_classes`, not `new_classes`.

Deleting a class (`deleted_classes`) or renaming one destroys that class's data.
The platform is expected to reject both, so treat classes as **append-only**.

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

`CREATE TABLE IF NOT EXISTS` does not add columns to an instance that already
exists. After adding a column, check with `PRAGMA table_info` and `ALTER TABLE`
in the object's own constructor or an explicit `migrate()`. Skipping this
returns a 500 with `no such column`.

As with D1, migrations are forward-only. Do not drop columns; it loses data.

### Read tenant boundaries from the token

Values that define a tenant boundary, such as the room, **must be read from the
token**. Trusting a client-supplied path or query lets a caller reach another
room's data.
