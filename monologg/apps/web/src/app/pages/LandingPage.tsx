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

// ── "Find Performers" niche grid — 8 categories with Title Case & large icons ──
const NICHES = [
  { label: "Actors", icon: User, color: "#f64932", bg: "#fbeae8" },
  { label: "Public Speakers", icon: Presentation, color: "#0075de", bg: "#e6f3fe" },
  { label: "Comperes", icon: Mic, color: "#7B00FE", bg: "#f3e8ff" },
  { label: "Comedians", icon: Star, color: "#e89d01", bg: "#fff7e6" },
  { label: "Streamers", icon: Video, color: "#097fe8", bg: "#e6f3fe" },
  { label: "Artists", icon: Camera, color: "#1A7544", bg: "#e6f4ea" },
  { label: "Musicians", icon: Music, color: "#b18164", bg: "#f9f2ed" },
  { label: "Creators", icon: Sparkles, color: "#ffb110", bg: "#fff7e6" },
];

// 7 Avatar character marks for hero arrangement
const HERO_CHARACTER_MARKS = [
  { name: "Folake", border: "#0075de", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop" },
  { name: "Emeka", border: "#f64932", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop" },
  { name: "Kareem", border: "#ffb110", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop" },
  { name: "Zainab", border: "#62aef0", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&fit=crop" },
  { name: "Tunde", border: "#097fe8", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&fit=crop" },
  { name: "Elena", border: "#f64932", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80&fit=crop" },
  { name: "Chidi", border: "#ffb110", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&fit=crop" },
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
    <div
      style={{
        background: "var(--color-paper-warmth, #f6f5f4)",
        color: "var(--color-ink-black, #000000)",
        fontFamily: "var(--font-notioninter, 'Inter', sans-serif)",
      }}
      className="min-h-screen flex flex-col overflow-x-hidden selection:bg-[#e6f3fe] selection:text-[#0075de]"
    >
      <WebsiteHeader />

      <main className="flex-1">
        {/* ── Top Hero Stage (Warm paper notebook under afternoon sun) ── */}
        <section className="pt-16 pb-20 md:pt-20 md:pb-24 px-5 md:px-16 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Horizontal row of 7 avatar character marks */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              {HERO_CHARACTER_MARKS.map((mark, i) => (
                <div
                  key={i}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full p-0.5 bg-white shrink-0 shadow-xs"
                  style={{ border: `2px solid ${mark.border}` }}
                >
                  <img
                    src={mark.img}
                    alt={mark.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ))}
            </motion.div>

            {/* Headline with embedded colored highlight pill (Sentence Case / Title Case) */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-[68px] font-semibold tracking-[-0.03em] leading-[1.12] mb-6 text-black"
            >
              Find performers, find gigs, and{" "}
              <span className="inline-block px-4 py-1 rounded-full bg-[#f6d5b8] text-black font-medium border border-black/10 mx-1 align-middle">
                finish your project.
              </span>
            </motion.h1>

            {/* Subhead in Graphite #615d59 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="text-lg md:text-xl text-[#615d59] max-w-2xl leading-relaxed mb-8"
            >
              Discover the performing arts' best-kept secrets. Connect directly with directors, studios, agencies, brand managers, and live event organizers globally — with zero agent commissions.
            </motion.p>

            {/* Dual CTA Buttons (Primary #0075de + Ghost #e6f3fe) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-14"
            >
              <Button
                className="h-10 px-5 text-sm font-medium rounded-lg shadow-none w-full sm:w-auto transition-opacity"
                style={{ background: "#0075de", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find performers
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-5 text-sm font-medium rounded-lg w-full sm:w-auto border-0 transition-opacity"
                style={{ background: "#e6f3fe", color: "#0075de" }}
                onClick={() => navigate("/auth")}
              >
                Find gigs
              </Button>
            </motion.div>

            {/* Product UI Mockup (12px radius, 1px border rgba(0,0,0,0.08), single drop shadow) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-3xl rounded-xl p-6 text-left"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f64932]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffb110]" />
                  <span className="w-3 h-3 rounded-full bg-[#62aef0]" />
                  <span className="text-xs text-[#757575] font-medium ml-2">Order Room · #ord-8924</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#1A7544]">
                  Escrow active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg border border-black/[0.08] bg-[#f6f5f4]">
                  <div className="text-xs text-[#757575] mb-1">Talent</div>
                  <div className="font-semibold text-sm text-black flex items-center gap-1">
                    Emeka Johnson
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
                  </div>
                  <div className="text-xs text-[#757575] mt-0.5">Lead Actor · Drama</div>
                </div>

                <div className="p-3.5 rounded-lg border border-black/[0.08] bg-[#f6f5f4]">
                  <div className="text-xs text-[#757575] mb-1">Escrow held</div>
                  <div className="font-semibold text-sm font-mono text-black">₦350,000</div>
                  <div className="text-xs text-[#1A7544] mt-0.5">100% protected payout</div>
                </div>

                <div className="p-3.5 rounded-lg border border-black/[0.08] bg-[#f6f5f4]">
                  <div className="text-xs text-[#757575] mb-1">Deliverable</div>
                  <div className="font-semibold text-sm text-black">Feature Audition Tape</div>
                  <div className="text-xs text-[#757575] mt-0.5">Due in 48 hours</div>
                </div>
              </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-12 w-full max-w-3xl pt-8 border-t border-black/[0.08]">
              {HERO_STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight text-black mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#757575]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── "Find performers for every kind of work" (8 Categories in White Cards) ── */}
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-left md:text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-2 block">
                Explore categories
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
                Find performers for every kind of work
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NICHES.map((niche, idx) => {
                const IconComponent = niche.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate("/auth")}
                    className="p-5 rounded-xl border border-black/[0.08] bg-white transition-all cursor-pointer flex items-center gap-4 hover:border-black/20 group"
                  >
                    {/* Large 28px icon in a 52px rounded squircle */}
                    <div
                      className="w-13 h-13 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: niche.bg, color: niche.color }}
                    >
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-black group-hover:text-[#0075de] transition-colors">
                        {niche.label}
                      </div>
                      <div className="text-xs text-[#757575] mt-0.5 flex items-center gap-1">
                        <span>Browse talent</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6 Core Features (Sticky-Note Accent Panels & Ruled White Cards) ── */}
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14 text-left md:text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-2 block">
                Platform features
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
                Everything you need, nothing you don't
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1: Share your stage anywhere (Sky Tint #e6f3fe panel) */}
              <div className="p-7 rounded-xl border border-black/[0.08] bg-[#e6f3fe] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-[#0075de] shrink-0 border border-black/[0.06]">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-[#0075de] border border-black/[0.06]">
                      One link
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-black">
                    Share your stage anywhere
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59] mb-5">
                    Join other performers using a single master link and instant QR code to share their portfolios, showreels, and press kits directly with casting directors, studios, agencies, brand managers, and live event organizers globally across all platforms.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-white border border-black/[0.08] flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-[#0075de] shrink-0" />
                  <div className="text-xs font-mono text-black truncate">monologg.co/emeka</div>
                </div>
              </div>

              {/* Feature 2: Monetize fan shoutouts & micro-deliverables (Coral Tint #fbeae8 panel) */}
              <div className="p-7 rounded-xl border border-black/[0.08] bg-[#fbeae8] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-[#f64932] shrink-0 border border-black/[0.06]">
                      <Video className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-[#f64932] border border-black/[0.06]">
                      93% payout
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-black">
                    Monetize fan shoutouts &amp; micro-deliverables
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59] mb-5">
                    Earn up to 93% of your rate by selling custom video shoutouts, voice drops, and private consultations directly from your bio link — on your own prices and delivery timelines.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-black/[0.08] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-black">Custom Video Drop</span>
                    <span className="text-[#757575] ml-2">₦45,000</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#f64932] text-white font-medium">Book</span>
                </div>
              </div>

              {/* Feature 3: Analyze your audience (Marigold Tint #fff7e6 panel) */}
              <div className="p-7 rounded-xl border border-black/[0.08] bg-[#fff7e6] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-[#e89d01] shrink-0 border border-black/[0.06]">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-[#e89d01] border border-black/[0.06]">
                      Real-time
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-black">
                    Analyze your audience
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59] mb-5">
                    Track your profile visits and link clicks in real time to see exactly where your fans are coming from and which packages make you the most money.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white border border-black/[0.08]">
                    <div className="text-[11px] text-[#757575]">Profile views</div>
                    <div className="text-lg font-semibold text-black">43,500</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-black/[0.08]">
                    <div className="text-[11px] text-[#757575]">Sales volume</div>
                    <div className="text-lg font-semibold text-black">₦2.36M</div>
                  </div>
                </div>
              </div>

              {/* Feature 4: Set transparent custom rate cards (Mocha Tint #f9f2ed panel) */}
              <div className="p-7 rounded-xl border border-black/[0.08] bg-[#f9f2ed] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-[#b18164] shrink-0 border border-black/[0.06]">
                      <FileText className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-[#b18164] border border-black/[0.06]">
                      No-haggle
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-black">
                    Set transparent custom rate cards
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59] mb-5">
                    Stop wasting time emailing back and forth — set clear, upfront Naira rates for auditions, hosting, voiceovers, or comedy sets so clients can book you instantly.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-black/[0.08] flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">Corporate MC / Compere</span>
                  <span className="font-mono font-bold text-black">₦450,000</span>
                </div>
              </div>

              {/* Feature 5: Powered by Thespian AI (Dark Card Surface Island #02093a) */}
              <div className="p-7 rounded-xl bg-[#02093a] text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center text-[#62aef0] shrink-0 border border-white/10">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-[#62aef0] border border-white/10">
                      AI-powered
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">
                    Powered by Thespian AI
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70 mb-5">
                    Get a 24/7 AI agent that automatically responds to questions on your behalf and books gigs onto your calendar while you sleep, and scans script PDFs to pitch your talent for open roles. Terms and Conditions apply.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-white/10 border border-white/10 text-xs text-white/80">
                  <span className="font-semibold text-white">Thespian:</span> "Elena is available this Friday for reading."
                </div>
              </div>

              {/* Feature 6: Bank-grade escrow protection (White Card with Interactive Calculator) */}
              <div className="p-7 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-lg bg-[#e6f4ea] flex items-center justify-center text-[#1A7544] shrink-0 border border-black/[0.06]">
                      <Lock className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#1A7544]">
                      Escrow backed
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-black">
                    Bank-grade escrow protection
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59] mb-5">
                    Never worry about late payments again — booking funds are safely held in escrow before you start working and sent straight to your bank account the moment you finish.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#f6f5f4] border border-black/[0.08]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#757575]">Contract value:</span>
                    <span className="font-mono font-bold text-black">₦{calculatorBudget.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="25000"
                    value={calculatorBudget}
                    onChange={(e) => setCalculatorBudget(Number(e.target.value))}
                    className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#0075de] mb-3"
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-black/[0.08]">
                    <div>
                      <div className="text-[10px] text-[#757575]">Performer take-home (93%)</div>
                      <div className="font-mono font-semibold text-[#1A7544]">₦{performerCut.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#757575]">Client invoice (109%)</div>
                      <div className="font-mono font-semibold text-black">₦{clientInvoice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Frequently Asked Questions (2-Column White Card Grid) ── */}
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12 text-left md:text-center">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
                Frequently asked questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-black/[0.08] bg-white transition-all overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-black/[0.01] transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-[15px] font-semibold text-black pr-3 leading-snug">
                      {faq.q}
                    </span>
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center border border-black/[0.08] shrink-0 transition-transform"
                      style={{
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
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
                        <div className="px-5 pb-5 text-sm leading-relaxed text-[#615d59] border-t border-black/[0.06] pt-3">
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

        {/* ── Final CTA (Midnight Card Island #02093a) ── */}
        <section className="py-16 px-5 md:px-16">
          <div className="max-w-5xl mx-auto rounded-xl p-10 md:p-16 bg-[#02093a] text-white text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
              Find performers, find gigs, and finish your project.
            </h2>
            <p className="text-base text-white/70 max-w-xl mx-auto leading-relaxed mb-8">
              Connect directly with directors, studios, agencies, brand managers, and live event organizers globally — with zero agent commissions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Button
                className="h-10 px-6 text-sm font-medium rounded-lg shadow-none w-full sm:w-auto"
                style={{ background: "#0075de", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find performers
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-6 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                onClick={() => navigate("/auth")}
              >
                Find gigs
              </Button>
            </div>

            {/* Character marks row */}
            <div className="flex items-center justify-center -space-x-2">
              {HERO_CHARACTER_MARKS.map((m, i) => (
                <img
                  key={i}
                  src={m.img}
                  alt={m.name}
                  className="w-9 h-9 rounded-full border-2 border-[#02093a] object-cover"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Join Our Newsletter ── */}
        <section className="py-12 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-1">
                Join our newsletter
              </h3>
              <p className="text-xs text-[#757575]">
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
                  className="h-9 px-3 rounded-lg border border-black/[0.12] text-sm bg-white text-black w-full md:w-64 focus:outline-none focus:border-[#0075de]"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg text-sm font-medium text-white transition-opacity shrink-0"
                  style={{ background: "#0075de" }}
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1A7544]">
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
