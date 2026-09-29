import type { Todo } from '../../worker/src/todo'

export type { Todo }

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

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
    throw new ApiError(
      body?.message ?? `HTTP ${response.status}`,
      response.status,
    )
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

  // 二度押しや別の画面で先に消されていても、消すという目的は果たしている。
  remove: (id: number) =>
    request<void>(`todos/${id}`, { method: 'DELETE' }).catch((e: unknown) => {
      if (!(e instanceof ApiError && e.status === 404)) throw e
    }),
}
