import { DurableObject } from 'cloudflare:workers'

import { COUNTER_STORE_MIGRATIONS, migrate } from './migrations'

export type Counter = {
  name: string
  value: number
}

export class CounterStore extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    migrate(ctx.storage, COUNTER_STORE_MIGRATIONS)
  }

  list(limit: number): Counter[] {
    return this.ctx.storage.sql
      .exec<Counter>(
        'SELECT name, value FROM counters ORDER BY name LIMIT ?',
        limit,
      )
      .toArray()
  }

  get(name: string): number {
    const rows = this.ctx.storage.sql
      .exec<{ value: number }>('SELECT value FROM counters WHERE name = ?', name)
      .toArray()

    return rows[0]?.value ?? 0
  }

  // 読んでから書く操作は 1 つのメソッドにまとめる。Worker から get と
  // 書き込みを別々に呼ぶと、その間に別のリクエストが割り込む。
  increment(name: string): number {
    return this.ctx.storage.sql
      .exec<{ value: number }>(
        `INSERT INTO counters (name, value) VALUES (?, 1)
         ON CONFLICT (name) DO UPDATE SET value = value + 1
         RETURNING value`,
        name,
      )
      .one().value
  }
}
