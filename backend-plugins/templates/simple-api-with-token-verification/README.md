# Simple API with token verification

A starter project for a metatell backend plugin that authenticates its callers:
a Cloudflare Worker verifying the access token against JWKS before it does
anything.

Start here when a route reads or writes something that belongs to a caller. If
nothing needs a caller's identity, start from [`../minimal`](../minimal)
instead.

## Why this is the plugin's job

The token arrives untouched — nothing upstream has checked it. A route that
skips verification is open to anyone who can reach the dispatch route, and the
caller's identity is whatever they claim. This template does three things:

1. Verifies the signature against the JWKS at `PLUGIN_TOKEN_JWKS_URL`.
2. Checks `iss`. Signature alone is not enough — a token another identity
   provider signed would otherwise pass.
3. Takes the caller's identity from the `sub` claim, not from the request
   body. `/me` answers with it, so you can see what the Worker read.

## Start from this template

```bash
git clone git@github.com:urth-inc/metatell-plugins.git
cp -R metatell-plugins/backend-plugins/templates/simple-api-with-token-verification \
  /path/to/your/plugin
cd /path/to/your/plugin
git init
git add .
git commit -m "Initial commit"
```

Set the package `name`, `version`, and `description`, and the `name` in
`wrangler.jsonc`.

## Where the verification settings come from

The platform provides them. Read them off `env` — do not declare them in
`wrangler.jsonc`:

| Var | Contents |
| --- | --- |
| `PLUGIN_TOKEN_ISSUER` | Expected `iss`. Rejected if it does not match. |
| `PLUGIN_TOKEN_JWKS_URL` | Where the signing keys are published. |

They are typed in `src/env.d.ts`, so a missing one is a type error rather than
`undefined` at runtime.

## Files

| Path | Contents |
| --- | --- |
| `src/auth.ts` | The verification. JWKS caching, the `iss` check, `sub`. |
| `src/middleware/authenticated.ts` | The middleware that guards a route, and the app's type. |
| `src/index.ts` | The Hono app. The routes. |
| `src/env.d.ts` | The `Env` bindings, including the two the platform provides. Only Durable Object bindings can be added. |
| `wrangler.jsonc` | The Worker's configuration. Ships in the archive — see above. |
| `scripts/build.js` | Bundles `worker.js` with wrangler, ships `wrangler.jsonc`, and zips `dist/plugin.zip`. |

## Routes

| Method | Path | Auth | Result |
| --- | --- | --- | --- |
| `GET` | `/me` | Required | The `sub` claim the Worker verified |
| `GET` | `/health` | None | Reachability |

```bash
curl http://localhost:8787/me -H "authorization: Bearer $TOKEN"   # pnpm dev
# {"sub":"...","issuer":"https://..."}
```

Failures answer 401 with a reason: `missing bearer token`, `invalid token`
(signature, `iss`, expiry, or no `exp` at all), or `token has no sub`.

When the token cannot be judged at all, the answer is **503** `token
verification unavailable` instead: the JWKS is unreachable, times out, or
returns something that is not a key set. A 401 tells the client its credentials
are bad and usually sends the user back to sign in; this failure is on the
server side and passes on retry.

A token whose key is not in the JWKS is one or the other, depending on timing.
jose does not refetch the JWKS within 30 seconds of the previous fetch, so right
after the identity provider rotates its signing key, a valid token signed with
the new key cannot be checked yet — that is a 503. Once jose could refetch and
the key is still missing, the key is not one the issuer publishes — retired,
from another realm, or forged — and that is a 401.

## Guarding your own routes

The middleware is opt-in per route, so a new route is unprotected until you say
otherwise:

```ts
import { authenticated } from './middleware/authenticated'

app.use('/items/*', authenticated)

app.get('/items', (ctx) => {
  const { sub, claims } = ctx.get('identity')
  ...
})
```

`claims` is the verified payload. Values that decide what the caller may reach
belong there rather than in a path or query the caller controls.

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

Locally, nothing provides the two vars above, and verification reaches out to
`PLUGIN_TOKEN_JWKS_URL` for real. Supply them for the run instead of committing
them:

```bash
pnpm dev --var PLUGIN_TOKEN_ISSUER:... --var PLUGIN_TOKEN_JWKS_URL:...
```

`.dev.vars` works too, and is already gitignored.

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
