# Backend plugin template

A starter project for a metatell backend plugin: a Cloudflare Worker that runs
as a User Worker in a Workers for Platforms dispatch namespace.

It is deliberately small. It carries the parts every backend plugin needs —
token verification, per-room state in a Durable Object, schema migration, and
the packaging pipeline — and nothing that belongs to a particular feature.
Rename `RoomState` and `items` and build your own feature on top.

There is one template, not one per feature, because an organization registers
one Worker. Every feature goes inside it, so this is the starting point for that
Worker.

## Start from this template

```bash
git clone git@github.com:urth-inc/metatell-plugins.git
cp -R metatell-plugins/backend-plugins/template /path/to/your/plugin
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
| `src/index.ts` | The Hono app: routes, the authentication middleware, and `/healthz`. |
| `src/auth.ts` | Verifies the plugin API token against JWKS and resolves the caller. |
| `src/room-state.ts` | The Durable Object holding per-room state, with `migrate()`. |
| `src/env.d.ts` | The `Env` bindings. Add new bindings here and in `wrangler.jsonc`. |
| `scripts/build.js` | Bundles `worker.js`, writes `metadata.json`, and zips `dist/plugin.zip`. |

## Routes

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/healthz` | none | Checks that dispatch works and the Durable Object starts. |
| `GET` | `/items` | required | Lists items in the caller's room. |
| `POST` | `/items` | required | Adds an item to the caller's room. |

The room is read from the token's `hub_sid` claim, never from the path or the
query. See [`src/auth.ts`](./src/auth.ts) — keeping tenant boundaries on the
token is what stops one room from reading another's data.

## Adding a Durable Object class

1. Add the class and export it from `src/index.ts`.
2. Add the binding to `wrangler.jsonc` under `durable_objects.bindings`, and add
   a `migrations` entry using `new_sqlite_classes`.
3. Add the binding to `Env` in `src/env.d.ts`.
4. Add `{ className, bindingName }` to `durableObjects` in `scripts/build.js`.

Step 4 is easy to miss: `worker.js` is bundled, so the platform cannot find the
class without the declaration in `metadata.json`.

Classes are append-only. Deleting or renaming one destroys its data.

## Commands

This template uses pnpm. The version is pinned in `packageManager`, so Corepack
picks it up.

```bash
pnpm install
pnpm dev        # wrangler dev
pnpm lint:tsc   # typecheck
pnpm build      # writes dist/plugin.zip
```

`pnpm dev` runs the Worker locally in workerd. It needs no Cloudflare
credentials — only `wrangler deploy` and `--remote` do, and neither is part of
this workflow.

pnpm blocks dependency build scripts by default, so `esbuild` and `workerd` are
allowed explicitly under `pnpm.onlyBuiltDependencies` in `package.json`. Both
download a platform binary in `postinstall`; without that, `pnpm build` and
`pnpm dev` fail.

## Ship it

`pnpm build` writes `dist/plugin.zip`. That archive is the deliverable:
register it with metatell and the platform uploads the Worker into its dispatch
namespace for you.

**You do not deploy this Worker yourself.** The dispatch namespace lives in the
platform's Cloudflare account, so `wrangler deploy` is not part of this
template's workflow — `wrangler` is here for `pnpm dev` only.

A registered Worker has no route of its own and cannot be called directly. It is
reached through the platform's dispatch route.

See [`../README.md`](../README.md) for the archive's contents and for the
constraints that apply to every backend plugin.
