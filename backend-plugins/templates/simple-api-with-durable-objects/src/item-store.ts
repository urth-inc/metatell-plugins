import { DurableObject } from 'cloudflare:workers'

import { ITEM_STORE_MIGRATIONS, migrate } from './migrations'

const COLUMNS = `id,
          body,
          created_at AS createdAt,
          updated_at AS updatedAt`

export type Item = {
  id: string
  body: string
  createdAt: string
  updatedAt: string
}

export class ItemStore extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    migrate(ctx.storage, ITEM_STORE_MIGRATIONS)
  }

  // created_at は秒精度で同じ秒の順が決まらないので、挿入順の rowid で並べる。
  listItems(limit: number): Item[] {
    return this.ctx.storage.sql
      .exec<Item>(
        `SELECT ${COLUMNS}
           FROM items
          ORDER BY rowid DESC
          LIMIT ?`,
        limit,
      )
      .toArray()
  }

  getItem(id: string): Item | null {
    const rows = this.ctx.storage.sql
      .exec<Item>(`SELECT ${COLUMNS} FROM items WHERE id = ?`, id)
      .toArray()

    return rows[0] ?? null
  }

  createItem(body: string): Item {
    return this.ctx.storage.sql
      .exec<Item>(
        `INSERT INTO items (id, body, updated_at)
         VALUES (?, ?, datetime('now'))
         RETURNING ${COLUMNS}`,
        crypto.randomUUID(),
        body,
      )
      .one()
  }

  updateItem(id: string, body: string): Item | null {
    const rows = this.ctx.storage.sql
      .exec<Item>(
        `UPDATE items
            SET body = ?, updated_at = datetime('now')
          WHERE id = ?
         RETURNING ${COLUMNS}`,
        body,
        id,
      )
      .toArray()

    return rows[0] ?? null
  }

  deleteItem(id: string): boolean {
    const rows = this.ctx.storage.sql
      .exec<{ id: string }>('DELETE FROM items WHERE id = ? RETURNING id', id)
      .toArray()

    return rows.length > 0
  }
}
