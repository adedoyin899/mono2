import { useState } from "react";
import { useNavigate } from "react-router";
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
  const navigate = useNavigate();
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
        {/* ── Terms of Service Stage ── */}
        <section className="pt-16 pb-20 md:pt-20 md:pb-24 px-5 md:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4 border border-black/[0.08] bg-white text-[#0075de]">
                <span>Legal &amp; trust policies</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.15] text-black mb-4">
                Terms of service
              </h1>
              <p className="text-base md:text-lg text-[#615d59] max-w-xl mx-auto leading-relaxed">
                Clear and transparent guidelines safeguarding every creator, performer, and employer on Monologg.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Escrow Guarantee Policy */}
              <div className="p-8 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between transition-all">
                <div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6 bg-[#fbeae8] text-[#f64932]">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Escrow guarantee policy
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59]">
                    All client and fan booking funds are locked securely in escrow before performance or recording begins and released upon project completion: guaranteed by FINCRA/PAYSTACK.
                  </p>
                </div>
              </div>

              {/* Fair Trade Contracts */}
              <div className="p-8 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between transition-all">
                <div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6 bg-[#e6f3fe] text-[#0075de]">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Fair trade contracts
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59]">
                    Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Support & Community ── */}
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-2 block">
                Assistance &amp; guides
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-black">
                Support &amp; community
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 24/7 Creator Helpdesk */}
              <div className="p-8 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6 bg-[#fff7e6] text-[#e89d01]">
                    <LifeBuoy className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    24/7 creator helpdesk
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59]">
                    Live assistance for booking disputes, account setup, and fast settlement inquiries.
                  </p>
                </div>
              </div>

              {/* Onboarding & EPK Guides */}
              <div className="p-8 rounded-xl border border-black/[0.08] bg-white flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mb-6 bg-[#e6f4ea] text-[#1A7544]">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    Onboarding &amp; EPK guides
                  </h3>
                  <p className="text-sm leading-relaxed text-[#615d59]">
                    Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Banner & Social Icon Bar */}
            <div className="p-6 rounded-xl border border-black/[0.08] bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f6f5f4] flex items-center justify-center text-[#615d59]">
                  <Mail className="w-5 h-5" />
                </div>
                <a
                  href="mailto:hello@monologg.co"
                  className="text-base font-semibold text-black hover:text-[#0075de] transition-colors"
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
                      className="w-9 h-9 rounded-lg flex items-center justify-center border border-black/[0.08] bg-[#f6f5f4] text-[#615d59] hover:text-black hover:bg-black/[0.03] transition-all"
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
        <section className="py-20 px-5 md:px-16 border-t border-black/[0.08]">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
              {/* Left Column Headline */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0075de] mb-2 block">
                  Partner with us
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-4 text-black">
                  Become an investor
                </h2>
                <p className="text-base text-[#615d59] leading-relaxed max-w-md">
                  Follow our investor updates and be notified on our next round. Join our mission to empower African and global creative talents.
                </p>
              </div>

              {/* Right Column Form */}
              <div className="p-8 rounded-xl border border-black/[0.08] bg-white">
                {!investorSubmitted ? (
                  <form onSubmit={handleInvestorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#757575] mb-1.5">
                          First name
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jane"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/[0.12] bg-[#f6f5f4] text-black text-sm focus:outline-none focus:border-[#0075de] focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#757575] mb-1.5">
                          Last name
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/[0.12] bg-[#f6f5f4] text-black text-sm focus:outline-none focus:border-[#0075de] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#757575] mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          required
                          value={investorEmail}
                          onChange={(e) => setInvestorEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/[0.12] bg-[#f6f5f4] text-black text-sm focus:outline-none focus:border-[#0075de] focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#757575] mb-1.5">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/[0.12] bg-[#f6f5f4] text-black text-sm focus:outline-none focus:border-[#0075de] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#757575] mb-1.5">
                        Please tell us who you are
                      </label>
                      <select
                        value={investorType}
                        onChange={(e) => setInvestorType(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-lg border border-black/[0.12] bg-[#f6f5f4] text-black text-sm focus:outline-none focus:border-[#0075de] focus:bg-white transition-colors"
                      >
                        <option value="Angel Investor">Angel Investor</option>
                        <option value="Early-Stage VC">Early-Stage VC</option>
                        <option value="Growth VC">Growth VC</option>
                        <option value="Family Office">Family Office</option>
                        <option value="Strategic Partner">Strategic Partner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#757575] mb-1.5">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Leave a message..."
                        className="w-full p-3 rounded-lg border border-black/[0.12] bg-[#f6f5f4] text-black text-sm focus:outline-none focus:border-[#0075de] focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-opacity"
                      style={{ background: "#0075de" }}
                    >
                      <span>Submit application</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#1A7544] flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      Application received
                    </h3>
                    <p className="text-sm text-[#615d59] max-w-sm mx-auto">
                      Thank you for your interest in Monologg. Our investor relations lead will reach out shortly.
                    </p>
                  </div>
                )}
              </div>
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
