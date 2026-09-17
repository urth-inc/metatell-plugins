# external-api-auth

A sample metatell plugin and backend for calling an external API with a plugin API token.

## What is this?

external-api-auth shows how a metatell plugin can obtain a plugin API token and send it to an external API with `Authorization: Bearer <token>`.

The backend sample verifies the JWT signature and claims before using the token subject.
The sample API is a simple per-user counter, so the backend does not expose the full JWT payload in its response.
The counter is in-memory and process-local; it is intentionally simple sample state, not persistent storage.

See the [metatell external API authentication documentation](https://docs.metatell.io/docs/developer-docs/plugins/external-api-auth/) for the full flow, token claim requirements, JWKS endpoint format, and security notes.

## Packages

- [external-api-auth-plugin](./packages/external-api-auth-plugin/README.md)
- [external-api-auth-backend](./packages/external-api-auth-backend/README.md)

## Configuration

The plugin package uses:

| Variable | Required | Description |
| --- | --- | --- |
| `METATELL_CLIENT_ID` | Yes | OIDC client ID registered for the external API. The plugin passes this value to `getPluginApiToken()` as the token audience. Use the same value on the backend. |
| `METATELL_EXTERNAL_API_BASE_URL` | No | Base URL for the backend sample. If unset, the plugin calls `http://localhost:3000`. Use HTTPS for deployed backends; loopback HTTP is accepted for local development. |

For local builds, copy `packages/external-api-auth-plugin/.env.example` to `packages/external-api-auth-plugin/.env` before running the plugin build.
The plugin build injects these values into the browser bundle and fails fast if `METATELL_CLIENT_ID` is missing.

The backend package uses:

| Variable | Required | Description |
| --- | --- | --- |
| `METATELL_CLIENT_ID` | Yes | Expected JWT audience. This must match the client ID used by the plugin. |
| `METATELL_ISSUER` | Yes | Issuer URL for the metatell organization realm. This must match the token `iss` claim exactly. Do not include `/protocol/openid-connect/certs`. |
| `METATELL_CORS_ORIGINS` | No | Allowed browser origins for CORS. Use `*` for local sample testing, or a comma-separated list such as `https://your-metatell-origin.example.com` for deployed backends. |
| `PORT` | No | HTTP port for the backend server. Defaults to `3000`. |

The backend verifies `iss` against `METATELL_ISSUER`.
It derives the separate JWKS URL as `${METATELL_ISSUER}/protocol/openid-connect/certs`.

## How to use

1. Register the external API as an OIDC client for the target metatell organization.
2. Set the same client ID in the plugin and backend.
3. Deploy the backend sample or adapt its JWT verification code to your API.
4. Configure the plugin with the backend URL.
5. Build `external-api-auth-plugin` and register its `dist/plugin.zip` in metatell.
6. Apply the `CustomOverlay` plugin to a room and call the counter API from the overlay.

## Commands

Run commands from this directory.

```bash
pnpm install
pnpm -r build
pnpm -r typecheck
pnpm test
```
