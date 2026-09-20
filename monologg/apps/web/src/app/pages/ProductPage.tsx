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
    title: "Sleek bio storefront",
    desc: "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
    color: "#f64932",
    bg: "#fbeae8",
  },
  {
    icon: TrendingUp,
    title: "Real-time performer analytics & visitor intelligence",
    desc: "See exactly who is visiting your page, which monologues they play, where they find your link, and how many views turn into paid bookings.",
    color: "#e89d01",
    bg: "#fff7e6",
  },
  {
    icon: Sparkles,
    title: "Interactive AI agent",
    desc: "Your AI agent works while you sleep, chatting with visitors about your style and instantly booking audition slots straight onto your calendar.",
    color: "#7B00FE",
    bg: "#f3e8ff",
  },
  {
    icon: FileText,
    title: "Custom rate cards & micro-deliverables",
    desc: "Set clear baseline prices for gigs and fan requests so clients can book your auditions, MC hosting, voiceovers, or personalized shoutouts instantly.",
    color: "#b18164",
    bg: "#f9f2ed",
  },
  {
    icon: Send,
    title: "Direct proposal bidding",
    desc: "Browse open casting briefs posted by verified studios and commercial media vendors; submit auditions and proposals in seconds.",
    color: "#0075de",
    bg: "#e6f3fe",
  },
  {
    icon: Lock,
    title: "Escrow security",
    desc: "Never worry about non-payment or client ghosting again. Funds for gigs and custom shoutouts are deposited safely into escrow prior to production or recording and released immediately upon project completion.",
    color: "#1A7544",
    bg: "#e6f4ea",
  },
  {
    icon: Calendar,
    title: "Integrated scheduling",
    desc: "Sync your calendar so visitors can book audition slots, phone consultations, or quick custom messages without back-and-forth emails.",
    color: "#097fe8",
    bg: "#e6f3fe",
  },
];

const CLIENT_FEATURES = [
  {
    icon: Users,
    title: "Verified creator pool",
    desc: "Browse rich, data-verified candidate pipelines across Actors, Comedians, Voiceover Artistes, Comperes, Musicians, Public speakers, Streamers, and Content Creators.",
    color: "#7B00FE",
    bg: "#f3e8ff",
  },
  {
    icon: ClipboardList,
    title: "Post gigs & micro-briefs",
    desc: "Publish creative briefs, indie movie roles, corporate event jobs, or direct shoutout requests in minutes and receive direct, structured applications or instant fulfillments.",
    color: "#0075de",
    bg: "#e6f3fe",
  },
  {
    icon: MessageSquare,
    title: "Chat with AI performer profiles",
    desc: "Instant Q&A with a performer's AI agent to verify availability, review project fits, book audition slots, or request custom video drops in seconds.",
    color: "#e89d01",
    bg: "#fff7e6",
  },
  {
    icon: ShieldCheck,
    title: "Secure contracts & escrow payments",
    desc: "Sign standard digital agreements with built-in milestones and escrow payment safety.",
    color: "#1A7544",
    bg: "#e6f4ea",
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
        {/* ── Performer Portal Hero & Features ── */}
        <section className="pt-16 pb-20 md:pt-20 md:pb-24 px-5 md:px-16 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mx-auto mb-14 flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#f64932] mb-3 block">
                Performer portal
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.12] mb-5 text-black">
                Build your personal digital stage
              </h1>
              <p className="text-lg md:text-xl text-[#615d59] leading-relaxed max-w-2xl mb-8">
                Pitch on live casting briefs, set your custom service rates, track customer analytics, and get paid securely.
              </p>
              <Button
                className="h-10 px-6 text-sm font-medium rounded-lg shadow-none"
                style={{ background: "#0075de", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find gigs
              </Button>
            </div>

            {/* 6+ Performer Feature White Cards (12px radius, 1px hairline border, no shadows) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
              {PERFORMER_FEATURES.map((f) => {
                const IconComponent = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-6 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between"
                  >
                    <div>
                      {/* Large prominent icon squircle */}
                      <div
                        className="w-13 h-13 rounded-lg flex items-center justify-center shrink-0 mb-5"
                        style={{ background: f.bg, color: f.color }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-black">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#615d59]">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Client Portal ("The Upwork for performer acquisition") ── */}
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-12 text-left md:text-center md:mx-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7B00FE] mb-2 block">
                Client portal
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-black">
                The Upwork for performer acquisition
              </h2>
              <p className="text-lg text-[#615d59] leading-relaxed mb-6">
                A professional performer acquisition network built for production houses, casting directors, brand managers, live event organizers, and fans.
              </p>
              <Button
                className="h-10 px-6 text-sm font-medium rounded-lg shadow-none"
                style={{ background: "#7B00FE", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find performers
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CLIENT_FEATURES.map((f) => {
                const IconComponent = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-6 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="w-13 h-13 rounded-lg flex items-center justify-center shrink-0 mb-5"
                        style={{ background: f.bg, color: f.color }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-black">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#615d59]">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Performance Intelligence Engine (Thespian AI) ── */}
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-14 text-left md:text-center md:mx-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-2 block">
                Thespian AI
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-black">
                Performance intelligence engine
              </h2>
              <p className="text-lg text-[#615d59] leading-relaxed">
                Say goodbye to manual form fatigue and endless email threads. Thespian AI works for both sides of the stage — acting as an untiring, 24/7 digital agent for performers and an automated casting butler for studios.
              </p>
            </div>

            {/* Performers AI Container */}
            <div className="mb-14">
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-6 flex items-center gap-2 text-black">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f64932]" />
                What Thespian AI does for the performer (your digital AI agent)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THESPIAN_PERFORMER.map((f) => {
                  const IconComp = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="p-5 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-[#fbeae8] text-[#f64932] flex items-center justify-center shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>
                          {f.badge && (
                            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-[#757575]">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-base text-black mb-1.5">
                          {f.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-[#615d59]">
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
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-6 flex items-center gap-2 text-black">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7B00FE]" />
                What Thespian AI does for the client (your automated casting butler)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {THESPIAN_CLIENT.map((f) => {
                  const IconComp = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="p-5 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-[#f3e8ff] text-[#7B00FE] flex items-center justify-center shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>
                          {f.badge && (
                            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-[#757575]">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-base text-black mb-1.5">
                          {f.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-[#615d59]">
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

        {/* ── Final Conversion CTA (Midnight Card Island #02093a) ── */}
        <section className="py-16 px-5 md:px-16">
          <div className="max-w-5xl mx-auto rounded-xl p-10 md:p-16 bg-[#02093a] text-white text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
              Find performers, find gigs, and finish your project.
            </h2>
            <p className="text-base text-white/70 max-w-xl mx-auto leading-relaxed mb-8">
              Connect directly with directors, studios, agencies, brand managers, and live event organizers globally — with zero agent commissions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
