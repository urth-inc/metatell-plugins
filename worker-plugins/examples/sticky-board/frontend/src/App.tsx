import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { BOARD_PATTERN, NAME_MAX } from '../../worker/src/protocol'
import { Board } from './Board'
import { InfoButton } from './InfoButton'
import { ThemeToggle } from './ThemeToggle'
import { STATUS_LABELS, useBoard } from './useBoard'

const DEFAULT_BOARD = 'lobby'

// 開いているボードは URL のハッシュに持つ。同じ URL を開けば同じボードに入る。
const boardFromHash = () => {
  const hash = decodeURIComponent(location.hash.slice(1))
  return BOARD_PATTERN.test(hash) ? hash : DEFAULT_BOARD
}

export const App = () => {
  const [boardName, setBoardName] = useState(boardFromHash)
  // 名前はブラウザに保存しない。入力された文字列をそのまま保存しないため。開き直すと空に戻る。
  const [name, setName] = useState('')
  const [draft, setDraft] = useState(boardName)
  const board = useBoard(boardName, name)

  useEffect(() => {
    const onHashChange = () => {
      setBoardName(boardFromHash())
      setDraft(boardFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const switchBoard = (event: FormEvent) => {
    event.preventDefault()
    if (BOARD_PATTERN.test(draft)) location.hash = draft
  }

  const peers = Object.values(board.peers)
  const showError = board.error && Date.now() - board.error.at < 5000

  return (
    <div className="app">
      <header className="header">
        <div className="title">
          <h1>付箋ボード</h1>
          <span className={`status ${board.status}`}>{STATUS_LABELS[board.status]}</span>
        </div>

        {/* ラベル・入力欄・ボタンを 1 つの枠にまとめる。 */}
        <form className="field" onSubmit={switchBoard}>
          <label className="field-label" htmlFor="board-input">
            ボード
          </label>
          <input
            id="board-input"
            className="board-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            pattern={BOARD_PATTERN.source}
            title="英小文字・数字・ハイフン、32 文字まで"
            required
          />
          <button type="submit" className="field-button">
            移動
          </button>
        </form>

        <label className="field">
          <span className="field-label">名前</span>
          <input
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder={board.you?.name ?? 'ゲスト'}
          />
        </label>

        <ul className="peers" aria-label="このボードにいる人">
          {board.you && (
            <li style={{ background: board.you.color }} title="あなた">
              {board.you.name}（あなた）
            </li>
          )}
          {peers.map((peer) => (
            <li key={peer.id} style={{ background: peer.color }}>
              {peer.name}
            </li>
          ))}
        </ul>

        <ThemeToggle />
      </header>

      {showError && (
        <div className="alert" role="alert">
          {board.error!.message}
        </div>
      )}

      <div className="board-area">
        <Board board={board} />
        <InfoButton />
      </div>

      <footer className="footer muted">
        ボード <code>{boardName}</code> · 付箋 {Object.keys(board.notes).length} 枚 · {peers.length + (board.you ? 1 : 0)} 人が参加中 ·
        同じ URL を別のタブや端末で開くと、変更がリアルタイムに届きます。
      </footer>
    </div>
  )
}
