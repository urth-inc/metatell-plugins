import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'

/**
 * プラグイン API トークンの検証。
 *
 * Workers for Platforms のディスパッチャはトークンを素通しするため、
 * User Worker が自分で検証する責務を持つ。
 */

export type PluginIdentity = {
  userId: string
  /** 在室中のルーム。hub_sid クレーム。 */
  roomId: string
}

export class UnauthorizedError extends Error {}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

const getJwks = (url: string) => {
  let jwks = jwksCache.get(url)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksCache.set(url, jwks)
  }
  return jwks
}

const readBearerToken = (request: Request): string => {
  const header = request.headers.get('authorization')
  if (header?.toLowerCase().startsWith('bearer ')) {
    return header.slice('bearer '.length).trim()
  }

  throw new UnauthorizedError('missing bearer token')
}

/**
 * トークンから呼び出し元を決める。
 *
 * この Worker は組織ごとに分かれているので、組織の識別はトークンに要らない。
 *
 * roomId のようなテナント境界に関わる値は、必ずここでトークンから取り出すこと。
 * クライアントが指定したパスやクエリを信用すると、別のルームのデータに到達できる。
 */
const toIdentity = (payload: JWTPayload): PluginIdentity => {
  const userId = payload.sub
  if (typeof userId !== 'string' || userId === '') {
    throw new UnauthorizedError('token has no sub')
  }

  const roomId = payload.hub_sid
  if (typeof roomId !== 'string' || roomId === '') {
    throw new UnauthorizedError('token has no hub_sid')
  }

  return { userId, roomId }
}

export const authenticate = async (
  request: Request,
  env: Env,
): Promise<PluginIdentity> => {
  const token = readBearerToken(request)

  const { payload } = await jwtVerify(token, getJwks(env.PLUGIN_TOKEN_JWKS_URL), {
    issuer: env.PLUGIN_TOKEN_ISSUER,
    audience: env.PLUGIN_TOKEN_AUDIENCE,
  }).catch(() => {
    throw new UnauthorizedError('invalid token')
  })

  return toIdentity(payload)
}
