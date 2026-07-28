import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import { env } from "./config/env.js";
import { registerRoutes } from "./routes/index.js";

export interface BuildAppOptions {
  /** Override the logger for testing (pass false to disable, or a custom logger). */
  logger?: boolean | object;
}

/**
 * Fastify app factory.
 *
 * Separated from the server entry point (index.ts) so tests can call `buildApp()`
 * directly without binding a real port — the pattern recommended in Fastify docs.
 *
 * Cross-cutting concerns registered here:
 *  - CORS        — locked to CORS_ORIGIN env var
 *  - Helmet      — secure HTTP headers
 *  - Rate limit  — global 100 req / 1 min per IP
 *  - Sensible    — standardised HTTP error helpers
 *  - pino logger — structured JSON in production, pretty in development
 *  - Error handler — never leaks stack traces in production
 *
 * Route plugins are registered via registerRoutes().
 */
export async function buildApp(opts: BuildAppOptions = {}): Promise<FastifyInstance> {
  const isProd = env.NODE_ENV === "production";
  const isTest = env.NODE_ENV === "test";

  // ── Logger ─────────────────────────────────────────────────────────────────
  // Use pino-pretty in dev, raw JSON in prod (consumed by log aggregators).
  // In test, caller can pass `logger: false` to silence output.
  const loggerConfig =
    opts.logger !== undefined
      ? opts.logger
      : isTest
        ? false
        : isProd
          ? { level: env.LOG_LEVEL }
          : {
              level: env.LOG_LEVEL,
              transport: {
                target: "pino-pretty",
                options: {
                  translateTime: "HH:MM:ss Z",
                  ignore: "pid,hostname",
                  colorize: true,
                },
              },
            };

  const app = Fastify({ logger: loggerConfig });

  // ── CORS ─────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // ── Helmet (secure headers) ───────────────────────────────────────────────
  await app.register(helmet, {
    // CSP is deliberately relaxed here; tighten per-route if serving HTML.
    contentSecurityPolicy: false,
  });

  // ── Rate limiting ─────────────────────────────────────────────────────────
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    // Phase 4: tighten login + forgot-password to 10 req / 15 min per IP.
    errorResponseBuilder(_req, context) {
      return {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Retry in ${Math.ceil(context.ttl / 1000)} seconds.`,
        statusCode: 429,
      };
    },
  });

  // ── Sensible (standardised HTTP error helpers) ────────────────────────────
  await app.register(sensible);

  // ── Central error handler ─────────────────────────────────────────────────
  // Never leak stack traces to the client in production.
  app.setErrorHandler(function (error: any, _req, reply) {
    const statusCode = error.statusCode ?? 500;

    // Always log the real error server-side.
    if (statusCode >= 500) {
      this.log.error({ err: error }, "Unhandled server error");
    } else {
      this.log.warn({ err: error }, "Client error");
    }

    const body: Record<string, unknown> = {
      error: error.name ?? "Error",
      message: error.message,
      statusCode,
    };

    // Never expose internal error details (stack, cause) to the client in prod.
    if (!isProd && error.stack) {
      body.stack = error.stack;
    }

    reply.status(statusCode).send(body);
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  await registerRoutes(app);

  return app;
}
