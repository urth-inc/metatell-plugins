# Simple API with a React frontend

A starter project for a metatell worker plugin that has its own page: a
Cloudflare Worker that serves a React app built with Vite, and the API that app
calls, from the same origin.

The app is a to-do list: add an item, delete it. The items are kept in a
Durable Object, so they survive reloads and are shared by everyone who opens
the page.

## Start from this template

```bash
git clone git@github.com:urth-inc/metatell-plugins.git
cp -R metatell-plugins/worker-plugins/templates/simple-api-with-react-frontend \
  /path/to/your/plugin
cd /path/to/your/plugin
git init
git add .
git commit -m "Initial commit"
```

Set the `name`, `version`, and `description` in `package.json`, and the `name`
in `worker/wrangler.jsonc`.

## Layout

The page and the Worker are separate packages in one pnpm workspace, so each
declares only what it needs.

| Path | Contents |
| --- | --- |
| `frontend/index.html` | Sets `<base>` to the app's root. |
| `frontend/src/main.tsx` | Shows the app at its root, and "not found" elsewhere. |
| `frontend/src/App.tsx` | The page. |
| `frontend/src/api.ts` | The API client. Calls `./api/...`, relative to the root. |
| `frontend/vite.config.ts` | Relative `base`, and `static/` for built files. |
| `worker/src/index.ts` | The API routes. |
| `worker/src/todo-store.ts` | `TodoStore`, the Durable Object holding the items. |
| `worker/src/todo.ts` | The `Todo` type, shared with the frontend. |
| `worker/wrangler.jsonc` | The Worker's configuration, including `assets`. |
| `scripts/build.js` | Builds both and assembles `dist/plugin.zip`. |

## How the page ships

`pnpm build` writes `dist/plugin.zip`:

```
plugin.zip
├── worker.js           the bundled Worker
├── wrangler.jsonc      its configuration
└── assets/             the built page, served as Workers Static Assets
    ├── index.html
    └── static/
```

A request that matches a file under `assets/` is answered with that file and
does not run the Worker. Everything under `/api/` runs the Worker first. Any
other path gets `index.html`.

The platform decides the `assets` settings for every plugin, so treat them as
fixed:

| Setting | Why |
| --- | --- |
| `html_handling: "none"` | The built-in redirects answer with a path that has already lost `/ext/{organizationId}`, and would send the browser outside the plugin. |
| `not_found_handling: "single-page-application"` | `/` and any path that is not a file get `index.html`. |
| `run_worker_first: ["/api/*"]` | API routes reach the Worker. Keep every API route under `/api/`. |

A single file may be up to 25 MiB; the build checks it.

## URLs

The page is served at `https://metatell-<env>.app/ext/{organizationId}/`. The
prefix is stripped before the request reaches the Worker, so neither the build
nor the Worker knows the public URL. Everything therefore uses relative paths,
resolved against the app's root:

- `index.html` works out the root from the path it was opened at —
  `/ext/{organizationId}/`, or `/` locally — and sets it as `<base>`.
- Vite builds with `base: './'`, so the page loads `./static/...`.
- The app calls its API as `fetch('./api/...')`.

The page therefore loads at any path. At its root it shows the app; anywhere
else it shows "ページが見つかりません" with a link back. This is a soft 404: the
status is 200, because the Worker does not run for these paths. To add pages,
route on the path below the root, for example with a router's `basename`.

## Storage is shared

The page runs on the same origin as metatell and as every other organization's
plugin. Anything it keeps in `localStorage`, `sessionStorage`, IndexedDB, or
cookies can be read by them, and theirs by yours. **Do not keep secrets or
personal data there.** Keep state on the server, and if you must use browser
storage, prefix every key with your organization ID.

## Routes

| Method | Path | Result |
| --- | --- | --- |
| `GET` | `/` | The app |
| `GET` | `/api/todos` | All items |
| `POST` | `/api/todos` | Adds one from `{"text"}` (up to 200 characters) |
| `DELETE` | `/api/todos/:id` | 204, or 404 |
| `GET` | Any other path | "ページが見つかりません", with status 200 |

Anyone who can reach the URL can edit the list. To check the caller, see
[`../simple-api-with-token-verification`](../simple-api-with-token-verification).
To change the table later, use the append-only schema steps of
[`../simple-api-with-durable-objects`](../simple-api-with-durable-objects)
instead of `CREATE TABLE IF NOT EXISTS`.

## Commands

This template uses pnpm. The version is pinned in `packageManager`, so Corepack
picks it up. Run these at the root:

```bash
pnpm install
pnpm dev            # wrangler dev on :8787, rebuilding the page as you edit
pnpm lint:tsc       # typecheck both packages
pnpm build          # writes dist/plugin.zip
```

`pnpm dev` builds the page with `vite build --watch` and serves it with
`wrangler dev` the way the platform will. After an edit, reload the browser to
see the change. It needs no Cloudflare credentials.

`esbuild` and `workerd` are allowed to run their install scripts under
`pnpm.onlyBuiltDependencies` in `package.json`; without that, `pnpm build` and
`pnpm dev` fail.

## Ship it

Register `dist/plugin.zip` with metatell and the platform uploads the Worker
and its assets for you. You do not deploy this Worker yourself.

See [`../../README.md`](../../README.md) for the constraints that apply to
every worker plugin.
