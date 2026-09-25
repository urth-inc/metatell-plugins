declare global {
  /**
   * Durable Object のバインディングを足したら、ここと wrangler.jsonc の両方に書く。
   * 登録で受け付けられるのは今は Durable Object だけで、ほかの種類は断られる。
   */
  interface Env {
    PLUGIN_TOKEN_ISSUER: string
    PLUGIN_TOKEN_JWKS_URL: string
  }
}

export {}
