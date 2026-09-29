import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>()

app.get('/health', (ctx) => ctx.json({ ok: true }))

export default app
