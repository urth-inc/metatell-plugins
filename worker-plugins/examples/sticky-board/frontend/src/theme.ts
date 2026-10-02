import { useEffect, useState } from 'react'

import { readPreference, writePreference } from './preferences'

export type Theme = 'light' | 'dark'

const dark = window.matchMedia('(prefers-color-scheme: dark)')

const saved = (): Theme | null => {
  const value = readPreference('theme')
  return value === 'light' || value === 'dark' ? value : null
}

/**
 * 選んだテーマを <html data-theme> に置く。選んでいなければ外し、OS の設定に従う。
 * 描画の前にも呼んで、読み込んだ直後に色が切り替わって見えないようにする。
 */
export const applyTheme = (theme: Theme | null = saved()) => {
  if (theme) document.documentElement.dataset.theme = theme
  else delete document.documentElement.dataset.theme
}

/** 今のテーマと切り替え。最初は OS の設定に従い、切り替えたらその選択を覚える。 */
export const useTheme = () => {
  const [chosen, setChosen] = useState(saved)
  const [system, setSystem] = useState<Theme>(dark.matches ? 'dark' : 'light')

  useEffect(() => {
    const onChange = () => setSystem(dark.matches ? 'dark' : 'light')
    dark.addEventListener('change', onChange)
    return () => dark.removeEventListener('change', onChange)
  }, [])

  const theme = chosen ?? system

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setChosen(next)
    writePreference('theme', next)
    applyTheme(next)
  }

  return { theme, toggle }
}
