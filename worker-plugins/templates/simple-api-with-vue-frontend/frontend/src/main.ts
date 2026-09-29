import { createApp } from 'vue'

import App from './App.vue'
import NotFound from './NotFound.vue'
import './style.css'

// 存在しないパスにも index.html が返る。入口以外なら見つからないと表示する。
const root = new URL(document.baseURI).pathname
const found = [root, root.slice(0, -1), `${root}index.html`].includes(
  location.pathname,
)
if (!found) document.title = 'ページが見つかりません'

createApp(found ? App : NotFound).mount('#app')
