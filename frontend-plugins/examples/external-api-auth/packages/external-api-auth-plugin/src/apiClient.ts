import {
  NotAuthenticatedError,
  PluginApiClientNotFoundError,
  getPluginApiToken
} from "@urth/metatell-sdk/auth";
import { getConfig } from "./config.js";

const counterPath = "/api/metatell/counter";
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const MAX_ERROR_RESPONSE_TEXT_LENGTH = 500;

export type MetatellCounterResponse = {
  ok: boolean;
  subject: string;
  count: number;
};

export class ExternalApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseText: string
  ) {
    super(message);
    this.name = "ExternalApiRequestError";
  }
}

async function readBoundedResponseText(response: Response): Promise<string> {
  const text = await response.text();

  if (text.length <= MAX_ERROR_RESPONSE_TEXT_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_ERROR_RESPONSE_TEXT_LENGTH)}...`;
}

export async function fetchMetatellCounter(): Promise<MetatellCounterResponse> {
  const config = getConfig();
  const token = await getPluginApiToken(config.clientId);
  const response = await fetch(`${config.externalApiBaseUrl}${counterPath}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: "GET",
    signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new ExternalApiRequestError(
      `External API request failed with status ${response.status}`,
      response.status,
      await readBoundedResponseText(response)
    );
  }

  return response.json() as Promise<MetatellCounterResponse>;
}

export function describeAuthError(error: unknown): string {
  if (error instanceof NotAuthenticatedError) {
    return "The user is not authenticated in metatell.";
  }

  if (error instanceof PluginApiClientNotFoundError) {
    return "The metatell plugin API client is unavailable.";
  }

  if (error instanceof ExternalApiRequestError) {
    return `The external API rejected the request: ${error.status}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown authentication error.";
}
