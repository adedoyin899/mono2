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
  { border: "#0075de", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop" },
  { border: "#f64932", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop" },
  { border: "#ffb110", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop" },
  { border: "#62aef0", src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&fit=crop" },
  { border: "#097fe8", src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&fit=crop" },
];

const CLIENT_PARTNER_LOGOS = [
  "Vimeo",
  "Netflix",
  "Prime Video",
  "Paystack",
  "Spotify",
  "Twitch",
];

function Cell({ value }: { value: string }) {
  if (value === "Included" || value === "Full Access") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A7544]">
        <Check className="w-4 h-4 shrink-0 text-[#1A7544]" />
        {value}
      </span>
    );
  }
  if (value === "—") {
    return <span className="text-sm text-[#757575]">—</span>;
  }
  return <span className="text-sm text-[#615d59]">{value}</span>;
}

function ComparisonTable({
  colA,
  colB,
  rows,
  sections,
}: {
  colA: string;
  colB: string;
  rows?: Row[];
  sections?: Section[];
}) {
  const groups: Section[] = sections ?? [{ rows: rows ?? [] }];

  return (
    <div
      className="overflow-x-auto rounded-xl border border-black/[0.08] bg-white"
    >
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="bg-[#f6f5f4] border-b border-black/[0.08]">
            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#757575]">
              Feature / Capability
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#757575]">
              {colA}
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#0075de]">
              {colB}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.section && (
                <tr className="bg-[#f6f5f4]/70 border-t border-black/[0.08]">
                  <td colSpan={3} className="px-6 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                    {group.section}
                  </td>
                </tr>
              )}
              {group.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-t border-black/[0.06] hover:bg-black/[0.01] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.a} />
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.b} />
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
        {/* ── Pricing Hero Stage ── */}
        <section className="pt-16 pb-20 md:pt-20 md:pb-24 px-5 md:px-16 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-5 border border-black/[0.08] bg-white text-[#0075de]">
              <span>Simple, transparent pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.15] mb-5 text-black">
              Pricing designed to{" "}
              <span className="inline-block px-3.5 py-0.5 rounded-full bg-[#f6d5b8] text-black font-medium border border-black/10 mx-1 align-middle">
                maximize creator revenue.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#615d59] leading-relaxed max-w-2xl mx-auto mb-8">
              Simple, transparent pricing designed to maximize creator revenue with zero agent commissions or hidden fees.
            </p>
            <Button
              className="h-10 px-5 text-sm font-medium rounded-lg shadow-none transition-opacity"
              style={{ background: "#0075de", color: "#ffffff" }}
              onClick={() => {
                const el = document.getElementById("performers-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See pricing breakdown ↓
            </Button>
          </div>
        </section>

        {/* ── For Performers ── */}
        <section id="performers-section" className="pb-24 px-5 md:px-16 border-t border-black/[0.08] pt-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-1.5 block">
                  Keep what you earn
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">
                  For performers
                </h2>
                <p className="text-base text-[#615d59] max-w-xl leading-relaxed">
                  Keep 93% of your booking and shoutout revenue with zero agent commissions (compared to traditional 20%+ agency fees or Cameo's 25% platform cut).
                </p>
              </div>

              {/* Performer Character Marks Row */}
              <div className="flex items-center -space-x-2 shrink-0">
                {PERFORMER_AVATARS.map((av, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full p-0.5 bg-white shrink-0 shadow-xs"
                    style={{ border: `2px solid ${av.border}` }}
                  >
                    <img
                      src={av.src}
                      alt="Performer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <ComparisonTable
              colA="Free tier"
              colB="Monologg Pro (Coming soon)"
              rows={PERFORMER_ROWS}
            />

            <div className="mt-8">
              <Button
                className="h-10 px-5 text-sm font-medium rounded-lg shadow-none"
                style={{ background: "#0075de", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find gigs
              </Button>
            </div>
          </div>
        </section>

        {/* ── For Clients ── */}
        <section className="py-24 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-1.5 block">
                  Flexible casting plans
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">
                  For clients (employers, studios &amp; fans)
                </h2>
                <p className="text-base text-[#615d59] max-w-xl leading-relaxed">
                  Choose the plan that fits your production scale. All client fees are structured on invoices as an Automated Casting, Escrow Protection, and Project Management Service Fee.
                </p>
              </div>

              {/* Partner Brand Logos as clean greyscale Notion-style typography */}
              <div className="flex items-center gap-2 flex-wrap">
                {CLIENT_PARTNER_LOGOS.map((name) => (
                  <div
                    key={name}
                    className="px-3 py-1.5 rounded-lg border border-black/[0.08] bg-white text-xs font-medium text-black/70"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <ComparisonTable
              colA="Basic (Free marketplace)"
              colB="Business Plus (Coming soon)"
              sections={CLIENT_SECTIONS}
            />

            <div className="mt-8">
              <Button
                className="h-10 px-5 text-sm font-medium rounded-lg shadow-none"
                style={{ background: "#0075de", color: "#ffffff" }}
                onClick={() => navigate("/auth")}
              >
                Find performers
              </Button>
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
              <h3 className="text-lg font-semibold tracking-tight text-black mb-1">
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
                  className="h-9 px-3.5 rounded-lg border border-black/[0.12] bg-white text-black text-sm w-full md:w-64 focus:outline-none focus:border-[#0075de]"
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
              <div className="flex items-center gap-2 text-sm font-medium text-[#1A7544]">
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
