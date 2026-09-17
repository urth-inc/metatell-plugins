import {
  createRemoteJWKSet,
  errors,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey
} from "jose";
import { getConfig } from "./config.js";

const config = getConfig();
const jwks = createRemoteJWKSet(new URL(config.jwksUrl));
const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class TokenVerificationUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TokenVerificationUnavailableError";
  }
}

export function getBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Missing Authorization header.");
  }

  const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);
  if (scheme.toLowerCase() !== "bearer" || !token || rest.length > 0) {
    throw new UnauthorizedError("Authorization header must be a Bearer token.");
  }

  return token;
}

export function assertValidSubject(payload: JWTPayload): asserts payload is JWTPayload & {
  sub: string;
} {
  if (typeof payload.sub !== "string") {
    throw new UnauthorizedError("Token subject is missing.");
  }

  if (payload.sub.length > 36 || !uuidV4Pattern.test(payload.sub)) {
    throw new UnauthorizedError("Token subject must be a UUID v4 value.");
  }
}

function isTokenVerificationError(error: unknown): boolean {
  return (
    error instanceof errors.JWTExpired ||
    error instanceof errors.JWTClaimValidationFailed ||
    error instanceof errors.JWSSignatureVerificationFailed ||
    error instanceof errors.JOSEAlgNotAllowed ||
    error instanceof errors.JWSInvalid ||
    error instanceof errors.JWTInvalid ||
    error instanceof errors.JWKSNoMatchingKey
  );
}

export async function verifyMetatellPluginToken(token: string): Promise<JWTPayload & { sub: string }> {
  let payload: JWTPayload;

  try {
    ({ payload } = await jwtVerify(token, jwks as JWTVerifyGetKey, {
      algorithms: [config.requiredAlgorithm],
      audience: config.clientId,
      issuer: config.issuer,
      requiredClaims: ["exp"],
      clockTolerance: 5
    }));
  } catch (error) {
    if (isTokenVerificationError(error)) {
      throw new UnauthorizedError("Invalid metatell plugin API token.");
    }

    throw new TokenVerificationUnavailableError(
      "Token verification is temporarily unavailable.",
      { cause: error }
    );
  }

  assertValidSubject(payload);
  return payload;
}
