import type { RoomState } from './room-state'

declare global {
  interface Env {
    ROOM_STATE: DurableObjectNamespace<RoomState>

    PLUGIN_TOKEN_ISSUER: string
    PLUGIN_TOKEN_JWKS_URL: string
    PLUGIN_TOKEN_AUDIENCE: string
  }
}

export {}
