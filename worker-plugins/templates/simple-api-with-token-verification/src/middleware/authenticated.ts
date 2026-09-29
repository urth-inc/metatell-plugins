import type { MiddlewareHandler } from 'hono'

import {
  UnauthorizedError,
  VerificationUnavailableError,
  authenticate,
} from '../auth'
import type { PluginIdentity } from '../auth'

/** Hono の型引数。ルートから ctx.get('identity') を引けるようにする。 */
export type AppEnv = {
  Bindings: Env
  Variables: { identity: PluginIdentity }
}

export const authenticated: MiddlewareHandler<AppEnv> = async (ctx, next) => {
  try {
    ctx.set('identity', await authenticate(ctx.req.raw, ctx.env))
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return ctx.json({ message: error.message }, 401)
    }
    if (error instanceof VerificationUnavailableError) {
      console.error('token verification unavailable', error.message)
      return ctx.json({ message: 'token verification unavailable' }, 503)
    }
    throw error
  }

  await next()
}
