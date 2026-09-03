import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { WebsiteHeader } from "../components/ui/WebsiteHeader";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import { cn } from "../../lib/utils";
import {
  Shield, ChevronDown, Lock, FileText,
  QrCode, Video, TrendingUp, Sparkles,
  User, Presentation, Mic, Star, Camera, Music,
} from "lucide-react";

// ── "Find Performers" niche grid — 8 categories per the current copy ──
const NICHES = [
  { label: "Actors", icon: User, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80&fit=crop" },
  { label: "Public Speakers", icon: Presentation, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop" },
  { label: "Comperes", icon: Mic, img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80&fit=crop" },
  { label: "Comedians", icon: Star, img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80&fit=crop" },
  { label: "Streamers", icon: Video, img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80&fit=crop" },
  { label: "Artists", icon: Camera, img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&fit=crop" },
  { label: "Musicians", icon: Music, img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80&fit=crop" },
  { label: "Creators", icon: Sparkles, img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&fit=crop" },
];

const HERO_STATS = [
  { value: "10,000+", label: "Verified Performers" },
  { value: "$5M+", label: "Project Escrow Processed" },
  { value: "98%", label: "On-Time Payout Rate" },
  { value: "125", label: "Gigs" },
];

const FEATURES = [
  {
    icon: QrCode,
    title: "Share Your Stage Anywhere",
    desc: "Join other performers using a single master link and instant QR code to share their portfolios, showreels, and press kits directly with casting directors, studios, agencies, brand managers, and live event organizers globally across all platforms.",
    badge: "One Link",
  },
  {
    icon: Video,
    title: "Monetize Fan Shoutouts & Micro-Deliverables",
    desc: "Earn up to 93% of your rate by selling custom video shoutouts, voice drops, and private consultations directly from your bio link — on your own prices and delivery timelines.",
    badge: "93% Payout",
  },
  {
    icon: TrendingUp,
    title: "Analyze Your Audience",
    desc: "Track your profile visits and link clicks in real time to see exactly where your fans are coming from and which packages make you the most money.",
    badge: "Real-Time",
  },
  {
    icon: FileText,
    title: "Set Transparent Custom Rate Cards",
    desc: "Stop wasting time emailing back and forth — set clear, upfront Naira rates for auditions, hosting, voiceovers, or comedy sets so clients can book you instantly.",
    badge: "No-Haggle",
  },
  {
    icon: Sparkles,
    title: "Powered by Thespian AI",
    desc: "Get a 24/7 AI agent that automatically responds to questions on your behalf and books gigs onto your calendar while you sleep, and scans script PDFs to pitch your talent for open roles. Terms and Conditions apply.",
    badge: "AI-Powered",
  },
  {
    icon: Lock,
    title: "Bank-Grade Escrow Protection",
    desc: "Never worry about late payments again — booking funds are safely held in escrow before you start working and sent straight to your bank account the moment you finish.",
    badge: "Escrow Backed",
  },
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const bentoItems: Array<
    | { kind: "feature"; feature: (typeof FEATURES)[number]; span: "big" | "tall" | "normal" }
    | { kind: "stat"; value: string; label: string; span: "tall" }
  > = [
    { kind: "feature", feature: FEATURES[0], span: "big" },
    { kind: "feature", feature: FEATURES[1], span: "normal" },
    { kind: "feature", feature: FEATURES[2], span: "normal" },
    { kind: "stat", value: HERO_STATS[1].value, label: HERO_STATS[1].label, span: "tall" },
    { kind: "feature", feature: FEATURES[3], span: "normal" },
    { kind: "feature", feature: FEATURES[4], span: "normal" },
    { kind: "feature", feature: FEATURES[5], span: "normal" },
  ];

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }} className="min-h-screen flex flex-col overflow-x-hidden">
      <WebsiteHeader />

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
              <h1 className="font-display text-[40px] md:text-[64px] leading-[1.02] tracking-[-0.03em] uppercase mb-6">
                Find Performers,{" "}
                <br />
                Find Gigs,{" "}
                <br />
                <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Finish Your Project.
                </span>
              </h1>

              <p
                className="text-lg md:text-xl mb-8 max-w-xl leading-relaxed font-body"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Discover the performing arts' best-kept secrets. Connect directly with directors, studios, agencies, brand managers, and live event organizers globally — with zero agent commissions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button className="h-12 px-8" onClick={() => navigate("/auth")}>
                  Find Performers
                </Button>
                <Button variant="secondary" className="h-12 px-8" onClick={() => navigate("/auth")}>
                  Find Gigs
                </Button>
              </div>

              {/* Stats strip */}
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {HERO_STATS.map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-2xl tnum" style={{ color: "var(--color-text-primary)" }}>{s.value}</div>
                    <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating product mockup — the Order Room in miniature */}
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
                <div className="text-xs font-mono uppercase tracking-[0.1em] mb-1" style={{ color: "var(--color-text-tertiary)" }}>On-time payouts</div>
                <div className="font-display text-xl tnum" style={{ color: "var(--color-purple)" }}>98%</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Find Performers (niche grid) ── */}
        <section className="py-24 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center"><Eyebrow tone="red">Find Performers</Eyebrow></div>
              <h2 className="font-display text-3xl md:text-4xl mb-3">
                Actors, Public Speakers, Comperes, Comedians, Streamers, Artists, Musicians &amp; Creators
              </h2>
            </div>
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
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Bento ── */}
        <section
          className="py-24 px-5 md:px-16"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center"><Eyebrow tone="red">Why Performers Choose Monologg</Eyebrow></div>
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
                  </motion.div>
                );
              })}
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
                Frequently Asked Questions
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
            <h2 className="font-display text-4xl md:text-[56px] leading-[1.04] mb-5 uppercase">
              Find Performers, Find Gigs, Finish Your Project.
            </h2>
            <p className="text-base font-body mb-10" style={{ color: "var(--color-text-secondary)" }}>
              Connect directly with directors, studios, agencies, brand managers, and live event organizers globally — with zero agent commissions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="h-12 px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>
                Find Performers
              </Button>
              <Button variant="secondary" className="h-12 px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>
                Find Gigs
              </Button>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}
