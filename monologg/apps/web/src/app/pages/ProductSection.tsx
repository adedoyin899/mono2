import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../components/ui/Button";
import {
  Layers, TrendingUp, Sparkles, FileText, Send, Lock, Calendar,
  Users, ClipboardList, MessageSquare, ShieldCheck, Zap, Mic, Shield,
} from "lucide-react";

const PERFORMER_FEATURES = [
  {
    icon: Layers,
    title: "Sleek Bio Storefront",
    desc: "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Performer Analytics & Visitor Intelligence",
    desc: "See exactly who is visiting your page, which monologues they play, where they find your link, and how many views turn into paid bookings.",
  },
  {
    icon: Sparkles,
    title: "Interactive AI Agent",
    desc: "Your AI agent works while you sleep, chatting with visitors about your style and instantly booking audition slots straight onto your calendar.",
  },
  {
    icon: FileText,
    title: "Custom Rate Cards & Micro-Deliverables",
    desc: "Set clear baseline prices for gigs and fan requests so clients can book your auditions, MC hosting, voiceovers, or personalized shoutouts instantly.",
  },
  {
    icon: Send,
    title: "Direct Proposal Bidding",
    desc: "Browse open casting briefs posted by verified studios and commercial media vendors; submit auditions and proposals in seconds.",
  },
  {
    icon: Lock,
    title: "Escrow Security",
    desc: "Never worry about non-payment or client ghosting again. Funds for gigs and custom shoutouts are deposited safely into escrow prior to production or recording and released immediately upon project completion.",
  },
  {
    icon: Calendar,
    title: "Integrated Scheduling",
    desc: "Sync your calendar so visitors can book audition slots, phone consultations, or quick custom messages without back-and-forth emails.",
  },
];

const CLIENT_FEATURES = [
  {
    icon: Users,
    title: "Verified Creator Pool",
    desc: "Browse rich, data-verified candidate pipelines across Actors, Comedians, Voiceover Artistes, Comperes, Musicians, Public speakers, Streamers, and Content Creators.",
  },
  {
    icon: ClipboardList,
    title: "Post Gigs & Micro-Briefs",
    desc: "Publish creative briefs, indie movie roles, corporate event jobs, or direct shoutout requests in minutes and receive direct, structured applications or instant fulfillments.",
  },
  {
    icon: MessageSquare,
    title: "Chat with AI Performer Profiles",
    desc: "Instant Q&A with a performer's AI agent to verify availability, review project fits, book audition slots, or request custom video drops in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Contracts & Escrow Payments",
    desc: "Sign standard digital agreements with built-in milestones and escrow payment safety.",
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

function Eyebrow({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "purple" }) {
  const color = tone === "purple" ? "var(--color-purple)" : "var(--color-red)";
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs font-mono font-medium uppercase tracking-[0.1em]" style={{ color }}>{children}</span>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  badge,
  tone = "red",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  badge?: string;
  tone?: "red" | "purple";
}) {
  const accent = tone === "purple" ? "var(--color-purple)" : "var(--color-red)";
  const soft = tone === "purple" ? "var(--color-purple-soft)" : "var(--color-red-soft)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="p-6 rounded-[var(--radius-xl)] flex flex-col"
      style={{ background: "var(--color-bg-elevated)", boxShadow: "var(--shadow-cutout)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ background: soft, color: accent }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full font-body"
            style={{ background: "var(--color-bg-surface)", color: "var(--color-text-tertiary)", border: "1px solid var(--color-hairline)" }}
          >
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-body font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{desc}</p>
    </motion.div>
  );
}

/** Product content — rendered as one section of the single merged landing
 * page (id="product" is the header nav's anchor-scroll target), not a
 * routed page of its own. */
export function ProductSection() {
  const navigate = useNavigate();

  return (
    <section id="product" style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }}>
        {/* ── Performer Portal ── */}
        <section className="pt-20 pb-20 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-12">
              <Eyebrow tone="red">Performer Portal</Eyebrow>
              <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] mb-5">
                Build your personal digital stage
              </h1>
              <p className="text-lg font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Pitch on live casting briefs, set your custom service rates, track customer analytics, and get paid securely.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PERFORMER_FEATURES.map((f) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} tone="red" />
              ))}
            </div>
            <div className="mt-10">
              <Button className="h-12 px-8" onClick={() => navigate("/auth")}>Find Gigs</Button>
            </div>
          </div>
        </section>

        {/* ── Client Portal ── */}
        <section className="py-20 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-12">
              <Eyebrow tone="purple">Client Portal</Eyebrow>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] mb-5">
                The Upwork for Performer Acquisition
              </h2>
              <p className="text-lg font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                A professional performer acquisition network built for production houses, casting directors, brand managers, live event organizers, and fans.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CLIENT_FEATURES.map((f) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} tone="purple" />
              ))}
            </div>
            <div className="mt-10">
              <Button variant="secondary" className="h-12 px-8" onClick={() => navigate("/auth")}>Find Performers</Button>
            </div>
          </div>
        </section>

        {/* ── Thespian AI ── */}
        <section className="py-20 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-12">
              <Eyebrow tone="red">Thespian</Eyebrow>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] mb-5">
                Performance Intelligence Engine
              </h2>
              <p className="text-lg font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Say goodbye to manual form fatigue and endless email threads. Thespian AI works for both sides of the stage — acting as an untiring, 24/7 digital agent for performers and an automated casting butler for studios.
              </p>
            </div>

            <div className="mb-14">
              <h3 className="font-body font-semibold text-lg mb-5" style={{ color: "var(--color-red)" }}>
                What Thespian AI Does for the Performer (Your Digital AI Agent)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {THESPIAN_PERFORMER.map((f) => (
                  <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} badge={f.badge} tone="red" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-body font-semibold text-lg mb-5" style={{ color: "var(--color-purple)" }}>
                What Thespian AI Does for the Client (Your Automated Casting Butler)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {THESPIAN_CLIENT.map((f) => (
                  <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} badge={f.badge} tone="purple" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative py-24 px-5 md:px-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--gradient-brand-soft)" }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl leading-[1.1] mb-6">
              See it in action.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="h-12 px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>Find Performers</Button>
              <Button variant="secondary" className="h-12 px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>Find Gigs</Button>
            </div>
          </div>
        </section>
    </section>
  );
}
