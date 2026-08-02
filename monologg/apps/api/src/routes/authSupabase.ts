// Phase 12B: Supabase Auth server-side identity bridge.
//
// Endpoints:
//   POST /api/v1/auth/session/sync  — verifies a Supabase JWT, creates/links an
//     app User, issues an app JWT pair, writes AuthEvent audit row, fires notifications.
//   POST /api/v1/auth/otp/request   — server-side rate-limit gate before the client
//     calls supabase.auth.signInWithOtp(). 1 request per email per 60 seconds.
//
// The existing requireAuth / requireRole / requireOwner middleware is UNCHANGED.
// All app logic sees only a standard app JWT regardless of which sign-in path was used.

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { prisma } from "../db/client.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  hashToken,
} from "../services/auth.js";
import { notifyProvider } from "../providers/index.js";
import { supabaseAuthProvider } from "../providers/index.js";
import { cacheProvider } from "../providers/cache.js";
import { CURRENT_TERMS_VERSION } from "@monologg/types";

// ── Validation schemas ──────────────────────────────────────────────────────

const sessionSyncSchema = z.object({
  // The Supabase-issued access token from the client's auth session
  supabaseAccessToken: z.string().min(1, "supabaseAccessToken is required"),
  // The intended user type — collected on the sign-in form before the OAuth/OTP flow
  userType: z.enum(["TALENT", "CLIENT"]),
  // Human-readable name (from Supabase user metadata or form input)
  name: z.string().min(1, "name is required").optional(),
  // Which Supabase provider was used — determines AuthEvent.provider
  provider: z.enum(["GOOGLE", "MAGIC_LINK", "EMAIL_OTP"]).default("GOOGLE"),
});

const otpRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// OTP rate-limit: 1 request per email per 60 seconds.
// Uses the same cacheProvider TTL pattern as auth:reset and auth:verify tokens.
const OTP_RATE_LIMIT_TTL_SECONDS = 60;

// Hash an IP for the AuthEvent audit trail (PII-safe — not reversible without the original IP).
function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex");
}

export async function supabaseAuthRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /api/v1/auth/session/sync ─────────────────────────────────────────
  // Called by the client's /auth/callback page after any successful Supabase Auth sign-in.
  // Rate-limit: 10/min (inherits global limit); no per-route tightening needed since
  // the Supabase JWT verification is the expensive gate (token must be real + unexpired).
  app.post(
    "/api/v1/auth/session/sync",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = sessionSyncSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const { supabaseAccessToken, userType, name, provider } = parsed.data;

      // ── 1. Verify the Supabase JWT ───────────────────────────────────────
      let claims: { sub: string; email: string };
      try {
        claims = await supabaseAuthProvider.verifyJwt(supabaseAccessToken);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid token";
        return reply.status(401).send({
          error: "Unauthorized",
          message: `Invalid Supabase token: ${message}`,
          statusCode: 401,
        });
      }

      const { sub: supabaseUserId, email } = claims;
      const ipHash = hashIp(request.ip);
      const userAgent = (request.headers["user-agent"] ?? "").slice(0, 512);

      // ── 2. Find or create the app User ──────────────────────────────────
      // Lookup order: exact supabaseUserId → email match.
      // Never creates a duplicate — the email unique constraint catches any race.
      let appUser = await prisma.user.findFirst({
        where: { OR: [{ supabaseUserId }, { email }] },
        include: { creator: true, client: true },
      });

      let eventType: string;
      let isNewUser: boolean;

      if (!appUser) {
        // ── New user: create User + Creator/Client + TermsAcceptance ────────
        eventType = "signup_success";
        isNewUser = true;

        const effectiveName = name ?? email.split("@")[0];
        const referralCode = `REF-${effectiveName.replace(/\s+/g, "").toUpperCase()}-${randomUUID().slice(0, 4)}`;
        const dummyPasswordHash = await hashPassword(`supabase-auth-${randomUUID()}`);

        appUser = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              passwordHash: dummyPasswordHash,
              // passwordSet stays false — Supabase Auth users authenticate via Supabase,
              // not the password path. The existing /auth/login refuses passwordSet=false
              // accounts (same as AUTO_CHECKOUT), which is the correct behavior here.
              passwordSet: false,
              userType,
              emailVerified: true, // Supabase verified the email as part of sign-in
              authProvider: provider,
              supabaseUserId,
              isNewUser: true,
            },
          });

          if (userType === "TALENT") {
            await tx.creator.create({
              data: {
                userId: newUser.id,
                name: effectiveName,
                location: "",
                niche: "CONTENT_CREATOR",
                referralCode,
                mediaKit: { create: {} },
              },
            });
          } else {
            await tx.client.create({
              data: {
                userId: newUser.id,
                name: effectiveName,
                location: "",
              },
            });
          }

          await tx.termsAcceptance.create({
            data: { userId: newUser.id, version: CURRENT_TERMS_VERSION },
          });

          return tx.user.findUniqueOrThrow({
            where: { id: newUser.id },
            include: { creator: true, client: true },
          });
        });

        // Welcome email with "Complete your profile" CTA
        const ctaUrl = userType === "TALENT"
          ? `${process.env.CORS_ORIGIN ?? "http://localhost:5173"}/onboarding`
          : `${process.env.CORS_ORIGIN ?? "http://localhost:5173"}/onboarding/client`;

        await notifyProvider.email(email, "welcome_supabase", {
          name: effectiveName,
          userType,
          provider,
          ctaUrl,
        });
      } else if (!appUser.supabaseUserId) {
        // ── Existing user by email, not yet linked ───────────────────────────
        // Link by setting supabaseUserId. Update authProvider to reflect the Supabase path.
        eventType = "linked_existing_account";
        isNewUser = false;

        appUser = await prisma.user.update({
          where: { id: appUser.id },
          data: {
            supabaseUserId,
            authProvider: provider,
            emailVerified: true, // Supabase confirmed the email
          },
          include: { creator: true, client: true },
        });
      } else {
        // ── Already-linked user: regular sign-in ─────────────────────────────
        eventType = "signin_success";
        isNewUser = appUser.isNewUser;
      }

      // ── 3. Issue app JWT pair (same as /auth/login — zero middleware changes) ─
      const accessToken = generateAccessToken({
        userId: appUser.id,
        userType: appUser.userType,
        email: appUser.email,
      });

      const tokenJti = randomUUID();
      const refreshToken = generateRefreshToken(appUser.id, tokenJti);

      await prisma.refreshToken.create({
        data: {
          userId: appUser.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // ── 4. Write AuthEvent audit row ─────────────────────────────────────
      await prisma.authEvent.create({
        data: {
          userId: appUser.id,
          provider,
          event: eventType,
          ipHash,
          userAgent,
        },
      });

      // ── 5. SIGNIN_NOTICE notification ─────────────────────────────────────
      // Fires on every Supabase Auth sign-in (new + returning) — security notice.
      const displayName = appUser.creator?.name ?? appUser.client?.name ?? email;
      await notifyProvider.email(email, "signin_notice", {
        name: displayName,
        provider,
        userAgent,
      });
      await notifyProvider.inApp(appUser.id, {
        kind: "SIGNIN_NOTICE",
        message: `New sign-in via ${provider.replace("_", " ").toLowerCase()}. Wasn't you? Secure your account.`,
        link: `${process.env.CORS_ORIGIN ?? "http://localhost:5173"}/settings`,
        provider,
      });

      return reply.status(eventType === "signup_success" ? 201 : 200).send({
        accessToken,
        refreshToken,
        user: {
          userId: appUser.id,
          email: appUser.email,
          userType: appUser.userType,
          isNewUser,
        },
      });
    },
  );

  // ── POST /api/v1/auth/otp/request ──────────────────────────────────────────
  // Server-side rate-limit gate before the client fires supabase.auth.signInWithOtp().
  // Returns 200 if the request is allowed, 429 if within the cooldown window.
  // The client MUST call this first; the actual OTP send happens client-side.
  app.post(
    "/api/v1/auth/otp/request",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = otpRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const { email } = parsed.data;
      const cacheKey = `auth:otp-rate:${email}`;

      // Check if a request was made within the last 60 seconds
      const existing = await cacheProvider.get(cacheKey);
      if (existing) {
        return reply.status(429).send({
          error: "Too Many Requests",
          message: "OTP already sent. Please wait 60 seconds before requesting another.",
          statusCode: 429,
          retryAfterSeconds: OTP_RATE_LIMIT_TTL_SECONDS,
        });
      }

      // Mark this email as rate-limited for the next 60 seconds
      await cacheProvider.set(cacheKey, "1", OTP_RATE_LIMIT_TTL_SECONDS);

      return reply.status(200).send({ success: true });
    },
  );
}
