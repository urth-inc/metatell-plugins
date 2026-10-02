// ブラウザのストレージは、メタテルや他の組織のプラグインと同じオリジンで共有される。秘密は置かない。
// キーに組織 ID は付けない。付けるには URL から取るしかなく、外から決められる値をキーに使うことになる。
// 保存するのはテーマだけで、同じブラウザで開いたどの組織の付箋ボードとも共有する。
const keyOf = (name: string) => `worker-plugin:sticky-board:${name}`

export const readPreference = (name: string) => {
  try {
    return localStorage.getItem(keyOf(name))
  } catch {
    return null
  }
}

export const writePreference = (name: string, value: string) => {
  try {
    localStorage.setItem(keyOf(name), value)
  } catch {
    // 保存できなくても、この画面の間は効く。
  }
}
