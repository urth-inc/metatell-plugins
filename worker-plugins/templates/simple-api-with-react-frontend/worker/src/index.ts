import { Hono } from 'hono'

export { TodoStore } from './todo-store'

const TEXT_MAX_LENGTH = 200

const app = new Hono<{ Bindings: Env }>()

const getTodoStore = (env: Env) =>
  env.TODO_STORE.get(env.TODO_STORE.idFromName('todos'))

app.get('/api/todos', async (ctx) => {
  const todos = await getTodoStore(ctx.env).list()
  return ctx.json({ todos })
})

app.post('/api/todos', async (ctx) => {
  const payload = await ctx.req
    .json<{ text?: unknown }>()
    .catch(() => null)

  const text = typeof payload?.text === 'string' ? payload.text.trim() : ''
  if (text === '') return ctx.json({ message: 'text is required' }, 400)
  if (text.length > TEXT_MAX_LENGTH) {
    return ctx.json(
      { message: `text must not exceed ${TEXT_MAX_LENGTH} characters` },
      400,
    )
  }

  const todo = await getTodoStore(ctx.env).add(text)
  return ctx.json({ todo }, 201)
})

app.delete('/api/todos/:id{[0-9]+}', async (ctx) => {
  const deleted = await getTodoStore(ctx.env).delete(
    Number(ctx.req.param('id')),
  )
  if (!deleted) return ctx.json({ message: 'not found' }, 404)
  return ctx.body(null, 204)
})

export default app
