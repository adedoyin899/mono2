import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Check } from "lucide-react";

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

function Cell({ value, tone }: { value: string; tone: "red" | "purple" }) {
  if (value === "Included" || value === "Full Access") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-body" style={{ color: tone === "purple" ? "var(--color-purple)" : "var(--color-red)" }}>
        <Check className="w-4 h-4 shrink-0" />
        {value}
      </span>
    );
  }
  if (value === "—") {
    return <span className="text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>—</span>;
  }
  return <span className="text-sm font-body" style={{ color: "var(--color-text-primary)" }}>{value}</span>;
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
  tone: "red" | "purple";
}) {
  const accent = tone === "purple" ? "var(--color-purple)" : "var(--color-red)";
  const groups: Section[] = sections ?? [{ rows: rows ?? [] }];

  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)]" style={{ border: "1px solid var(--color-hairline)" }}>
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr style={{ background: "var(--color-bg-elevated)" }}>
            <th className="text-left px-5 py-4 text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Feature / Capability</th>
            <th className="text-left px-5 py-4 text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{colA}</th>
            <th className="text-left px-5 py-4 text-sm font-semibold font-body" style={{ color: accent }}>{colB}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.section && (
                <tr>
                  <td colSpan={3} className="px-5 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider font-body" style={{ color: "var(--color-text-tertiary)", background: "var(--color-bg-surface)" }}>
                    {group.section}
                  </td>
                </tr>
              )}
              {group.rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid var(--color-hairline)", background: "var(--color-bg-surface)" }}>
                  <td className="px-5 py-3.5 text-sm font-body" style={{ color: "var(--color-text-primary)" }}>{row.feature}</td>
                  <td className="px-5 py-3.5"><Cell value={row.a} tone={tone} /></td>
                  <td className="px-5 py-3.5"><Cell value={row.b} tone={tone} /></td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Pricing content — rendered as one section of the single merged landing
 * page (id="pricing" is the header nav's anchor-scroll target), not a
 * routed page of its own. */
export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section id="pricing" style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }}>
        {/* ── Hero ── */}
        <section className="pt-20 pb-16 px-5 md:px-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] mb-5">
              Simple, transparent pricing
            </h1>
            <p className="text-lg font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Designed to maximize direct opportunities while protecting project payouts.
            </p>
          </div>
        </section>

        {/* ── Performers ── */}
        <section className="pb-20 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl mb-2">For Performers</h2>
            <p className="text-base font-body mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Keep 93% of your booking and shoutout revenue with zero agent commissions (compared to traditional 20%+ agency fees or Cameo's 25% platform cut).
            </p>
            <ComparisonTable colA="Free Tier" colB="🚀 Monologg Pro (Coming Soon)" rows={PERFORMER_ROWS} tone="red" />
            <div className="mt-8">
              <Button className="h-12 px-8" onClick={() => navigate("/auth")}>Find Gigs</Button>
            </div>
          </div>
        </section>

        {/* ── Clients ── */}
        <section className="pb-24 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl mb-2">For Clients (Employers, Studios &amp; Fans)</h2>
            <p className="text-base font-body mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Choose the plan that fits your production scale. All client fees are structured on invoices as an Automated Casting, Escrow Protection, and Project Management Service Fee.
            </p>
            <ComparisonTable colA="Basic (Free Marketplace)" colB="Business Plus (Coming Soon)" sections={CLIENT_SECTIONS} tone="purple" />
            <div className="mt-8">
              <Button variant="secondary" className="h-12 px-8" onClick={() => navigate("/auth")}>Find Performers</Button>
            </div>
          </div>
        </section>
    </section>
  );
}
