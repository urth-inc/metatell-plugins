import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>()

/**
 * ルートは接頭辞を含めずに書く。ディスパッチャが
 * /admin/plugin-api/v1/organizations/{organizationId} を剥がしてから渡すため、
 * この /healthz は外からは下記で叩く。
 *
 *   https://metatell.app/admin/plugin-api/v1/organizations/{organizationId}/healthz
 */
app.get('/healthz', (ctx) => ctx.json({ ok: true }))

export default app
