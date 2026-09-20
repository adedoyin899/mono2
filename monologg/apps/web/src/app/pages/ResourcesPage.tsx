import { useState } from "react";
import { Button } from "../components/ui/Button";
import { WebsiteHeader } from "../components/ui/WebsiteHeader";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import {
  Lock, FileText, LifeBuoy, BookOpen, Mail,
  Instagram, X, Music, Linkedin, Twitch, Globe,
  Check, ArrowUpRight
} from "lucide-react";

const SOCIAL_LINKS = [
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "Product Hunt", icon: Globe, href: "https://producthunt.com" },
  { label: "X", icon: X, href: "https://x.com" },
  { label: "Twitch", icon: Twitch, href: "https://twitch.tv" },
  { label: "Discord", icon: Globe, href: "https://discord.com" },
  { label: "Tiktok", icon: Music, href: "https://tiktok.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
];

export function ResourcesPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  // Investor Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [investorType, setInvestorType] = useState("Angel Investor");
  const [message, setMessage] = useState("");
  const [investorSubmitted, setInvestorSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setNewsletterSent(true);
  };

  const handleInvestorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (investorEmail && firstName) {
      setInvestorSubmitted(true);
    }
  };

  return (
    <div style={{ background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }} className="min-h-screen flex flex-col overflow-x-hidden font-body selection:bg-blue-100 selection:text-blue-900">
      <WebsiteHeader />

      <main className="flex-1">
        {/* ── Terms of Service Stage ── */}
        <section className="pt-20 pb-20 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border shadow-xs"
                style={{
                  borderColor: "var(--color-faint-line)",
                  background: "var(--color-pure-white)",
                  color: "var(--color-signal-blue)",
                }}
              >
                <span>Legal &amp; Trust Policies</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Terms Of Service
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Escrow Guarantee Policy */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pure-white)",
                  borderColor: "var(--color-faint-line)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6"
                    style={{ background: "var(--color-pastel-rose-squircle)", color: "var(--color-pastel-rose-text)" }}
                  >
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Escrow Guarantee Policy
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">
                    All client and fan booking funds are locked securely in escrow before performance or recording begins and released upon project completion: guaranteed by FINCRA/PAYSTACK.
                  </p>
                </div>
              </div>

              {/* Fair Trade Contracts */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between transition-all"
                style={{
                  background: "var(--color-pure-white)",
                  borderColor: "var(--color-faint-line)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6"
                    style={{ background: "var(--color-pastel-blue-squircle)", color: "var(--color-pastel-blue-text)" }}
                  >
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                    Fair Trade Contracts
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">
                    Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Support & Community ── */}
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
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Support &amp; Community
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 24/7 Creator Helpdesk */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between"
                style={{
                  background: "var(--color-pure-white)",
                  borderColor: "var(--color-faint-line)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6"
                    style={{ background: "var(--color-pastel-amber-squircle)", color: "var(--color-pastel-amber-text)" }}
                  >
                    <LifeBuoy className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-[var(--color-text-primary)]">
                    24/7 Creator Helpdesk
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">
                    Live assistance for booking disputes, account setup, and fast settlement inquiries.
                  </p>
                </div>
              </div>

              {/* Onboarding & EPK Guides */}
              <div
                className="p-8 rounded-2xl border flex flex-col justify-between"
                style={{
                  background: "var(--color-pure-white)",
                  borderColor: "var(--color-faint-line)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6"
                    style={{ background: "var(--color-pastel-mint-squircle)", color: "var(--color-pastel-mint-text)" }}
                  >
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-[var(--color-text-primary)]">
                    Onboarding &amp; EPK Guides
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">
                    Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Banner & Social Icon Bar */}
            <div
              className="p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6"
              style={{
                background: "var(--color-pure-white)",
                borderColor: "var(--color-faint-line)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[var(--color-warm-gray)]">
                  <Mail className="w-5 h-5" />
                </div>
                <a
                  href="mailto:hello@monologg.co"
                  className="text-base font-semibold font-body text-[var(--color-text-primary)] hover:text-[var(--color-signal-blue)] transition-colors"
                >
                  hello@monologg.co
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                {SOCIAL_LINKS.map((s) => {
                  const IconComp = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                      style={{
                        borderColor: "var(--color-faint-line)",
                        background: "var(--color-paper-white)",
                        color: "var(--color-warm-gray)",
                      }}
                    >
                      <IconComp className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Become an Investor ── */}
        <section className="py-24 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
              {/* Left Column Headline */}
              <div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-4 text-[var(--color-text-primary)]">
                  Become An Investor
                </h2>
                <p className="text-base text-[var(--color-warm-gray)] leading-relaxed max-w-md">
                  Follow our investor updates and be notified on our next round.
                </p>
              </div>

              {/* Right Column Form */}
              <div
                className="p-8 rounded-2xl border"
                style={{
                  background: "var(--color-pure-white)",
                  borderColor: "var(--color-faint-line)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {!investorSubmitted ? (
                  <form onSubmit={handleInvestorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-warm-gray)] mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jane"
                          className="w-full h-11 px-3.5 rounded-lg border text-sm focus:outline-none focus:border-[#0075de]"
                          style={{
                            background: "var(--color-bg-canvas)",
                            borderColor: "var(--color-faint-line)",
                            color: "var(--color-text-primary)",
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-warm-gray)] mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full h-11 px-3.5 rounded-lg border text-sm focus:outline-none focus:border-[#0075de]"
                          style={{
                            background: "var(--color-bg-canvas)",
                            borderColor: "var(--color-faint-line)",
                            color: "var(--color-text-primary)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-warm-gray)] mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={investorEmail}
                          onChange={(e) => setInvestorEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full h-11 px-3.5 rounded-lg border text-sm focus:outline-none focus:border-[#0075de]"
                          style={{
                            background: "var(--color-bg-canvas)",
                            borderColor: "var(--color-faint-line)",
                            color: "var(--color-text-primary)",
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-warm-gray)] mb-1.5">
                          Phone No
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="w-full h-11 px-3.5 rounded-lg border text-sm focus:outline-none focus:border-[#0075de]"
                          style={{
                            background: "var(--color-bg-canvas)",
                            borderColor: "var(--color-faint-line)",
                            color: "var(--color-text-primary)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-warm-gray)] mb-1.5">
                        Please Tell Us Who You Are
                      </label>
                      <select
                        value={investorType}
                        onChange={(e) => setInvestorType(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg border text-sm focus:outline-none focus:border-[#0075de]"
                        style={{
                          background: "var(--color-bg-canvas)",
                          borderColor: "var(--color-faint-line)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        <option value="Angel Investor">Angel Investor</option>
                        <option value="Early-Stage VC">Early-Stage VC</option>
                        <option value="Growth VC">Growth VC</option>
                        <option value="Family Office">Family Office</option>
                        <option value="Strategic Partner">Strategic Partner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-warm-gray)] mb-1.5">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Leave a message..."
                        className="w-full p-3 rounded-lg border text-sm focus:outline-none focus:border-[#0075de] resize-none"
                        style={{
                          background: "var(--color-bg-canvas)",
                          borderColor: "var(--color-faint-line)",
                          color: "var(--color-text-primary)",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-12 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                      style={{ background: "#F13030" }}
                    >
                      <span>Submit Application</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase mb-2 text-[var(--color-text-primary)]">
                      Application Received
                    </h3>
                    <p className="text-sm text-[var(--color-warm-gray)] max-w-sm mx-auto">
                      Thank you for your interest in Monologg. Our investor relations lead will reach out shortly.
                    </p>
                  </div>
                )}
              </div>
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
                onClick={() => (window.location.href = "/auth")}
              >
                Get Started
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
