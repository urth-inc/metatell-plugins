import { createRemoteJWKSet, errors, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'

/**
 * アクセストークンの検証。
 *
 * 検証は自分でやる。トークンはそのまま渡ってくるため、上流の誰も
 * 中身を見ていない。読み書きするルートは、動く前に必ず通す。
 */

export class UnauthorizedError extends Error {}

/**
 * トークンの良し悪しを判断できなかった。JWKS が取れない、など。
 *
 * 401 と分ける。401 を受けたクライアントは資格情報が悪いと解釈して
 * サインインし直させるが、これは待てば直る側の失敗なので 503 で返す。
 */
export class VerificationUnavailableError extends Error {}

// トークンそのものが原因の失敗。これ以外は検証先の側の失敗として扱う。
// JWKSNoMatchingKey は authenticate の中で個別に判断する。
const TOKEN_ERRORS = [
  errors.JWTExpired,
  errors.JWTClaimValidationFailed,
  errors.JWTInvalid,
  errors.JWSInvalid,
  errors.JWSSignatureVerificationFailed,
  errors.JOSEAlgNotAllowed,
  errors.JOSENotSupported,
]

const isTokenError = (error: unknown) =>
  TOKEN_ERRORS.some((TokenError) => error instanceof TokenError)

/**
 * JWKS の取得結果はキャッシュする。createRemoteJWKSet が鍵を取りに行くのは
 * 未知の kid に当たったときだけなので、リクエストごとに作り直すと取得も
 * 毎回になる。
 */
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
  if (!header?.toLowerCase().startsWith('bearer ')) {
    throw new UnauthorizedError('missing bearer token')
  }

  const token = header.slice('bearer '.length).trim()
  if (token === '') {
    throw new UnauthorizedError('missing bearer token')
  }

  return token
}

export type PluginIdentity = {
  /** sub クレーム。利用者の識別子。 */
  sub: string
  /** 検証済みのクレーム全体。 */
  claims: JWTPayload
}

/**
 * 署名と発行者を検証して、クレームを返す。
 *
 * 署名が通っただけでは足りない。issuer を照合しないと、別の認証基盤が
 * 出したトークンでもこの Worker に通ってしまう。
 */
export const authenticate = async (
  request: Request,
  env: Env,
): Promise<PluginIdentity> => {
  const token = readBearerToken(request)
  const jwks = getJwks(env.PLUGIN_TOKEN_JWKS_URL)

  // 鍵が見つからなかったとき、jose が JWKS を取り直せたかは検証の前に決まる。
  // 取り直せない待機中（取得から 30 秒）なら鍵の切り替え直後かもしれず判断
  // できない。取り直せたのに無いなら、そのトークンの鍵ではない。
  const canRefetch = !jwks.coolingDown

  const { payload } = await jwtVerify(
    token,
    jwks,
    // jose は exp があるときしか期限を見ない。無いトークンを通さない。
    { issuer: env.PLUGIN_TOKEN_ISSUER, requiredClaims: ['exp'] },
  ).catch((error: unknown) => {
    if (
      isTokenError(error) ||
      (error instanceof errors.JWKSNoMatchingKey && canRefetch)
    ) {
      throw new UnauthorizedError('invalid token')
    }
    throw new VerificationUnavailableError(
      error instanceof Error ? error.message : 'verification failed',
    )
  })

  const sub = payload.sub
  if (typeof sub !== 'string' || sub === '') {
    throw new UnauthorizedError('token has no sub')
  }

  return { sub, claims: payload }
}
