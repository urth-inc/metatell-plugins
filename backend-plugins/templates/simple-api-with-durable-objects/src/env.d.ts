import type { CounterStore } from './counter-store'
import type { ItemStore } from './item-store'

declare global {
  // 足せるのは Durable Object のバインディングだけ（ほかは登録で断られる）。
  interface Env {
    ITEM_STORE: DurableObjectNamespace<ItemStore>
    COUNTER_STORE: DurableObjectNamespace<CounterStore>
  }
}

export {}
