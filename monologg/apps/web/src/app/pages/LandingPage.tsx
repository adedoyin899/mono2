import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { Logo } from "../components/ui/Logo";
import { useTheme } from "../Root";
import {
  Star, Shield, Mic, Video, User,
  Sun, Moon, Check, ChevronDown,
  Menu, X, UploadCloud, Lock, RefreshCw, Sparkles, MessageSquare
} from "lucide-react";

// Curated artistic talent categories with beautiful pictures representing the variety of crafts
const NICHES = [
  { label: "Actors", icon: User, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80&fit=crop", stat: "1,240+" },
  { label: "Voice Artists", icon: Mic, img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80&fit=crop", stat: "890+" },
  { label: "Dancers & Choreographers", icon: Star, img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80&fit=crop", stat: "430+" },
  { label: "Comperes & Hosts", icon: Video, img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80&fit=crop", stat: "620+" },
];

const STEPS = [
  {
    num: "01",
    title: "Build Your Style Profile",
    body: "Upload your showcase reel. Thespian AI analyzes your performance parameters and generates style tags in seconds — no middleman, no gatekeeping.",
  },
  {
    num: "02",
    title: "Set Your Rate Cards",
    body: "Turn your craft into purchasable services. Actors, voice artists, performers — define what you offer and your price.",
  },
  {
    num: "03",
    title: "Get Booked. Get Paid.",
    body: "Clients discover you, lock payment in escrow, and you deliver. Funds release the moment you're done. No waiting, no chasing.",
  },
];

const TESTIMONIALS = [
  {
    name: "Adaeze Obi",
    role: "Voice-Over Artist · Lagos",
    avatar: "AO",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&fit=crop",
    quote: "I used to lose 25% to my agent for just picking up the phone. With Monologg, I set my own rates and the money hits my account the same day the client approves.",
    stars: 5,
  },
  {
    name: "Tunde Balogun",
    role: "Commercial Actor · Abuja",
    avatar: "TB",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop",
    quote: "Having real style tags on my profile gave me instant credibility. I got my first international booking within 72 hours of going live. This platform is the future.",
    stars: 5,
  },
  {
    name: "Sarah Mensah",
    role: "Events Director · Accra",
    avatar: "SM",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&fit=crop",
    quote: "Finding a compere used to take me two weeks of WhatsApp threads. Now I shortlist five candidates, compare their reels side by side, and book in 20 minutes.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "What percentage does Monologg take?",
    a: "We charge a 9% platform fee on completed transactions. There's also a 12% escrow processing fee that clients pay — so your rate is what you earn.",
  },
  {
    q: "How does the AI style tagging work?",
    a: "You upload a performance reel (video or audio, up to 150MB). Thespian AI analyzes vocal patterns, pacing, clarity, and presence — then generates your profile's style tags. The process takes 15–45 seconds. This is separate from identity verification, which uses a dedicated ID check.",
  },
  {
    q: "When do I get paid?",
    a: "The moment the client approves your deliverable, funds are released from escrow automatically. Most payouts arrive within 24 business hours.",
  },
  {
    q: "Can I use Monologg if I'm not in Nigeria?",
    a: "Yes — Monologg is built for the African creative economy but serves global talent. Payouts are available in multiple currencies via our FINCRA integration.",
  },
  {
    q: "What if a client disputes my work?",
    a: "Our support team mediates all disputes. Escrow funds are never released without either mutual agreement or a support decision. Your money is always safe.",
  },
];

// ── Interactive Self-Running Sub-Components for FAANG-level UX Motion Storytelling ──

function AITaggingDemo() {
  const [phase, setPhase] = useState(0); // 0: drop/idle, 1: analysis scan, 2: tags loaded
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => {
        const next = (prev + 1) % 3;
        if (next === 0) setProgress(0);
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase === 1) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <div className="p-6 rounded-[var(--radius-xl)] relative min-h-[300px] flex flex-col justify-center transition-all duration-500" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}>
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="phase-upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 border-current/20 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <UploadCloud className="w-10 h-10 mb-3" style={{ color: "var(--color-accent)" }} />
            </motion.div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Drag &amp; Drop Reel</div>
            <div className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Supports MP3, WAV or MP4 up to 150MB</div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div
            key="phase-scan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thespian AI Scanning...</span>
              <span className="font-mono text-[var(--color-accent)]">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--color-bg-surface)" }}>
              <div className="h-full rounded-full transition-all duration-75" style={{ width: `${progress}%`, background: "var(--color-accent)" }} />
            </div>
            <div className="text-[10px] text-center italic" style={{ color: "var(--color-text-tertiary)" }}>Analyzing voice pitch modulation, articulation, and pacing attributes...</div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="phase-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12" background="var(--color-accent-glow)" color="var(--color-accent)">EJ</Avatar>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  Emeka Johnson
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
                    <Shield className="w-4 h-4" style={{ color: "var(--color-success)" }} />
                  </motion.span>
                </div>
                <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Dramatic Actor · Lagos</div>
              </div>
            </div>
            <div className="p-3.5 rounded-lg" style={{ background: "var(--color-bg-surface)" }}>
              <div className="text-[10px] uppercase tracking-wider mb-2 font-mono" style={{ color: "var(--color-text-tertiary)" }}>AI Generated Vibe tags</div>
              <div className="flex flex-wrap gap-1.5">
                {["Deep Tone", "Intense", "Nollywood Drama", "Accented", "High-Energy"].map((tag, idx) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                    className="text-[11px] px-2.5 py-1 rounded-full font-body font-semibold"
                    style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EscrowDemo() {
  const [phase, setPhase] = useState(0); // 0: client locks, 1: files uploaded, 2: release checkout

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 rounded-[var(--radius-xl)] transition-all duration-500 min-h-[300px] flex flex-col justify-center" style={{ background: "#1c1c1f", border: "1px solid #333335" }}>
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="escrow-lock"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto"
            >
              <Lock className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-white/50 font-mono">FINCRA Escrow Lock</div>
              <h4 className="text-lg font-bold text-white">₦120,000 Contract Active</h4>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed max-w-xs mx-auto">
              Client locks the contract fee securely. Payment is verified and held safely before any voice recording or staging begins.
            </p>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div
            key="escrow-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="text-xs uppercase tracking-widest text-white/50 font-mono mb-2">Order Room Milestones</div>
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-lg text-xs space-y-1.5"
              style={{ background: "#27272a" }}
            >
              <div className="flex justify-between items-center text-white/40 text-[10px]">
                <span>Emeka Johnson</span>
                <span>Uploaded Deliverable</span>
              </div>
              <div className="text-white font-semibold">commercial_spot_v2.wav</div>
            </motion.div>
            <motion.div
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-3 rounded-lg text-xs space-y-1.5 self-end"
              style={{ background: "var(--color-purple-press)" }}
            >
              <div className="text-white/80 font-medium">Draft looks fantastic, launching final review!</div>
            </motion.div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="escrow-release"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Funds Released</h4>
              <p className="text-[11px] text-emerald-400">₦109,200 transferred safely to Talent bank</p>
            </div>
            <div className="text-[10px] text-white/40">Escrow cycle complete · 9% platform commission applied</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const s = {
    canvas: { background: "var(--color-bg-canvas)" } as React.CSSProperties,
    text: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    tertiary: { color: "var(--color-text-tertiary)" } as React.CSSProperties,
    surface: { background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
    inkBorder: { border: "1px solid var(--color-hairline)" } as React.CSSProperties,
  };

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)", fontFamily: "SF Pro Text, system-ui, sans-serif" }} className="min-h-screen flex flex-col overflow-x-hidden">
      {/* ── Top thin global-nav (Apple 44px style) ── */}
      <div className="h-[44px] bg-[#000000] text-[#ffffff] flex items-center justify-between px-6 text-xs font-medium border-b border-[#333333] z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
          <span className="tracking-wide uppercase text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Monologg SaaS</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white/80 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a>
        </div>
      </div>

      {/* ── Sub-Nav Frosted sticky bar (Apple 52px style) ── */}
      <header
        className="h-[52px] sticky top-0 z-40 px-5 md:px-16 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "color-mix(in srgb, var(--color-bg-canvas) 72%, transparent)", borderColor: "var(--color-hairline)" }}
      >
        <div className="flex items-center gap-3">
          <Logo className="h-5 w-auto" style={{ color: "var(--color-text-primary)" }} title="Monologg" />
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors active:scale-[0.95]"
            style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-full md:hidden flex items-center justify-center border transition-colors active:scale-[0.95]"
            style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-primary)" }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <Button
            variant="ghost"
            className="h-8 px-3 text-xs hidden md:inline-flex"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button
            className="h-8 px-4 text-xs font-semibold"
            onClick={() => navigate("/auth")}
          >
            Launch Storefront
          </Button>
        </div>
      </header>

      {/* ── Mobile Nav Sheet ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden sticky top-[52px] z-40 px-5 py-6 border-b glass-panel space-y-4"
            style={{ borderColor: "var(--color-hairline)" }}
          >
            {["Features", "How It Works", "Pricing"].map(item => (
              <button
                key={item}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left font-display text-lg py-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item}
              </button>
            ))}
            <div className="pt-4 border-t flex flex-col gap-2.5" style={{ borderColor: "var(--color-hairline)" }}>
              <Button variant="secondary" className="w-full h-10" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button className="w-full h-10" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main-content" className="flex-1">
        {/* ── Hero Section (Join Waitlist / Queue focus) ── */}
        <section className="relative pt-20 pb-28 px-5 md:px-16 overflow-hidden" style={{ background: "var(--color-bg-canvas)" }}>
          <div className="absolute -top-48 -left-24 w-[640px] h-[640px] rounded-full pointer-events-none opacity-80" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--color-red-glow) 0%, transparent 70%)", filter: "blur(90px)" }} />
          <div className="absolute -top-32 -right-24 w-[560px] h-[560px] rounded-full pointer-events-none opacity-80" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--color-purple-glow) 0%, transparent 70%)", filter: "blur(90px)" }} />

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border animate-pulse" style={{ background: "var(--color-accent-glow)", borderColor: "var(--color-accent)", color: "var(--color-text-primary)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-success)" }} />
              Series-C Built · 3,200+ Verified Talents
            </div>

            <h1 className="font-display text-[44px] md:text-[76px] leading-[1.02] tracking-[-0.04em] font-bold" style={{ color: "var(--color-text-primary)" }}>
              Your craft. On your terms.<br />
              <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Instantly booked.
              </span>
            </h1>

            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-body" style={s.secondary}>
              The world's first brief-to-booking pipeline for performing arts and the creator economy. Verified profiles, escrow protection, zero middlemen.
            </p>

            <div className="max-w-md mx-auto relative min-h-[120px]">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="p-5 rounded-[var(--radius-xl)] flex flex-col gap-3"
                    style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter your email to join the queue"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="h-10 text-xs flex-1"
                      />
                      <Button type="submit" className="h-10 px-4 text-xs font-semibold">
                        Launch Storefront
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    className="p-5 rounded-[var(--radius-xl)] flex flex-col items-center text-center border"
                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-success)" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "var(--color-success-bg)" }}>
                      <Check className="w-5 h-5" style={{ color: "var(--color-success)" }} />
                    </div>
                    <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>You're in queue!</h3>
                    <p className="text-xs font-body" style={s.secondary}>
                      You are <span className="font-semibold text-[var(--color-accent)]">#347</span>. Share to climb: <span className="font-mono underline">monologg.app/invite/abc1234</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── Product Alternating Tiles (Apple Style with Interactive Demos & CTAs) ── */}
        <section id="features" className="space-y-12">
          {/* Tile 1: AI Style Tagging (Light Canvas + Dynamic Demo + CTA) */}
          <div className="py-20 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider font-body" style={{ color: "var(--color-accent)" }}>Thespian AI Engine</span>
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight" style={s.text}>
                  Atmospheric AI Style Tagging.
                </h2>
                <p className="text-sm font-body leading-relaxed" style={s.secondary}>
                  No middleman. No gatekeeping. Our proprietary model analyzes your vocal and dramatic attributes to generate rich profile style tags so clients find your unique vibe instantly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>
                    Analyze My Performance Reel
                  </Button>
                </div>
              </div>
              <div>
                <AITaggingDemo />
              </div>
            </div>
          </div>

          {/* Tile 2: Escrow Protection & Order Room (Dark Canvas + Dynamic Demo + CTA) */}
          <div className="py-20 px-5 md:px-16" style={{ background: "#0f0f11", color: "#ffffff" }}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <EscrowDemo />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider font-body text-emerald-400">FINCRA Integrated Escrow</span>
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
                  Payment Security.<br />Automated.
                </h2>
                <p className="text-sm leading-relaxed text-white/70">
                  Payments are locked safely in escrow before you begin recording. The moment deliverables are uploaded and approved by the client, funds release automatically to your bank.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="h-10 px-6 text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-600 border-none" onClick={() => navigate("/auth")}>
                    Book Talent Safely
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Curated Art Categories (Nice Photography Cards + CTA) ── */}
        <section className="py-24 px-5 md:px-16" style={{ background: "var(--color-bg-canvas)" }}>
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={s.text}>Built for every creative discipline</h2>
              <p className="text-xs uppercase tracking-wider" style={s.tertiary}>Connecting top artists with premium brand campaigns</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {NICHES.map((niche, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative aspect-[3/4] rounded-[var(--radius-xl)] overflow-hidden border cursor-pointer transition-shadow hover:shadow-lg"
                  style={s.inkBorder}
                  onClick={() => navigate("/auth")}
                >
                  <img
                    src={niche.img}
                    alt={niche.label}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-sm font-semibold font-body">{niche.label}</div>
                    <div className="text-[10px] text-white/70 font-mono mt-0.5">{niche.stat} active profiles</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button variant="secondary" className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>
                Browse All 8 Niche Categories
              </Button>
            </div>
          </div>
        </section>

        {/* ── Go Live in 3 Steps (How it works + CTA) ── */}
        <section id="how-it-works" className="py-20 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)" }}>
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>Fast Onboarding</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={s.text}>How Monologg Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-[var(--radius-xl)] border space-y-3 transition-shadow hover:shadow-md"
                  style={{ background: "var(--color-bg-canvas)", borderColor: "var(--color-hairline)" }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}>
                    {step.num}
                  </div>
                  <h3 className="font-display text-base font-semibold" style={s.text}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={s.secondary}>{step.body}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>
                Get Started Now
              </Button>
            </div>
          </div>
        </section>

        {/* ── Testimonials + CTA ── */}
        <section className="py-20 px-5 md:px-16" style={{ background: "var(--color-bg-canvas)" }}>
          <div className="max-w-5xl mx-auto space-y-12">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-center" style={s.text}>Endorsed by working artists</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="p-6 rounded-[var(--radius-xl)] border flex flex-col justify-between transition-shadow hover:shadow-md" style={s.surface}>
                  <p className="text-xs italic font-body leading-relaxed mb-6" style={s.secondary}>
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 text-xs" background="var(--color-accent-glow)" color="var(--color-accent)">
                      {t.avatar}
                    </Avatar>
                    <div>
                      <div className="text-xs font-bold font-body" style={s.text}>{t.name}</div>
                      <div className="text-[10px]" style={s.tertiary}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button variant="secondary" className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>
                Join the Elite Roster
              </Button>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-20 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)" }}>
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl md:text-5xl font-bold" style={s.text}>Simple value fees</h2>
              <p className="text-xs" style={s.tertiary}>Zero monthly subscription. We only make money when you do.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[var(--radius-xl)] border space-y-4" style={{ background: "var(--color-bg-canvas)", borderColor: "var(--color-hairline)" }}>
                <h3 className="font-display text-lg font-semibold" style={s.text}>For Creative Talent</h3>
                <div className="text-3xl font-bold font-display" style={{ color: "var(--color-accent)" }}>9%</div>
                <div className="text-xs" style={s.tertiary}>Charged per completed transaction. Profile, rate cards, and style analysis are 100% free.</div>
                <Button className="w-full h-9 text-xs" onClick={() => navigate("/auth")}>Launch Storefront Free</Button>
              </div>

              <div className="p-6 rounded-[var(--radius-xl)] border space-y-4" style={{ background: "var(--color-bg-canvas)", borderColor: "var(--color-hairline)" }}>
                <h3 className="font-display text-lg font-semibold" style={s.text}>For Clients &amp; Brands</h3>
                <div className="text-3xl font-bold font-display" style={{ color: "var(--color-purple)" }}>12%</div>
                <div className="text-xs" style={s.tertiary}>Escrow protection &amp; platform processing fee. Pay only when deliverables are approved.</div>
                <Button variant="secondary" className="w-full h-9 text-xs" onClick={() => navigate("/auth")}>Post a Project</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ + CTA ── */}
        <section className="py-20 px-5 md:px-16" style={{ background: "var(--color-bg-canvas)" }}>
          <div className="max-w-2xl mx-auto space-y-12">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-center" style={s.text}>Frequently Asked Questions</h2>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-[var(--radius-md)] border animate-fade-in" style={s.inkBorder}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold"
                    style={{ background: "var(--color-bg-surface)" }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }} />
                  </button>
                  {openFaq === i && (
                    <div className="p-4 text-xs leading-relaxed border-t" style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-secondary)", borderColor: "var(--color-hairline)" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button variant="secondary" className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>
                Still Have Questions? Join Monologg
              </Button>
            </div>
          </div>
        </section>

        {/* ── Final Conversion CTA (Apple Style Quote) ── */}
        <section className="py-24 px-5 md:px-16 text-center border-t" style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)" }}>
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight" style={s.text}>
              Take control of your craft.
            </h2>
            <p className="text-sm font-body max-w-lg mx-auto" style={s.secondary}>
              Join over 3,200 verified actors, hosts, and creators getting booked directly with zero commission on their first booking.
            </p>
            <div className="flex justify-center gap-3">
              <Button className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>Launch Storefront Free</Button>
              <Button variant="secondary" className="h-10 px-6 text-xs font-semibold" onClick={() => navigate("/auth")}>Post a Project</Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-12 px-5 md:px-16" style={{ background: "#000000", borderTop: "1px solid #222225", color: "#ffffff" }}>
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-3">
              <Logo className="h-5 w-auto" style={{ color: "#ffffff" }} />
              <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                The world's first brief-to-booking pipeline for performing arts and the creator economy.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs">
              <div>
                <h4 className="font-bold mb-2">Product</h4>
                <ul className="space-y-1.5 text-white/50">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2">Legal</h4>
                <ul className="space-y-1.5 text-white/50">
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="text-white/50">
                <h4 className="font-bold mb-2 text-white">Security Integration</h4>
                <p className="text-[11px] leading-relaxed">Secured by FINCRA Escrow. NDPA compliant and protected against fraud.</p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-[#222225] flex flex-col md:flex-row justify-between items-center text-[10px] text-white/40">
            <span>© {new Date().getFullYear()} Monologg Inc. All rights reserved.</span>
            <span>Nigerian Data Protection Act verified.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
