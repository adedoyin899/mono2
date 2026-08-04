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
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [useCustomGoogleAccount, setUseCustomGoogleAccount] = useState(false);
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

  const executeGoogleLogin = async (targetEmail: string, targetName: string) => {
    setError(null);
    setGoogleAuthLoading(true);
    try {
      await apiClient.googleLogin({
        email: targetEmail,
        name: targetName,
        userType: role === "talent" ? "TALENT" : "CLIENT",
      });
      setShowGoogleModal(false);
      navigate(role === "talent" ? "/onboarding" : "/onboarding/client");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setGoogleAuthLoading(false);
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
    if (!supabase) {
      // ALL-MOCK mode fallback: use the existing mock Google modal
      setShowGoogleModal(true);
      return;
    }
    setError(null);
    const appUrl = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback`,
        // Echo userType back through the state param so /auth/callback knows which role
        queryParams: { state: btoa(JSON.stringify({ userType: role === "talent" ? "TALENT" : "CLIENT" })) },
      },
    });
    if (oauthError) setError(oauthError.message);
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
        navigate(user.userType === "CLIENT" ? "/client" : "/dashboard");
      } else {
        // Mock mode: any 6-digit code works
        if (otpCode.length !== 6) throw new Error("Enter the 6-digit code.");
        const user = await apiClient.sessionSync("", userType, { provider: "EMAIL_OTP" });
        navigate(user.userType === "CLIENT" ? "/client" : "/dashboard");
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
      className="min-h-screen flex flex-col"
      style={s.canvas}
    >
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-5 md:px-8" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
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

      <div className="flex-1 flex">
        {/* Left panel — desktop illustration */}
        <div
          className="hidden lg:flex flex-col justify-between p-14 w-[480px] shrink-0 relative overflow-hidden"
          style={{ background: "var(--color-bg-elevated)", borderRight: "1px solid var(--color-hairline)" }}
        >
          <div
            className="absolute -top-24 -left-16 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--color-red-glow) 0%, transparent 70%)", filter: "blur(50px)" }}
          />
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-8"
              style={{ background: "var(--color-red-soft)" }}
            >
              <Shield className="w-6 h-6 text-[#F13030]" />
            </div>
            <h2 className="font-display text-[38px] font-bold leading-[1.05] tracking-[-0.02em] mb-4 text-[#16161A] dark:text-[#F5F5F0]">
              Your craft. On your terms.
            </h2>
            <p className="text-base font-body leading-relaxed text-[#5D5D66] dark:text-[#A6A6B0]">
              Join 3,200+ verified performers and casting directors on Africa's first brief-to-booking pipeline.
            </p>
          </div>

          <div className="relative space-y-3.5">
            {[
              "Free to join — zero subscription fees",
              "Proprietary Thespian AI vibe scanner in 30s",
              "Get paid the same day deliverables are approved",
              "Full FINCRA escrow protection on every booking",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[#FFECEC] dark:bg-[#F13030]/20"
                >
                  <Check className="w-3.5 h-3.5 text-[#F13030]" />
                </div>
                <span className="text-sm font-body text-[#16161A] dark:text-[#F5F5F0] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — forms */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px]">
            {/* Wise-Style Segmented Role Switcher */}
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
                Talent / Creator
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
                Client / Employer
              </button>
            </div>

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
                  <h1 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.02em] mb-2 text-[#16161A] dark:text-[#F5F5F0]">
                    Welcome to Monologg.
                  </h1>
                  <p className="text-base font-body mb-8 text-[#5D5D66] dark:text-[#A6A6B0]">
                    Sign in or create a free {role === "talent" ? "Talent" : "Client"} account to continue.
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
                  <div className="mt-8 pt-6 text-center border-t border-[var(--color-hairline)]">
                    <p className="text-xs font-body mb-2 text-[var(--color-text-secondary)]">
                      {role === "talent" ? "Are you a brand or casting director?" : "Are you an actor or performer?"}
                    </p>
                    <button
                      onClick={() => setRole(role === "talent" ? "client" : "talent")}
                      className="text-xs font-bold font-mono text-[#F13030] dark:text-[#FF4D4D] hover:underline"
                    >
                      Switch to {role === "talent" ? "Client / Employer" : "Talent / Creator"} Mode →
                    </button>
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
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2.5 font-body" style={s.secondary}>I'm joining as</p>
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
                          {r === "talent" ? "Talent / Creator" : "Client / Employer"}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleSupabaseGoogle}
                    disabled={submitting}
                    className="w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center justify-center gap-3 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99] shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[var(--color-hairline)]" />
                    <span className="text-[11px] font-body uppercase tracking-wider text-[var(--color-text-tertiary)]">or with email</span>
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
                      {submitting ? "Creating account…" : role === "talent" ? "Create My Talent Profile" : "Create Client Account"}
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
                    disabled={submitting}
                    className="w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center justify-center gap-3 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99] shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Sign in with Google
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[var(--color-hairline)]" />
                    <span className="text-[11px] font-body uppercase tracking-wider text-[var(--color-text-tertiary)]">or sign in with email</span>
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
                      Talent
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

      {/* ── Google OAuth Sign-In Modal ── */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[420px] rounded-2xl p-6 shadow-2xl relative font-body"
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-hairline)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors p-1 text-sm"
              >
                ✕
              </button>

              {/* Google Brand Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-3 border border-stone-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Sign in with Google</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">to continue to <strong className="text-[var(--color-text-primary)]">Monologg</strong></p>
              </div>

              {googleAuthLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[var(--color-text-secondary)] animate-pulse">Authenticating with Google OAuth 2.0…</p>
                </div>
              ) : !useCustomGoogleAccount ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">Choose an account</p>
                  
                  {/* Option 1: Typed email or default personal email */}
                  <button
                    type="button"
                    onClick={() => executeGoogleLogin(email || "user.creative@gmail.com", name || "Google Creative User")}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-900 font-bold flex items-center justify-center text-sm shadow">
                      {(email ? email[0] : "G").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{name || "Google Creative User"}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">{email || "user.creative@gmail.com"}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors shrink-0" />
                  </button>

                  {/* Option 2: Preconfigured Studio / Nollywood Account */}
                  <button
                    type="button"
                    onClick={() => executeGoogleLogin(role === "talent" ? "artist.nollywood@gmail.com" : "studio.filmcraft@gmail.com", role === "talent" ? "Nollywood Star" : "FilmCraft Studios")}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                      {role === "talent" ? "N" : "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{role === "talent" ? "Nollywood Creator" : "FilmCraft Studios"}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">{role === "talent" ? "artist.nollywood@gmail.com" : "studio.filmcraft@gmail.com"}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 rotate-180 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors shrink-0" />
                  </button>

                  {/* Option 3: Use another Google account */}
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomGoogleAccount(true);
                      setGoogleEmailInput(email);
                      setGoogleNameInput(name);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] transition-all text-left mt-1 text-xs font-semibold text-[var(--color-gold-primary)]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--color-bg-surface-2)] flex items-center justify-center text-sm">
                      +
                    </div>
                    Use another Google account
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!googleEmailInput) return;
                    executeGoogleLogin(googleEmailInput, googleNameInput || googleEmailInput.split("@")[0]);
                  }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Enter your Google details</p>
                  <Input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    required
                    autoFocus
                  />
                  <Input
                    placeholder="Full Name (optional)"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 h-10"
                      onClick={() => setUseCustomGoogleAccount(false)}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 h-10">
                      Sign In
                    </Button>
                  </div>
                </form>
              )}

              <p className="text-[11px] text-center text-[var(--color-text-tertiary)] mt-6">
                To continue, Google will share your name, email address, and profile picture with Monologg.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
