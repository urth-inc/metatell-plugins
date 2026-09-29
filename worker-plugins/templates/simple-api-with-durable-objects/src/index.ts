import { Hono } from 'hono'

export { CounterStore } from './counter-store'
export { ItemStore } from './item-store'

const ITEMS_PAGE_SIZE = 50
const COUNTERS_PAGE_SIZE = 50
const BODY_MAX_LENGTH = 1000
const COUNTER_NAME = /^[A-Za-z0-9_-]{1,64}$/

const app = new Hono<{ Bindings: Env }>()

const getItemStore = (env: Env) =>
  env.ITEM_STORE.get(env.ITEM_STORE.idFromName('items'))

const getCounterStore = (env: Env) =>
  env.COUNTER_STORE.get(env.COUNTER_STORE.idFromName('counters'))

const readBody = async (request: Request): Promise<string | Error> => {
  const payload = await request
    .json<{ body?: unknown }>()
    .catch(() => null)

  const body = payload?.body
  if (typeof body !== 'string' || body.trim() === '') {
    return new Error('body is required')
  }
  if (body.length > BODY_MAX_LENGTH) {
    return new Error(`body must not exceed ${BODY_MAX_LENGTH} characters`)
  }

  return body
}

app.get('/items', async (ctx) => {
  const items = await getItemStore(ctx.env).listItems(ITEMS_PAGE_SIZE)
  return ctx.json({ items })
})

app.post('/items', async (ctx) => {
  const body = await readBody(ctx.req.raw)
  if (body instanceof Error) {
    return ctx.json({ message: body.message }, 400)
  }

  const item = await getItemStore(ctx.env).createItem(body)
  return ctx.json({ item }, 201)
})

app.get('/items/:id', async (ctx) => {
  const item = await getItemStore(ctx.env).getItem(ctx.req.param('id'))
  if (!item) {
    return ctx.json({ message: 'not found' }, 404)
  }

  return ctx.json({ item })
})

app.put('/items/:id', async (ctx) => {
  const body = await readBody(ctx.req.raw)
  if (body instanceof Error) {
    return ctx.json({ message: body.message }, 400)
  }

  const item = await getItemStore(ctx.env).updateItem(ctx.req.param('id'), body)
  if (!item) {
    return ctx.json({ message: 'not found' }, 404)
  }

  return ctx.json({ item })
})

app.delete('/items/:id', async (ctx) => {
  const deleted = await getItemStore(ctx.env).deleteItem(ctx.req.param('id'))
  if (!deleted) {
    return ctx.json({ message: 'not found' }, 404)
  }

  return ctx.body(null, 204)
})

app.get('/counters', async (ctx) => {
  const counters = await getCounterStore(ctx.env).list(COUNTERS_PAGE_SIZE)
  return ctx.json({ counters })
})

app.get('/counters/:name', async (ctx) => {
  const name = ctx.req.param('name')
  if (!COUNTER_NAME.test(name)) {
    return ctx.json({ message: 'invalid counter name' }, 400)
  }

  const value = await getCounterStore(ctx.env).get(name)
  return ctx.json({ name, value })
})

app.post('/counters/:name/increment', async (ctx) => {
  const name = ctx.req.param('name')
  if (!COUNTER_NAME.test(name)) {
    return ctx.json({ message: 'invalid counter name' }, 400)
  }

  const value = await getCounterStore(ctx.env).increment(name)
  return ctx.json({ name, value })
})

app.get('/health', async (ctx) => {
  const items = await getItemStore(ctx.env).listItems(1)

  return ctx.json({ ok: true, durableObject: 'ok', items: items.length })
})

export default app
