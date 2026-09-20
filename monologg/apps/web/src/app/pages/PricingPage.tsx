import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { WebsiteHeader } from "../components/ui/WebsiteHeader";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import { Check, ChevronDown } from "lucide-react";

type Row = { feature: string; a: string; b: string };
type Section = { section?: string; rows: Row[] };

const PERFORMER_ROWS: Row[] = [
  { feature: "Completed Booking Fee", a: "7% per booking", b: "5% per booking (Save a little over 28% on fees)" },
  { feature: "Bio Storefront & Media Hosting", a: "Standard Storefront (Video/Audio)", b: "Custom Domain (name.monologg.co)" },
  { feature: "Profile & Customer Analytics", a: "Limited", b: "Deep Traffic Sources & Conversion Analytics" },
  { feature: "24/7 AI Profile Agent (Thespian)", a: "Included", b: "Priority AI Search Indexing" },
  { feature: "Audition & Calendar Bookings", a: "Direct Calendar Sync", b: "Direct Calendar Sync + Auto-Booking" },
  { feature: "Milestone Escrow Protection", a: "Included", b: "Included" },
  { feature: "Interactive AI Line-Reader & Rehearsals", a: "—", b: "Included" },
  { feature: "Automated Press Kit (EPK) Generator", a: "Included", b: "Unlimited Pro EPK Exports" },
  { feature: "Verified Artist Badge", a: "—", b: "Verified Pro Badge" },
];

const CLIENT_SECTIONS: Section[] = [
  {
    rows: [
      { feature: "Monthly Subscription", a: "$0 / month", b: "$20 / seat / month" },
      { feature: "Client Service Fee", a: "9% per booking", b: "9% per booking" },
      { feature: "Contract Initiation Fee", a: "$0", b: "$0" },
    ],
  },
  {
    section: "Discover Trusted Performers",
    rows: [
      { feature: "Global Performer Pool Access", a: "Full Access", b: "Full Access" },
      { feature: "ID-Verified Performer Profiles", a: "Included", b: "Included" },
      { feature: "Verified Reviews & Work History", a: "Included", b: "Included" },
      { feature: "Expert-Vetted Talent Pool", a: "Standard", b: "Priority Access" },
    ],
  },
  {
    section: "Move Faster with Thespian AI",
    rows: [
      { feature: "Auto-Invite Top Candidates", a: "—", b: "Up to 100" },
      { feature: "Curated AI Shortlists", a: "—", b: "Delivered in < 2 hrs" },
      { feature: "Script & PDF Parsing", a: "—", b: "Included" },
    ],
  },
  {
    section: "Analytics & Reporting",
    rows: [
      { feature: "Spend & Escrow Reporting", a: "Standard Reports", b: "Automated Export & ERP" },
    ],
  },
  {
    section: "Engage & Contract Candidates",
    rows: [
      { feature: "Performer Invites Per Brief Post", a: "30 Invites", b: "Unlimited Invites" },
      { feature: "Direct Messages Per Day", a: "15 Messages / day", b: "Unlimited" },
    ],
  },
  {
    section: "Collaborate & Management",
    rows: [
      { feature: "Real-Time Chat, Video & Audition Calls", a: "Built-in (15mins per call)", b: "Built-in (15mins per call)" },
      { feature: "Milestone Escrow & Dispute Protection", a: "Included", b: "Included" },
      { feature: "Multi-User Team Seats", a: "1 Seat", b: "Up to 5 Seats" },
      { feature: "Custom Roles & Billing Permissions", a: "Basic", b: "Advanced" },
      { feature: "Unified Invoicing & HRIS Compliance", a: "Standard Invoices", b: "Advanced" },
    ],
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
];

const PERFORMER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&fit=crop",
];

const CLIENT_PARTNER_LOGOS = [
  { name: "Vimeo", color: "#1AB7EA" },
  { name: "Netflix", color: "#E50914" },
  { name: "Prime Video", color: "#00A8E1" },
  { name: "Paystack", color: "#0BA4DB" },
  { name: "Spotify", color: "#1ED760" },
  { name: "Twitch", color: "#9146FF" },
];

function Cell({ value, tone }: { value: string; tone: "blue" | "purple" }) {
  if (value === "Included" || value === "Full Access") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
        <Check className="w-4 h-4 shrink-0" />
        {value}
      </span>
    );
  }
  if (value === "—") {
    return <span className="text-sm text-[var(--color-warm-gray)]">—</span>;
  }
  return <span className="text-sm font-medium text-[var(--color-text-primary)]">{value}</span>;
}

function ComparisonTable({
  colA,
  colB,
  rows,
  sections,
  tone,
}: {
  colA: string;
  colB: string;
  rows?: Row[];
  sections?: Section[];
  tone: "blue" | "purple";
}) {
  const groups: Section[] = sections ?? [{ rows: rows ?? [] }];
  const accentColor = tone === "purple" ? "#7B00FE" : "var(--color-signal-blue)";

  return (
    <div
      className="overflow-x-auto rounded-2xl border"
      style={{
        background: "var(--color-pure-white)",
        borderColor: "var(--color-faint-line)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr style={{ background: "var(--color-paper-white)", borderBottom: "1px solid var(--color-faint-line)" }}>
            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider font-body text-[var(--color-warm-gray)]">
              Feature / Capability
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider font-body text-[var(--color-warm-gray)]">
              {colA}
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider font-body" style={{ color: accentColor }}>
              {colB}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.section && (
                <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                  <td colSpan={3} className="px-6 pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider font-body text-[var(--color-warm-gray)]">
                    {group.section}
                  </td>
                </tr>
              )}
              {group.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="hover:bg-black/[0.01] transition-colors"
                  style={{ borderTop: "1px solid var(--color-faint-line)" }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-primary)]">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.a} tone={tone} />
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.b} tone={tone} />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PricingPage() {
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
        {/* ── Pricing Hero Stage ── */}
        <section className="pt-20 pb-16 px-5 md:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5 border shadow-xs"
              style={{
                borderColor: "var(--color-faint-line)",
                background: "var(--color-pure-white)",
                color: "var(--color-signal-blue)",
              }}
            >
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-5 text-[var(--color-text-primary)]">
              Pricing
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-warm-gray)] leading-relaxed max-w-2xl mx-auto mb-8">
              Simple, transparent pricing designed to maximize creator revenue with zero agent commissions or hidden fees.
            </p>
            <Button
              className="h-11 px-6 text-sm font-medium rounded-lg"
              style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
              onClick={() => {
                const el = document.getElementById("performers-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See calculator ↓
            </Button>
          </div>
        </section>

        {/* ── For Performers ── */}
        <section id="performers-section" className="pb-24 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-[var(--color-text-primary)] mb-2">
                  For Performers
                </h2>
                <p className="text-base text-[var(--color-warm-gray)] max-w-xl leading-relaxed">
                  Keep 93% of your booking and shoutout revenue with zero agent commissions (compared to traditional 20%+ agency fees or Cameo's 25% platform cut).
                </p>
              </div>

              {/* Performer Avatar Cluster */}
              <div className="flex items-center -space-x-3 shrink-0">
                {PERFORMER_AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Performer"
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-black object-cover shadow-xs"
                  />
                ))}
              </div>
            </div>

            <ComparisonTable
              colA="Free Tier"
              colB="🚀 Monologg Pro (Coming Soon)"
              rows={PERFORMER_ROWS}
              tone="blue"
            />

            <div className="mt-8">
              <Button
                className="h-12 px-8 text-[15px] font-medium rounded-lg shadow-sm"
                style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find Gigs
              </Button>
            </div>
          </div>
        </section>

        {/* ── For Clients ── */}
        <section
          className="py-24 px-5 md:px-16 transition-colors"
          style={{
            background: "var(--color-paper-white)",
            borderTop: "1px solid var(--color-faint-line)",
            borderBottom: "1px solid var(--color-faint-line)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-[var(--color-text-primary)] mb-2">
                  For Clients (Employers, Studios &amp; Fans)
                </h2>
                <p className="text-base text-[var(--color-warm-gray)] max-w-xl leading-relaxed">
                  Choose the plan that fits your production scale. All client fees are structured on invoices as an Automated Casting, Escrow Protection, and Project Management Service Fee.
                </p>
              </div>

              {/* Partner Brand Logos Grid */}
              <div className="flex items-center gap-4 flex-wrap">
                {CLIENT_PARTNER_LOGOS.map((p) => (
                  <div
                    key={p.name}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider"
                    style={{
                      background: "var(--color-pure-white)",
                      borderColor: "var(--color-faint-line)",
                      color: p.color,
                    }}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            <ComparisonTable
              colA="Basic (Free Marketplace)"
              colB="Business Plus (Coming Soon)"
              sections={CLIENT_SECTIONS}
              tone="purple"
            />

            <div className="mt-8">
              <Button
                className="h-12 px-8 text-[15px] font-medium rounded-lg shadow-sm"
                style={{ background: "#7B00FE", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find Performers
              </Button>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-24 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
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
