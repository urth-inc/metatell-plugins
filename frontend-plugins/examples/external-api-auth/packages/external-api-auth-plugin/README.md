# external-api-auth-plugin

metatell `CustomOverlay` sample for calling an external API with a plugin API token.

## Role

This package builds a metatell Module Federation plugin with webpack.
It exposes `CustomOverlay`, obtains a plugin API token with `getPluginApiToken(config.clientId)` from `@urth/metatell-sdk/auth`, then calls the backend counter sample with `Authorization: Bearer <token>`.

It does not contain backend credentials or signing secrets.
The token flow only works when the plugin is loaded inside a metatell room whose client supports the plugin auth bridge.
Running the plugin standalone with webpack dev server or `index.html` cannot produce a plugin API token.

See the [metatell plugin getting started guide](https://docs.metatell.io/docs/developer-docs/plugins/getting-started/) for the plugin format and registration flow.
See the [external API authentication guide](https://docs.metatell.io/docs/developer-docs/plugins/external-api-auth/) for the token flow.

## Module Federation compatibility

The metatell client loads room plugins from `mf-manifest.json` with `@module-federation/runtime`.
This package pins `@module-federation/enhanced` to the same `2.0.1` generation used by `v-air_client`.

The webpack config emits `remoteEntry.js` and `mf-manifest.json`, and keeps `publicPath` as `auto` so uploaded plugin assets resolve from the plugin directory.

## Configuration

For local builds, copy `.env.example` to `.env` in this package directory before building.
No default client ID is provided.
The backend URL defaults to `http://localhost:3000` for local development.

| Variable | Required | Description |
| --- | --- | --- |
| `METATELL_CLIENT_ID` | Yes | OIDC client ID registered for the external API. The plugin passes this value to `getPluginApiToken()` as the requested token audience. It must match the backend `METATELL_CLIENT_ID`. |
| `METATELL_EXTERNAL_API_BASE_URL` | No | Base URL for the backend sample. Defaults to `http://localhost:3000`. Use HTTPS for deployed backends; loopback HTTP is accepted for local development. |

The webpack build injects these values into the plugin bundle.
You can also override them at runtime before the overlay calls the external API:

```ts
globalThis.__METATELL_EXTERNAL_API_AUTH_PLUGIN_CONFIG__ = {
  clientId: "your-client-id",
  externalApiBaseUrl: "http://localhost:3000"
};
```

With the default local backend URL, the overlay calls `http://localhost:3000/api/metatell/counter`.

## Build

Run commands from `external-api-auth`.

```bash
pnpm install
pnpm --filter @urth/external-api-auth-plugin-sample build
```

The build writes `dist/plugin.zip`.
Register that zip in the metatell admin plugin registration screen.

The generated `metadata.json` uses:

```json
{
  "name": "External API Auth",
  "type": "CustomOverlay"
}
```

## Development

```bash
pnpm --filter @urth/external-api-auth-plugin-sample dev
pnpm --filter @urth/external-api-auth-plugin-sample typecheck
```
