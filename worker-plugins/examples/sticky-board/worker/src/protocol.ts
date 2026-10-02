// WebSocket で送り合うメッセージ。Worker と frontend で共有する（frontend は import type で読む）。

export const BOARD_PATTERN = /^[a-z0-9][a-z0-9-]{0,31}$/

/** ボードの大きさ。付箋とカーソルの座標はこの中に収める。 */
export const BOARD_WIDTH = 2400
export const BOARD_HEIGHT = 1400

export const NOTE_WIDTH = 260
export const NOTE_HEIGHT = 200
export const NOTE_TEXT_MAX = 500
export const NOTES_MAX = 200
export const NAME_MAX = 20

export const NOTE_COLORS = ['#fde68a', '#fecaca', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8'] as const
export const PEER_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
] as const

export type Note = {
  id: string
  text: string
  x: number
  y: number
  color: string
  /** 最後に書き換えた人の名前。 */
  author: string
  updatedAt: string
}

/** 接続 1 本が 1 人。同じ人でもタブを 2 つ開けば 2 人になる。 */
export type Peer = { id: string; name: string; color: string }

export type ClientMessage =
  | { type: 'note.add'; x: number; y: number; color: string; text: string }
  | { type: 'note.move'; id: string; x: number; y: number }
  | { type: 'note.edit'; id: string; text: string }
  | { type: 'note.color'; id: string; color: string }
  | { type: 'note.delete'; id: string }
  | { type: 'cursor'; x: number; y: number }
  | { type: 'rename'; name: string }

export type ServerMessage =
  | { type: 'welcome'; you: Peer; notes: Note[]; peers: Peer[] }
  | { type: 'note.upserted'; note: Note; by: string }
  | { type: 'note.deleted'; id: string; by: string }
  | { type: 'peer.joined'; peer: Peer }
  | { type: 'peer.updated'; peer: Peer }
  | { type: 'peer.left'; id: string }
  | { type: 'cursor'; id: string; x: number; y: number }
  | { type: 'error'; message: string }
