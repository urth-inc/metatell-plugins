export type ExternalApiAuthPluginConfig = {
  clientId: string;
  externalApiBaseUrl: string;
};

const localExternalApiBaseUrl = "http://localhost:3000";
const loopbackHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const buildTimeConfig: Partial<ExternalApiAuthPluginConfig> = {
  clientId: process.env.METATELL_CLIENT_ID,
  externalApiBaseUrl: process.env.METATELL_EXTERNAL_API_BASE_URL ?? localExternalApiBaseUrl
};

declare global {
  var __METATELL_EXTERNAL_API_AUTH_PLUGIN_CONFIG__:
    | Partial<Pick<ExternalApiAuthPluginConfig, "clientId" | "externalApiBaseUrl">>
    | undefined;
}

declare const process: {
  env: Partial<Record<"METATELL_CLIENT_ID" | "METATELL_EXTERNAL_API_BASE_URL", string | undefined>>;
};

export function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getRequiredValue(value: string | undefined, label: string): string {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`${label} is required.`);
  }

  return trimmedValue;
}

function isLoopbackHttpUrl(url: URL): boolean {
  return url.protocol === "http:" && loopbackHostnames.has(url.hostname);
}

export function assertAllowedExternalApiBaseUrl(value: string, label: string): void {
  const url = new URL(value);

  if (url.protocol !== "https:" && !isLoopbackHttpUrl(url)) {
    throw new Error(`${label} must use HTTPS, except loopback HTTP for local development.`);
  }
}

export function getConfig(): ExternalApiAuthPluginConfig {
  const runtimeConfig = globalThis.__METATELL_EXTERNAL_API_AUTH_PLUGIN_CONFIG__;
  const clientId = getRequiredValue(
    runtimeConfig?.clientId ?? buildTimeConfig.clientId,
    "METATELL_CLIENT_ID"
  );
  const externalApiBaseUrl =
    normalizeUrl(
      getRequiredValue(
        runtimeConfig?.externalApiBaseUrl ?? buildTimeConfig.externalApiBaseUrl,
        "METATELL_EXTERNAL_API_BASE_URL"
      )
    );

  assertAllowedExternalApiBaseUrl(externalApiBaseUrl, "METATELL_EXTERNAL_API_BASE_URL");

  return {
    clientId,
    externalApiBaseUrl
  };
}
