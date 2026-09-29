import type { Todo } from '../../worker/src/todo'

export type { Todo }

// 相対パスは index.html が置く <base>（アプリの入口）から解決される。
const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`./api/${path}`, {
    ...init,
    headers: { 'content-type': 'application/json' },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(body?.message ?? `HTTP ${response.status}`)
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}

export const api = {
  list: () => request<{ todos: Todo[] }>('todos').then((r) => r.todos),

  add: (text: string) =>
    request<{ todo: Todo }>('todos', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }).then((r) => r.todo),

  remove: (id: number) => request<void>(`todos/${id}`, { method: 'DELETE' }),
}
