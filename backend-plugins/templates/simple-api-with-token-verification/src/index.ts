import { Hono } from 'hono'

import { authenticated } from './middleware/authenticated'
import type { AppEnv } from './middleware/authenticated'

const app = new Hono<AppEnv>()

app.use('/me', authenticated)

app.get('/me', (ctx) => {
  const { sub, claims } = ctx.get('identity')

  return ctx.json({ sub, issuer: claims.iss })
})

app.get('/health', (ctx) => ctx.json({ ok: true }))

export default app
