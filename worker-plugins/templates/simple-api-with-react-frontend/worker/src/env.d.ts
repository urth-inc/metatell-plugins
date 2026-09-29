import type { TodoStore } from './todo-store'

declare global {
  // 足せるのは Durable Object のバインディングだけ（ほかは登録で断られる）。
  interface Env {
    TODO_STORE: DurableObjectNamespace<TodoStore>
  }
}

export {}
