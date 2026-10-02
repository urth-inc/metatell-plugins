import { DurableObject } from 'cloudflare:workers'

import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  NAME_MAX,
  NOTES_MAX,
  NOTE_COLORS,
  NOTE_HEIGHT,
  NOTE_TEXT_MAX,
  NOTE_WIDTH,
  PEER_COLORS,
} from './protocol'
import type { ClientMessage, Note, Peer, ServerMessage } from './protocol'

const COLUMNS = 'id, text, x, y, color, author, updated_at AS updatedAt'

const clamp = (value: unknown, max: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.min(Math.max(value, 0), max))
    : null

const cleanName = (value: unknown) => {
  const name = typeof value === 'string' ? value.trim().slice(0, NAME_MAX) : ''
  return name || `ゲスト-${crypto.randomUUID().slice(0, 4)}`
}

const isNoteColor = (value: unknown): value is string =>
  NOTE_COLORS.includes(value as (typeof NOTE_COLORS)[number])

type MessageOf<T extends ClientMessage['type']> = Extract<ClientMessage, { type: T }>

const parse = (raw: string) => {
  try {
    return JSON.parse(raw) as ClientMessage
  } catch {
    return null
  }
}

/** 付箋の更新で書き換える列と値。値が正しくなければ null。 */
const changes = (
  message: MessageOf<'note.move' | 'note.edit' | 'note.color'>,
  peer: Peer,
): [string, string | number][] | null => {
  switch (message.type) {
    case 'note.move': {
      const x = clamp(message.x, BOARD_WIDTH - NOTE_WIDTH)
      const y = clamp(message.y, BOARD_HEIGHT - NOTE_HEIGHT)
      return x === null || y === null ? null : [['x', x], ['y', y]]
    }
    case 'note.edit':
      return typeof message.text === 'string'
        ? [['text', message.text.slice(0, NOTE_TEXT_MAX)], ['author', peer.name]]
        : null
    case 'note.color':
      return isNoteColor(message.color) ? [['color', message.color]] : null
  }
}

/**
 * ボード 1 枚が 1 インスタンス。付箋は SQLite に保存し、変更は接続している全員に送る。
 * WebSocket は Hibernation API で受ける。誰も書いていない間はインスタンスが休み、課金も止まる。
 * 接続ごとの情報（Peer）は attachment に持たせ、休みから戻っても参加者を復元できるようにする。
 */
export class BoardRoom extends DurableObject<Env> {
  private readonly sql: SqlStorage

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    this.sql.exec(`CREATE TABLE IF NOT EXISTS notes (
      id         TEXT PRIMARY KEY,
      text       TEXT NOT NULL,
      x          INTEGER NOT NULL,
      y          INTEGER NOT NULL,
      color      TEXT NOT NULL,
      author     TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`)
  }

  private notes() {
    return this.sql.exec<Note>(`SELECT ${COLUMNS} FROM notes ORDER BY updated_at`).toArray()
  }

  private note(id: unknown) {
    if (typeof id !== 'string') return null
    return this.sql.exec<Note>(`SELECT ${COLUMNS} FROM notes WHERE id = ?`, id).toArray()[0] ?? null
  }

  private peers(except?: WebSocket) {
    return this.ctx
      .getWebSockets()
      .filter((ws) => ws !== except && ws.readyState === WebSocket.OPEN)
      .map((ws) => ws.deserializeAttachment() as Peer)
  }

  /** 使われていない色から選ぶ。全部使われていれば順に回す。 */
  private pickColor() {
    const used = new Set(this.peers().map((p) => p.color))
    return PEER_COLORS.find((c) => !used.has(c)) ?? PEER_COLORS[used.size % PEER_COLORS.length]!
  }

  private send(ws: WebSocket, message: ServerMessage) {
    try {
      ws.send(JSON.stringify(message))
    } catch {
      // 切れかけの接続。close のハンドラで片付く。
    }
  }

  private broadcast(message: ServerMessage, except?: WebSocket) {
    const data = JSON.stringify(message)
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue
      try {
        ws.send(data)
      } catch {
        // 同上。
      }
    }
  }

  fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected a WebSocket upgrade', { status: 426 })
    }
    const peer: Peer = {
      id: crypto.randomUUID(),
      name: cleanName(new URL(request.url).searchParams.get('name')),
      color: this.pickColor(),
    }
    const [client, server] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket]
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment(peer)

    this.send(server, { type: 'welcome', you: peer, notes: this.notes(), peers: this.peers(server) })
    this.broadcast({ type: 'peer.joined', peer }, server)
    return new Response(null, { status: 101, webSocket: client })
  }

  webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    if (typeof raw !== 'string') return
    const message = parse(raw)
    if (!message) return this.send(ws, { type: 'error', message: 'invalid JSON' })
    const peer = ws.deserializeAttachment() as Peer

    switch (message.type) {
      case 'cursor':
        return this.moveCursor(ws, peer, message)
      case 'rename':
        return this.rename(ws, peer, message)
      case 'note.add':
        return this.addNote(ws, peer, message)
      case 'note.move':
      case 'note.edit':
      case 'note.color':
        return this.updateNote(ws, peer, message)
      case 'note.delete':
        return this.deleteNote(peer, message)
      default:
        return this.send(ws, { type: 'error', message: 'unknown message type' })
    }
  }

  private moveCursor(ws: WebSocket, peer: Peer, message: MessageOf<'cursor'>) {
    const x = clamp(message.x, BOARD_WIDTH)
    const y = clamp(message.y, BOARD_HEIGHT)
    if (x !== null && y !== null) this.broadcast({ type: 'cursor', id: peer.id, x, y }, ws)
  }

  private rename(ws: WebSocket, peer: Peer, message: MessageOf<'rename'>) {
    const renamed: Peer = { ...peer, name: cleanName(message.name) }
    ws.serializeAttachment(renamed)
    this.broadcast({ type: 'peer.updated', peer: renamed })
  }

  private addNote(ws: WebSocket, peer: Peer, message: MessageOf<'note.add'>) {
    const x = clamp(message.x, BOARD_WIDTH - NOTE_WIDTH)
    const y = clamp(message.y, BOARD_HEIGHT - NOTE_HEIGHT)
    const text = typeof message.text === 'string' ? message.text.slice(0, NOTE_TEXT_MAX) : ''
    if (x === null || y === null || !isNoteColor(message.color)) {
      return this.send(ws, { type: 'error', message: 'invalid note' })
    }
    const count = this.sql.exec<{ n: number }>('SELECT COUNT(*) AS n FROM notes').one().n
    if (count >= NOTES_MAX) {
      return this.send(ws, { type: 'error', message: `付箋は ${NOTES_MAX} 枚までです` })
    }
    const note = this.sql
      .exec<Note>(
        `INSERT INTO notes (id, text, x, y, color, author) VALUES (?, ?, ?, ?, ?, ?)
         RETURNING ${COLUMNS}`,
        crypto.randomUUID(),
        text,
        x,
        y,
        message.color,
        peer.name,
      )
      .one()
    // 作った本人も ID を知らないので、本人にも送る。
    this.broadcast({ type: 'note.upserted', note, by: peer.id })
  }

  // 移動・編集・色は、送った本人の画面では先に反映済み。本人以外に送る。
  private updateNote(ws: WebSocket, peer: Peer, message: MessageOf<'note.move' | 'note.edit' | 'note.color'>) {
    const current = this.note(message.id)
    if (!current) return this.send(ws, { type: 'error', message: 'note not found' })
    const set = changes(message, peer)
    if (!set) return

    // 列名は changes() が決めた固定の名前だけ。値はプレースホルダーで渡す。
    const assignments = set.map(([column]) => column + ' = ?').join(', ')
    const note = this.sql
      .exec<Note>(
        `UPDATE notes SET ${assignments}, updated_at = datetime('now')
          WHERE id = ? RETURNING ${COLUMNS}`,
        ...set.map(([, value]) => value),
        current.id,
      )
      .one()
    this.broadcast({ type: 'note.upserted', note, by: peer.id }, ws)
  }

  private deleteNote(peer: Peer, message: MessageOf<'note.delete'>) {
    if (typeof message.id !== 'string') return
    const deleted = this.sql
      .exec('DELETE FROM notes WHERE id = ? RETURNING id', message.id)
      .toArray().length > 0
    if (deleted) this.broadcast({ type: 'note.deleted', id: message.id, by: peer.id })
  }

  webSocketClose(ws: WebSocket, code: number, reason: string) {
    this.leave(ws)
    // 1005（番号なし）と 1006（異常切断）は送り返せない番号なので、通常の終了で閉じる。
    try {
      ws.close(code === 1005 || code === 1006 ? 1000 : code, reason)
    } catch {
      // すでに閉じている。
    }
  }

  webSocketError(ws: WebSocket) {
    this.leave(ws)
  }

  private leave(ws: WebSocket) {
    const peer = ws.deserializeAttachment() as Peer | null
    if (peer) this.broadcast({ type: 'peer.left', id: peer.id }, ws)
  }
}
