import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'

import { UnauthorizedError, authenticate } from './auth'
import type { PluginIdentity } from './auth'

export { RoomState } from './room-state'

const ITEMS_PAGE_SIZE = 50
const VALUE_MAX_LENGTH = 1000

type Bindings = Env
type Variables = { identity: PluginIdentity }

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const authenticated: MiddlewareHandler<{
  Bindings: Bindings
  Variables: Variables
}> = async (ctx, next) => {
  try {
    ctx.set('identity', await authenticate(ctx.req.raw, ctx.env))
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return ctx.json({ message: error.message }, 401)
    }
    throw error
  }
  await next()
}

app.use('/items/*', authenticated)
app.use('/items', authenticated)

/** 在室中のルームの状態を引く。roomId はトークン由来なので指定できない。 */
const getRoomState = (ctx: {
  env: Env
  get: (key: 'identity') => PluginIdentity
}) => {
  const { roomId } = ctx.get('identity')
  return ctx.env.ROOM_STATE.get(ctx.env.ROOM_STATE.idFromName(roomId))
}

app.get('/items', async (ctx) => {
  const items = await getRoomState(ctx).listItems(ITEMS_PAGE_SIZE)
  return ctx.json({ items })
})

app.post('/items', async (ctx) => {
  const { userId } = ctx.get('identity')

  const payload = await ctx.req.json<{ value?: unknown }>().catch(() => null)

  const value = payload?.value
  if (typeof value !== 'string' || value.trim() === '') {
    return ctx.json({ message: 'value is required' }, 400)
  }
  if (value.length > VALUE_MAX_LENGTH) {
    return ctx.json({ message: `value must not exceed ${VALUE_MAX_LENGTH}` }, 400)
  }

  const item = await getRoomState(ctx).createItem(userId, value)

  return ctx.json({ item }, 201)
})

/**
 * 疎通確認用。dispatch 経路が張れているかをトークン無しで確かめる。
 * Durable Object が実際に起動して SQLite を読めることも併せて確認する。
 */
app.get('/healthz', async (ctx) => {
  const room = ctx.env.ROOM_STATE.get(
    ctx.env.ROOM_STATE.idFromName('__healthz'),
  )
  const items = await room.listItems(1)

  return ctx.json({ ok: true, durableObject: 'ok', items: items.length })
})

export default app
