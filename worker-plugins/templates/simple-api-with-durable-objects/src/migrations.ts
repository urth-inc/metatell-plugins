// 段の列はクラスごとに持つ。追記のみ。適用済みの段を書き換えても既存の
// インスタンスには届かない。
export const ITEM_STORE_MIGRATIONS: string[][] = [
  [
    `CREATE TABLE items (
       id         TEXT PRIMARY KEY,
       body       TEXT NOT NULL,
       created_at TEXT NOT NULL DEFAULT (datetime('now'))
     )`,
  ],
  // ALTER TABLE で足す列は式をデフォルトにできない（行があると失敗する）。
  // 定数で足して既存の行を埋め、新しい行は INSERT で入れる。
  [
    `ALTER TABLE items ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`,
    `UPDATE items SET updated_at = created_at`,
  ],
]

export const COUNTER_STORE_MIGRATIONS: string[][] = [
  [
    `CREATE TABLE counters (
       name  TEXT PRIMARY KEY,
       value INTEGER NOT NULL
     )`,
  ],
]

export const migrate = (storage: DurableObjectStorage, steps: string[][]) => {
  const sql = storage.sql
  sql.exec(
    `CREATE TABLE IF NOT EXISTS _schema_migrations (
       version INTEGER PRIMARY KEY
     )`,
  )
  const applied = sql
    .exec<{ version: number }>(
      'SELECT COALESCE(MAX(version), 0) AS version FROM _schema_migrations',
    )
    .one().version

  for (let version = applied; version < steps.length; version++) {
    storage.transactionSync(() => {
      for (const statement of steps[version]!) {
        sql.exec(statement)
      }
      sql.exec(
        'INSERT INTO _schema_migrations (version) VALUES (?)',
        version + 1,
      )
    })
  }
}
