# Backend plugins

This directory contains metatell plugins that run on the server as Cloudflare
Workers, deployed into a Workers for Platforms dispatch namespace. A request
reaches them through the platform dispatcher, not through a route of their own.

- [`template`](./template) is the starter project to copy. There is one,
  because an organization registers one Worker.

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
├── metadata.json       plugin metadata
├── worker.js           the bundled User Worker (ESM)
└── pnpm-lock.yaml      for auditing: dependencies and versions are recorded at registration
```

```json
{
  "name": "backend-plugin-template",
  "version": "0.1.0",
  "description": "...",
  "type": "Backend",
  "versionId": "app_<uuid>",
  "durableObjects": [{ "className": "RoomState", "bindingName": "ROOM_STATE" }]
}
```

`worker.js` is already bundled, so **the platform cannot statically determine
which exports are Durable Object classes**. Declare them in `durableObjects`.

## Constraints

These apply to every backend plugin, and the template already accounts for them.

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

### Migrate the schema inside a Durable Object yourself

The platform provisions the Worker and its bindings and **does nothing to the
tables inside a Durable Object instance**.

`CREATE TABLE IF NOT EXISTS` does not add columns to an instance that already
exists. After adding a column, check with `PRAGMA table_info` and `ALTER TABLE`
(see `migrate()` in
[`template/src/room-state.ts`](./template/src/room-state.ts)).
Skipping this returns a 500 with `no such column`.

As with D1, migrations are forward-only. Do not drop columns; it loses data.

### Verifying tokens is the User Worker's job

The dispatcher passes tokens through untouched. The User Worker verifies them
against JWKS itself and authorizes on the token's claims. See
[`template/src/auth.ts`](./template/src/auth.ts).

Values that define a tenant boundary, such as the room, **must be read from the
token**. Trusting a client-supplied path or query lets a caller reach another
room's data.
