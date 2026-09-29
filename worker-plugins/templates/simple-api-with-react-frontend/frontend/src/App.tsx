import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { api } from './api'
import type { Todo } from './api'

export const App = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()

  const run = async (action: () => Promise<void>) => {
    setError(undefined)
    try {
      await action()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      return false
    }
  }

  useEffect(() => {
    void run(async () => setTodos(await api.list()))
  }, [])

  // 入力欄は送る前に空ける。待つ間に打った文字を、応答で消さないため。
  const add = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    const value = text
    setSaving(true)
    setText('')
    const ok = await run(async () => {
      const todo = await api.add(value)
      setTodos((todos) => [...todos, todo])
    })
    if (!ok) setText((current) => current || value)
    setSaving(false)
  }

  const remove = (id: number) =>
    void run(async () => {
      await api.remove(id)
      setTodos((todos) => todos.filter((todo) => todo.id !== id))
    })

  return (
    <main>
      <h1>ToDo</h1>

      <form onSubmit={(event) => void add(event)}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="やること"
          maxLength={200}
          required
        />
        <button type="submit" disabled={saving}>
          追加
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.text}</span>
            <button type="button" onClick={() => remove(todo.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
