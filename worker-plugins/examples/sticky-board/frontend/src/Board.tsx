import { useEffect, useRef, useState } from 'react'

import { BOARD_HEIGHT, BOARD_WIDTH, NOTE_COLORS, NOTE_HEIGHT, NOTE_WIDTH } from '../../worker/src/protocol'
import { NoteCard } from './NoteCard'
import type { useBoard } from './useBoard'

// カーソルは動きが止まってからこの時間で消す。
const CURSOR_MS = 5000

export const Board = ({ board }: { board: ReturnType<typeof useBoard> }) => {
  const surface = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState<string>(NOTE_COLORS[0])
  const [now, setNow] = useState(Date.now)

  // 古いカーソルと「編集中」の表示を消すため、1 秒ごとに今の時刻を進めて描き直す。
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toBoard = (clientX: number, clientY: number) => {
    const rect = surface.current!.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  /** 見えている範囲の真ん中に置く。続けて置いても重ならないよう、枚数に応じて斜めにずらす。 */
  const addAtCenter = () => {
    const s = scroller.current!
    const offset = (Object.keys(board.notes).length % 5) * 24
    board.addNote(
      s.scrollLeft + s.clientWidth / 2 - NOTE_WIDTH / 2 + offset,
      s.scrollTop + s.clientHeight / 2 - NOTE_HEIGHT / 2 + offset,
      color,
    )
  }

  const notes = Object.values(board.notes).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))

  return (
    <div className="board-frame">
      <div className="toolbar">
        <button type="button" className="primary" onClick={addAtCenter} disabled={board.status !== 'open'}>
          付箋を追加
        </button>
        <span className="muted">色</span>
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`新しい付箋の色を ${c} にする`}
            className={c === color ? 'swatch large current' : 'swatch large'}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
        <span className="muted hint">空いている所をダブルクリックしても追加できます · 付箋は上の帯をつかんで動かします</span>
      </div>

      <div className="board-scroll" ref={scroller}>
        <div
          className="board"
          ref={surface}
          style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
          onPointerMove={(e) => {
            const p = toBoard(e.clientX, e.clientY)
            board.moveCursor(Math.round(p.x), Math.round(p.y))
          }}
          onDoubleClick={(e) => {
            if (e.target !== e.currentTarget) return
            const p = toBoard(e.clientX, e.clientY)
            board.addNote(p.x - NOTE_WIDTH / 2, p.y - 20, color)
          }}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              touch={board.touched[note.id]}
              toBoard={toBoard}
              onMove={(x, y, done) => board.moveNote(note.id, x, y, done)}
              onEdit={(text, done) => board.editNote(note.id, text, done)}
              onColor={(c) => board.colorNote(note.id, c)}
              onDelete={() => board.deleteNote(note.id)}
            />
          ))}

          {Object.entries(board.cursors)
            .filter(([id, c]) => board.peers[id] && now - c.at < CURSOR_MS)
            .map(([id, c]) => {
              const peer = board.peers[id]!
              return (
                <div key={id} className="cursor" style={{ left: c.x, top: c.y, color: peer.color }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M1 1 L15 7 L8 8.5 L6 15 Z" fill="currentColor" stroke="white" strokeWidth="1" />
                  </svg>
                  <span style={{ background: peer.color }}>{peer.name}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
