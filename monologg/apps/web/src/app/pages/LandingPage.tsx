import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { Logo } from "../components/ui/Logo";
import { WebGLHeroCanvas } from "../components/ui/WebGLHeroCanvas";
import { useTheme } from "../Root";
import {
  Star, Shield, Mic, Video, User,
  Sun, Moon, Check, ChevronDown,
  Menu, X, UploadCloud, Lock, RefreshCw, Sparkles, MessageSquare,
  Play, Pause, ArrowRight, Smartphone, QrCode, DollarSign, Repeat, Zap
} from "lucide-react";

// ── Interactive Talent Roster Data ──
const FEATURED_TALENTS = [
  {
    id: "t1",
    name: "Emeka Johnson",
    category: "Dramatic Voice Artist",
    location: "Lagos · Global Remote",
    rate: "₦120,000 / day",
    usdRate: "$150 USD",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&fit=crop",
    audioSample: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    tags: ["Deep Tone", "Nollywood Drama", "Accented", "High Energy"],
    rating: 4.98,
    reviews: 142,
    verified: true,
  },
  {
    id: "t2",
    name: "Amara Kalu",
    category: "Commercial Lead Actor",
    location: "Abuja · On-Site",
    rate: "₦250,000 / day",
    usdRate: "$310 USD",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop",
    audioSample: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    tags: ["Charismatic", "Lead Presence", "Brand Campaign", "Fluency"],
    rating: 5.0,
    reviews: 98,
    verified: true,
  },
  {
    id: "t3",
    name: "Tariq Mansoor",
    category: "Live Event Compere",
    location: "Accra · International",
    rate: "₦180,000 / event",
    usdRate: "$225 USD",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&fit=crop",
    audioSample: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg",
    tags: ["Stage Command", "Multilingual", "Corporate", "Humor"],
    rating: 4.95,
    reviews: 84,
    verified: true,
  },
];

// ── Step Process ──
const STEPS = [
  {
    num: "01",
    title: "Upload Reel & Style Tags",
    body: "Upload your performance reel. Thespian AI extracts tone, diction, and presence — building your verified style card in under 30 seconds.",
  },
  {
    num: "02",
    title: "Define Purchasable Rate Cards",
    body: "Turn your craft into seamless booking packages. Set transparent prices for voice-overs, film appearances, and live hosting.",
  },
  {
    num: "03",
    title: "Instant Booking & Escrow Release",
    body: "Clients book and fund contracts into FINCRA escrow. Funds auto-release directly to your bank account upon deliverable approval.",
  },
];

// ── Testimonials ──
const TESTIMONIALS = [
  {
    name: "Adaeze Obi",
    role: "Senior Voice Artist · Lagos",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&fit=crop",
    quote: "I used to lose 25% to talent agencies just to make phone calls. Monologg gave me direct client bookings and instant escrow payouts. Game changer.",
    metric: "₦3.8M earned on platform",
    tag: "Voice-Over",
  },
  {
    name: "Tunde Balogun",
    role: "Commercial Actor · Abuja",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop",
    quote: "Having AI style tagging on my profile gave international casting directors immediate confidence. Booked my first global spot in 72 hours.",
    metric: "14 International Bookings",
    tag: "Acting",
  },
  {
    name: "Sarah Mensah",
    role: "Head of Talent · Brand Matrix Accra",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&fit=crop",
    quote: "Sourcing voice actors used to mean 2 weeks of WhatsApp back-and-forth. On Monologg, we shortlist, preview reels, and lock escrow in 15 minutes.",
    metric: "80+ Hours Saved / Mo",
    tag: "Client / Brand",
  },
];

// ── FAQ Accordion ──
const FAQS = [
  {
    q: "What fee does Monologg charge creators?",
    a: "Monologg charges a flat 9% platform commission on completed talent bookings. Profile creation, rate cards, and AI style tagging are 100% free.",
  },
  {
    q: "How does the Wise-style Escrow protection work?",
    a: "When a client places an order, full contract payment is securely locked in FINCRA Escrow. Talent works with complete peace of mind, and funds auto-release immediately when deliverables are approved.",
  },
  {
    q: "How does Thespian AI Style Tagging work?",
    a: "Upload any 30-90 second performance reel (audio or video up to 150MB). Thespian AI analyzes vocal resonance, pacing, and dramatic timbre to tag your profile automatically.",
  },
  {
    q: "Which countries and currencies are supported?",
    a: "Monologg supports multi-currency escrow payouts in NGN (Nigerian Naira), GHS (Ghanaian Cedi), KES (Kenyan Shilling), USD, and GBP.",
  },
];

// ── Wise-Inspired Interactive Booking Calculator Component ──
function WiseBookingCalculator() {
  const [amount, setAmount] = useState(150000);
  const [currency, setCurrency] = useState("NGN");

  const platformFee = Math.round(amount * 0.09);
  const escrowFee = Math.round(amount * 0.12);
  const talentEarnings = amount;
  const clientTotal = amount + escrowFee;

  return (
    <div
      className="p-6 md:p-8 rounded-[28px] transition-all duration-300 relative overflow-hidden"
      style={{
        background: "#163300",
        color: "#ffffff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#9fe870] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#9fe870]">
            Wise Escrow Calculator
          </span>
        </div>
        <div className="bg-[#054d28] px-3 py-1 rounded-full text-xs text-[#9fe870] font-mono">
          Guaranteed 100% Escrow
        </div>
      </div>

      <div className="space-y-4">
        {/* Input box 1: Booking Amount */}
        <div className="bg-white rounded-[16px] p-4 text-black space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
            <span>Client Pays Total Contract</span>
            <span className="font-mono">Including Escrow</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={clientTotal}
              readOnly
              className="text-2xl font-bold font-mono bg-transparent outline-none w-full text-[#163300]"
            />
            <div className="flex items-center gap-2 bg-[#e8ebe6] px-3 py-1.5 rounded-full text-xs font-bold text-[#163300] shrink-0">
              <span className="w-5 h-5 rounded-full bg-[#9fe870] text-[10px] flex items-center justify-center font-black">
                🇳🇬
              </span>
              <span>{currency}</span>
            </div>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2 px-2 text-xs text-white/80">
          <div className="flex justify-between items-center py-1 border-b border-white/10">
            <span>Talent Base Rate</span>
            <span className="font-mono text-[#9fe870]">
              ₦{amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/10">
            <span>Platform Escrow Fee (12%)</span>
            <span className="font-mono">₦{escrowFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>Talent Receives (Net Payout)</span>
            <span className="font-mono font-bold text-white text-sm">
              ₦{talentEarnings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Range slider */}
        <div className="pt-2">
          <div className="flex justify-between text-[11px] text-[#9fe870] mb-1 font-mono">
            <span>Adjust Booking Amount</span>
            <span>₦{amount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={50000}
            max={1000000}
            step={25000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-[#9fe870] cursor-pointer"
          />
        </div>

        {/* Primary Wise Lime CTA */}
        <div className="pt-2">
          <button
            className="w-full py-3.5 px-6 rounded-full bg-[#9fe870] text-[#163300] font-bold text-sm hover:bg-[#8edb5f] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap className="w-4 h-4 fill-current" />
            Lock Contract in Escrow
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3D Interactive Talent Card Component ──
function Talent3DCard({ talent }: { talent: (typeof FEATURED_TALENTS)[0] }) {
  const [playing, setPlaying] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 15;
    const y = (e.clientY - rect.top - rect.height / 2) / -15;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.y, rotateY: tilt.x }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
      className="group relative rounded-[24px] overflow-hidden bg-white dark:bg-[#16161A] border border-[var(--color-hairline)] p-4 transition-shadow hover:shadow-2xl cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden mb-4">
        <img
          src={talent.img}
          alt={talent.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{talent.rating}</span>
          <span className="text-white/60">({talent.reviews})</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(!playing);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#9fe870] text-[#163300] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {playing ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {playing && (
          <div className="absolute bottom-3 left-3 bg-[#163300]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono text-[#9fe870] flex items-center gap-2 border border-[#9fe870]/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#9fe870]" />
            <span>Playing Reel...</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-1.5 font-display text-[var(--color-text-primary)]">
            {talent.name}
            {talent.verified && (
              <Shield className="w-4 h-4 text-[#1A7544] fill-[#1A7544]/20" />
            )}
          </h3>
          <span className="text-xs font-bold font-mono text-[#1A7544] dark:text-[#9fe870]">
            {talent.rate}
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)] font-body">
          {talent.category} · {talent.location}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {talent.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#e2f6d5] text-[#163300] dark:bg-[#163300] dark:text-[#9fe870]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Floating QR App Badge Component ──
function FloatingQRBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 hidden lg:flex items-center gap-3 p-3 rounded-[18px] bg-[#163300] text-white border border-[#054d28] shadow-2xl hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="w-12 h-12 bg-white p-1 rounded-[12px] flex items-center justify-center shrink-0">
        <QrCode className="w-full h-full text-[#163300]" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#9fe870]">
          Get the Monologg App
        </div>
        <div className="text-[10px] text-white/70">Scan to download iOS/Android</div>
      </div>
    </motion.div>
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

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-body">
      {/* ── Top thin global announcement bar (Wise / Apple Style) ── */}
      <div className="h-[40px] bg-[#163300] text-[#9fe870] flex items-center justify-between px-6 text-xs font-semibold border-b border-[#054d28] z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9fe870] animate-ping" />
          <span className="uppercase tracking-widest text-[10px]">
            Monologg Marketplace v3.0 Live
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/80 text-[11px]">
          <span>FINCRA Escrow Secured</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono">3,200+ Verified Talents</span>
        </div>
      </div>

      {/* ── Frosted Sticky Header ── */}
      <header className="h-[64px] sticky top-0 z-40 px-6 md:px-16 flex items-center justify-between backdrop-blur-xl border-b border-[var(--color-hairline)] bg-[var(--color-bg-glass)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="h-6 w-auto text-[var(--color-text-primary)]" title="Monologg" />
        </div>

        {/* Wise Pill Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--color-bg-surface-2)] p-1 rounded-full border border-[var(--color-hairline)]">
          {["Features", "Talent Roster", "How it Works", "Escrow Calculator"].map((item, idx) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--color-hairline)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Button
            variant="outline-pill"
            className="h-9 px-4 text-xs font-bold hidden sm:inline-flex"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>

          <Button
            variant="lime"
            className="h-9 px-5 text-xs font-bold"
            onClick={() => navigate("/auth")}
          >
            Launch Storefront
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO SECTION (Hyper-Design Display Scale Typography + WebGL Canvas) ── */}
        <section className="relative pt-24 pb-32 px-6 md:px-16 overflow-hidden min-h-[85vh] flex items-center">
          <WebGLHeroCanvas />

          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
            {/* Top pill status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#e2f6d5] text-[#163300] dark:bg-[#163300] dark:text-[#9fe870] border border-[#9fe870]/30 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current text-[#163300] dark:text-[#9fe870]" />
              <span>THE FIRST BRIEF-TO-BOOKING PIPELINE FOR PERFORMING ARTS</span>
            </div>

            {/* Hyper-Design Architectural Block Display Headline */}
            <h1 className="font-wise-sans text-[52px] sm:text-[80px] md:text-[105px] font-black tracking-[-0.04em] leading-[0.88] text-[var(--color-text-primary)] uppercase max-w-5xl mx-auto">
              YOUR CRAFT. ON YOUR TERMS.<br />
              <span className="text-[#163300] dark:text-[#9fe870] underline decoration-[#9fe870] decoration-wavy">
                INSTANTLY BOOKED.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto font-body leading-relaxed font-medium">
              Verified performer profiles, Wise-inspired escrow protection, and AI style analysis. No middlemen, no gatekeeping.
            </p>

            {/* Waitlist Form / CTA Cluster */}
            <div className="max-w-lg mx-auto pt-2">
              {!submitted ? (
                <form
                  onSubmit={handleSubmit}
                  className="p-2 rounded-full bg-white dark:bg-[#16161A] border border-[var(--color-hairline)] shadow-xl flex items-center gap-2"
                >
                  <input
                    type="email"
                    placeholder="Enter email for instant storefront invite"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-5 py-3 text-xs md:text-sm bg-transparent outline-none text-[var(--color-text-primary)]"
                  />
                  <Button
                    type="submit"
                    variant="lime"
                    className="h-11 px-6 text-xs font-bold shrink-0"
                  >
                    Get Early Access <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              ) : (
                <div className="p-4 rounded-[20px] bg-[#e2f6d5] text-[#163300] border border-[#9fe870] flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-[#1A7544]" />
                  <span className="text-xs font-bold">
                    You're #347 in queue! Share link: monologg.app/invite/abc123
                  </span>
                </div>
              )}
            </div>

            {/* 3-Column Trust Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-12 border-t border-[var(--color-hairline)] text-center">
              <div>
                <div className="text-3xl md:text-5xl font-black font-mono text-[#163300] dark:text-[#9fe870]">
                  97%
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
                  On-Time Delivery Rate
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-black font-mono text-[#163300] dark:text-[#9fe870]">
                  2.9 hrs
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
                  Avg Brief to Booking
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-black font-mono text-[#163300] dark:text-[#9fe870]">
                  3,200+
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
                  Verified Talent Profiles
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED TALENT ROSTER (Wise Grid + 3D Tilt Cards) ── */}
        <section id="talent-roster" className="py-24 px-6 md:px-16 bg-[var(--color-bg-surface-2)] border-y border-[var(--color-hairline)]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#163300] dark:text-[#9fe870]">
                  Verified Performer Marketplace
                </span>
                <h2 className="font-wise-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                  Discover Top Performing Artists
                </h2>
              </div>
              <Button variant="outline-pill" className="h-10 px-5 text-xs font-bold" onClick={() => navigate("/auth")}>
                Explore Full Directory (3,200+)
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {FEATURED_TALENTS.map((talent) => (
                <Talent3DCard key={talent.id} talent={talent} />
              ))}
            </div>
          </div>
        </section>

        {/* ── WISE ESCROW & CALCULATOR SECTION (Dark Surface Alternate) ── */}
        <section id="escrow-calculator" className="py-24 px-6 md:px-16 bg-[#163300] text-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#9fe870] text-[#163300]">
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>Wise-Inspired Security Architecture</span>
              </div>

              <h2 className="font-wise-sans text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white">
                PAYMENT SECURITY.<br />
                <span className="text-[#9fe870]">AUTOMATED IN ESCROW.</span>
              </h2>

              <p className="text-base text-white/80 leading-relaxed font-body">
                Contracts are funded upfront into FINCRA Escrow before recording or performance begins. Talent works with complete confidence, and clients enjoy automated deliverable verification.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#9fe870] text-[#163300] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Zero Payment Risk for Talent</h4>
                    <p className="text-xs text-white/70">Escrow funds are locked securely prior to project kickoff.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#9fe870] text-[#163300] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Instant Payouts on Approval</h4>
                    <p className="text-xs text-white/70">Direct bank transfer release within 24 hours of client signoff.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <WiseBookingCalculator />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (3-Step Cards with Pill Badges) ── */}
        <section id="how-it-works" className="py-24 px-6 md:px-16 bg-[var(--color-bg-canvas)]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#163300] dark:text-[#9fe870]">
                Simple Workflow
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                Go Live in 3 Easy Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-[28px] bg-white dark:bg-[#16161A] border border-[var(--color-hairline)] space-y-4 relative shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#e2f6d5] text-[#163300] dark:bg-[#163300] dark:text-[#9fe870] font-mono font-black text-lg flex items-center justify-center">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg font-display text-[var(--color-text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-body">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL MOSAIC ── */}
        <section className="py-24 px-6 md:px-16 bg-[var(--color-bg-surface-2)] border-t border-[var(--color-hairline)]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#163300] dark:text-[#9fe870]">
                Endorsed by Performers &amp; Brands
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                Trusted Across the Continent
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-[28px] bg-white dark:bg-[#16161A] border border-[var(--color-hairline)] space-y-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm italic text-[var(--color-text-secondary)] leading-relaxed">
                    "{item.quote}"
                  </p>

                  <div className="space-y-4 pt-4 border-t border-[var(--color-hairline)]">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#9fe870]"
                      />
                      <div>
                        <div className="font-bold text-sm text-[var(--color-text-primary)] font-display">
                          {item.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] font-body">
                          {item.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono font-bold pt-1 text-[#163300] dark:text-[#9fe870]">
                      <span>{item.metric}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#e2f6d5] text-[#163300] dark:bg-[#163300] dark:text-[#9fe870] text-[10px]">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ACCORDION ── */}
        <section className="py-24 px-6 md:px-16 bg-[var(--color-bg-canvas)]">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="font-wise-sans text-3xl md:text-5xl font-black uppercase text-center tracking-tight text-[var(--color-text-primary)]">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[18px] bg-white dark:bg-[#16161A] border border-[var(--color-hairline)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left font-bold text-sm text-[var(--color-text-primary)]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-hairline)] pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL HYER & WISE CONVERSION CTA ── */}
        <section className="py-28 px-6 md:px-16 bg-[#163300] text-white text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-wise-sans text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] text-[#9fe870]">
              TAKE CONTROL OF YOUR CRAFT.
            </h2>
            <p className="text-base text-white/80 max-w-xl mx-auto font-body">
              Join over 3,200 verified actors, voice talent, and comperes getting booked directly with zero commission on their first booking.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                variant="lime"
                className="h-12 px-8 text-sm font-bold shadow-xl"
                onClick={() => navigate("/auth")}
              >
                Launch Storefront Free
              </Button>
              <Button
                variant="forest"
                className="h-12 px-8 text-sm font-bold border border-[#9fe870]/40"
                onClick={() => navigate("/auth")}
              >
                Post a Project Brief
              </Button>
            </div>
          </div>
        </section>
      </main>

      <FloatingQRBadge />

      {/* ── Wise Terminal Footer ── */}
      <footer className="py-12 px-6 md:px-16 bg-[#0e0f0c] text-white border-t border-white/10 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-3">
            <Logo className="h-6 w-auto text-white" />
            <p className="text-white/60 max-w-xs text-[11px] leading-relaxed">
              The world's first brief-to-booking marketplace pipeline for performing arts and the creator economy.
            </p>
          </div>
          <div className="flex gap-12 text-white/70">
            <div>
              <h4 className="font-bold text-white mb-2">Product</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-white">Directory</a></li>
                <li><a href="#" className="hover:text-white">Escrow Rates</a></li>
                <li><a href="#" className="hover:text-white">AI Style Tagging</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Legal</h4>
              <ul className="space-y-1">
                <li><a href="/legal/terms" className="hover:text-white">Terms</a></li>
                <li><a href="/legal/privacy" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 font-mono">
          <span>© {new Date().getFullYear()} Monologg Inc. All rights reserved.</span>
          <span>Secured by FINCRA Escrow</span>
        </div>
      </footer>
    </div>
  );
}
