import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>()

app.get('/healthz', (ctx) => ctx.json({ ok: true }))

export default app
