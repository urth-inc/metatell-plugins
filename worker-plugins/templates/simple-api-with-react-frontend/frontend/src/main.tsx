import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './style.css'

// 存在しないパスにも index.html が返る。入口以外なら見つからないと表示する。
const root = new URL(document.baseURI).pathname
const found = [root, root.slice(0, -1), `${root}index.html`].includes(
  location.pathname,
)
if (!found) document.title = 'ページが見つかりません'

const NotFound = () => (
  <main>
    <h1>ページが見つかりません</h1>
    <a href="./">トップへ戻る</a>
  </main>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>{found ? <App /> : <NotFound />}</StrictMode>,
)
