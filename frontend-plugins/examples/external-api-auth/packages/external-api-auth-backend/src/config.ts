import "./env.js";

export const REQUIRED_ALGORITHM = "RS256";

export type ExternalApiAuthBackendConfig = {
  clientId: string;
  corsOrigins: string | string[];
  issuer: string;
  jwksUrl: string;
  requiredAlgorithm: "RS256";
};

const loopbackHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function assertHttpsUrl(value: string, label: string): void {
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS.`);
  }
}

function isLoopbackHttpUrl(url: URL): boolean {
  return url.protocol === "http:" && loopbackHostnames.has(url.hostname);
}

export function normalizeCorsOrigin(value: string): string {
  const origin = normalizeUrl(value.trim());
  const url = new URL(origin);

  if (url.origin !== origin) {
    throw new Error("METATELL_CORS_ORIGINS entries must be origins without paths.");
  }

  if (url.protocol !== "https:" && !isLoopbackHttpUrl(url)) {
    throw new Error("METATELL_CORS_ORIGINS entries must use HTTPS, except loopback HTTP for local development.");
  }

  return origin;
}

export function buildJwksUrl(issuer: string): string {
  return `${normalizeUrl(issuer)}/protocol/openid-connect/certs`;
}

export function getCorsOrigins(): string | string[] {
  const value = getOptionalEnv("METATELL_CORS_ORIGINS");

  if (!value) {
    return "*";
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes("*")) {
    return "*";
  }

  return origins.map(normalizeCorsOrigin);
}

export function getConfig(): ExternalApiAuthBackendConfig {
  const clientId = getRequiredEnv("METATELL_CLIENT_ID");
  const issuer = normalizeUrl(getRequiredEnv("METATELL_ISSUER"));

  assertHttpsUrl(issuer, "METATELL_ISSUER");

  return {
    clientId,
    corsOrigins: getCorsOrigins(),
    issuer,
    jwksUrl: buildJwksUrl(issuer),
    requiredAlgorithm: REQUIRED_ALGORITHM
  };
}
