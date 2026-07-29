import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Logo } from "../components/ui/Logo";
import { useTheme } from "../Root";
import { cn } from "../../lib/utils";
import {
  Copy, Star, Shield, Zap, ArrowRight, Mic, Video, User,
  Sun, Moon, Check, ChevronDown, Play, TrendingUp, Clock,
  Lock, MessageSquare, FileText, Users, Award, Briefcase, Quote, Sparkles
} from "lucide-react";

const NICHES = [
  { label: "Actors", icon: User, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80&fit=crop", stat: "1,240+" },
  { label: "Voice Artists", icon: Mic, img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80&fit=crop", stat: "890+" },
  { label: "Comedians", icon: Star, img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80&fit=crop", stat: "430+" },
  { label: "Comperes", icon: Video, img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80&fit=crop", stat: "620+" },
];

const STEPS = [
  {
    num: "01",
    title: "Build Your Style Profile",
    body: "Upload your showcase reel. Thespian AI analyzes your performance parameters and generates style tags in seconds — no middleman, no gatekeeping.",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Set Your Rate Cards",
    body: "Turn your craft into purchasable services. Actors, voice artists, comedians — define what you offer and your price.",
    icon: FileText,
  },
  {
    num: "03",
    title: "Get Booked. Get Paid.",
    body: "Clients discover you, lock payment in escrow, and you deliver. Funds release the moment you're done. No waiting, no chasing.",
    icon: TrendingUp,
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Thespian AI Style Tagging",
    desc: "Our proprietary AI reviews your reel and generates style tags — warm, dramatic, high-energy — so clients find your vibe fast. Identity verification is a separate, independent check.",
    badge: "AI-Powered",
  },
  {
    icon: Zap,
    title: "Instant Rate Cards",
    desc: "Build purchasable services in minutes. Clients can book directly with one click.",
    badge: "No-Haggle",
  },
  {
    icon: Lock,
    title: "Escrow Protection",
    desc: "Payment is locked before work begins. You're paid automatically on approval.",
    badge: "FINCRA Backed",
  },
  {
    icon: MessageSquare,
    title: "Collaborative Order Room",
    desc: "A dedicated workspace for each booking. Files, milestones, real-time chat.",
    badge: "Real-Time",
  },
  {
    icon: Clock,
    title: "Availability Calendar",
    desc: "Set your slots and let bookings come to you. Never double-booked.",
    badge: "Smart Scheduling",
  },
  {
    icon: TrendingUp,
    title: "Earnings Analytics",
    desc: "Income trends, profile views, conversion data — know what's working.",
    badge: "Insights",
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

const STATS = [
  { value: "3,200+", label: "Verified Talents" },
  { value: "₦2.4B+", label: "Paid Out" },
  { value: "12,000+", label: "Bookings Completed" },
  { value: "98%", label: "Satisfaction Rate" },
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

/* ── Local visual primitives — landing-page-only, additive to the shared
   design system, never applied to the rest of the app ── */

function Eyebrow({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "purple" }) {
  const color = tone === "purple" ? "var(--color-purple)" : "var(--color-red)";
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs font-mono font-medium uppercase tracking-[0.1em]" style={{ color }}>{children}</span>
    </div>
  );
}

function IconTile({
  icon: Icon,
  size = "md",
  tone = "red",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  size?: "sm" | "md" | "lg";
  tone?: "red" | "purple";
}) {
  const dims = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-9 h-9" : "w-12 h-12";
  const iconDims = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const [from, to] = tone === "purple"
    ? ["var(--color-purple)", "var(--color-purple-press)"]
    : ["var(--color-red)", "var(--color-red-press)"];
  return (
    <div
      className={cn(dims, "rounded-[var(--radius-md)] flex items-center justify-center shrink-0")}
      style={{
        background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -8px 12px rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.18)",
      }}
    >
      <Icon className={iconDims} style={{ color: "#fff" }} />
    </div>
  );
}

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const copyLink = () => {
    alert("Copied to clipboard: https://monologg.app/invite/abc1234");
  };

  const bentoItems: Array<
    | { kind: "feature"; feature: (typeof FEATURES)[number]; span: "big" | "tall" | "normal" }
    | { kind: "stat"; value: string; label: string; span: "tall" }
  > = [
    { kind: "feature", feature: FEATURES[0], span: "big" },
    { kind: "feature", feature: FEATURES[1], span: "normal" },
    { kind: "feature", feature: FEATURES[2], span: "normal" },
    { kind: "stat", value: STATS[1].value, label: STATS[1].label, span: "tall" },
    { kind: "feature", feature: FEATURES[3], span: "normal" },
    { kind: "feature", feature: FEATURES[4], span: "normal" },
    { kind: "feature", feature: FEATURES[5], span: "normal" },
  ];

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }} className="min-h-screen flex flex-col overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <header
        className="h-20 sticky top-0 z-50 px-5 md:px-16 flex items-center justify-between backdrop-blur-xl"
        style={{ background: "color-mix(in srgb, var(--color-bg-canvas) 72%, transparent)", borderBottom: "1px solid var(--color-hairline)" }}
      >
        <Logo className="h-6 w-auto" style={{ color: "var(--color-text-primary)" }} title="Monologg" />
        <nav className="hidden md:flex items-center gap-9">
          {["Features", "How It Works", "Talent", "Pricing"].map(item => (
            <button
              key={item}
              className="font-body text-[length:var(--font-size-sm)] opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggle}
            className="w-11 h-11 rounded-[var(--radius-full)] flex items-center justify-center border transition-colors active:scale-[0.97]"
            style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <Button
            variant="ghost"
            className="h-11 px-4 text-sm hidden md:inline-flex"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button
            className="h-11 px-5 text-sm"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative pt-16 pb-24 md:pt-20 md:pb-28 px-5 md:px-16 overflow-hidden">
          {/* Dual-tone atmosphere: Monologg's own red↔purple duality, not a
              borrowed accent — the two blobs never fully merge, echoing the
              two-sided marketplace. */}
          <div
            className="absolute -top-48 -left-24 w-[640px] h-[640px] rounded-full pointer-events-none opacity-80"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--color-red-glow) 0%, transparent 70%)", filter: "blur(70px)" }}
          />
          <div
            className="absolute -top-32 -right-24 w-[560px] h-[560px] rounded-full pointer-events-none opacity-80"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--color-purple-glow) 0%, transparent 70%)", filter: "blur(70px)" }}
          />

          <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-full)] text-xs font-medium tracking-wide mb-7"
                style={{ background: "var(--color-red-soft)", border: "1px solid var(--color-hairline)", color: "var(--color-red)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-red)" }} />
                Now in Early Access · 3,200+ Verified Talents
              </div>

              <h1 className="font-display text-[52px] md:text-[80px] leading-[0.98] tracking-[-0.035em] mb-6">
                Your next booking is{" "}
                <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  3 clicks
                </span>{" "}
                away.
              </h1>

              <p
                className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-body"
                style={{ color: "var(--color-text-secondary)" }}
              >
                The world's first brief-to-booking pipeline for performing arts and the creator economy. Verified profiles, escrow payments, zero middlemen.
              </p>

              <div className="max-w-md relative min-h-[160px] mb-10">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      onSubmit={handleSubmit}
                      className="p-6 rounded-[var(--radius-2xl)] flex flex-col gap-3"
                      style={{
                        background: "var(--color-bg-surface)",
                        border: "1px solid var(--color-hairline)",
                        boxShadow: "var(--shadow-cutout)",
                      }}
                    >
                      <p className="text-sm font-medium text-left font-body" style={{ color: "var(--color-text-secondary)" }}>
                        Join the Verification Queue — it's free
                      </p>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 h-12">
                          Launch My Storefront
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1 h-12"
                          onClick={() => navigate("/auth")}
                        >
                          Find Talent
                        </Button>
                      </div>
                      <p className="text-xs text-center font-body" style={{ color: "var(--color-text-tertiary)" }}>
                        No credit card required · Cancel anytime
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-[var(--radius-2xl)] flex flex-col items-center text-center"
                      style={{
                        background: "var(--color-bg-surface)",
                        border: "1px solid var(--color-hairline)",
                        boxShadow: "var(--shadow-cutout)",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                        style={{ background: "var(--color-success-bg)" }}
                      >
                        <Check className="w-6 h-6" style={{ color: "var(--color-success)" }} />
                      </div>
                      <h3 className="font-display text-2xl mb-1" style={{ color: "var(--color-red)" }}>
                        You're in.
                      </h3>
                      <p className="text-sm font-body mb-1" style={{ color: "var(--color-text-primary)" }}>
                        You are <strong style={{ color: "var(--color-success)" }}>#347</strong> in the Verification Queue.
                      </p>
                      <p className="text-xs mb-4 font-body" style={{ color: "var(--color-text-secondary)" }}>
                        Share your link to climb the roster.
                      </p>
                      <div
                        className="w-full flex items-center gap-2 p-2 pl-4 rounded-full mb-3"
                        style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}
                      >
                        <span className="font-mono text-xs flex-1 text-left truncate" style={{ color: "var(--color-text-secondary)" }}>
                          monologg.app/invite/abc1234
                        </span>
                        <Button variant="ghost" className="h-8 px-3 text-xs shrink-0" onClick={copyLink}>
                          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Social proof: overlapping photo cluster + stat, more human
                  than a bare number */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-3">
                  {NICHES.map((n, i) => (
                    <Avatar
                      key={i}
                      size="md"
                      src={n.img}
                      alt={n.label}
                      className="border-4 border-[var(--color-bg-canvas)]"
                      background="var(--color-bg-elevated)"
                    >
                      {n.label[0]}
                    </Avatar>
                  ))}
                </div>
                <div className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                  <strong style={{ color: "var(--color-text-primary)" }}>3,200+</strong> talents already booking
                </div>
              </div>
            </motion.div>

            {/* Floating product mockup — the "3-clicks" booking in miniature */}
            <motion.div
              className="hidden lg:block relative"
              initial={{ opacity: 0, y: 20, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-[var(--radius-2xl)] p-5 max-w-sm"
                style={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-hairline)",
                  boxShadow: "var(--shadow-cutout)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-[0.1em]" style={{ color: "var(--color-text-tertiary)" }}>
                    Order Room
                  </span>
                  <Badge tone="success" size="sm">Escrow Active</Badge>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar size="lg" src={NICHES[0].img} alt="Talent">CO</Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold font-body truncate">Chidi Okeke</span>
                      <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-success)" }} />
                    </div>
                    <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Actor · Corporate VO</div>
                  </div>
                </div>
                <div className="rounded-[var(--radius-md)] p-3 mb-3" style={{ background: "var(--color-bg-elevated)" }}>
                  <div className="flex items-center justify-between text-xs font-body mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                    <span>Payment held in escrow</span>
                    <span className="font-mono tnum" style={{ color: "var(--color-text-primary)" }}>₦45,000</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border-default)" }}>
                    <div className="h-full rounded-full" style={{ width: "70%", background: "var(--gradient-brand)" }} />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Badge tone="accent" size="sm">Dramatic</Badge>
                  <Badge tone="accent" size="sm">Deep Voice</Badge>
                </div>
              </motion.div>

              {/* Small floating stat chip, offset behind the card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-8 rounded-[var(--radius-lg)] px-4 py-3 hidden xl:block"
                style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-cutout-sm)" }}
              >
                <div className="text-xs font-mono uppercase tracking-[0.1em] mb-1" style={{ color: "var(--color-text-tertiary)" }}>Paid out</div>
                <div className="font-display text-xl tnum" style={{ color: "var(--color-purple)" }}>₦2.4B+</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Niche Grid ── */}
        <section className="py-24 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-center mb-12" style={{ color: "var(--color-text-tertiary)" }}>
              Built for every performing creative
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {NICHES.map((niche, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  whileHover={{ rotate: 0, y: -4 }}
                  style={{ rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                  className="relative aspect-[3/4] rounded-[var(--radius-xl)] overflow-hidden cursor-pointer"
                >
                  <div
                    className="absolute inset-0 rounded-[var(--radius-xl)]"
                    style={{ border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-cutout)" }}
                  />
                  <img
                    src={niche.img}
                    alt={niche.label}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }}
                  />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-sm font-semibold font-body text-white">{niche.label}</div>
                    <div className="text-xs font-body tnum" style={{ color: "rgba(255,255,255,0.82)" }}>{niche.stat} talents</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-24 px-5 md:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center"><Eyebrow tone="red">For Talent</Eyebrow></div>
              <h2 className="font-display text-4xl md:text-5xl mb-4">
                Go live in 3 steps
              </h2>
              <p className="text-base font-body max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                No agents. No waiting lists. No commission on your first booking.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-8 left-full w-8 border-t border-dashed"
                      style={{ borderColor: "var(--color-red)" }}
                    />
                  )}
                  <div className="mb-5"><IconTile icon={step.icon} tone="red" /></div>
                  <div
                    className="text-xs font-mono font-medium mb-2"
                    style={{ color: "var(--color-red)" }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-body text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {step.body}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button onClick={() => navigate("/auth")} className="h-12 px-8">
                Start Your Free Profile <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── Features Bento ── */}
        <section
          className="py-24 px-5 md:px-16"
          style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center"><Eyebrow tone="red">Platform Features</Eyebrow></div>
              <h2 className="font-display text-4xl md:text-5xl mb-4">
                Everything you need, nothing you don't
              </h2>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              style={{ gridAutoFlow: "dense" }}
            >
              {bentoItems.map((item, i) => {
                const spanClass =
                  item.span === "big" ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" :
                  item.span === "tall" ? "lg:row-span-2" : "";

                if (item.kind === "stat") {
                  return (
                    <motion.div
                      key={`stat-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className={cn("p-6 rounded-[var(--radius-xl)] flex flex-col justify-between", spanClass)}
                      style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-cutout)" }}
                    >
                      <TrendingUp className="w-6 h-6 mb-6" style={{ color: "rgba(255,255,255,0.85)" }} />
                      <div>
                        <div className="font-display text-4xl mb-1 tnum text-white">{item.value}</div>
                        <div className="text-sm font-body" style={{ color: "rgba(255,255,255,0.85)" }}>{item.label}</div>
                      </div>
                    </motion.div>
                  );
                }

                const f = item.feature;
                const isBig = item.span === "big";
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    className={cn("p-6 rounded-[var(--radius-xl)] flex flex-col", spanClass)}
                    style={{
                      background: "var(--color-bg-elevated)",
                      boxShadow: "var(--shadow-cutout)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <IconTile icon={f.icon} size={isBig ? "lg" : "md"} tone="red" />
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-[var(--radius-full)] font-body"
                        style={{ background: "var(--color-red-soft)", color: "var(--color-red)" }}
                      >
                        {f.badge}
                      </span>
                    </div>
                    <h3 className={cn("font-body font-semibold mb-2", isBig ? "text-xl" : "text-base")}>{f.title}</h3>
                    <p className={cn("font-body leading-relaxed", isBig ? "text-base" : "text-sm")} style={{ color: "var(--color-text-secondary)" }}>
                      {f.desc}
                    </p>
                    {isBig && (
                      <div className="mt-auto pt-6 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border-default)" }}>
                          <div className="h-full rounded-full" style={{ width: "82%", background: "var(--color-red)" }} />
                        </div>
                        <span className="text-xs font-mono tnum shrink-0" style={{ color: "var(--color-text-tertiary)" }}>82% match</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Full-bleed photography break ── */}
        <section className="relative h-[360px] md:h-[440px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80&fit=crop"
            alt="Live performance"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)" }} />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
            <p className="text-xs font-mono uppercase tracking-[0.15em] mb-4 text-white/70">Every night, somewhere on Monologg</p>
            <h2 className="font-display text-white text-4xl md:text-6xl tracking-[-0.03em] max-w-2xl">
              Real stages. Real gigs. Real pay.
            </h2>
          </div>
        </section>

        {/* ── For Clients Section ── */}
        <section className="py-24 md:py-32 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Eyebrow tone="purple">For Clients &amp; Brands</Eyebrow>
                <h2 className="font-display text-4xl md:text-[length:var(--font-size-4xl)] leading-[1.05] mb-5">
                  Find the right talent in minutes, not weeks
                </h2>
                <p className="text-base font-body mb-8 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  Post a brief, browse verified profiles with AI-generated style tags, and book with one click. Our escrow system means you only pay when you're completely satisfied.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Users, text: "3,200+ verified talents across 8 creative niches, each with AI-generated style tags" },
                    { icon: Lock, text: "Escrow protection — your money is safe until work is approved" },
                    { icon: Clock, text: "Real-time availability — no more scheduling email chains" },
                    { icon: Award, text: "Performance reels, client reviews, and AI vibe tags on every profile" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <IconTile icon={item.icon} size="sm" tone="purple" />
                      <p className="text-sm font-body pt-1.5" style={{ color: "var(--color-text-secondary)" }}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => navigate("/auth")} variant="secondary" className="h-12 px-8">
                  Post a Project <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Mock client dashboard preview */}
              <motion.div
                initial={{ opacity: 0, y: 12, rotate: 1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 1.5 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                className="rounded-[var(--radius-2xl)] overflow-hidden p-5"
                style={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-hairline)",
                  boxShadow: "var(--shadow-cutout)",
                }}
              >
                <div className="text-xs font-mono uppercase tracking-[0.1em] mb-4" style={{ color: "var(--color-text-tertiary)" }}>
                  Talent Discovery
                </div>
                {[
                  { name: "Chidi Okeke", role: "Actor · Lagos", price: "₦45,000", verified: true, tags: ["Dramatic", "Deep Voice"], img: NICHES[0].img },
                  { name: "Amara Diallo", role: "Voice Artist · Accra", price: "₦28,000", verified: true, tags: ["Warm", "Multilingual"], img: NICHES[1].img },
                  { name: "Kofi Mensah", role: "Comedian · Accra", price: "₦60,000", verified: true, tags: ["Corporate", "Witty"], img: NICHES[2].img },
                ].map((talent, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl mb-2 last:mb-0"
                    style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}
                  >
                    <Avatar size="md" src={talent.img} alt={talent.name} background="var(--color-purple-soft)" color="var(--color-purple)">
                      {talent.name.split(" ").map(n => n[0]).join("")}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold font-body">{talent.name}</span>
                        {talent.verified && (
                          <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                        )}
                      </div>
                      <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{talent.role}</div>
                      <div className="flex gap-1 mt-1">
                        {talent.tags.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded-full font-body" style={{ background: "var(--color-purple-soft)", color: "var(--color-purple)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm font-semibold font-body tnum" style={{ color: "var(--color-purple)" }}>{talent.price}</div>
                  </div>
                ))}
                <Button className="w-full mt-4 h-9 text-sm">Browse All Talent</Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section
          className="py-24 px-5 md:px-16"
          style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center"><Eyebrow tone="red">Creator Stories</Eyebrow></div>
              <h2 className="font-display text-4xl md:text-5xl">
                Real results from real talent
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  className="p-7 rounded-[var(--radius-xl)] relative"
                  style={{
                    background: "var(--color-bg-elevated)",
                    boxShadow: "var(--shadow-cutout)",
                  }}
                >
                  <Quote className="w-8 h-8 absolute top-5 right-5 opacity-[0.08]" style={{ color: "var(--color-text-primary)" }} />
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" style={{ color: "var(--color-gold)" }} />
                    ))}
                  </div>
                  <p className="text-[15px] font-body leading-relaxed mb-6" style={{ color: "var(--color-text-primary)" }}>
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" src={t.photo} alt={t.name} background="var(--color-red-soft)" color="var(--color-red)">
                      {t.avatar}
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold font-body">{t.name}</div>
                      <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing / Value Prop ── */}
        <section className="py-24 px-5 md:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center"><Eyebrow tone="red">Simple, Transparent Pricing</Eyebrow></div>
            <h2 className="font-display text-4xl md:text-5xl mb-4">
              No subscription. No lock-in.
            </h2>
            <p className="text-base font-body mb-12" style={{ color: "var(--color-text-secondary)" }}>
              We succeed when you succeed. We only take a fee when a booking is completed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {[
                {
                  title: "For Talent",
                  icon: Briefcase,
                  fee: "9%",
                  feeLabel: "per completed booking",
                  perks: [
                    "Free profile creation",
                    "Unlimited rate cards",
                    "AI-generated style tags included",
                    "Availability calendar",
                    "Earnings analytics dashboard",
                    "Direct client messaging",
                  ],
                  cta: "Launch Storefront Free",
                  highlight: false,
                  tone: "red" as const,
                  accent: "var(--color-red)",
                },
                {
                  title: "For Clients",
                  icon: Users,
                  fee: "12%",
                  feeLabel: "escrow processing fee",
                  perks: [
                    "Free account & project posting",
                    "Unlimited talent browsing",
                    "Escrow-backed payments",
                    "Order Room collaboration",
                    "File sharing & milestones",
                    "24/7 dispute support",
                  ],
                  cta: "Post a Project Free",
                  highlight: true,
                  tone: "purple" as const,
                  accent: "var(--color-purple)",
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className="p-6 md:p-7 rounded-[var(--radius-2xl)]"
                  style={{
                    background: "var(--color-bg-surface)",
                    border: `1px solid ${plan.highlight ? plan.accent : "var(--color-hairline)"}`,
                    boxShadow: "var(--shadow-cutout)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <IconTile icon={plan.icon} size="sm" tone={plan.tone} />
                    <h3 className="font-body text-base font-semibold">{plan.title}</h3>
                  </div>
                  <div className="mb-5">
                    <span className="font-display text-5xl tnum" style={{ color: plan.accent }}>{plan.fee}</span>
                    <span className="text-sm font-body ml-2" style={{ color: "var(--color-text-secondary)" }}>{plan.feeLabel}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.perks.map((p, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                        <Check className="w-4 h-4 shrink-0" style={{ color: "var(--color-success)" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full h-11"
                    variant={plan.highlight ? "primary" : "secondary"}
                    onClick={() => navigate("/auth")}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          className="py-24 px-5 md:px-16"
          style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl mb-4">
                Frequently asked
              </h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--color-hairline)" }}
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    style={{ background: "var(--color-bg-elevated)" }}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-semibold font-body">{faq.q}</span>
                    <ChevronDown
                      className="w-4 h-4 shrink-0 ml-3 transition-transform"
                      style={{
                        color: "var(--color-text-tertiary)",
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 py-4 text-sm font-body leading-relaxed"
                          style={{ color: "var(--color-text-secondary)", background: "var(--color-bg-surface)" }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative py-28 px-5 md:px-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--gradient-brand-soft)" }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex justify-center mb-7">
              <IconTile icon={Play} size="lg" tone="red" />
            </div>
            <h2 className="font-display text-4xl md:text-[64px] leading-[1.04] mb-5">
              Your career belongs here.
            </h2>
            <p className="text-base font-body mb-10" style={{ color: "var(--color-text-secondary)" }}>
              Join 3,200+ performing artists and content creators who've taken control of their bookings. Launch your free storefront today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="h-12 px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>
                Launch Storefront Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" className="h-12 px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>
                Post a Project
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-10 px-5 md:px-16"
        style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <Logo className="h-6 w-auto mb-2" style={{ color: "var(--color-text-primary)" }} />
              <p className="text-sm font-body max-w-xs" style={{ color: "var(--color-text-tertiary)" }}>
                The world's first brief-to-booking pipeline for performing arts and the creator economy.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm font-body">
              {[
                { heading: "Product", links: ["Features", "How It Works", "Pricing", "Changelog"] },
                { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
                { heading: "Legal", links: ["Terms", "Privacy", "Cookies", "Contact"] },
              ].map((col, i) => (
                <div key={i}>
                  <div className="font-semibold mb-3">{col.heading}</div>
                  <ul className="space-y-2">
                    {col.links.map(l => (
                      <li key={l}>
                        <a href="#" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div
            className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: "var(--color-hairline)" }}
          >
            <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
              © {new Date().getFullYear()} Monologg Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
              <Lock className="w-3 h-3" style={{ color: "var(--color-success)" }} />
              Secured by FINCRA Escrow · Nigerian Data Protection Act compliant
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
