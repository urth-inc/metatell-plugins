import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  getBearerToken,
  TokenVerificationUnavailableError,
  UnauthorizedError,
  verifyMetatellPluginToken
} from "./auth.js";
import { getConfig } from "./config.js";

const counterPath = "/api/metatell/counter";
const DEFAULT_PORT = 3000;
const counters = new Map<string, number>();

type ErrorLogDetails = {
  name?: string;
  message: string;
  code?: string;
  hostname?: string;
  cause?: ErrorLogDetails;
};

function getErrorLogDetails(error: unknown): ErrorLogDetails {
  if (!(error instanceof Error)) {
    return {
      message: String(error)
    };
  }

  const errorWithNodeFields = error as Error & {
    cause?: unknown;
    code?: unknown;
    hostname?: unknown;
  };
  const details: ErrorLogDetails = {
    message: error.message,
    name: error.name
  };

  if (typeof errorWithNodeFields.code === "string") {
    details.code = errorWithNodeFields.code;
  }

  if (typeof errorWithNodeFields.hostname === "string") {
    details.hostname = errorWithNodeFields.hostname;
  }

  if (errorWithNodeFields.cause !== undefined) {
    details.cause = getErrorLogDetails(errorWithNodeFields.cause);
  }

  return details;
}

export function createApp() {
  const app = new Hono();
  const config = getConfig();

  app.use(
    counterPath,
    cors({
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "OPTIONS"],
      maxAge: 600,
      origin: config.corsOrigins
    })
  );

  app.get(counterPath, async (context) => {
    const token = getBearerToken(context.req.header("Authorization"));
    const claims = await verifyMetatellPluginToken(token);
    // This in-memory sample counter is synchronous and process-local.
    const count = (counters.get(claims.sub) ?? 0) + 1;

    counters.set(claims.sub, count);

    return context.json({
      ok: true,
      subject: claims.sub,
      count
    });
  });

  app.notFound((context) =>
    context.json(
      {
        error: "Not Found"
      },
      404
    )
  );

  app.onError((error, context) => {
    if (error instanceof UnauthorizedError) {
      return context.json(
        {
          error: error.message
        },
        401
      );
    }

    if (error instanceof TokenVerificationUnavailableError) {
      console.error("Token verification is unavailable.", {
        error: getErrorLogDetails(error),
        request: {
          method: context.req.method,
          path: context.req.path
        }
      });

      return context.json(
        {
          error: error.message
        },
        503
      );
    }

    console.error("Unhandled backend error.", {
      error: getErrorLogDetails(error),
      request: {
        method: context.req.method,
        path: context.req.path
      }
    });

    return context.json(
      {
        error: "Internal Server Error"
      },
      500
    );
  });

  return app;
}

export const app = createApp();

export function handleRequest(request: Request): Response | Promise<Response> {
  return app.fetch(request);
}

export function createAppServer(port = Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10)) {
  return serve({
    fetch: app.fetch,
    port
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10);
  createAppServer(port);
  console.log(`external-api-auth-backend listening on port ${port}`);
}
