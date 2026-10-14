import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { useTheme } from "../Root";
import { apiClient } from "../../lib/api-client";
import { supabase, SUPABASE_MODE } from "../../lib/supabase";
import { appStateSync } from "../../lib/state-sync";
import { CURRENT_TERMS_VERSION } from "@monologg/types";
import {
  Eye,
  EyeOff,
  ChevronLeft,
  Sun,
  Moon,
  Check,
  Mail,
  KeyRound,
  User,
  Lock,
  AlertCircle,
} from "lucide-react";
import { WebGLHeroCanvas } from "../components/ui/WebGLHeroCanvas";

type View = "splash" | "register" | "login" | "forgot" | "otp_entry" | "magic_sent";
type Role = "talent" | "client";

export function AuthFlow() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || searchParams.get("view");
  const initialRole = searchParams.get("role");

  const [view, setView] = useState<View>(() => {
    if (initialMode === "login" || initialMode === "signin") return "login";
    if (initialMode === "register" || initialMode === "signup") return "register";
    return "splash";
  });
  const [role, setRole] = useState<Role>(() => {
    if (initialRole === "client") return "client";
    return "talent";
  });
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
    gold: { color: "var(--color-text-primary)", textDecoration: "underline", textDecorationColor: "var(--color-gold-primary)", textUnderlineOffset: "3px" } as React.CSSProperties,
  };

  return (
    <div
      className={`${role === "client" ? "role-client" : "role-talent"} min-h-screen flex flex-col relative overflow-hidden`}
      style={s.canvas}
    >
      <WebGLHeroCanvas opacityMultiplier={0.05} />

      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-5 md:px-8 relative z-20 border-b border-[var(--color-hairline)] bg-[var(--color-bg-canvas)]/80 backdrop-blur-md">
        <Link to="/" aria-label="Monologg">
          <Logo className="h-5 w-auto" style={s.primary} />
        </Link>
        <button
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-11 h-11 rounded-full flex items-center justify-center border transition-colors active:scale-[0.97]"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>

      <div className="flex-1 flex relative z-10">
        {/* Left panel — desktop illustration */}
        <div
          className="hidden lg:flex flex-col justify-between p-12 xl:p-14 w-[480px] xl:w-[500px] shrink-0 relative overflow-hidden"
          style={{ background: "var(--color-bg-elevated)", borderRight: "1px solid var(--color-hairline)" }}
        >
          <div
            className="absolute -top-24 -left-16 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(50% 50% at 50% 50%, var(--color-accent-glow) 0%, transparent 70%)`,
              filter: "blur(50px)",
            }}
          />
          <div className="relative space-y-4">
            <h2 className="font-wise-sans text-[36px] sm:text-[42px] font-black uppercase tracking-[-0.03em] leading-[0.95] text-[var(--color-text-primary)]">
              {role === "talent" ? (
                <>
                  YOUR CRAFT. ON YOUR TERMS.<br />
                  <span className="relative inline-block text-[var(--color-accent)] mt-1">
                    INSTANTLY BOOKED.
                    <svg
                      className="absolute left-0 -bottom-1.5 w-full h-3 text-[var(--color-accent)] pointer-events-none"
                      viewBox="0 0 300 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 15Q75 2 150 15T295 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </>
              ) : (
                <>
                  TOP TALENT. ZERO HASSLE.<br />
                  <span className="relative inline-block text-[var(--color-accent)] mt-1">
                    INSTANTLY BOOKED.
                    <svg
                      className="absolute left-0 -bottom-1.5 w-full h-3 text-[var(--color-accent)] pointer-events-none"
                      viewBox="0 0 300 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 15Q75 2 150 15T295 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </>
              )}
            </h2>
            <p className="text-base font-body leading-relaxed text-[var(--color-text-secondary)]">
              {role === "talent"
                ? "Join 3,200+ verified performers and casting directors on Africa's first brief-to-booking pipeline."
                : "Connect with 3,200+ verified performers and casting directors on Africa's first brief-to-booking pipeline."}
            </p>
          </div>

          <div className="relative space-y-3.5">
            {(role === "talent"
              ? [
                  "Free to join — zero subscription fees",
                  "Proprietary Thespian AI vibe scanner in 30s",
                  "Get paid the same day deliverables are approved",
                  "Payments held securely in escrow by our payment partner, Paystack",
                ]
              : [
                  "Free project posting — zero upfront search fees",
                  "Proprietary Thespian AI vibe scanner in 30s",
                  "Release funds only when deliverables are approved",
                  "Payments held securely in escrow by our payment partner, Paystack",
                ]
            ).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-accent-soft)] transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-[var(--color-accent)] transition-colors" />
                </div>
                <span className="text-sm font-body text-[var(--color-text-primary)] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — forms */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-[420px]">
            {/* Mobile banner */}
            <div className="lg:hidden w-full mb-6 p-6 rounded-2xl relative overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-bg-elevated)]">
              <h2 className="font-wise-sans text-2xl font-black uppercase tracking-[-0.03em] leading-tight text-[var(--color-text-primary)] mb-2">
                {role === "talent" ? (
                  <>
                    YOUR CRAFT. ON YOUR TERMS.<br />
                    <span className="relative inline-block text-[var(--color-accent)]">
                      INSTANTLY BOOKED.
                    </span>
                  </>
                ) : (
                  <>
                    TOP TALENT. ZERO HASSLE.<br />
                    <span className="relative inline-block text-[var(--color-accent)]">
                      INSTANTLY BOOKED.
                    </span>
                  </>
                )}
              </h2>
              <p className="text-xs font-body text-[var(--color-text-secondary)]">
                {role === "talent"
                  ? "Join 3,200+ verified performers on Africa's first brief-to-booking pipeline."
                  : "Connect with 3,200+ verified performers for your productions."}
              </p>
            </div>

            {/* Single Unified Role Switcher */}
            <div className="flex p-1 mb-6 rounded-full bg-[var(--color-bg-surface-2)] border border-[var(--color-hairline)]">
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
                  <h1 className="font-display text-[32px] sm:text-[36px] font-bold leading-[1.05] tracking-[-0.02em] mb-2 text-[var(--color-text-primary)]">
                    Welcome to Monologg
                  </h1>
                  <p className="text-sm sm:text-base font-body mb-7 text-[var(--color-text-secondary)]">
                    Sign in or create a free {role === "talent" ? "Performer" : "Client"} account to continue.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant={role === "talent" ? "red" : "purple"}
                      className="w-full h-12 text-sm font-bold shadow-md rounded-full"
                      onClick={() => setView("register")}
                    >
                      Create Free Account
                    </Button>
                    <Button
                      variant="outline-pill"
                      className="w-full h-12 text-sm font-bold rounded-full border border-[var(--color-hairline)]"
                      onClick={() => setView("login")}
                    >
                      Sign In
                    </Button>
                  </div>

                  {/* Clean demo row */}
                  <div className="mt-8 pt-5 border-t border-[var(--color-hairline)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span className="font-body">Explore demo preview:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
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
                        className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-hairline)] hover:border-[#F13030]/40 hover:bg-[#F13030]/10 hover:text-[#F13030] transition-colors"
                      >
                        Performer
                      </button>
                      <button
                        type="button"
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
                        className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-hairline)] hover:border-[#7B00FE]/40 hover:bg-[#7B00FE]/10 hover:text-[#7B00FE] transition-colors"
                      >
                        Client
                      </button>
                    </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setView("splash")}
                      className="flex items-center gap-1 text-xs font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors -ml-1 p-1 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">
                    Create account
                  </h2>
                  <p className="text-sm font-body mb-5 text-[var(--color-text-secondary)]">
                    Join Monologg as a {role === "talent" ? "Performer" : "Client"}.
                  </p>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleSupabaseGoogle}
                    disabled={submitting || googleAuthLoading}
                    className="w-full h-12 rounded-full border border-[var(--color-hairline)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-2)] transition-colors flex items-center justify-center gap-2.5 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99] shadow-xs"
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

                  <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Full name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          placeholder="Full Name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="h-11 pl-10 pr-3.5 rounded-xl text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Email address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="h-11 pl-10 pr-3.5 rounded-xl text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          type={showPwd ? "text" : "password"}
                          placeholder="Create Password (min. 8 chars)"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="h-11 pl-10 pr-11 rounded-xl text-sm"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-surface-2)] transition-colors"
                          aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms consent */}
                    <label className="flex items-start gap-3 mt-1.5 cursor-pointer select-none">
                      <div
                        className="relative w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all"
                        style={{
                          background: agreed ? "var(--color-gold-primary)" : "var(--color-bg-elevated)",
                          borderColor: agreed ? "var(--color-gold-primary)" : "var(--color-hairline)",
                        }}
                        onClick={() => setAgreed(!agreed)}
                      >
                        {agreed && <Check className="w-3.5 h-3.5" style={{ color: "#1A1200" }} />}
                      </div>
                      <span className="text-xs font-body leading-relaxed text-[var(--color-text-secondary)]">
                        I agree to the{" "}
                        <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-[var(--color-text-primary)] underline underline-offset-2">Terms of Service</a>{" "}
                        and{" "}
                        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-[var(--color-text-primary)] underline underline-offset-2">Privacy Policy</a>
                      </span>
                    </label>

                    {error && (
                      <div className="p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex items-start gap-2.5 text-xs font-body text-[var(--color-error)]">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant={role === "talent" ? "red" : "purple"}
                      className="w-full h-12 mt-1 text-sm font-bold rounded-full shadow-md"
                      disabled={!agreed || !name || !email || password.length < 8 || submitting}
                    >
                      {submitting ? "Creating account…" : role === "talent" ? "Create My Performer Profile" : "Create Client Account"}
                    </Button>
                  </form>

                  <p className="text-sm text-center mt-5 font-body text-[var(--color-text-secondary)]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="hover:underline font-semibold text-[var(--color-accent)] underline-offset-2"
                      onClick={() => setView("login")}
                    >
                      Sign in
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
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setView("splash")}
                      className="flex items-center gap-1 text-xs font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors -ml-1 p-1 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">
                    Welcome back
                  </h2>
                  <p className="text-sm font-body mb-5 text-[var(--color-text-secondary)]">
                    Sign in to your {role === "talent" ? "Performer" : "Client"} account.
                  </p>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleSupabaseGoogle}
                    disabled={submitting || googleAuthLoading}
                    className="w-full h-12 rounded-full border border-[var(--color-hairline)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-2)] transition-colors flex items-center justify-center gap-2.5 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99] shadow-xs"
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

                  <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Email address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="h-11 pl-10 pr-3.5 rounded-xl text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Password</label>
                        <button
                          type="button"
                          className="text-xs font-body hover:underline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                          onClick={() => setView("forgot")}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input
                          type={showPwd ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="h-11 pl-10 pr-11 rounded-xl text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-surface-2)] transition-colors"
                          aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex items-start gap-2.5 text-xs font-body text-[var(--color-error)]">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant={role === "talent" ? "red" : "purple"}
                      className="w-full h-12 mt-1 text-sm font-bold rounded-full shadow-md"
                      disabled={submitting}
                    >
                      {submitting ? "Signing in…" : "Sign In"}
                    </Button>
                  </form>

                  <p className="text-sm text-center mt-5 font-body text-[var(--color-text-secondary)]">
                    New here?{" "}
                    <button
                      type="button"
                      className="hover:underline font-semibold text-[var(--color-accent)] underline-offset-2"
                      onClick={() => setView("register")}
                    >
                      Create free account
                    </button>
                  </p>

                  {/* Clean demo row */}
                  <div className="mt-6 pt-4 border-t border-[var(--color-hairline)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span className="font-body">Quick demo:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
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
                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--color-hairline)] hover:border-[#F13030]/40 hover:bg-[#F13030]/10 hover:text-[#F13030] transition-colors"
                      >
                        Performer
                      </button>
                      <button
                        type="button"
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
                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--color-hairline)] hover:border-[#7B00FE]/40 hover:bg-[#7B00FE]/10 hover:text-[#7B00FE] transition-colors"
                      >
                        Client
                      </button>
                    </div>
                  </div>
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
                  <button
                    onClick={() => setView("login")}
                    className="mb-5 -ml-1 flex items-center gap-1 text-xs font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to sign in
                  </button>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-[var(--color-bg-surface-2)] border border-[var(--color-hairline)]">
                    <KeyRound className="w-6 h-6" style={{ color: "var(--color-gold-primary)" }} />
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">
                    Enter your code
                  </h2>
                  <p className="text-sm font-body mb-6 text-[var(--color-text-secondary)]">
                    We sent a 6-digit code to <strong className="text-[var(--color-text-primary)]">{otpEmail}</strong>.
                  </p>
                  <form onSubmit={handleOtpVerify} className="flex flex-col gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Verification code</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="000000"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="h-12 text-center tracking-[0.3em] text-xl font-mono rounded-xl"
                        required
                      />
                    </div>
                    {error && (
                      <div className="p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex items-start gap-2.5 text-xs font-body text-[var(--color-error)]">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      variant={role === "talent" ? "red" : "purple"}
                      className="w-full h-11 text-sm font-semibold rounded-xl shadow-xs"
                      disabled={otpCode.length !== 6 || submitting}
                    >
                      {submitting ? "Verifying…" : "Verify Code"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    {otpResendCooldown > 0 ? (
                      <p className="text-xs font-body text-[var(--color-text-tertiary)]">Resend in {otpResendCooldown}s</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOtpRequest as unknown as React.MouseEventHandler}
                        className="text-xs font-body hover:underline text-[var(--color-text-primary)] font-medium"
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
                  className="flex flex-col items-center text-center py-4"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[var(--color-success-bg)] border border-[var(--color-success)]/20">
                    <Mail className="w-7 h-7 text-[var(--color-success)]" />
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">
                    Check your inbox
                  </h2>
                  <p className="text-sm font-body mb-6 text-[var(--color-text-secondary)] max-w-xs">
                    We sent a magic sign-in link to <strong className="text-[var(--color-text-primary)]">{magicLinkEmail}</strong>. Click the link in the email to continue.
                    {SUPABASE_MODE === "mock" && " (Dev mode: check console for link.)"}
                  </p>
                  <Button
                    variant="outline-pill"
                    className="h-10 px-5 text-xs font-semibold rounded-xl"
                    onClick={() => setView("login")}
                  >
                    Back to Sign In
                  </Button>
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
                  <button
                    onClick={() => setView("login")}
                    className="mb-5 -ml-1 flex items-center gap-1 text-xs font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to sign in
                  </button>

                  {!forgotSent ? (
                    <>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">
                        Reset password
                      </h2>
                      <p className="text-sm font-body mb-6 text-[var(--color-text-secondary)]">
                        Enter your email and we'll send you a password reset link.
                      </p>
                      <form onSubmit={handleForgot} className="flex flex-col gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium font-body text-[var(--color-text-secondary)]">Email address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="Email Address"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="h-11 pl-10 pr-3.5 rounded-xl text-sm"
                              required
                            />
                          </div>
                        </div>
                        {error && (
                          <div className="p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex items-start gap-2.5 text-xs font-body text-[var(--color-error)]">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}
                        <Button
                          type="submit"
                          variant={role === "talent" ? "red" : "purple"}
                          className="w-full h-11 mt-1 text-sm font-semibold rounded-xl shadow-xs"
                          disabled={submitting}
                        >
                          {submitting ? "Sending…" : "Send Reset Link"}
                        </Button>
                      </form>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[var(--color-success-bg)] border border-[var(--color-success)]/20">
                        <Check className="w-7 h-7 text-[var(--color-success)]" />
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-1 text-[var(--color-text-primary)]">
                        Check your email
                      </h3>
                      <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-xs mx-auto mb-6">
                        We sent a reset link to <strong className="text-[var(--color-text-primary)]">{email}</strong>. Check your inbox and follow the instructions.
                      </p>
                      <Button
                        variant="outline-pill"
                        className="h-10 px-5 text-xs font-semibold rounded-xl"
                        onClick={() => {
                          setForgotSent(false);
                          setView("login");
                        }}
                      >
                        Back to Sign In
                      </Button>
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

