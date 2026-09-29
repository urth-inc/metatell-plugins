import { DurableObject } from 'cloudflare:workers'

import type { Todo } from './todo'

const COLUMNS = 'id, text, created_at AS createdAt'

export class TodoStore extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    // AUTOINCREMENT なので id は追加順に増え、消した id は使い回されない。
    ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS todos (
         id         INTEGER PRIMARY KEY AUTOINCREMENT,
         text       TEXT NOT NULL,
         created_at TEXT NOT NULL DEFAULT (datetime('now'))
       )`,
    )
  }

  list(): Todo[] {
    return this.ctx.storage.sql
      .exec<Todo>(`SELECT ${COLUMNS} FROM todos ORDER BY id`)
      .toArray()
  }

  add(text: string): Todo {
    return this.ctx.storage.sql
      .exec<Todo>(`INSERT INTO todos (text) VALUES (?) RETURNING ${COLUMNS}`, text)
      .one()
  }

  delete(id: number): boolean {
    return (
      this.ctx.storage.sql
        .exec('DELETE FROM todos WHERE id = ? RETURNING id', id)
        .toArray().length > 0
    )
  }
}
