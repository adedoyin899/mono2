import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { WebsiteHeader } from "../components/ui/WebsiteHeader";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import {
  ChevronDown, Lock, FileText,
  QrCode, Video, TrendingUp, Sparkles,
  User, Presentation, Mic, Star, Camera, Music,
  ArrowRight, Check, ShieldCheck
} from "lucide-react";

// ── "Find Performers" niche grid — 8 categories with large icons ──
const NICHES = [
  { label: "Actors", icon: User, color: "var(--color-pastel-rose-text)", bg: "var(--color-pastel-rose-squircle)", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80&fit=crop" },
  { label: "Public Speakers", icon: Presentation, color: "var(--color-pastel-blue-text)", bg: "var(--color-pastel-blue-squircle)", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop" },
  { label: "Comperes", icon: Mic, color: "var(--color-pastel-purple-text)", bg: "var(--color-pastel-purple-squircle)", img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80&fit=crop" },
  { label: "Comedians", icon: Star, color: "var(--color-pastel-amber-text)", bg: "var(--color-pastel-amber-squircle)", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80&fit=crop" },
  { label: "Streamers", icon: Video, color: "var(--color-pastel-periwinkle-text)", bg: "var(--color-pastel-periwinkle-squircle)", img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80&fit=crop" },
  { label: "Artists", icon: Camera, color: "var(--color-pastel-mint-text)", bg: "var(--color-pastel-mint-squircle)", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&fit=crop" },
  { label: "Musicians", icon: Music, color: "var(--color-pastel-rose-text)", bg: "var(--color-pastel-rose-squircle)", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80&fit=crop" },
  { label: "Creators", icon: Sparkles, color: "var(--color-pastel-purple-text)", bg: "var(--color-pastel-purple-squircle)", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&fit=crop" },
];

const SHOWCASE_PERFORMERS = [
  { name: "Folake Bakare", role: "Voice Actor · Commercials", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80&fit=crop" },
  { name: "Emeka Johnson", role: "Lead Actor · Nollywood", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80&fit=crop" },
  { name: "Kareem Adeleke", role: "Standup Comedian · MC", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80&fit=crop" },
  { name: "Zainab Balogun", role: "Presenter · Event Compere", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80&fit=crop" },
  { name: "Tunde Williams", role: "Music Director · Producer", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80&fit=crop" },
];

const HERO_STATS = [
  { value: "10,000+", label: "Verified Performers" },
  { value: "$5M+", label: "Project Escrow Processed" },
  { value: "98%", label: "On-Time Payout Rate" },
  { value: "125", label: "Active Gigs" },
];

const FAQS = [
  {
    q: "What is Monologg and how does it work?",
    a: "Monologg is like Upwork for Actors, Public speakers, Comperes, Comedians, Streamers, Artists, musicians and Creators. Performers get a personalized link to show their work, set prices, and manage bookings. Clients — like studios, directors, and event organizers — use it to find verified talent, post jobs, and pay safely through the platform.",
  },
  {
    q: "What currency does Monologg support?",
    a: "Right now, everything is paid and received in Nigerian Naira (₦) through secure payment processors like Paystack and Fincra. Dollar (USD) and Pound (GBP) payments are coming very soon.",
  },
  {
    q: "How does escrow payment protection work?",
    a: "To protect everyone, the client pays the job money into a secure Monologg holding account (escrow) before work starts. Once the performer completes the gig and both sides give a quick rating, the money is released instantly to the performer.",
  },
  {
    q: "What are the platform fees?",
    a: "Monologg takes a 16% total fee per booking, split between both sides. For Performers: 7% is deducted from your final pay — which is way cheaper than the 20% to 25% that traditional agents or fan apps take. For Clients: 9% is added to the invoice to cover safe payment protection and platform management.",
  },
  {
    q: "How does Thespian AI work?",
    a: "When a performer uploads a monologue or voice reel, Thespian AI automatically listens to the clip. It instantly detects the accent, tone, comedic timing, and style, then fills out the profile tags automatically so you don't have to fill long forms.",
  },
  {
    q: "What data can performers see?",
    a: "Performers get a simple dashboard showing exactly how many people view their profile, how many play their videos, where their traffic is coming from (like Instagram or TikTok), and which of their packages make the most money.",
  },
  {
    q: "What data can clients see?",
    a: "Clients can track their job posts to see how many performers viewed the gig, how many applied, how fast people are responding, video play counts on auditions, and simple spending reports for their accounting.",
  },
  {
    q: "How do clients post jobs and hire?",
    a: "Clients can post a job brief or script for free. Once posted, Thespian AI automatically reads the requirements and can give the client a short list of the best-matching performers based on style, accent, and budget.",
  },
  {
    q: "Can I sell fan videos and voice shoutouts?",
    a: "Yes! Performers can add custom shoutouts to their page, set a price (like ₦200,000), and choose a delivery time (like 24 hours). Fans pay upfront, the money is locked safely, and it releases to you the moment you upload the video.",
  },
  {
    q: "How do performers withdraw money to their bank?",
    a: "Once a job or shoutout is done, the money goes straight into your Monologg Wallet. You can click withdraw at any time to send the funds instantly into any Nigerian bank account.",
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [calculatorBudget, setCalculatorBudget] = useState<number>(350000);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const navigate = useNavigate();

  // Fee calculation (16% split: 7% performer, 9% client)
  const performerCut = Math.round(calculatorBudget * 0.93);
  const clientInvoice = Math.round(calculatorBudget * 1.09);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setNewsletterSent(true);
  };

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }} className="min-h-screen flex flex-col overflow-x-hidden font-body selection:bg-blue-100 selection:text-blue-900">
      <WebsiteHeader />

      <main className="flex-1">
        {/* ── Top Hero Stage ── */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-5 md:px-16 text-center overflow-hidden">
          {/* Subtle ambient spotlight */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] rounded-full pointer-events-none opacity-40 blur-[100px]"
            style={{ background: "radial-gradient(ellipse at center, rgba(98, 174, 240, 0.25) 0%, rgba(123, 0, 254, 0.15) 50%, transparent 70%)" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            {/* Pill Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 border transition-colors shadow-xs"
              style={{
                background: "var(--color-pure-white)",
                borderColor: "var(--color-faint-line)",
                color: "var(--color-text-primary)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#0075de] animate-pulse" />
              <span className="tracking-[0.04em] uppercase text-[11px] font-semibold text-[var(--color-signal-blue)]">Zero Agent Commissions</span>
              <span className="text-[var(--color-warm-gray)]">· 100% Escrow Protection</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-[42px] sm:text-[60px] md:text-[72px] leading-[1.02] tracking-[-0.035em] uppercase font-bold mb-6 text-[var(--color-text-primary)]"
            >
              Find Performers, <br className="hidden sm:inline" />
              Find Gigs, <br className="hidden sm:inline" />
              <span style={{ color: "var(--color-signal-blue)" }}>Finish Your Project.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10 text-[var(--color-warm-gray)]"
            >
              Discover the performing arts' best-kept secrets. Connect directly with directors, studios, agencies, brand managers, and live event organizers globally with zero agent commissions.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-14"
            >
              <Button
                className="h-12 px-8 text-[15px] font-medium rounded-lg shadow-sm w-full sm:w-auto transition-transform active:scale-95"
                style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find Performers
              </Button>
              <Button
                variant="ghost"
                className="h-12 px-8 text-[15px] font-medium rounded-lg border w-full sm:w-auto transition-colors"
                style={{
                  borderColor: "var(--color-faint-line)",
                  background: "var(--color-pure-white)",
                  color: "var(--color-text-primary)",
                }}
                onClick={() => navigate("/auth")}
              >
                Find Gigs
              </Button>
            </motion.div>

            {/* Live Stats Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 pt-6 border-t w-full max-w-3xl"
              style={{ borderColor: "var(--color-faint-line)" }}
            >
              {HERO_STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-[var(--color-warm-gray)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 5-Performer Showcase Strip */}
          <div className="mt-14 max-w-6xl mx-auto overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {SHOWCASE_PERFORMERS.map((talent, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-xs border cursor-pointer group"
                  style={{ borderColor: "var(--color-faint-line)", background: "var(--color-pure-white)" }}
                  onClick={() => navigate("/emeka")}
                >
                  <img
                    src={talent.img}
                    alt={talent.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="text-white text-sm font-semibold truncate flex items-center gap-1">
                      {talent.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3EE089] shrink-0" />
                    </div>
                    <div className="text-white/70 text-xs truncate mt-0.5">
                      {talent.role}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category Exploration Grid (Large Icons) ── */}
        <section
          className="py-20 md:py-24 px-5 md:px-16 transition-colors"
          style={{
            background: "var(--color-paper-white)",
            borderTop: "1px solid var(--color-faint-line)",
            borderBottom: "1px solid var(--color-faint-line)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 border"
                style={{ borderColor: "var(--color-faint-line)", background: "var(--color-pure-white)", color: "var(--color-signal-blue)" }}
              >
                <span>Find Gigs</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight uppercase text-[var(--color-text-primary)]">
                Find Performers For Every Kind Of Work
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NICHES.map((niche, idx) => {
                const IconComponent = niche.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate("/auth")}
                    className="p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group"
                    style={{
                      background: "var(--color-pure-white)",
                      borderColor: "var(--color-faint-line)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Large prominent icon squircle */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                      style={{ background: niche.bg, color: niche.color }}
                    >
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-signal-blue)] transition-colors">
                        {niche.label}
                      </div>
                      <div className="text-xs text-[var(--color-warm-gray)] mt-0.5 flex items-center gap-1">
                        <span>Browse category</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6 Core Features (Transparent / Pastel Washes & Large Icons) ── */}
        <section className="py-24 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--color-signal-blue)] border"
                style={{ borderColor: "var(--color-faint-line)", background: "var(--color-pure-white)" }}
              >
                Why Performers Choose Monologg
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Everything you need, nothing you don't
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1: Share Your Stage Anywhere */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pastel-blue-bg)",
                  borderColor: "var(--color-pastel-blue-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    {/* Large Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-pastel-blue-squircle)", color: "var(--color-pastel-blue-text)" }}
                    >
                      <QrCode className="w-8 h-8" />
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "var(--color-pure-white)", borderColor: "var(--color-pastel-blue-border)", color: "var(--color-pastel-blue-text)" }}
                    >
                      One Link
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Share Your Stage Anywhere
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[var(--color-warm-gray)]">
                    Join other performers using a single master link and instant QR code to share their portfolios, showreels, and press kits directly with casting directors, studios, agencies, brand managers, and live event organizers globally across all platforms.
                  </p>
                </div>

                {/* Visual Preview Card */}
                <div
                  className="p-4 rounded-xl border flex items-center gap-4 mt-2"
                  style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}
                >
                  <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6 text-[var(--color-signal-blue)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[var(--color-warm-gray)]">monologg.co/emeka</div>
                    <div className="text-xs font-medium text-[var(--color-text-primary)] mt-0.5">Instant Digital Press Kit &amp; Showreel</div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Monetize Fan Shoutouts & Micro-Deliverables */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pastel-purple-bg)",
                  borderColor: "var(--color-pastel-purple-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    {/* Large Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-pastel-purple-squircle)", color: "var(--color-pastel-purple-text)" }}
                    >
                      <Video className="w-8 h-8" />
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "var(--color-pure-white)", borderColor: "var(--color-pastel-purple-border)", color: "var(--color-pastel-purple-text)" }}
                    >
                      93% Payout
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Monetize Fan Shoutouts &amp; Micro-Deliverables
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[var(--color-warm-gray)]">
                    Earn up to 93% of your rate by selling custom video shoutouts, voice drops, and private consultations directly from your bio link — on your own prices and delivery timelines.
                  </p>
                </div>

                {/* Visual Preview Card */}
                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between mt-2"
                  style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs">
                      ₦
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--color-text-primary)]">Custom Video Drop</div>
                      <div className="text-[11px] text-[var(--color-warm-gray)]">24h turnaround · ₦45,000</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#7B00FE] text-white">Book</span>
                </div>
              </div>

              {/* Feature 3: Analyze Your Audience */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pastel-amber-bg)",
                  borderColor: "var(--color-pastel-amber-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    {/* Large Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-pastel-amber-squircle)", color: "var(--color-pastel-amber-text)" }}
                    >
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "var(--color-pure-white)", borderColor: "var(--color-pastel-amber-border)", color: "var(--color-pastel-amber-text)" }}
                    >
                      Real-Time
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Analyze Your Audience
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[var(--color-warm-gray)]">
                    Track your profile visits and link clicks in real time to see exactly where your fans are coming from and which packages make you the most money.
                  </p>
                </div>

                {/* Visual Preview Card */}
                <div
                  className="grid grid-cols-2 gap-3 mt-2"
                >
                  <div className="p-3 rounded-xl border" style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}>
                    <div className="text-[11px] text-[var(--color-warm-gray)]">Profile Clicks</div>
                    <div className="text-lg font-bold font-mono text-[var(--color-text-primary)]">43,500</div>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}>
                    <div className="text-[11px] text-[var(--color-warm-gray)]">Sales Volume</div>
                    <div className="text-lg font-bold font-mono text-[var(--color-text-primary)]">₦2.36M</div>
                  </div>
                </div>
              </div>

              {/* Feature 4: Set Transparent Custom Rate Cards */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pastel-periwinkle-bg)",
                  borderColor: "var(--color-pastel-periwinkle-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    {/* Large Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-pastel-periwinkle-squircle)", color: "var(--color-pastel-periwinkle-text)" }}
                    >
                      <FileText className="w-8 h-8" />
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "var(--color-pure-white)", borderColor: "var(--color-pastel-periwinkle-border)", color: "var(--color-pastel-periwinkle-text)" }}
                    >
                      No-Haggle
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Set Transparent Custom Rate Cards
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[var(--color-warm-gray)]">
                    Stop wasting time emailing back and forth — set clear, upfront Naira rates for auditions, hosting, voiceovers, or comedy sets so clients can book you instantly.
                  </p>
                </div>

                {/* Visual Preview Card */}
                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between mt-2 text-xs"
                  style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--color-text-primary)]">Voiceover Session</span>
                    <span className="text-[var(--color-warm-gray)]">· 60 mins</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--color-text-primary)]">₦150,000</span>
                </div>
              </div>

              {/* Feature 5: Powered by Thespian AI */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pastel-mint-bg)",
                  borderColor: "var(--color-pastel-mint-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    {/* Large Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-pastel-mint-squircle)", color: "var(--color-pastel-mint-text)" }}
                    >
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "var(--color-pure-white)", borderColor: "var(--color-pastel-mint-border)", color: "var(--color-pastel-mint-text)" }}
                    >
                      AI-Powered
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Powered by Thespian AI
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[var(--color-warm-gray)]">
                    Get a 24/7 AI agent that automatically responds to questions on your behalf and books gigs onto your calendar while you sleep, and scans script PDFs to pitch your talent for open roles. Terms and Conditions apply.
                  </p>
                </div>

                {/* Visual Preview Card */}
                <div
                  className="p-3.5 rounded-xl border flex items-center gap-3 mt-2"
                  style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-[var(--color-warm-gray)]">
                    <span className="font-semibold text-[var(--color-text-primary)]">Thespian:</span> "Elena is available this Friday at 3:00 PM for reading."
                  </div>
                </div>
              </div>

              {/* Feature 6: Bank-Grade Escrow Protection (with interactive budget calculator) */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pastel-rose-bg)",
                  borderColor: "var(--color-pastel-rose-border)",
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    {/* Large Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-pastel-rose-squircle)", color: "var(--color-pastel-rose-text)" }}
                    >
                      <Lock className="w-8 h-8" />
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "var(--color-pure-white)", borderColor: "var(--color-pastel-rose-border)", color: "var(--color-pastel-rose-text)" }}
                    >
                      Escrow Backed
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Bank-Grade Escrow Protection
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[var(--color-warm-gray)]">
                    Never worry about late payments again — booking funds are safely held in escrow before you start working and sent straight to your bank account the moment you finish.
                  </p>
                </div>

                {/* Escrow Simulator Widget */}
                <div
                  className="p-4 rounded-xl border mt-2"
                  style={{ background: "var(--color-pure-white)", borderColor: "var(--color-faint-line)" }}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[var(--color-warm-gray)]">Contract Amount:</span>
                    <span className="font-mono font-bold text-[var(--color-text-primary)]">₦{calculatorBudget.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="25000"
                    value={calculatorBudget}
                    onChange={(e) => setCalculatorBudget(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0075de] mb-3"
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="text-[10px] text-[var(--color-warm-gray)]">Performer Takes (93%)</div>
                      <div className="font-mono font-semibold text-emerald-600">₦{performerCut.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--color-warm-gray)]">Client Invoice (109%)</div>
                      <div className="font-mono font-semibold text-[var(--color-text-primary)]">₦{clientInvoice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section (2-Column Clean Editorial Cards) ── */}
        <section
          className="py-24 px-5 md:px-16 transition-colors"
          style={{
            background: "var(--color-paper-white)",
            borderTop: "1px solid var(--color-faint-line)",
            borderBottom: "1px solid var(--color-faint-line)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight uppercase text-[var(--color-text-primary)]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border transition-all overflow-hidden"
                  style={{
                    background: "var(--color-pure-white)",
                    borderColor: "var(--color-faint-line)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-black/[0.01]"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-[15px] font-semibold font-body leading-snug text-[var(--color-text-primary)] pr-3">
                      {faq.q}
                    </span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 transition-transform"
                      style={{
                        borderColor: "var(--color-faint-line)",
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <ChevronDown className="w-4 h-4 text-[var(--color-warm-gray)]" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="px-5 pb-5 text-sm font-body leading-relaxed border-t pt-3"
                          style={{
                            color: "var(--color-warm-gray)",
                            borderColor: "var(--color-faint-line)",
                          }}
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

        {/* ── Final Conversion CTA (Midnight Workspace Stage) ── */}
        <section
          className="py-24 md:py-28 px-5 md:px-16 text-center transition-colors relative overflow-hidden"
          style={{ background: "var(--color-midnight-ink)", color: "#ffffff" }}
        >
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full pointer-events-none opacity-20 blur-[90px]"
            style={{ background: "radial-gradient(circle, #62aef0 0%, #2537b1 70%, transparent 100%)" }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white">
              Find Performers. Find Gigs. <br /> Finish Your Project.
            </h2>
            <p className="text-base font-body mb-8 text-white/70 max-w-lg mx-auto leading-relaxed">
              Connect directly with directors, studios, agencies, brand managers, and live event organizers globally with zero agent commissions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Button
                className="h-12 px-8 text-[15px] font-medium rounded-lg shadow-sm w-full sm:w-auto"
                style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>

            {/* Avatar Pill Strip */}
            <div className="flex items-center justify-center -space-x-2">
              {SHOWCASE_PERFORMERS.map((p, idx) => (
                <img
                  key={idx}
                  src={p.img}
                  alt={p.name}
                  className="w-10 h-10 rounded-full border-2 border-[#02093a] object-cover"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Join Our Newsletter ── */}
        <section
          className="py-14 px-5 md:px-16 transition-colors"
          style={{
            background: "var(--color-paper-white)",
            borderBottom: "1px solid var(--color-faint-line)",
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[var(--color-text-primary)] mb-1">
                Join Our Newsletter
              </h3>
              <p className="text-xs text-[var(--color-warm-gray)]">
                Stay updated with our investor news and updates about upcoming funding rounds.
              </p>
            </div>

            {!newsletterSent ? (
              <form onSubmit={handleNewsletter} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="h-10 px-3.5 rounded-lg border text-sm w-full md:w-64 focus:outline-none focus:border-[#0075de]"
                  style={{
                    background: "var(--color-pure-white)",
                    borderColor: "var(--color-faint-line)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg text-sm font-medium text-white transition-opacity shrink-0"
                  style={{ background: "var(--color-signal-blue)" }}
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <Check className="w-4 h-4" />
                <span>You're subscribed — thank you!</span>
              </div>
            )}
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}
