// Phase 12B: Real SupabaseAuthProvider.
// Used in SUPABASE_MODE=real (production).
// Verifies Supabase-issued JWTs using SUPABASE_JWT_SECRET (HS256).
//
// Supabase uses HS256 by default. The JWT secret is found in:
//   Supabase Dashboard → Project Settings → API → JWT Secret
//
// Alternative (asymmetric / RS256): If your project uses the asymmetric key
// option, you'd fetch the JWKS from https://<project>.supabase.co/auth/v1/.well-known/jwks.json
// and verify using jsonwebtoken's { algorithms: ["RS256"] } + a PEM-formatted public key
// extracted from the JWKS. HS256 is simpler and the Supabase default.

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { SupabaseAuthProvider, SupabaseJwtClaims } from "./supabaseAuth.interface.js";

export const realSupabaseAuthProvider: SupabaseAuthProvider = {
  async verifyJwt(token: string): Promise<SupabaseJwtClaims> {
    const secret = env.SUPABASE_JWT_SECRET;
    if (!secret) {
      throw new Error(
        "[supabaseAuth.real] SUPABASE_JWT_SECRET is not set — cannot verify Supabase JWT. " +
          "Set it in apps/api/.env when SUPABASE_MODE=real.",
      );
    }

    try {
      const payload = jwt.verify(token, secret, {
        algorithms: ["HS256"],
        audience: "authenticated",
      }) as SupabaseJwtClaims;

      if (!payload.sub || !payload.email) {
        throw new Error("Missing required claims (sub, email) in Supabase JWT");
      }

      return {
        sub: payload.sub,
        email: payload.email,
        aud: payload.aud,
        exp: payload.exp,
      };
    } catch (err) {
      // Re-throw with a clearer prefix so logs distinguish Supabase JWT errors
      // from our own app JWT errors (same library, different signing keys).
      const message = err instanceof Error ? err.message : "Unknown JWT error";
      throw new Error(`[supabaseAuth.real] JWT verification failed: ${message}`);
    }
  },
};
