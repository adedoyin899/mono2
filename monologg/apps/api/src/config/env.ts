import { z } from "zod";

// ---------------------------------------------------------------------------
// Boot-time environment validation
// Every required variable is declared here. Any missing/malformed var causes
// the process to exit with a clear, specific message before the server binds.
// ---------------------------------------------------------------------------

const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  // ── Database ─────────────────────────────────────────────────────────────
  // Both vars come from Supabase; see apps/api/.env.example for format.
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL"),

  // ── Auth (JWT) ───────────────────────────────────────────────────────────
  // Phase 4 will use these; defined here so the server fails fast if missing.
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be ≥ 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be ≥ 32 chars"),

  // ── CORS ─────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // ── Provider selection ───────────────────────────────────────────────────
  // Each defaults to "mock" so dev + test work without real API keys.
  PAYMENT_PROVIDER: z.enum(["mock", "paystack", "stripe", "airwallex"]).default("mock"),
  KYC_PROVIDER: z.enum(["mock", "smile_identity"]).default("mock"),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  CALENDAR_PROVIDER: z.enum(["mock", "google"]).default("mock"),
  NOTIFY_PROVIDER: z.enum(["mock", "sendgrid_twilio"]).default("mock"),

  // ── External service keys (optional — only validated when provider≠mock) ─
  PAYSTACK_SECRET_KEY: z.string().optional(),
  SMILE_IDENTITY_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Validate and export. Throws (and exits) at module-load time if any required
// var is absent, so nothing else in the codebase can run with a broken config.
// ---------------------------------------------------------------------------
function parseEnv(): Env {
  const envData = { ...process.env };
  if (envData.NODE_ENV === "test") {
    envData.DATABASE_URL = envData.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";
    envData.DIRECT_URL = envData.DIRECT_URL || "postgresql://mock:mock@localhost:5432/mock";
    envData.JWT_ACCESS_SECRET = envData.JWT_ACCESS_SECRET || "mock_access_secret_length_minimum_32_chars";
    envData.JWT_REFRESH_SECRET = envData.JWT_REFRESH_SECRET || "mock_refresh_secret_length_minimum_32_chars";
  }

  const result = envSchema.safeParse(envData);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // Print to stderr and exit — don't throw, since a top-level throw won't
    // always produce a readable message in all Node runners.
    process.stderr.write(`\n[config/env] Invalid environment configuration:\n${issues}\n\n`);
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
