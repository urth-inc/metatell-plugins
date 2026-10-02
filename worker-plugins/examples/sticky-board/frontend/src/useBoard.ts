import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import type { ClientMessage, Note, Peer, ServerMessage } from '../../worker/src/protocol'

export type Status = 'connecting' | 'open' | 'closed'

export const STATUS_LABELS: Record<Status, string> = {
  connecting: '接続中…',
  open: '接続中',
  closed: '切断（再接続します）',
}
export type Cursor = { x: number; y: number; at: number }
/** 他の人が最後に触った付箋。しばらく枠をその人の色にする。 */
export type Touch = { color: string; name: string; at: number }

type State = {
  status: Status
  you?: Peer
  notes: Record<string, Note>
  peers: Record<string, Peer>
  cursors: Record<string, Cursor>
  touched: Record<string, Touch>
  error?: { message: string; at: number }
}

type Action =
  | { type: 'status'; status: Status }
  | { type: 'server'; message: ServerMessage }
  | { type: 'local.note'; id: string; patch: Partial<Note> }
  | { type: 'local.delete'; id: string }

const initial: State = { status: 'connecting', notes: {}, peers: {}, cursors: {}, touched: {} }

const without = <T,>(record: Record<string, T>, key: string) => {
  const { [key]: _, ...rest } = record
  return rest
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'status':
      return { ...state, status: action.status }
    case 'local.note': {
      const note = state.notes[action.id]
      return note ? { ...state, notes: { ...state.notes, [action.id]: { ...note, ...action.patch } } } : state
    }
    case 'local.delete':
      return { ...state, notes: without(state.notes, action.id) }
  }

  const message = action.message
  switch (message.type) {
    case 'welcome':
      return {
        ...initial,
        status: 'open',
        you: message.you,
        notes: Object.fromEntries(message.notes.map((n) => [n.id, n])),
        peers: Object.fromEntries(message.peers.map((p) => [p.id, p])),
      }
    case 'note.upserted': {
      const by = state.peers[message.by]
      return {
        ...state,
        notes: { ...state.notes, [message.note.id]: message.note },
        touched: by
          ? { ...state.touched, [message.note.id]: { color: by.color, name: by.name, at: Date.now() } }
          : state.touched,
      }
    }
    case 'note.deleted':
      return { ...state, notes: without(state.notes, message.id), touched: without(state.touched, message.id) }
    case 'peer.joined':
    case 'peer.updated':
      if (message.peer.id === state.you?.id) return { ...state, you: message.peer }
      return { ...state, peers: { ...state.peers, [message.peer.id]: message.peer } }
    case 'peer.left':
      return { ...state, peers: without(state.peers, message.id), cursors: without(state.cursors, message.id) }
    case 'cursor':
      return { ...state, cursors: { ...state.cursors, [message.id]: { x: message.x, y: message.y, at: Date.now() } } }
    case 'error':
      return { ...state, error: { message: message.message, at: Date.now() } }
  }
}

/** 最後の呼び出しだけを、ms ごとに 1 回まで送る。flush で残りをすぐ送る。 */
const throttle = <A extends unknown[]>(fn: (...args: A) => void, ms: number) => {
  let last = 0
  let pending: A | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const fire = () => {
    timer = undefined
    last = Date.now()
    if (pending) fn(...pending)
    pending = undefined
  }
  const call = (...args: A) => {
    pending = args
    if (timer) return
    const wait = ms - (Date.now() - last)
    if (wait <= 0) fire()
    else timer = setTimeout(fire, wait)
  }
  call.flush = () => {
    clearTimeout(timer)
    fire()
  }
  return call
}

const socketUrl = (board: string, name: string) => {
  // 相対パスは index.html が置く <base>（アプリの入口）から解決される。
  const url = new URL(`./api/boards/${board}/ws?name=${encodeURIComponent(name)}`, document.baseURI)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url
}

export const useBoard = (board: string, name: string) => {
  const [state, dispatch] = useReducer(reducer, initial)
  const socket = useRef<WebSocket>(undefined)
  const nameRef = useRef(name)
  nameRef.current = name

  const send = useCallback((message: ClientMessage) => {
    const ws = socket.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message))
  }, [])

  // 切れたらつなぎ直す。間隔は 1 秒から倍々で、10 秒まで。
  useEffect(() => {
    let disposed = false
    let retry = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      dispatch({ type: 'status', status: 'connecting' })
      const ws = new WebSocket(socketUrl(board, nameRef.current))
      socket.current = ws
      ws.onopen = () => {
        retry = 0
      }
      ws.onmessage = (event) => dispatch({ type: 'server', message: JSON.parse(event.data) })
      ws.onclose = () => {
        if (socket.current === ws) socket.current = undefined
        if (disposed) return
        dispatch({ type: 'status', status: 'closed' })
        timer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 10_000))
      }
    }
    connect()

    return () => {
      disposed = true
      clearTimeout(timer)
      socket.current?.close(1000)
    }
  }, [board])

  // 名前はつなぐときに渡す。つないだあとに変えたら知らせる。
  useEffect(() => {
    if (state.you && state.you.name !== name) send({ type: 'rename', name })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, send])

  const actions = useMemo(() => {
    const sendMove = throttle((id: string, x: number, y: number) => send({ type: 'note.move', id, x, y }), 40)
    const sendCursor = throttle((x: number, y: number) => send({ type: 'cursor', x, y }), 50)
    const sendEdit = throttle((id: string, text: string) => send({ type: 'note.edit', id, text }), 250)

    return {
      addNote: (x: number, y: number, color: string) =>
        send({ type: 'note.add', x, y, color, text: '' }),
      moveNote: (id: string, x: number, y: number, done = false) => {
        dispatch({ type: 'local.note', id, patch: { x, y } })
        sendMove(id, x, y)
        if (done) sendMove.flush()
      },
      editNote: (id: string, text: string, done = false) => {
        dispatch({ type: 'local.note', id, patch: { text } })
        sendEdit(id, text)
        if (done) sendEdit.flush()
      },
      colorNote: (id: string, color: string) => {
        dispatch({ type: 'local.note', id, patch: { color } })
        send({ type: 'note.color', id, color })
      },
      deleteNote: (id: string) => {
        dispatch({ type: 'local.delete', id })
        send({ type: 'note.delete', id })
      },
      moveCursor: sendCursor,
    }
  }, [send])

  return { ...state, ...actions }
}
