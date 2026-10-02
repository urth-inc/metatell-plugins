import { useRef } from 'react'
import type { PointerEvent } from 'react'

import { NOTE_COLORS, NOTE_HEIGHT, NOTE_TEXT_MAX, NOTE_WIDTH } from '../../worker/src/protocol'
import type { Note } from '../../worker/src/protocol'
import type { Touch } from './useBoard'

type Props = {
  note: Note
  touch: Touch | undefined
  /** ボード上の座標に直す。 */
  toBoard: (clientX: number, clientY: number) => { x: number; y: number }
  onMove: (x: number, y: number, done?: boolean) => void
  onEdit: (text: string, done?: boolean) => void
  onColor: (color: string) => void
  onDelete: () => void
}

const TOUCH_MS = 1500

export const NoteCard = ({ note, touch, toBoard, onMove, onEdit, onColor, onDelete }: Props) => {
  // つかんだ位置と付箋の左上との差。
  const grab = useRef<{ dx: number; dy: number }>(undefined)

  const start = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest('button')) return
    const p = toBoard(event.clientX, event.clientY)
    grab.current = { dx: p.x - note.x, dy: p.y - note.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const drag = (event: PointerEvent, done = false) => {
    if (!grab.current) return
    const p = toBoard(event.clientX, event.clientY)
    onMove(Math.round(p.x - grab.current.dx), Math.round(p.y - grab.current.dy), done)
    if (done) grab.current = undefined
  }

  const recent = touch && Date.now() - touch.at < TOUCH_MS
  const label = recent ? `${touch.name} が編集中` : note.author

  return (
    <div
      className="note"
      style={{
        left: note.x,
        top: note.y,
        width: NOTE_WIDTH,
        height: NOTE_HEIGHT,
        background: note.color,
        outlineColor: recent ? touch.color : undefined,
      }}
      data-touched={recent || undefined}
    >
      <div
        className="note-bar"
        onPointerDown={start}
        onPointerMove={(e) => drag(e)}
        onPointerUp={(e) => drag(e, true)}
        onPointerCancel={(e) => drag(e, true)}
      >
        {/* 色の丸が出ている間は省略されるので、全文はツールチップで見せる。 */}
        <span className="note-author" title={label}>
          {label}
        </span>
        <span className="note-colors">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`色を ${color} にする`}
              className={color === note.color ? 'swatch current' : 'swatch'}
              style={{ background: color }}
              onClick={() => onColor(color)}
            />
          ))}
        </span>
        <button type="button" className="note-delete" aria-label="付箋を削除" onClick={onDelete}>
          ×
        </button>
      </div>
      <textarea
        aria-label="付箋"
        value={note.text}
        maxLength={NOTE_TEXT_MAX}
        placeholder="ここに書く"
        onChange={(e) => onEdit(e.target.value)}
        onBlur={(e) => onEdit(e.target.value, true)}
      />
    </div>
  )
}
