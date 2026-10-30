import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

export function WebsiteFooter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="w-full flex flex-col items-center bg-white border-t border-[#ECECE8] text-[#16161A]">
      {/* ── 1. Top Call To Action Banner ── */}
      <div className="w-full bg-[#F9F9F9] py-16 lg:py-24 px-6 lg:px-[200px] flex justify-center border-b border-[#ECECE8]">
        <div className="w-full max-w-[960px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="flex-1 max-w-[480px]">
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-[#16161A] tracking-[-0.03em] leading-[1.1] mb-2 font-display">
              Finish Your <br />
              Project today!
            </h2>
          </div>
          <div className="flex-1 max-w-[460px] flex flex-col gap-6">
            <p className="text-base sm:text-lg text-[#6D6D75] leading-relaxed">
              Connect directly with directors, studios, agencies, brand managers, and live event organizers globally with zero agent commissions.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#F13030] hover:bg-[#D31F20] text-white text-sm font-semibold shadow-md transition-all active:scale-95"
              >
                <span>Get started for free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/support?topic=investor")}
                className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#F8F8F8] hover:bg-[#F0F0EE] border border-[#E8E8E8] text-[#16161A] text-sm font-medium transition-colors"
              >
                Become an investor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Newsletter Signup Row ── */}
      <div className="w-full py-12 px-6 lg:px-[200px] flex justify-center border-b border-[#D1D1D1]/40">
        <div className="w-full max-w-[960px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#16161A] tracking-tight mb-1">
              Join our newsletter
            </h3>
            <p className="text-sm text-[#6D6D75]">
              Stay updated with our investor news and receive alerts about upcoming funding rounds
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full sm:w-auto flex items-center">
            <div className="relative flex items-center w-full sm:w-[280px] bg-white border border-[#E5E7EB] rounded-full p-1 shadow-sm focus-within:border-[#F13030] focus-within:ring-1 focus-within:ring-[#F13030] transition-all">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-4 text-sm text-[#16161A] placeholder-[#6D6D75] focus:outline-none"
                required
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="shrink-0 size-9 rounded-full bg-[#F13030] hover:bg-[#D31F20] text-white flex items-center justify-center transition-transform active:scale-90"
              >
                {subscribed ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── 3. Main Footer Links & Brand Dossier ── */}
      <div className="w-full py-16 px-6 lg:px-[200px] flex justify-center">
        <div className="w-full max-w-[960px] flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Brand Bio */}
          <div className="max-w-[280px] flex flex-col gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <Logo className="h-6 w-auto" />
            </div>
            <p className="text-sm text-[#6D6D75] leading-relaxed">
              The Upwork for Actors, Public speakers, Comperes, Comedians, Streamers, Artists, musicians and Creators.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-medium text-[#6D6D75]">
              <span>Backed by</span>
              <div className="inline-flex items-center justify-center size-6 rounded-md bg-[#FF6600] text-white font-bold text-xs" title="Y Combinator">
                Y
              </div>
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#16161A] font-semibold">Combinator</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-14 text-sm">
            {/* Product Column */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[#16161A] text-sm mb-1">Product</h4>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Performer Portal
              </button>
              <button
                onClick={() => navigate("/client")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Client Portal
              </button>
              <button
                onClick={() => navigate("/media-kit")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors flex items-center gap-1.5"
              >
                <span>Thespian AI</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide bg-[#FFECEC] text-[#F13030] uppercase">
                  new
                </span>
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Pricing
              </button>
            </div>

            {/* Resources Column */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[#16161A] text-sm mb-1">Resources</h4>
              <button
                onClick={() => navigate("/legal/terms")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Escrow Policy
              </button>
              <button
                onClick={() => navigate("/legal/terms")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Fair Trade Contracts
              </button>
              <button
                onClick={() => navigate("/support")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Support & Community
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("faq");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else navigate("/#faq");
                }}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => navigate("/support?topic=investor")}
                className="text-left text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Become an Investor
              </button>
            </div>

            {/* Social Column */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[#16161A] text-sm mb-1">Social</h4>
              <a
                href="mailto:hello@monologg.co"
                className="text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                hello@monologg.co
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                X (Twitter)
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Tiktok
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Discord
              </a>
              <a
                href="https://producthunt.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#6D6D75] hover:text-[#16161A] transition-colors"
              >
                Product Hunt
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Copyright & Location Bar ── */}
      <div className="w-full py-6 px-6 lg:px-[200px] border-t border-[#D1D1D1]/40 flex justify-center">
        <div className="w-full max-w-[960px] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6D6D75] gap-2">
          <p>© 2026 Monologg. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium text-[#16161A]">
            <span>Lagos, Nigeria</span>
            <span>🇳🇬</span>
            <span>·</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

