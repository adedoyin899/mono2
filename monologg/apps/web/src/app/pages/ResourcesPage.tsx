import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { WebsiteHeader } from "../components/ui/WebsiteHeader";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import {
  Lock, FileText, LifeBuoy, BookOpen, Mail,
  Instagram, X, Music, Linkedin, Twitch, Globe,
} from "lucide-react";

const SOCIAL_LINKS = [
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "X", icon: X, href: "#" },
  { label: "Tiktok", icon: Music, href: "#" },
  { label: "Discord", icon: Globe, href: "#" },
  { label: "Twitch", icon: Twitch, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "Product Hunt", icon: Globe, href: "#" },
  { label: "YC / Hacker News", icon: Globe, href: "#" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-red)" }} />
      <span className="text-xs font-mono font-medium uppercase tracking-[0.1em]" style={{ color: "var(--color-red)" }}>{children}</span>
    </div>
  );
}

function ResourceCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-6 rounded-[var(--radius-xl)] flex flex-col"
      style={{ background: "var(--color-bg-elevated)", boxShadow: "var(--shadow-cutout)" }}
    >
      <div
        className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 mb-4"
        style={{ background: "var(--color-red-soft)", color: "var(--color-red)" }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-body font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{desc}</p>
    </div>
  );
}

export function ResourcesPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }} className="min-h-screen flex flex-col overflow-x-hidden">
      <WebsiteHeader />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="pt-20 pb-16 px-5 md:px-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] mb-5">
              Resources
            </h1>
            <p className="text-lg font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Everything you need to book with confidence — policies, support, and where to find us.
            </p>
          </div>
        </section>

        {/* ── Terms of Service ── */}
        <section className="pb-20 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <Eyebrow>Terms of Service</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl mb-8">Fair, escrow-first agreements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ResourceCard
                icon={Lock}
                title="Escrow Guarantee Policy"
                desc="All client and fan booking funds are locked securely in escrow before performance or recording begins and released upon project completion: guaranteed by FINCRA/PAYSTACK."
              />
              <ResourceCard
                icon={FileText}
                title="Fair Trade Contracts"
                desc="Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms."
              />
            </div>
          </div>
        </section>

        {/* ── Support & Community ── */}
        <section className="pb-20 px-5 md:px-16" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)", paddingTop: "5rem" }}>
          <div className="max-w-5xl mx-auto">
            <Eyebrow>Support &amp; Community</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl mb-8">We've got your back</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              <ResourceCard
                icon={LifeBuoy}
                title="24/7 Creator Helpdesk"
                desc="Live assistance for booking disputes, account setup, and fast settlement inquiries."
              />
              <ResourceCard
                icon={BookOpen}
                title="Onboarding & EPK Guides"
                desc="Tutorials helping performers optimize showreels, rate cards, and bio storefronts for maximum booking conversions."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-elevated)" }}>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: "var(--color-text-tertiary)" }} />
                <a href="mailto:hello@monologg.co" className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>hello@monologg.co</a>
              </div>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Become an Investor ── */}
        <section className="relative py-24 px-5 md:px-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--gradient-brand-soft)" }} />
          <div className="relative z-10 max-w-md mx-auto">
            <h2 className="font-display text-3xl md:text-4xl leading-[1.1] mb-3">
              Become an Investor
            </h2>
            <p className="text-base font-body mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Follow our investor updates and be notified on our next round.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="h-11 px-6 shrink-0">Notify Me</Button>
              </form>
            ) : (
              <p className="text-sm font-semibold font-body" style={{ color: "var(--color-success)" }}>
                You're on the list — thank you.
              </p>
            )}
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
}
