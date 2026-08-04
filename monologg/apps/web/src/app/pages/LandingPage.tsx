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
  Play, Pause, ArrowRight, Smartphone, QrCode, DollarSign, Repeat, Zap, ExternalLink, ArrowUpRight, Music, Radio
} from "lucide-react";

// ── 7 Curated Talent Profiles for Infinite Auto-Looping Carousel ──
const CAROUSEL_TALENTS = [
  {
    id: "t1",
    name: "Emeka Johnson",
    category: "Dramatic Voice Artist",
    location: "Lagos · Remote",
    rate: "₦120,000 / day",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&fit=crop",
    tags: ["Deep Tone", "Nollywood", "High Energy"],
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
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop",
    tags: ["Charismatic", "Lead Presence", "Brand Spot"],
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
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&fit=crop",
    tags: ["Stage Command", "Multilingual", "Corporate"],
    rating: 4.95,
    reviews: 84,
    verified: true,
  },
  {
    id: "t4",
    name: "Zainab Bello",
    category: "Stunt & Motion Performer",
    location: "Kano · On-Location",
    rate: "₦210,000 / day",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80&fit=crop",
    tags: ["Martial Arts", "High Agility", "Cinema"],
    rating: 4.99,
    reviews: 67,
    verified: true,
  },
  {
    id: "t5",
    name: "David Osei",
    category: "Radio & Podcast Host",
    location: "Kumasi · Remote",
    rate: "₦150,000 / episode",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80&fit=crop",
    tags: ["Baritone", "Storytelling", "Live FM"],
    rating: 4.92,
    reviews: 115,
    verified: true,
  },
  {
    id: "t6",
    name: "Chidinma Nwosu",
    category: "High-Fashion Commercial Model",
    location: "Lagos · International",
    rate: "₦300,000 / day",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&fit=crop",
    tags: ["Runway", "Editorial", "Vogue Africa"],
    rating: 5.0,
    reviews: 89,
    verified: true,
  },
  {
    id: "t7",
    name: "Kofi Mensah",
    category: "Afrobeat Stage Choreographer",
    location: "Accra · Remote/On-Site",
    rate: "₦190,000 / routine",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&fit=crop",
    tags: ["Stage Sync", "High Tempo", "Tour Ready"],
    rating: 4.96,
    reviews: 73,
    verified: true,
  },
];

// ── 3-Step Process ──
const STEPS = [
  {
    num: "01",
    title: "Upload Reel & AI Vibe Scan",
    body: "Upload your performance reel. Proprietary Thespian AI extracts tone, diction, and dramatic presence — building your verified style card in under 30 seconds.",
  },
  {
    num: "02",
    title: "Define Purchasable Rate Cards",
    body: "Turn your craft into transparent booking packages. Set fixed prices for voice-overs, film appearances, commercial spots, and live hosting.",
  },
  {
    num: "03",
    title: "Instant Escrow Lock & Release",
    body: "Clients book and lock funds into Monologg Escrow. Funds auto-release directly to your bank account upon deliverable signoff with zero chasing.",
  },
];

// ── Testimonials ──
const TESTIMONIALS = [
  {
    name: "Adaeze Obi",
    role: "Senior Voice Artist · Lagos",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&fit=crop",
    quote: "I used to lose 25% to talent agencies for basic coordination. Monologg gave me direct client bookings and instant escrow payouts. Game changer.",
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
    quote: "Sourcing voice actors used to mean 2 weeks of WhatsApp threads. On Monologg, we shortlist, preview reels, and lock escrow in 15 minutes.",
    metric: "80+ Hours Saved / Mo",
    tag: "Client / Brand",
  },
];

// ── FAQ Accordion ──
const FAQS = [
  {
    q: "What fee does Monologg charge creators?",
    a: "Monologg charges a flat 9% platform commission on completed talent bookings. Profile creation, rate cards, and AI style tagging are 100% free forever.",
  },
  {
    q: "How does the Monologg Escrow Protocol work?",
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

// ── Escrow Calculator ──
function MonologgEscrowCalculator() {
  const [amount, setAmount] = useState(150000);

  const escrowFee = Math.round(amount * 0.12);
  const talentEarnings = amount;
  const clientTotal = amount + escrowFee;

  return (
    <div className="p-6 md:p-8 rounded-[28px] bg-[#16161A] text-white border border-[#26262E] shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F13030] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F13030]">
            Monologg Escrow Protocol
          </span>
        </div>
        <div className="bg-[#F13030]/20 text-[#FF4D4D] px-3 py-1 rounded-full text-xs font-bold font-mono border border-[#F13030]/30">
          100% Guaranteed Payout
        </div>
      </div>

      <div className="bg-[#1B1B20] rounded-[18px] p-4 border border-[#26262E] space-y-1">
        <div className="flex justify-between items-center text-xs text-[#A6A6B0] font-medium">
          <span>Client Pays Total Contract</span>
          <span className="font-mono">FINCRA Locked</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <input
            type="number"
            value={clientTotal}
            readOnly
            className="text-2xl font-bold font-mono bg-transparent outline-none w-full text-[#F5F5F0]"
          />
          <div className="flex items-center gap-2 bg-[#232329] px-3 py-1.5 rounded-full text-xs font-bold text-white shrink-0 border border-white/10">
            <span className="w-5 h-5 rounded-full bg-[#F13030] text-white text-[10px] flex items-center justify-center font-black">
              🇳🇬
            </span>
            <span>NGN</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-2 text-xs text-white/80">
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-[#A6A6B0]">Talent Base Rate</span>
          <span className="font-mono font-bold text-[#FF4D4D]">
            ₦{amount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-[#A6A6B0]">Escrow Processing Fee (12%)</span>
          <span className="font-mono text-[#A6A6B0]">₦{escrowFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="font-bold text-white">Talent Receives (Net Payout)</span>
          <span className="font-mono font-extrabold text-white text-base">
            ₦{talentEarnings.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between text-[11px] text-[#FF4D4D] mb-1 font-mono">
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
          className="w-full accent-[#F13030] cursor-pointer"
        />
      </div>

      <div className="pt-2">
        <button className="w-full py-3.5 px-6 rounded-full bg-[#F13030] text-white font-bold text-sm hover:bg-[#d31f20] transition-all flex items-center justify-center gap-2 shadow-lg">
          <Lock className="w-4 h-4" />
          Lock Contract in Monologg Escrow
        </button>
      </div>
    </div>
  );
}

// ── Single Talent Card Component with WCAG AA High Contrast Dark Mode ──
function TalentCardItem({ talent }: { talent: (typeof CAROUSEL_TALENTS)[0] }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="w-[320px] sm:w-[360px] shrink-0 rounded-[24px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] p-4 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden mb-4 bg-gray-100 dark:bg-[#1B1B20]">
        <img
          src={talent.img}
          alt={talent.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{talent.rating}</span>
          <span className="text-white/60">({talent.reviews})</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(!playing);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#F13030] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-1.5 font-display text-[#16161A] dark:text-[#F5F5F0]">
            {talent.name}
            {talent.verified && <Shield className="w-4 h-4 text-[#F13030] fill-[#F13030]/20" />}
          </h3>
          <span className="text-xs font-bold font-mono text-[#F13030] dark:text-[#FF4D4D]">
            {talent.rate}
          </span>
        </div>

        <p className="text-xs text-gray-600 dark:text-[#A6A6B0] font-body">
          {talent.category} · {talent.location}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {talent.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] border border-[#F13030]/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Infinite Auto-Scrolling Framer Motion Talent Carousel ──
function TalentCarousel() {
  const [paused, setPaused] = useState(false);
  const extendedTalents = [...CAROUSEL_TALENTS, ...CAROUSEL_TALENTS];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex gap-6 w-max"
        animate={{ x: paused ? undefined : ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 25,
        }}
      >
        {extendedTalents.map((talent, idx) => (
          <TalentCardItem key={`${talent.id}-${idx}`} talent={talent} />
        ))}
      </motion.div>
    </div>
  );
}

// ── Floating QR App Badge ──
function FloatingQRBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 hidden lg:flex items-center gap-3 p-3 rounded-[18px] bg-[#16161A] text-white border border-[#26262E] shadow-2xl hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="w-12 h-12 bg-white p-1 rounded-[12px] flex items-center justify-center shrink-0">
        <QrCode className="w-full h-full text-[#16161A]" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#F13030]">
          Get Monologg App
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
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-body text-base">
      {/* ── Top Announcement Bar ── */}
      <div className="h-[40px] bg-[#16161A] text-[#F5F5F0] flex items-center justify-between px-6 text-xs font-semibold border-b border-[#26262E] z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F13030] animate-ping" />
          <span className="uppercase tracking-widest text-[10px] text-[#F13030]">
            Monologg Marketplace v3.0 Live
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/80 text-[11px]">
          <span>FINCRA Escrow Secured</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono">3,200+ Verified Talent Profiles</span>
        </div>
      </div>

      {/* ── Frosted Sticky Header ── */}
      <header className="h-[68px] sticky top-0 z-40 px-6 md:px-16 flex items-center justify-between backdrop-blur-xl border-b border-[var(--color-hairline)] bg-[var(--color-bg-glass)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="h-6 w-auto text-[var(--color-text-primary)]" title="Monologg" />
        </div>

        {/* Pill Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--color-bg-surface-2)] p-1.5 rounded-full border border-[var(--color-hairline)]">
          {["Features", "Talent Roster", "How it Works", "Escrow Calculator"].map((item) => (
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
            className="h-10 px-5 text-xs font-bold hidden sm:inline-flex"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>

          <Button
            variant="red"
            className="h-10 px-5 text-xs font-bold"
            onClick={() => navigate("/auth")}
          >
            Launch Storefront
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO SECTION (Clean Background with Hover Grid Reveal) ── */}
        <section className="relative pt-24 pb-32 px-6 md:px-16 overflow-hidden min-h-[85vh] flex items-center">
          <WebGLHeroCanvas />

          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] border border-[#F13030]/30 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current text-[#F13030]" />
              <span>THE FIRST BRIEF-TO-BOOKING PIPELINE FOR PERFORMING ARTS</span>
            </div>

            {/* Oversized Display Headline */}
            <h1 className="font-wise-sans text-[48px] sm:text-[72px] md:text-[96px] font-black tracking-[-0.035em] leading-[0.9] text-[var(--color-text-primary)] uppercase max-w-5xl mx-auto">
              YOUR CRAFT. ON YOUR TERMS.<br />
              <span className="text-[#F13030] dark:text-[#FF4D4D]">
                INSTANTLY BOOKED.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto font-body leading-relaxed font-normal">
              Verified performer profiles, Monologg Escrow Protocol, and proprietary Thespian AI vibe scanner. Zero middlemen, zero gatekeeping.
            </p>

            {/* Email Form */}
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
                    className="flex-1 px-5 py-3 text-sm bg-transparent outline-none text-[var(--color-text-primary)]"
                  />
                  <Button
                    type="submit"
                    variant="red"
                    className="h-11 px-6 text-xs font-bold shrink-0"
                  >
                    Get Early Access <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              ) : (
                <div className="p-4 rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] border border-[#F13030] flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-[#F13030]" />
                  <span className="text-sm font-bold">
                    You're #347 in queue! Share link: monologg.app/invite/abc123
                  </span>
                </div>
              )}
            </div>

            {/* 3-Column Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-12 border-t border-[var(--color-hairline)] text-center">
              <div>
                <div className="text-3xl md:text-5xl font-black font-mono text-[#F13030] dark:text-[#FF4D4D]">
                  97%
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
                  On-Time Delivery Rate
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-black font-mono text-[#F13030] dark:text-[#FF4D4D]">
                  2.9 hrs
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
                  Avg Brief to Booking
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-black font-mono text-[#F13030] dark:text-[#FF4D4D]">
                  3,200+
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
                  Verified Talent Profiles
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED TALENT ROSTER CAROUSEL (Infinite Auto-Looping) ── */}
        <section id="talent-roster" className="py-24 bg-[var(--color-bg-surface-2)] border-y border-[var(--color-hairline)]">
          <div className="max-w-6xl mx-auto px-6 md:px-16 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F13030] dark:text-[#FF4D4D]">
                Verified Performer Marketplace
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Discover Top Performing Artists
              </h2>
            </div>
            <Button variant="outline-pill" className="h-10 px-5 text-xs font-bold shrink-0" onClick={() => navigate("/auth")}>
              Explore Directory (3,200+)
            </Button>
          </div>

          <TalentCarousel />
        </section>

        {/* ── MONOLOGG ESCROW CALCULATOR SECTION ── */}
        <section id="escrow-calculator" className="py-24 px-6 md:px-16 bg-[#0D0D0F] text-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F13030] text-white">
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>Monologg Escrow Protocol</span>
              </div>

              <h2 className="font-wise-sans text-4xl md:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-white">
                PAYMENT SECURITY.<br />
                <span className="text-[#FF4D4D]">AUTOMATED IN ESCROW.</span>
              </h2>

              <p className="text-base text-white/80 leading-relaxed font-body">
                Contracts are funded upfront into FINCRA Escrow prior to recording or performance. Talent works with 100% confidence, and clients enjoy automated deliverable signoff.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F13030] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Zero Non-Payment Risk for Talent</h4>
                    <p className="text-sm text-white/70">Escrow funds are locked securely prior to project kickoff.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F13030] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Instant Payouts on Approval</h4>
                    <p className="text-sm text-white/70">Direct bank transfer release within 24 hours of client signoff.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <MonologgEscrowCalculator />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (High Contrast Dark Mode Cards) ── */}
        <section id="how-it-works" className="py-24 px-6 md:px-16 bg-[var(--color-bg-canvas)]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F13030] dark:text-[#FF4D4D]">
                Simple Workflow
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Go Live in 3 Easy Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-[28px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] space-y-4 relative shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] font-mono font-bold text-lg flex items-center justify-center">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg font-display text-[#16161A] dark:text-[#F5F5F0]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-[#A6A6B0] leading-relaxed font-body">
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
              <span className="text-xs font-bold uppercase tracking-widest text-[#F13030] dark:text-[#FF4D4D]">
                Endorsed by Performers &amp; Brands
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Trusted Across the Continent
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-[28px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] space-y-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm italic text-gray-700 dark:text-[#A6A6B0] leading-relaxed font-body">
                    "{item.quote}"
                  </p>

                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#26262E]">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#F13030]"
                      />
                      <div>
                        <div className="font-bold text-base text-[#16161A] dark:text-[#F5F5F0] font-display">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#A6A6B0] font-body">
                          {item.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono font-bold pt-1 text-[#F13030] dark:text-[#FF4D4D]">
                      <span>{item.metric}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] text-[10px]">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ACCORDION (High Contrast Dark Mode Fix) ── */}
        <section className="py-24 px-6 md:px-16 bg-[var(--color-bg-canvas)]">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase text-center tracking-tight text-[var(--color-text-primary)]">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[18px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left font-bold text-base text-[#16161A] dark:text-[#F5F5F0]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 shrink-0 text-gray-400 dark:text-[#A6A6B0] ${
                        openFaq === i ? "rotate-180 text-[#F13030] dark:text-[#FF4D4D]" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-sm text-gray-600 dark:text-[#A6A6B0] leading-relaxed border-t border-gray-100 dark:border-[#26262E] pt-4 font-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CONVERSION CTA (Primary Red + Outlined Secondary Pair) ── */}
        <section className="py-28 px-6 md:px-16 bg-[#16161A] text-white text-center border-t border-white/10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-wise-sans text-4xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9] text-white">
              TAKE CONTROL OF YOUR CRAFT.
            </h2>
            <p className="text-base text-white/80 max-w-xl mx-auto font-body">
              Join over 3,200 verified actors, voice talent, and comperes getting booked directly with zero commission on their first booking.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                variant="red"
                className="h-12 px-8 text-sm font-bold shadow-xl"
                onClick={() => navigate("/auth")}
              >
                Launch Storefront Free
              </Button>
              <Button
                variant="outline-pill"
                className="h-12 px-8 text-sm font-bold border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/auth")}
              >
                Post a Project Brief
              </Button>
            </div>
          </div>
        </section>
      </main>

      <FloatingQRBadge />

      {/* ── OVERSIZED LOGOTYPE FOOTER ── */}
      <footer className="pt-20 pb-12 px-6 md:px-16 bg-[#0D0D0F] text-white border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 text-sm">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-auto text-white" />
              </div>
              <p className="text-xs text-white/60 max-w-xs leading-relaxed font-body">
                The world's first brief-to-booking pipeline for performing arts and the creator economy.
              </p>
              <div className="text-xs font-mono text-[#FF4D4D] pt-2">
                hello@monologg.app
              </div>
              <div className="flex items-center gap-3 pt-2 text-white/70">
                <a href="#" className="hover:text-white flex items-center gap-1 text-xs">
                  <span>X (Twitter)</span> <ArrowUpRight className="w-3 h-3" />
                </a>
                <a href="#" className="hover:text-white flex items-center gap-1 text-xs">
                  <span>LinkedIn</span> <ArrowUpRight className="w-3 h-3" />
                </a>
                <a href="#" className="hover:text-white flex items-center gap-1 text-xs">
                  <span>Instagram</span> <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-white/50 font-mono">Product</h4>
              <ul className="space-y-2 text-xs text-white/70 font-body">
                <li><a href="#talent-roster" className="hover:text-white transition-colors">Talent Directory</a></li>
                <li><a href="#escrow-calculator" className="hover:text-white transition-colors">Monologg Escrow</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Thespian AI Scanner</a></li>
                <li><a href="/design-system" className="hover:text-white transition-colors">Design System</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-white/50 font-mono">Solutions</h4>
              <ul className="space-y-2 text-xs text-white/70 font-body">
                <li><a href="/auth" className="hover:text-white transition-colors">For Voice Talent</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">For Lead Actors</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">For Event Comperes</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">For Brand Directors</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-white/50 font-mono">Company &amp; Legal</h4>
              <ul className="space-y-2 text-xs text-white/70 font-body">
                <li><a href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NDPA Data Protection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FINCRA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 font-mono gap-4">
            <div>© {new Date().getFullYear()} Monologg Inc. All rights reserved.</div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">✓ NDPA Compliant</span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">✓ FINCRA Escrow Verified</span>
            </div>
          </div>

          <div className="pt-8 text-center select-none overflow-hidden">
            <h1 className="font-wise-sans text-[64px] sm:text-[120px] md:text-[180px] font-black uppercase tracking-tighter leading-none text-white/10 hover:text-white/20 transition-colors pointer-events-none">
              MONOLOGG
            </h1>
          </div>
        </div>
      </footer>
    </div>
  );
}
