import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { useTheme } from "../Root";
import { apiClient } from "../../lib/api-client";
import { supabase, SUPABASE_MODE } from "../../lib/supabase";
import { appStateSync } from "../../lib/state-sync";
import { CURRENT_TERMS_VERSION } from "@monologg/types";
import { Eye, EyeOff, ChevronLeft, Shield, Sun, Moon, Check, Mail, KeyRound } from "lucide-react";
import { WebGLHeroCanvas } from "../components/ui/WebGLHeroCanvas";

type View = "splash" | "register" | "login" | "forgot" | "otp_entry" | "magic_sent";
type Role = "talent" | "client";

export function AuthFlow() {
  const [view, setView] = useState<View>("splash");
  const [role, setRole] = useState<Role>("talent");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Phase 12B: magic-link + OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [showMagicLinkInput, setShowMagicLinkInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.register({
        email,
        password,
        name,
        userType: role === "talent" ? "TALENT" : "CLIENT",
        acceptedTermsVersion: CURRENT_TERMS_VERSION,
      });
      navigate(role === "talent" ? "/onboarding" : "/onboarding/client");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await apiClient.login(email, password);
      navigate(user.userType === "CLIENT" ? "/client" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.forgotPassword(email);
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Phase 12B: Supabase Auth handlers ──────────────────────────────────────

  /** Real Google OAuth via Supabase — fires the browser redirect. */
  const handleSupabaseGoogle = async () => {
    setError(null);
    if (!supabase) {
      setError("Google Sign-In isn't configured in this environment yet.");
      return;
    }
    setGoogleAuthLoading(true);
    const appUrl = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback`,
        // Echo userType back through the state param so /auth/callback knows which role
        queryParams: { state: btoa(JSON.stringify({ userType: role === "talent" ? "TALENT" : "CLIENT" })) },
      },
    });
    // On success the browser navigates away to Google immediately; only errors
    // return control here, so it's safe to always clear the loading flag.
    if (oauthError) setError(oauthError.message);
    setGoogleAuthLoading(false);
  };

  /** Magic link — sends an email with a sign-in link, then shows a confirmation. */
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      // Mock mode: just show a toast-style confirmation
      console.log(`[auth mock] Magic link sent to ${magicLinkEmail}`);
      setView("magic_sent" as View);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const appUrl = window.location.origin;
      const userTypeParam = role === "talent" ? "TALENT" : "CLIENT";
      const { error: mlError } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?userType=${userTypeParam}`,
          shouldCreateUser: true,
        },
      });
      if (mlError) throw new Error(mlError.message);
      setView("magic_sent" as View);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link.");
    } finally {
      setSubmitting(false);
    }
  };

  /** OTP step 1: request OTP (server rate-limit check + supabase.auth.signInWithOtp). */
  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Server-side rate-limit gate (1/60s)
      await apiClient.requestOtp(otpEmail);
      if (supabase) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: otpEmail,
          options: { shouldCreateUser: true },
        });
        if (otpError) throw new Error(otpError.message);
      } else {
        console.log(`[auth mock] OTP requested for ${otpEmail}`);
      }
      setView("otp_entry" as View);
      // Start 60s resend cooldown
      setOtpResendCooldown(60);
      const timer = setInterval(() => {
        setOtpResendCooldown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  /** OTP step 2: verify the 6-digit code then sync with our backend. */
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const userType = role === "talent" ? "TALENT" : "CLIENT";
      if (supabase) {
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email: otpEmail,
          token: otpCode,
          type: "email",
        });
        if (verifyError) throw new Error(verifyError.message);
        if (!verifyData.session) throw new Error("No session returned after OTP verification.");
        const user = await apiClient.sessionSync(
          verifyData.session.access_token,
          userType,
          { provider: "EMAIL_OTP" },
        );
        navigate(
          user.isNewUser
            ? user.userType === "CLIENT" ? "/onboarding/client" : "/onboarding"
            : user.userType === "CLIENT" ? "/client" : "/dashboard",
        );
      } else {
        // Mock mode: any 6-digit code works
        if (otpCode.length !== 6) throw new Error("Enter the 6-digit code.");
        const user = await apiClient.sessionSync("", userType, { provider: "EMAIL_OTP" });
        navigate(
          user.isNewUser
            ? user.userType === "CLIENT" ? "/onboarding/client" : "/onboarding"
            : user.userType === "CLIENT" ? "/client" : "/dashboard",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    canvas: { background: "var(--color-bg-canvas)" } as React.CSSProperties,
    surface: { background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
    primary: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    /* gold text on white fails WCAG AA; use underlined primary text for text links */
    gold: { color: "var(--color-text-primary)", textDecoration: "underline", textDecorationColor: "var(--color-gold-primary)", textUnderlineOffset: "3px" } as React.CSSProperties,
  };

  return (
    <div
      className={`${role === "client" ? "role-client" : "role-talent"} min-h-screen flex flex-col relative overflow-hidden`}
      style={s.canvas}
    >
      <WebGLHeroCanvas opacityMultiplier={0.05} />

      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-5 md:px-8 relative z-20" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <Link to="/" aria-label="Monologg"><Logo className="h-5 w-auto" style={s.primary} /></Link>
        <button
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-11 h-11 rounded-[var(--radius-full)] flex items-center justify-center border transition-colors active:scale-[0.97]"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>

      <div className="flex-1 flex relative z-10">
        {/* Left panel — Grainy Gradient Showcase Variant (performer/client brand colors & noise) */}
        <div
          className="hidden lg:flex flex-col justify-between p-10 xl:p-12 w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden rounded-[28px] m-4 border shadow-2xl transition-all duration-500"
          style={{
            background:
              role === "talent"
                ? "radial-gradient(circle at 50% 38%, rgba(241, 48, 48, 0.95) 0%, rgba(220, 38, 38, 0.65) 28%, rgba(123, 0, 254, 0.4) 55%, rgba(10, 6, 18, 0.98) 80%), #0A0612"
                : "radial-gradient(circle at 50% 38%, rgba(123, 0, 254, 0.95) 0%, rgba(147, 51, 234, 0.65) 28%, rgba(241, 48, 48, 0.4) 55%, rgba(10, 6, 18, 0.98) 80%), #0A0612",
            borderColor: "rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* SVG Noise Grain Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-overlay"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="auth-noise-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#auth-noise-grain)" />
          </svg>

          {/* Luminous Glow Auras */}
          <div
            className="absolute top-[22%] left-[22%] w-[300px] h-[300px] rounded-full blur-[70px] pointer-events-none transition-colors duration-700"
            style={{
              background: role === "talent" ? "rgba(241, 48, 48, 0.55)" : "rgba(123, 0, 254, 0.55)",
            }}
          />
          <div
            className="absolute bottom-[10%] right-[10%] w-[260px] h-[260px] rounded-full blur-[80px] pointer-events-none transition-colors duration-700"
            style={{
              background: role === "talent" ? "rgba(123, 0, 254, 0.35)" : "rgba(241, 48, 48, 0.35)",
            }}
          />

          {/* Card Top Brand & Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" aria-label="Monologg">
              <Logo className="h-6 w-auto text-white" />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md border border-white/15">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  role === "talent" ? "bg-[#F13030]" : "bg-[#A855F7]"
                }`}
              />
              {role === "talent" ? "Performer portal" : "Client portal"}
            </span>
          </div>

          {/* Card Hero Content — Dynamic Copy based on Role */}
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-white/75 font-body mb-2">
                Let's help you
              </div>
              <h2 className="font-display text-3xl xl:text-[40px] font-bold leading-[1.08] tracking-[-0.02em] text-white">
                {role === "talent"
                  ? "Find gigs and finish your projects"
                  : "Find performers and finish your projects"}
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              {(role === "talent"
                ? [
                    "Free to join — zero subscription fees",
                    "Proprietary Thespian AI vibe scanner in 30s",
                    "Get paid the same day deliverables are approved",
                    "Full FINCRA escrow protection on every booking",
                  ]
                : [
                    "Africa's premier verified performer network",
                    "Brief-to-booking in 30 seconds",
                    "Automated escrow milestone releases",
                    "Full FINCRA escrow protection on every booking",
                  ]
              ).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white/15 border border-white/20 text-white">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-body text-white/90 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — forms */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px]">
            {/* Mobile Grainy Gradient Banner */}
            <div
              className="lg:hidden w-full mb-6 p-5 rounded-2xl relative overflow-hidden border shadow-lg text-white"
              style={{
                background:
                  role === "talent"
                    ? "radial-gradient(circle at 50% 35%, rgba(241, 48, 48, 0.95) 0%, rgba(220, 38, 38, 0.65) 30%, rgba(123, 0, 254, 0.4) 60%, rgba(10, 6, 18, 0.98) 85%), #0A0612"
                    : "radial-gradient(circle at 50% 35%, rgba(123, 0, 254, 0.95) 0%, rgba(147, 51, 234, 0.65) 30%, rgba(241, 48, 48, 0.4) 60%, rgba(10, 6, 18, 0.98) 85%), #0A0612",
                borderColor: "rgba(255, 255, 255, 0.12)",
              }}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay"
                xmlns="http://www.w3.org/2000/svg"
              >
                <filter id="auth-noise-grain-mobile">
                  <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#auth-noise-grain-mobile)" />
              </svg>
              <div className="relative z-10 space-y-1.5">
                <div className="text-[11px] font-semibold tracking-wide text-white/75 font-body">
                  Let's help you
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold leading-snug tracking-tight text-white">
                  {role === "talent"
                    ? "Find gigs and finish your projects"
                    : "Find performers and finish your projects"}
                </h2>
              </div>
            </div>

            {/* Wise-Style Segmented Role Switcher — hidden on Register, which has its own "I'm joining as" toggle */}
            {view !== "register" && (
              <div className="flex p-1 mb-8 rounded-full bg-[var(--color-bg-surface-2)] border border-[var(--color-hairline)]">
                <button
                  type="button"
                  onClick={() => setRole("talent")}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                    role === "talent"
                      ? "bg-[#F13030] text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Performer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                    role === "client"
                      ? "bg-[#7B00FE] text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Client
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── Splash ── */}
              {view === "splash" && (
                <motion.div
                  key="splash"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="flex flex-col"
                >
                  <h1 className="font-display text-[34px] sm:text-[36px] font-bold leading-[1.08] tracking-[-0.02em] mb-2 text-[var(--color-text-primary)]">
                    Welcome to Monologg
                  </h1>
                  <p className="text-base font-body mb-8 text-[var(--color-text-secondary)]">
                    Sign in or create a free {role === "talent" ? "Performer" : "Client"} account to continue.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant={role === "talent" ? "red" : "purple"}
                      className="w-full h-12 text-sm font-bold shadow-lg"
                      onClick={() => setView("register")}
                    >
                      Create Free Account
                    </Button>
                    <Button
                      variant="outline-pill"
                      className="w-full h-12 text-sm font-bold"
                      onClick={() => setView("login")}
                    >
                      Sign In
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Register ── */}
              {view === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <button onClick={() => setView("splash")} className="mb-6 -ml-1 flex items-center gap-1 text-sm font-body" style={s.secondary}>
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="font-display text-[32px] leading-[1.08] tracking-[-0.02em] mb-2" style={s.primary}>Create account</h2>
                  <p className="text-[15px] font-body mb-7" style={s.secondary}>Join the brief-to-booking pipeline.</p>

                  {/* Role toggle */}
                  <p className="text-xs font-semibold tracking-normal mb-2.5 font-body" style={s.secondary}>I'm joining as</p>
                  <div
                    className="flex p-1 rounded-[var(--radius-lg)] mb-6"
                    style={{ background: "var(--color-bg-surface-2)", border: "1px solid var(--color-hairline)" }}
                  >
                    {(["talent", "client"] as Role[]).map(r => {
                      const active = role === r;
                      const accent = r === "talent" ? "var(--color-red)" : "var(--color-purple)";
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className="flex-1 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold font-body transition-all active:scale-[0.98]"
                          style={{
                            background: active ? "var(--color-bg-surface)" : "transparent",
                            color: active ? accent : "var(--color-text-secondary)",
                            boxShadow: active ? "var(--shadow-card)" : "none",
                          }}
                        >
                          {r === "talent" ? "Performer" : "Client"}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleSupabaseGoogle}
                    disabled={submitting || googleAuthLoading}
                    className="w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center justify-center gap-3 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99] shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    {googleAuthLoading ? "Redirecting to Google…" : "Continue with Google"}
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[var(--color-hairline)]" />
                    <span className="text-xs font-body tracking-normal text-[var(--color-text-tertiary)]">Or with email</span>
                    <div className="flex-1 h-px bg-[var(--color-hairline)]" />
                  </div>

                  <form onSubmit={handleRegister} className="flex flex-col gap-3">
                    <Input
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <div className="relative">
                      <Input
                        type={showPwd ? "text" : "password"}
                        placeholder="Create Password (min. 8 chars)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={s.secondary}
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <label className="flex items-start gap-3 mt-2 cursor-pointer">
                      <div
                        className="relative w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border"
                        style={{
                          background: agreed ? "var(--color-gold-primary)" : "var(--color-bg-elevated)",
                          borderColor: agreed ? "var(--color-gold-primary)" : "var(--color-hairline)",
                        }}
                        onClick={() => setAgreed(!agreed)}
                      >
                        {agreed && <Check className="w-3 h-3" style={{ color: "#1A1200" }} />}
                      </div>
                      <span className="text-xs font-body leading-relaxed" style={s.secondary}>
                        I agree to the{" "}
                        <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="hover:underline" style={s.gold}>Terms of Service</a>{" "}
                        and{" "}
                        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline" style={s.gold}>Privacy Policy</a>
                      </span>
                    </label>

                    {error && (
                      <p className="text-xs font-body" style={{ color: "var(--color-error)" }}>{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 mt-2"
                      disabled={!agreed || !name || !email || password.length < 8 || submitting}
                    >
                      {submitting ? "Creating account…" : role === "talent" ? "Create My Performer Profile" : "Create Client Account"}
                    </Button>
                  </form>

                  <p className="text-sm text-center mt-6 font-body" style={s.secondary}>
                    Already have an account?{" "}
                    <button className="hover:underline font-medium" style={s.gold} onClick={() => setView("login")}>
                      Sign In
                    </button>
                  </p>
                </motion.div>
              )}

              {/* ── Login ── */}
              {view === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <button onClick={() => setView("splash")} className="mb-6 -ml-1 flex items-center gap-1 text-sm font-body" style={s.secondary}>
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="font-display text-[32px] leading-[1.08] tracking-[-0.02em] mb-2" style={s.primary}>Welcome back</h2>
                  <p className="text-[15px] font-body mb-6" style={s.secondary}>Sign in to manage your bookings.</p>

                  <button
                    type="button"
                    onClick={handleSupabaseGoogle}
                    disabled={submitting || googleAuthLoading}
                    className="w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center justify-center gap-3 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99] shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    {googleAuthLoading ? "Redirecting to Google…" : "Sign in with Google"}
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[var(--color-hairline)]" />
                    <span className="text-xs font-body tracking-normal text-[var(--color-text-tertiary)]">Or sign in with email</span>
                    <div className="flex-1 h-px bg-[var(--color-hairline)]" />
                  </div>

                  <form onSubmit={handleLogin} className="flex flex-col gap-3">
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <div className="relative">
                      <Input
                        type={showPwd ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={s.secondary}
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-xs font-body hover:underline"
                        style={s.secondary}
                        onClick={() => setView("forgot")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs font-body" style={{ color: "var(--color-error)" }}>{error}</p>
                    )}
                    <Button type="submit" className="w-full h-12 mt-2" disabled={submitting}>
                      {submitting ? "Signing in…" : "Sign In"}
                    </Button>
                  </form>

                  <div
                    className="my-6 flex items-center gap-3"
                    style={{ borderColor: "var(--color-hairline)" }}
                  >
                    <div className="flex-1 border-t" style={{ borderColor: "var(--color-hairline)" }} />
                    <span className="text-xs font-body" style={s.secondary}>or continue as</span>
                    <div className="flex-1 border-t" style={{ borderColor: "var(--color-hairline)" }} />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1 h-11 text-sm font-semibold"
                      onClick={() => {
                        localStorage.setItem("monologg_is_new_user", "false");
                        appStateSync.setLoggedInUser({
                          id: "usr-demo-talent",
                          email: "emeka@example.com",
                          name: "Emeka Johnson",
                          userType: "TALENT",
                          authProvider: "EMAIL",
                          isNewUser: false,
                        });
                        navigate("/dashboard");
                      }}
                    >
                      Performer
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 h-11 text-sm font-semibold"
                      onClick={() => {
                        localStorage.setItem("monologg_is_new_user", "false");
                        appStateSync.setLoggedInUser({
                          id: "usr-demo-client",
                          email: "sarah@filmcraft.com",
                          name: "Sarah Jenkins",
                          userType: "CLIENT",
                          authProvider: "EMAIL",
                          isNewUser: false,
                        });
                        navigate("/client");
                      }}
                    >
                      Client
                    </Button>
                  </div>

                  <p className="text-sm text-center mt-6 font-body" style={s.secondary}>
                    New here?{" "}
                    <button className="hover:underline font-medium" style={s.gold} onClick={() => setView("register")}>
                      Create free account
                    </button>
                  </p>
                </motion.div>
              )}

              {/* ── OTP entry (Phase 12B) ── */}
              {view === "otp_entry" && (
                <motion.div
                  key="otp_entry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <button onClick={() => setView("login")} className="mb-6 -ml-1 flex items-center gap-1 text-sm font-body" style={s.secondary}>
                    <ChevronLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-bg-surface-2)" }}>
                    <KeyRound className="w-6 h-6" style={{ color: "var(--color-gold-primary)" }} />
                  </div>
                  <h2 className="font-display text-[28px] leading-[1.1] tracking-[-0.02em] mb-2" style={s.primary}>Enter your code</h2>
                  <p className="text-[14px] font-body mb-6" style={s.secondary}>
                    We sent a 6-digit code to <strong>{otpEmail}</strong>.
                  </p>
                  <form onSubmit={handleOtpVerify} className="flex flex-col gap-3">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center tracking-[0.3em] text-xl font-mono"
                      required
                    />
                    {error && <p className="text-xs font-body" style={{ color: "var(--color-error)" }}>{error}</p>}
                    <Button type="submit" className="w-full h-12" disabled={otpCode.length !== 6 || submitting}>
                      {submitting ? "Verifying…" : "Verify Code"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    {otpResendCooldown > 0 ? (
                      <p className="text-xs font-body" style={s.secondary}>Resend in {otpResendCooldown}s</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOtpRequest as unknown as React.MouseEventHandler}
                        className="text-xs font-body hover:underline"
                        style={s.gold}
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Magic Link Sent (Phase 12B) ── */}
              {view === "magic_sent" && (
                <motion.div
                  key="magic_sent"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-success-bg)" }}>
                    <Mail className="w-7 h-7" style={{ color: "var(--color-success)" }} />
                  </div>
                  <h2 className="font-display text-[28px] mb-2" style={s.primary}>Check your inbox</h2>
                  <p className="text-sm font-body mb-6" style={s.secondary}>
                    We sent a magic sign-in link to <strong>{magicLinkEmail}</strong>. Click the link in the email to continue.
                    {SUPABASE_MODE === "mock" && " (Dev mode: no real email sent — check console.)"}
                  </p>
                  <button className="text-sm font-body hover:underline" style={s.gold} onClick={() => setView("login")}>
                    Back to Sign In
                  </button>
                </motion.div>
              )}

              {/* ── Forgot Password ── */}
              {view === "forgot" && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <button onClick={() => setView("login")} className="mb-6 -ml-1 flex items-center gap-1 text-sm font-body" style={s.secondary}>
                    <ChevronLeft className="w-4 h-4" /> Back to Sign In
                  </button>

                  {!forgotSent ? (
                    <>
                      <h2 className="font-display text-[32px] leading-[1.08] tracking-[-0.02em] mb-2" style={s.primary}>Reset password</h2>
                      <p className="text-[15px] font-body mb-8" style={s.secondary}>
                        Enter your email and we'll send you a reset link.
                      </p>
                      <form onSubmit={handleForgot} className="flex flex-col gap-3">
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                        {error && (
                          <p className="text-xs font-body" style={{ color: "var(--color-error)" }}>{error}</p>
                        )}
                        <Button type="submit" className="w-full h-12 mt-2" disabled={submitting}>
                          {submitting ? "Sending…" : "Send Reset Link"}
                        </Button>
                      </form>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: "var(--color-success-bg)" }}
                      >
                        <Check className="w-7 h-7" style={{ color: "var(--color-success)" }} />
                      </div>
                      <h3 className="font-display text-2xl mb-2" style={s.primary}>Check your email</h3>
                      <p className="text-sm font-body" style={s.secondary}>
                        We sent a reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
