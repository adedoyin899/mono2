import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { WebsiteHeader } from "../components/ui/WebsiteHeader";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import {
  Layers, TrendingUp, Sparkles, FileText, Send, Lock, Calendar,
  Users, ClipboardList, MessageSquare, ShieldCheck, Zap, Mic, Shield,
  ChevronDown, Check
} from "lucide-react";

const PERFORMER_FEATURES = [
  {
    icon: Layers,
    title: "Sleek Bio Storefront",
    desc: "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
    color: "var(--color-pastel-rose-text)",
    bg: "var(--color-pastel-rose-squircle)",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Performer Analytics & Visitor Intelligence",
    desc: "See exactly who is visiting your page, which monologues they play, where they find your link, and how many views turn into paid bookings.",
    color: "var(--color-pastel-amber-text)",
    bg: "var(--color-pastel-amber-squircle)",
  },
  {
    icon: Sparkles,
    title: "Interactive AI Agent",
    desc: "Your AI agent works while you sleep, chatting with visitors about your style and instantly booking audition slots straight onto your calendar.",
    color: "var(--color-pastel-purple-text)",
    bg: "var(--color-pastel-purple-squircle)",
  },
  {
    icon: FileText,
    title: "Custom Rate Cards & Micro-Deliverables",
    desc: "Set clear baseline prices for gigs and fan requests so clients can book your auditions, MC hosting, voiceovers, or personalized shoutouts instantly.",
    color: "var(--color-pastel-periwinkle-text)",
    bg: "var(--color-pastel-periwinkle-squircle)",
  },
  {
    icon: Send,
    title: "Direct Proposal Bidding",
    desc: "Browse open casting briefs posted by verified studios and commercial media vendors; submit auditions and proposals in seconds.",
    color: "var(--color-pastel-blue-text)",
    bg: "var(--color-pastel-blue-squircle)",
  },
  {
    icon: Lock,
    title: "Escrow Security",
    desc: "Never worry about non-payment or client ghosting again. Funds for gigs and custom shoutouts are deposited safely into escrow prior to production or recording and released immediately upon project completion.",
    color: "var(--color-pastel-mint-text)",
    bg: "var(--color-pastel-mint-squircle)",
  },
  {
    icon: Calendar,
    title: "Integrated Scheduling",
    desc: "Sync your calendar so visitors can book audition slots, phone consultations, or quick custom messages without back-and-forth emails.",
    color: "var(--color-pastel-blue-text)",
    bg: "var(--color-pastel-blue-squircle)",
  },
];

const CLIENT_FEATURES = [
  {
    icon: Users,
    title: "Verified Creator Pool",
    desc: "Browse rich, data-verified candidate pipelines across Actors, Comedians, Voiceover Artistes, Comperes, Musicians, Public speakers, Streamers, and Content Creators.",
    color: "var(--color-pastel-purple-text)",
    bg: "var(--color-pastel-purple-squircle)",
  },
  {
    icon: ClipboardList,
    title: "Post Gigs & Micro-Briefs",
    desc: "Publish creative briefs, indie movie roles, corporate event jobs, or direct shoutout requests in minutes and receive direct, structured applications or instant fulfillments.",
    color: "var(--color-pastel-blue-text)",
    bg: "var(--color-pastel-blue-squircle)",
  },
  {
    icon: MessageSquare,
    title: "Chat with AI Performer Profiles",
    desc: "Instant Q&A with a performer's AI agent to verify availability, review project fits, book audition slots, or request custom video drops in seconds.",
    color: "var(--color-pastel-amber-text)",
    bg: "var(--color-pastel-amber-squircle)",
  },
  {
    icon: ShieldCheck,
    title: "Secure Contracts & Escrow Payments",
    desc: "Sign standard digital agreements with built-in milestones and escrow payment safety.",
    color: "var(--color-pastel-mint-text)",
    bg: "var(--color-pastel-mint-squircle)",
  },
];

const THESPIAN_PERFORMER = [
  { icon: Sparkles, title: "24/7 AI Booking Agent", desc: "Let visitors chat with your profile about your roles and book auditions directly onto your calendar anytime." },
  { icon: Zap, title: "Instant AI Onboarding", desc: "Upload a monologue or audio reel, Thespian AI analyzes your media to automatically detect your vocal texture (pitch, accent, projection), comedic timing, and stage presence — filling out your performance attributes automatically without having to fill tedious forms." },
  { icon: Send, title: "Automatic Gig Pitching", desc: "Thespian constantly scans script PDFs and casting calls, pitching your profile the moment a role matches your talent and rates." },
  { icon: Mic, title: "AI Rehearsal Partner", desc: "Upload audition scripts to get character breakdowns and practice your lines with an interactive AI reader.", badge: "Coming soon" },
  { icon: Shield, title: "Contract Guardrails", desc: "AI automatically checks briefs for unfair terms and ensures booking funds are safely in escrow before you work." },
];

const THESPIAN_CLIENT = [
  { icon: FileText, title: "Script & Prompt Parsing", desc: "Drop in a PDF script or creative brief, and the AI reads the dialogue to generate a curated performer shortlist instantly.", badge: "Coming soon" },
  { icon: Sparkles, title: "Vibe & Texture Matching", desc: "Match performers based on actual artistic texture, including comedic timing, vocal cadence, accent, and stage presence." },
  { icon: Calendar, title: "Automated Logistics", desc: "Automatically handle identity verification, availability checks, audition invites, calendar scheduling, and escrow protection." },
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
];

export function ProductPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setNewsletterSent(true);
  };

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }} className="min-h-screen flex flex-col overflow-x-hidden font-body selection:bg-blue-100 selection:text-blue-900">
      <WebsiteHeader />

      <main className="flex-1">
        {/* ── Performer Portal Hero & Features ── */}
        <section className="pt-20 pb-24 px-5 md:px-16 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mx-auto mb-16 flex flex-col items-center">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5 border shadow-xs"
                style={{
                  borderColor: "var(--color-pastel-rose-border)",
                  background: "var(--color-pure-white)",
                  color: "var(--color-pastel-rose-text)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Performer Portal
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-5 text-[var(--color-text-primary)]">
                Build your personal digital stage
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-warm-gray)] leading-relaxed max-w-2xl mb-8">
                Pitch on live casting briefs, set your custom service rates, track customer analytics, and get paid securely.
              </p>
              <Button
                className="h-12 px-8 text-[15px] font-medium rounded-lg shadow-sm"
                style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find Gigs
              </Button>
            </div>

            {/* 6+ Performer Feature Cards (Large Icons + Transparent/Pastel Washes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {PERFORMER_FEATURES.map((f) => {
                const IconComponent = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="p-7 rounded-2xl border flex flex-col justify-between"
                    style={{
                      background: "var(--color-pure-white)",
                      borderColor: "var(--color-faint-line)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div>
                      {/* Large prominent icon squircle */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6"
                        style={{ background: f.bg, color: f.color }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2 text-[var(--color-text-primary)]">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">
                        {f.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Client Portal (Pastel Lavender Wash & Large Icons) ── */}
        <section
          className="py-24 px-5 md:px-16 transition-colors"
          style={{
            background: "var(--color-pastel-purple-bg)",
            borderTop: "1px solid var(--color-pastel-purple-border)",
            borderBottom: "1px solid var(--color-pastel-purple-border)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-14">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
                style={{
                  borderColor: "var(--color-pastel-purple-border)",
                  background: "var(--color-pure-white)",
                  color: "var(--color-pastel-purple-text)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Client Portal
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-[var(--color-text-primary)]">
                The Upwork for Performer Acquisition
              </h2>
              <p className="text-lg text-[var(--color-warm-gray)] leading-relaxed mb-6">
                A professional performer acquisition network built for production houses, casting directors, brand managers, live event organizers, and fans.
              </p>
              <Button
                className="h-11 px-6 text-sm font-medium rounded-lg"
                style={{ background: "#7B00FE", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find Performers
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CLIENT_FEATURES.map((f) => {
                const IconComponent = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-7 rounded-2xl border flex flex-col justify-between"
                    style={{
                      background: "var(--color-pure-white)",
                      borderColor: "var(--color-faint-line)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div>
                      {/* Large prominent icon squircle */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6"
                        style={{ background: f.bg, color: f.color }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2 text-[var(--color-text-primary)]">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Thespian AI Engine ── */}
        <section className="py-24 px-5 md:px-16 transition-colors">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
                style={{
                  borderColor: "var(--color-pastel-mint-border)",
                  background: "var(--color-pure-white)",
                  color: "var(--color-pastel-mint-text)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Thespian
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-[var(--color-text-primary)]">
                Performance Intelligence Engine
              </h2>
              <p className="text-lg text-[var(--color-warm-gray)] leading-relaxed">
                Say goodbye to manual form fatigue and endless email threads. Thespian AI works for both sides of the stage — acting as an untiring, 24/7 digital agent for performers and an automated casting butler for studios.
              </p>
            </div>

            {/* Performers AI Container */}
            <div className="mb-14">
              <h3 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                What Thespian AI Does For The Performer (Your Digital AI Agent)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {THESPIAN_PERFORMER.map((f) => {
                  const IconComp = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="p-6 rounded-2xl border flex flex-col justify-between"
                      style={{
                        background: "var(--color-pure-white)",
                        borderColor: "var(--color-faint-line)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "var(--color-pastel-rose-squircle)", color: "var(--color-pastel-rose-text)" }}
                          >
                            <IconComp className="w-6 h-6" />
                          </div>
                          {f.badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[var(--color-warm-gray)]">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-base text-[var(--color-text-primary)] mb-2">
                          {f.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-[var(--color-warm-gray)]">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clients AI Container */}
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                What Thespian AI Does For The Client (Your Automated Casting Butler)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {THESPIAN_CLIENT.map((f) => {
                  const IconComp = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="p-6 rounded-2xl border flex flex-col justify-between"
                      style={{
                        background: "var(--color-pure-white)",
                        borderColor: "var(--color-faint-line)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "var(--color-pastel-purple-squircle)", color: "var(--color-pastel-purple-text)" }}
                          >
                            <IconComp className="w-6 h-6" />
                          </div>
                          {f.badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[var(--color-warm-gray)]">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-base text-[var(--color-text-primary)] mb-2">
                          {f.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-[var(--color-warm-gray)]">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section
          className="py-20 px-5 md:px-16 transition-colors"
          style={{
            background: "var(--color-paper-white)",
            borderTop: "1px solid var(--color-faint-line)",
            borderBottom: "1px solid var(--color-faint-line)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight uppercase text-[var(--color-text-primary)]">
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
          className="py-24 px-5 md:px-16 text-center transition-colors relative overflow-hidden"
          style={{ background: "var(--color-midnight-ink)", color: "#ffffff" }}
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white">
              Find Performers. Find Gigs. <br /> Finish Your Project.
            </h2>
            <p className="text-base font-body mb-8 text-white/70 max-w-lg mx-auto leading-relaxed">
              Connect directly with directors, studios, agencies, brand managers, and live event organizers globally with zero agent commissions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                className="h-12 px-8 text-[15px] font-medium rounded-lg shadow-sm w-full sm:w-auto"
                style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find Performers
              </Button>
              <Button
                variant="ghost"
                className="h-12 px-8 text-[15px] font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                onClick={() => navigate("/auth")}
              >
                Find Gigs
              </Button>
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
