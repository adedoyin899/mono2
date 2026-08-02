import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Logo } from "../components/ui/Logo";
import { supabase } from "../../lib/supabase";
import { apiClient } from "../../lib/api-client";

/**
 * /auth/callback — OAuth / magic-link callback landing page.
 *
 * After Supabase Auth redirects the browser here, this component:
 *  1. Retrieves the Supabase session (supabase.auth.getSession or exchangeCodeForSession)
 *  2. Sends the Supabase access token to POST /api/v1/auth/session/sync
 *  3. On success: routes to the correct home screen (TALENT → /dashboard, CLIENT → /client)
 *  4. On failure: routes to /auth with an error message
 *
 * Shows a clean loading state while the sync completes.
 * Public route — no RequireAuth wrapper (this IS how a Supabase user gets their session).
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false); // prevent double-run in React Strict Mode

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        // The userType was packed into the state param by AuthFlow before the
        // OAuth redirect. Supabase echoes it back in the URL hash after the
        // callback. We fall back to "TALENT" if it's absent (e.g. magic-link).
        const userTypeParam = searchParams.get("userType");
        const userType: "TALENT" | "CLIENT" =
          userTypeParam === "CLIENT" ? "CLIENT" : "TALENT";

        if (!supabase) {
          // ALL-MOCK mode: no real Supabase client — should not be reachable
          // unless someone navigates here directly. Route back to auth.
          navigate("/auth", { replace: true });
          return;
        }

        // Exchange the OAuth code for a session. Supabase puts the code in
        // the URL hash/query; getSession() handles both PKCE and implicit flows.
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !data.session) {
          throw new Error(sessionError?.message ?? "No Supabase session found");
        }

        const supabaseAccessToken = data.session.access_token;
        const name = data.session.user.user_metadata?.["name"] as string | undefined;

        // Determine which Supabase provider was used
        const provider = data.session.user.app_metadata?.["provider"];
        const syncProvider =
          provider === "google" ? "GOOGLE" : provider === "email" ? "EMAIL_OTP" : "MAGIC_LINK";

        // Sync with our app backend — creates/links the User, issues an app JWT
        const user = await apiClient.sessionSync(supabaseAccessToken, userType, {
          name,
          provider: syncProvider,
        });

        // Navigate to the appropriate home screen
        navigate(user.userType === "CLIENT" ? "/client" : "/dashboard", { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign-in failed";
        setError(message);
        // After a short delay, redirect back to the auth page with the error
        setTimeout(() => navigate("/auth", { replace: true }), 2500);
      }
    })();
  }, [navigate, searchParams]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--color-bg-canvas)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 text-center max-w-sm px-6"
      >
        <Logo className="h-6 w-auto" style={{ color: "var(--color-text-primary)" }} />

        {error ? (
          <>
            <p className="text-sm font-body" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
            <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
              Redirecting you back…
            </p>
          </>
        ) : (
          <>
            {/* Animated loading dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--color-text-tertiary)" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
              Finishing sign in…
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
