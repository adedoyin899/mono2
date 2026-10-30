import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "../components/ui/Logo";
import { Avatar } from "../components/ui/Avatar";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import { useTheme } from "../Root";
import { appStateSync } from "../../lib/state-sync";
import { apiClient } from "../../lib/api-client";
import {
  Sun, Moon, ChevronDown, Check, ArrowRight, Shield, Sparkles,
  LayoutDashboard, Settings as SettingsIcon, LogOut, Plus, X
} from "lucide-react";

export function PricingPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [audience, setAudience] = useState<"performers" | "clients">("performers");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    return appStateSync.subscribe(() => {
      setLoggedInUser(appStateSync.getLoggedInUser());
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await apiClient.logout();
    } catch {}
    appStateSync.setLoggedInUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  const userInitials = loggedInUser?.name
    ? loggedInUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const talentProfile = loggedInUser ? appStateSync.getTalentProfile() : null;
  const userAvatarUrl = talentProfile?.avatarUrl;

  const userMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: loggedInUser?.userType === "TALENT" ? "/dashboard" : "/client" },
    { label: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  const pricingFaqs = [
    {
      q: "What are the platform fees?",
      a: "Monologg charges a total fee of 16% for each booking, divided between performers and clients: 7% deducted from performer earnings, which is less than the typical 20% to 25% taken by traditional agents; clients bear an additional 9% on their invoices to ensure payment protection.",
    },
    {
      q: "Are there any monthly subscription or signup costs?",
      a: "No. Creating your performer profile or posting project briefs as a client is 100% free with no monthly subscription fees. You only pay fees when a booking is confirmed and completed.",
    },
    {
      q: "How does escrow payment protection work?",
      a: "Clients deposit the agreed payment into an escrow account managed by Monologg before the performance or recording begins. Once the job is completed and both parties sign off, the funds are released to the performer's bank account immediately.",
    },
    {
      q: "What currencies are supported for payouts?",
      a: "All transactions are currently processed in Nigerian Naira (₦) via Fincra and Paystack. US Dollar (USD) and British Pound (GBP) international settlement rails will be available in the upcoming release.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#16161A] font-sans antialiased">
      {/* ── 1. Top Announcement Bar ── */}
      <div className="h-10 bg-[#16161A] border-b border-[#26262E] px-4 sm:px-6 md:px-12 flex items-center justify-between text-xs text-white z-50">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F13030] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F13030]"></span>
          </span>
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#F13030]">
            Monologg Marketplace v3.0 Live
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-white/80 text-[11px]">
          <span className="font-medium">FINCRA Escrow Secured</span>
          <span>·</span>
          <span className="font-mono text-white/90">3,200+ Verified Talent Profiles</span>
        </div>
      </div>

      {/* ── 2. Header ── */}
      <header className="h-[68px] sticky top-0 z-40 px-4 sm:px-6 md:px-16 flex items-center justify-between backdrop-blur-xl bg-white/90 border-b border-[#ECECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="h-6 w-auto text-[#16161A]" title="Monologg" />
        </div>

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#6D6D75] hover:text-[#16161A] hover:bg-[#F5F5F3] transition-colors"
          >
            Product
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#F13030] bg-[#FFF2F2] flex items-center gap-1.5 transition-colors"
          >
            <span className="size-1.5 rounded-full bg-[#F13030]" />
            <span>Pricing</span>
          </button>
          <button
            onClick={() => navigate("/resources")}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#6D6D75] hover:text-[#16161A] hover:bg-[#F5F5F3] transition-colors"
          >
            Resources
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#ECECE8] bg-white text-[#6D6D75] hover:text-[#16161A] hover:bg-[#F9F9F9] transition-colors active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {loggedInUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-full p-1 pr-2 border border-[#ECECE8] bg-white hover:bg-[#F9F9F9] transition-all active:scale-95 shadow-sm"
                aria-label="Account menu"
              >
                <Avatar size="sm" src={userAvatarUrl ?? undefined} background="#F13030" color="#FFFFFF">
                  {userInitials}
                </Avatar>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6D6D75] transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl overflow-hidden z-50 bg-white border border-[#ECECE8]"
                  >
                    <div className="flex items-center gap-3 p-4 border-b border-[#ECECE8]">
                      <Avatar size="md" src={userAvatarUrl ?? undefined} background="#F13030" color="#FFFFFF">
                        {userInitials}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-[#16161A]">{loggedInUser.name}</div>
                        <div className="text-xs truncate text-[#6D6D75]">{loggedInUser.email}</div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { setShowUserMenu(false); navigate(item.path); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#16161A] hover:bg-[#F9F9F9] transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-[#6D6D75]" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="py-1.5 border-t border-[#ECECE8]">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#F13030] hover:bg-[#FFF5F5] transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate("/auth?mode=signin")}
                className="h-10 px-5 rounded-full border border-[#DBDBD6] text-xs font-bold text-[#16161A] hover:bg-[#F9F9F9] transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="h-10 px-5 rounded-full bg-[#F13030] hover:bg-[#D31F20] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* ── 3. Hero Section (Figma Frame 178359:18019) ── */}
        <section className="w-full py-16 sm:py-20 px-6 lg:px-12 bg-white flex justify-center text-center">
          <div className="max-w-[720px] flex flex-col items-center">
            <h1 className="text-4xl sm:text-6xl font-semibold text-[#16161A] tracking-[-0.03em] mb-4 font-display">
              Pricing
            </h1>
            <p className="text-base sm:text-lg text-[#6D6D75] leading-relaxed mb-8 max-w-[600px]">
              Simple, transparent pricing designed to maximize direct opportunities while protecting project payouts.
            </p>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-[#F13030] hover:bg-[#D31F20] text-white text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 4. Toggle & Pricing Details (Figma Frame 178359:18031) ── */}
        <section className="w-full pb-20 px-6 lg:px-12 bg-white flex justify-center">
          <div className="w-full max-w-[1040px] flex flex-col items-center">
            {/* Segmented Controller */}
            <div className="inline-flex items-center rounded-full bg-[#F5F5F3] p-1 border border-[#ECECE8] mb-12">
              <button
                onClick={() => setAudience("performers")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                  audience === "performers"
                    ? "bg-white text-[#16161A] shadow-sm"
                    : "text-[#6D6D75] hover:text-[#16161A]"
                }`}
              >
                <span className={`size-2 rounded-full ${audience === "performers" ? "bg-[#F13030]" : "bg-transparent"}`} />
                <span>Performers</span>
              </button>
              <button
                onClick={() => setAudience("clients")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                  audience === "clients"
                    ? "bg-white text-[#16161A] shadow-sm"
                    : "text-[#6D6D75] hover:text-[#16161A]"
                }`}
              >
                <span className={`size-2 rounded-full ${audience === "clients" ? "bg-[#F13030]" : "bg-transparent"}`} />
                <span>Clients</span>
              </button>
            </div>

            {/* Audience Heading */}
            <div className="text-center max-w-[700px] mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#16161A] mb-3 font-display">
                {audience === "performers" ? "For Performers" : "For Clients & Casting Directors"}
              </h2>
              <p className="text-sm sm:text-base text-[#6D6D75] leading-relaxed">
                {audience === "performers"
                  ? "Keep 93% of your booking and shoutout revenue with zero agent commissions (compared to traditional 20%+ agency fees or Cameo's 25% platform cut)."
                  : "Hire verified performers and creators with 100% money-back escrow protection. Zero subscription fees."}
              </p>
            </div>

            {/* Comparison Table (Figma Frame 178359:18050) */}
            <div className="w-full border border-[#ECECE8] rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-[#FBFBFA] border-b border-[#ECECE8] text-xs font-semibold text-[#16161A] py-4 px-6">
                <div className="col-span-5 sm:col-span-6">Feature / Capability</div>
                <div className="col-span-4 sm:col-span-3">
                  {audience === "performers" ? "Free Tier" : "Standard Booking"}
                </div>
                <div className="col-span-3 sm:col-span-3 flex items-center gap-2">
                  <span>{audience === "performers" ? "Monologg Pro" : "Enterprise Studio"}</span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] bg-[#FFECEC] text-[#F13030] font-mono uppercase font-bold">
                    Soon
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#ECECE8] text-sm">
                {(audience === "performers"
                  ? [
                      { feat: "Completed Booking Fee", standard: "7% per booking", pro: "4% per booking" },
                      { feat: "Bio Storefront & Instant QR Code", standard: "Included (monologg.co/@you)", pro: "Custom Domain & Branding" },
                      { feat: "Fan Shoutouts & Micro-Deliverables", standard: "Included (Up to 93% payout)", pro: "Priority queue & custom packages" },
                      { feat: "Thespian AI Script Scanning", standard: "5 scripts / month", pro: "Unlimited 24/7 AI agent bookings" },
                      { feat: "Audience Analytics", standard: "Basic 30-day traffic & views", pro: "Real-time fan insights & heatmaps" },
                      { feat: "Direct Payout Timeline", standard: "24 Hours post-approval", pro: "Instant bank settlement" },
                      { feat: "Escrow Payment Security", standard: "100% Escrow backed", pro: "100% Escrow + Dedicated disputes desk" },
                    ]
                  : [
                      { feat: "Escrow Protection Fee", standard: "9% on completed milestones", pro: "Custom enterprise volume pricing" },
                      { feat: "Audition Tape Submissions", standard: "Unlimited direct submissions", pro: "Dedicated casting pipeline & NDAs" },
                      { feat: "Performer Verification", standard: "Identity & portfolio verified", pro: "Priority background & SAG vetting" },
                      { feat: "Automated Contracts & NDAs", standard: "Standard NDPA agreements", pro: "Custom studio union / non-union legal" },
                      { feat: "Milestone Holding & Release", standard: "Fincra / Paystack Escrow", pro: "Multi-currency milestone escrow" },
                    ]
                ).map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-4 px-6 items-center hover:bg-[#FDFDFD] transition-colors">
                    <div className="col-span-5 sm:col-span-6 font-medium text-[#16161A] text-xs sm:text-sm">
                      {row.feat}
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-xs sm:text-sm text-[#6D6D75]">
                      {row.standard}
                    </div>
                    <div className="col-span-3 sm:col-span-3 text-xs sm:text-sm font-semibold text-[#16161A]">
                      {row.pro}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Pricing FAQ ── */}
        <section className="w-full py-16 px-6 lg:px-12 bg-[#FBFBFA] border-t border-[#ECECE8] flex justify-center">
          <div className="w-full max-w-[840px] flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#16161A] mb-8 font-display">
              Pricing Questions
            </h2>
            <div className="w-full flex flex-col gap-3">
              {pricingFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-[#ECECE8] rounded-2xl bg-white overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-4 px-6 flex items-center justify-between text-left gap-4 hover:bg-[#FDFDFD] transition-colors"
                    >
                      <span className="text-sm font-semibold text-[#16161A]">{faq.q}</span>
                      <span className="size-6 rounded-full flex items-center justify-center bg-[#F5F5F3] text-[#16161A] shrink-0">
                        {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-[#6D6D75] leading-relaxed border-t border-[#ECECE8]/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. WebsiteFooter ── */}
        <WebsiteFooter />
      </main>
    </div>
  );
}
