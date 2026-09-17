# Backend plugin template

A starter project for a metatell backend plugin: a Cloudflare Worker that runs
as a User Worker in a Workers for Platforms dispatch namespace.

It is deliberately bare. It carries a health route, the TypeScript setup, and
the packaging pipeline — nothing else. Add your own routes, bindings, and state
on top.

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
| `src/index.ts` | The Hono app. One route today; add yours here. |
| `src/env.d.ts` | The `Env` bindings. Add new bindings here and in `wrangler.jsonc`. |
| `wrangler.jsonc` | The Worker's configuration. Ships in the archive — see below. |
| `scripts/build.js` | Bundles `worker.js`, ships `wrangler.jsonc`, and zips `dist/plugin.zip`. |

## Routes

| Method | Path | Reached at |
| --- | --- | --- |
| `GET` | `/healthz` | `https://metatell.app/admin/plugin-api/v1/organizations/{organizationId}/healthz` |

Routes are declared bare. This Worker has no hostname of its own: callers go
through the platform's dispatch route, and **the dispatcher strips
`/admin/plugin-api/v1/organizations/{organizationId}` before handing the request
over**. Declaring `/admin/plugin-api/v1/...` in a route matches nothing.

```bash
curl https://metatell.app/admin/plugin-api/v1/organizations/{organizationId}/healthz
# {"ok":true}
```

There is no authentication here. The dispatcher passes tokens through untouched,
so verifying them is the User Worker's job — see [`../README.md`](../README.md)
before you add a route that reads or writes anything.

## Adding a binding

1. Add it to `wrangler.jsonc`.
2. Add it to `Env` in `src/env.d.ts`.

`wrangler.jsonc` ships in the archive and the platform uploads the Worker with
it, so step 1 is what creates the binding in production — not just locally.
[`../README.md`](../README.md) covers what that means for Durable Objects, whose
`migrations` are cumulative and must be appended to rather than rewritten.

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

`pnpm build` writes `dist/plugin.zip`, holding the bundled `worker.js` and
`wrangler.jsonc`. That archive is the deliverable: register it with metatell and
the platform uploads the Worker into its dispatch namespace for you.

**You do not deploy this Worker yourself.** The dispatch namespace lives in the
platform's Cloudflare account, so `wrangler deploy` is not part of this
template's workflow — `wrangler` is here for `pnpm dev` only.

A registered Worker has no route of its own and cannot be called directly. It is
reached through the platform's dispatch route.

See [`../README.md`](../README.md) for the archive's contents and for the
constraints that apply to every backend plugin.
