import { Hono } from 'hono'

import { BOARD_PATTERN } from './protocol'

export { BoardRoom } from './board-room'

const app = new Hono<{ Bindings: Env }>()

// ボードごとに 1 インスタンス。ハンドシェイクは RPC では返せないので、Durable Object の fetch に渡す。
// ブラウザの WebSocket は /api/ の下につなぐ（静的ファイルより先に Worker が受けるのは /api/* だけ）。
app.get('/api/boards/:board/ws', async (ctx) => {
  const board = ctx.req.param('board')
  if (!BOARD_PATTERN.test(board)) return ctx.json({ message: 'invalid board name' }, 400)
  if (ctx.req.header('Upgrade') !== 'websocket') {
    return ctx.json({ message: 'expected a WebSocket upgrade' }, 426)
  }
  const room = ctx.env.BOARD_ROOM.get(ctx.env.BOARD_ROOM.idFromName(board))
  const response = await room.fetch(ctx.req.raw)
  return response
})

export default app
