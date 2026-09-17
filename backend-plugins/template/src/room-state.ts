import { DurableObject } from 'cloudflare:workers'

const CREATE_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS items (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    value      TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

export type Item = {
  id: string
  userId: string
  value: string
  createdAt: string
}

/**
 * 1 ルームにつき 1 インスタンス。プラグインの状態はここに閉じる。
 *
 * インスタンスは idFromName(roomId) で引く。この Worker 自体が組織ごとに
 * 分かれているため、キーにルーム ID だけを使えば組織境界は保たれる。
 *
 * D1 ではなく Durable Object を使うのは、排他制御と強整合が要るため。
 */
export class RoomState extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    ctx.storage.sql.exec(CREATE_ITEMS_TABLE)
    this.migrate()
  }

  /**
   * Durable Object 内のスキーマはプラグイン作者の責務。
   *
   * プラットフォームが面倒を見るのは Worker とバインディングまでで、
   * インスタンスの中のテーブルには何もしない。CREATE TABLE IF NOT EXISTS は
   * 既存のインスタンスに列を足さないため、列を追加したらここで追従する。
   * 忘れると `no such column` で 500 になる。
   *
   * D1 と同じく forward-only。列の削除はデータを失うので行わない。
   */
  private migrate() {
    const columns = this.ctx.storage.sql
      .exec<{ name: string }>('PRAGMA table_info(items)')
      .toArray()

    // 列を追加したときの例。追加のたびにこの形で足していく。
    if (!columns.some((column) => column.name === 'value')) {
      this.ctx.storage.sql.exec(
        `ALTER TABLE items ADD COLUMN value TEXT NOT NULL DEFAULT ''`,
      )
    }
  }

  listItems(limit: number): Item[] {
    return this.ctx.storage.sql
      .exec<Item>(
        `SELECT id,
                user_id    AS userId,
                value,
                created_at AS createdAt
           FROM items
          ORDER BY created_at DESC, id DESC
          LIMIT ?`,
        limit,
      )
      .toArray()
  }

  createItem(userId: string, value: string): Item {
    return this.ctx.storage.sql
      .exec<Item>(
        `INSERT INTO items (id, user_id, value)
         VALUES (?, ?, ?)
         RETURNING id,
                   user_id    AS userId,
                   value,
                   created_at AS createdAt`,
        crypto.randomUUID(),
        userId,
        value,
      )
      .one()
  }
}
