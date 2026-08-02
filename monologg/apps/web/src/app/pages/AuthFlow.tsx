import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { useTheme } from "../Root";
import { apiClient } from "../../lib/api-client";
import { CURRENT_TERMS_VERSION } from "@monologg/types";
import { Eye, EyeOff, ChevronLeft, Shield, Sun, Moon, Check } from "lucide-react";

type View = "splash" | "register" | "login" | "forgot";
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
  const [submitting, setSubmitting] = useState(false);
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

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const userName = name || (role === "talent" ? "New Creative User" : "New Client Account");
      const userEmail = email || `user-${Date.now().toString().slice(-4)}@gmail.com`;
      const res = await apiClient.googleLogin({
        email: userEmail,
        name: userName,
        userType: role === "talent" ? "TALENT" : "CLIENT",
      });
      navigate(role === "talent" ? "/dashboard" : "/client");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed.");
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
              className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center mb-10"
              style={{ background: "var(--color-red-soft)" }}
            >
              <Shield className="w-6 h-6" style={{ color: "var(--color-red)" }} />
            </div>
            <h2 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] mb-5" style={s.primary}>
              Your career belongs here.
            </h2>
            <p className="text-[15px] font-body leading-relaxed" style={s.secondary}>
              Join 3,200+ verified performers who've taken control of their bookings with escrow-protected payments and AI-generated style tags.
            </p>
          </div>

          <div className="relative space-y-4">
            {[
              "Free to join — no subscription fees",
              "AI-generated style tags in 45 seconds",
              "Get paid the same day work is approved",
              "Full escrow protection on every booking",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--color-success-bg)" }}
                >
                  <Check className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                </div>
                <span className="text-sm font-body" style={s.secondary}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — forms */}
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-[400px]">
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
                  <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] mb-3" style={s.primary}>Welcome to Monologg.</h1>
                  <p className="text-[15px] font-body mb-10" style={s.secondary}>
                    Sign in or create a free account to continue.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full h-12" onClick={() => setView("register")}>
                      Create Free Account
                    </Button>
                    <Button variant="secondary" className="w-full h-12" onClick={() => setView("login")}>
                      Sign In
                    </Button>
                  </div>
                  <div className="mt-8 pt-8 text-center" style={{ borderTop: "1px solid var(--color-hairline)" }}>
                    <p className="text-xs font-body mb-3" style={s.secondary}>Are you a brand or agency?</p>
                    <button
                      onClick={() => { setRole("client"); setView("register"); }}
                      className="text-sm font-medium font-body hover:underline"
                      style={s.gold}
                    >
                      Continue as Client / Employer →
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
                    onClick={handleGoogleAuth}
                    disabled={submitting}
                    className="w-full h-11 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center justify-center gap-3 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99]"
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
                    onClick={handleGoogleAuth}
                    disabled={submitting}
                    className="w-full h-11 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-all flex items-center justify-center gap-3 text-sm font-semibold font-body text-[var(--color-text-primary)] mb-4 active:scale-[0.99]"
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
                    <span className="text-[11px] font-body uppercase tracking-wider text-[var(--color-text-tertiary)]">or with email</span>
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
                    <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => navigate("/dashboard")}>
                      Talent
                    </Button>
                    <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => navigate("/client")}>
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
