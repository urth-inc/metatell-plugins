import type { BoardRoom } from './board-room'

declare global {
  // 足せるのは Durable Object のバインディングだけ（ほかは登録で断られる）。
  interface Env {
    BOARD_ROOM: DurableObjectNamespace<BoardRoom>
  }
}

export {}
