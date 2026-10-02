import { useEffect, useRef, useState } from 'react'

const SOURCE_URL =
  'https://github.com/urth-inc/metatell-plugins/tree/develop/worker-plugins/examples/sticky-board'

const HelpIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8.5 8.5a3.5 3.5 0 1 1 5 3.2c-.9.4-1.5 1.2-1.5 2.2v.6M12 19h.01" />
  </svg>
)

const GitHubMark = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

const USAGE = [
  { action: 'ダブルクリック', text: '空いている所に付箋を置く。「付箋を追加」でも置ける' },
  { action: 'ドラッグ', text: '付箋の上の帯をつかんで動かす' },
  { action: '色の丸', text: '付箋の色を変える。付箋にマウスを乗せると、上の帯に出る' },
  { action: '×', text: '付箋を削除する' },
  { action: '移動', text: 'ボード名を変えて別のボードへ。URL を共有すると同じボードに入れる' },
  { action: '名前', text: '他の人の画面で、カーソルと付箋に出る' },
]

// どう動いているか。画面・保存・同期のそれぞれを、何が担っているか。
const HOW = [
  { part: '画面', text: 'Workers Static Assets として配信する React のページ' },
  { part: '保存', text: 'ボードごとに 1 つの Durable Object が、付箋を SQLite に保存する' },
  { part: '同期', text: 'WebSocket で変更を全員に配る。誰も操作していない間は休止する（Hibernation API）' },
]

/** 右下の ？。押すと、仕組みと使い方とソースへのリンクを出す。 */
export const InfoButton = () => {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Esc と、パネルの外を押したときに閉じる。
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="info" ref={root}>
      {open && (
        <section className="info-panel" id="info-panel" aria-labelledby="info-title">
          {/* 見出しの行はスクロールしても残す。GitHub へのリンクがいつでも見えるように。 */}
          <header className="info-header">
            <h2 id="info-title">付箋ボードについて</h2>
            <a className="info-github" href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              <GitHubMark />
              GitHub
              <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="info-close" aria-label="閉じる" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="info-body">
            <h3 className="info-section">仕組み</h3>
            <p className="info-lead">metatell のワーカープラグインの例です。</p>
            <dl className="info-how">
              {HOW.map((item) => (
                <div key={item.part} className="info-how-row">
                  <dt>{item.part}</dt>
                  <dd>{item.text}</dd>
                </div>
              ))}
            </dl>

            <h3 className="info-section">使い方</h3>
            <dl className="info-usage">
              {USAGE.map((item) => (
                <div key={item.action} className="info-usage-row">
                  <dt>
                    <kbd>{item.action}</kbd>
                  </dt>
                  <dd>{item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <button
        type="button"
        className="info-button"
        aria-label="付箋ボードについて"
        title="付箋ボードについて"
        aria-expanded={open}
        aria-controls="info-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <HelpIcon />
      </button>
    </div>
  )
}
