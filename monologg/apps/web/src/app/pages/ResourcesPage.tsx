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
  Sun, Moon, ChevronDown, Check, ArrowRight, Shield, Gavel, HelpCircle,
  Mail, ExternalLink, LayoutDashboard, Settings as SettingsIcon, LogOut,
  FileText, BookOpen, MessageSquare, Plus, X
} from "lucide-react";

export function ResourcesPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const resourceFaqs = [
    {
      q: "How does Monologg ensure safety for payments?",
      a: "Monologg uses an escrow system to secure payments. Funds are held safely until the performer completes the job or delivers the shoutout, ensuring that clients only pay for work they approve.",
    },
    {
      q: "How does Monologg support communication between clients and performers?",
      a: "Monologg features an integrated messaging system that allows clients and performers to communicate directly, discuss project details, and finalize arrangements efficiently.",
    },
    {
      q: "What features does Monologg offer to performers?",
      a: "Performers can create personalized profiles, upload portfolios, set their own rates, and manage bookings seamlessly. They can also receive feedback from clients and showcase their experience, increasing their visibility and opportunities.",
    },
    {
      q: "What type of gigs can clients post on Monologg?",
      a: "Clients can post a variety of gigs ranging from acting roles, public speaking events, and comedy performances to music gigs and custom video requests, catering to diverse entertainment needs.",
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
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#6D6D75] hover:text-[#16161A] hover:bg-[#F5F5F3] transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate("/resources")}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#F13030] bg-[#FFF2F2] flex items-center gap-1.5 transition-colors"
          >
            <span className="size-1.5 rounded-full bg-[#F13030]" />
            <span>Resources</span>
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
        {/* ── 3. Resources Hero ── */}
        <section className="w-full py-16 sm:py-20 px-6 lg:px-12 bg-white flex justify-center text-center">
          <div className="max-w-[720px] flex flex-col items-center">
            <h1 className="text-4xl sm:text-6xl font-semibold text-[#16161A] tracking-[-0.03em] mb-4 font-display">
              Resources &amp; Legal
            </h1>
            <p className="text-base sm:text-lg text-[#6D6D75] leading-relaxed max-w-[600px]">
              Explore our platform policies, escrow guarantees, creator guidelines, and fair-trade performance contracts.
            </p>
          </div>
        </section>

        {/* ── 4. Grid Cards (Figma Frame 178359:18409) ── */}
        <section className="w-full pb-20 px-6 lg:px-12 bg-white flex justify-center">
          <div className="w-full max-w-[1000px] flex flex-col items-center">
            <div className="w-full border border-[#E8E8E8] rounded-3xl overflow-hidden shadow-sm bg-white divide-y divide-[#E8E8E8]">
              {/* Terms of Service Header */}
              <div className="p-8 sm:p-10 flex flex-col gap-8">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => navigate("/legal/terms")}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F7F7] hover:bg-[#EFEFED] border border-[#ECECE8] text-xs font-semibold text-[#16161A] transition-colors"
                  >
                    <Gavel className="w-3.5 h-3.5 text-[#F13030]" />
                    <span>Terms of Service</span>
                  </button>
                  <button
                    onClick={() => navigate("/legal/cookies")}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F7F7] hover:bg-[#EFEFED] border border-[#ECECE8] text-xs font-semibold text-[#16161A] transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#F13030]" />
                    <span>Cookie Settings &amp; Policy</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#ECECE8]">
                  <div className="flex flex-col gap-3 pr-0 md:pr-6">
                    <h3 className="text-lg font-semibold text-[#16161A] font-display">
                      Escrow Guarantee Policy
                    </h3>
                    <p className="text-sm text-[#6D6D75] leading-relaxed">
                      All client and fan booking funds are locked securely in escrow before performance or recording begins and released upon project completion: guaranteed by FINCRA/PAYSTACK.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-lg font-semibold text-[#16161A] font-display">
                      Fair Trade Contracts
                    </h3>
                    <p className="text-sm text-[#6D6D75] leading-relaxed">
                      Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Support & Community Header */}
              <div className="p-8 sm:p-10 flex flex-col gap-8">
                <div className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F7F7] border border-[#ECECE8] text-xs font-semibold text-[#16161A]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#F13030]" />
                  <span>Support &amp; Community</span>
                </div>

                <div className="grid md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#ECECE8]">
                  <div className="flex flex-col gap-3 pr-0 md:pr-6">
                    <h3 className="text-lg font-semibold text-[#16161A] font-display">
                      24/7 Creator Helpdesk
                    </h3>
                    <p className="text-sm text-[#6D6D75] leading-relaxed">
                      Live assistance for booking disputes, account setup, and fast settlement inquiries.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-lg font-semibold text-[#16161A] font-display">
                      Onboarding &amp; EPK Guides
                    </h3>
                    <p className="text-sm text-[#6D6D75] leading-relaxed">
                      Tutorials helping performers optimize showreels, rate cards, and bio storefronts for maximum booking conversions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact & Community Footer Bar (Figma 178359:18448) */}
              <div className="p-6 sm:p-8 bg-[#F9F9F9] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-[#6D6D75]">
                  <Mail className="w-4 h-4 text-[#F13030]" />
                  <a
                    href="mailto:hello@monologg.co"
                    className="font-medium text-[#16161A] hover:underline"
                  >
                    hello@monologg.co
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#6D6D75]">
                  <span>Direct Creator Hotline</span>
                  <span>·</span>
                  <button
                    onClick={() => navigate("/support")}
                    className="text-[#F13030] hover:underline"
                  >
                    Open Support Ticket →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Resources FAQs ── */}
        <section className="w-full py-16 px-6 lg:px-12 bg-[#FBFBFA] border-t border-[#ECECE8] flex justify-center">
          <div className="w-full max-w-[840px] flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#16161A] mb-8 font-display">
              Frequently Asked Legal &amp; Support Questions
            </h2>
            <div className="w-full flex flex-col gap-3">
              {resourceFaqs.map((faq, idx) => {
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

