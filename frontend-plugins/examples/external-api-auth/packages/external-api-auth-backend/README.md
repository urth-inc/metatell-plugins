# external-api-auth-backend

External API backend sample for verifying metatell plugin API tokens.

## Role

This package exposes a Hono API with `GET /api/metatell/counter`. The handler reads `Authorization: Bearer <token>`, verifies the token, then increments an in-memory counter for the verified token subject.

Only claims returned after successful signature verification are trusted.
The counter is process-local sample state and is not persistent.

## Verification

The backend uses Hono for routing and `jose` with `createRemoteJWKSet` and `jwtVerify` for token verification.

It verifies:

- RS256 signature
- issuer: `METATELL_ISSUER`
- audience: `METATELL_CLIENT_ID`
- expiration (`exp`)
- `sub` is a UUID v4 string and no longer than 36 characters

`METATELL_ISSUER` must be the issuer value itself and must match the token `iss` claim exactly.
Do not include `/protocol/openid-connect/certs` in `METATELL_ISSUER`.
The JWKS URL is derived separately from the normalized issuer:

`${METATELL_ISSUER}/protocol/openid-connect/certs`

## Configuration

Set these values in your runtime environment. No default issuer or client ID is provided.
For local development, copy `.env.example` to `.env` in this package directory; the backend loads it automatically at startup.

| Variable | Required | Description |
| --- | --- | --- |
| `METATELL_CLIENT_ID` | Yes | Expected JWT audience. This must match the client ID used by the plugin when it calls `getPluginApiToken()`. |
| `METATELL_ISSUER` | Yes | Issuer URL for the metatell organization realm. This must match the token `iss` claim exactly. Do not include `/protocol/openid-connect/certs`. |
| `METATELL_CORS_ORIGINS` | No | Allowed browser origins for CORS. Use `*` for local sample testing, or a comma-separated list for deployed backends. |
| `PORT` | No | HTTP port for the backend server. Defaults to `3000`. |

```bash
METATELL_CLIENT_ID=your-client-id
METATELL_ISSUER=https://your-issuer.example.com/realms/your-organization-id
METATELL_CORS_ORIGINS=*
PORT=3000
```

`METATELL_CORS_ORIGINS` accepts `*` or a comma-separated list of origins.
Use `*` for local sample testing; restrict it to your metatell origin for deployed backends.

## Commands

```bash
pnpm install
pnpm --filter @urth/external-api-auth-backend-sample build
pnpm --filter @urth/external-api-auth-backend-sample typecheck
pnpm --filter @urth/external-api-auth-backend-sample test
pnpm --filter @urth/external-api-auth-backend-sample start
```
