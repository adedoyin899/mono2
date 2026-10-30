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
  Sun,
  Moon,
  ChevronDown,
  ArrowRight,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  X,
} from "lucide-react";

export function PricingPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Active section / tab toggle: "performers" | "clients"
  const [activeAudience, setActiveAudience] = useState<"performers" | "clients">("performers");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    try {
      window.scrollTo?.(0, 0);
    } catch {}
  }, []);

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

  const handleAudienceClick = (type: "performers" | "clients") => {
    setActiveAudience(type);
    const targetEl = document.getElementById(type);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const userInitials = loggedInUser?.name
    ? loggedInUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const talentProfile = loggedInUser ? appStateSync.getTalentProfile() : null;
  const userAvatarUrl = talentProfile?.avatarUrl;

  const userMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: loggedInUser?.userType === "TALENT" ? "/dashboard" : "/client",
    },
    { label: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  // Performer avatars (6 items)
  const performerAvatars = [
    "/assets/pricing/avatar-1.png",
    "/assets/pricing/avatar-2.png",
    "/assets/pricing/avatar-3.png",
    "/assets/pricing/avatar-4.png",
    "/assets/pricing/avatar-5.png",
    "/assets/pricing/avatar-6.png",
  ];

  // Client studio badges (6 items)
  const studioBadges = [
    { name: "Vimeo", src: "/assets/studios/vimeo.svg" },
    { name: "Netflix", src: "/assets/studios/netflix.svg" },
    { name: "Amazon Prime", src: "/assets/studios/amazon.svg" },
    { name: "Disney+", src: "/assets/studios/disney.svg" },
    { name: "Hulu", src: "/assets/studios/hulu.svg" },
    { name: "Twitch", src: "/assets/studios/twitch.svg" },
  ];

  // For Performers comparison rows (Figma 178359:18050)
  const performerRows = [
    {
      feature: "Completed Booking Fee",
      freeTier: "7% per booking",
      proTier: "5% per booking (Save a little over 28% on fees)",
    },
    {
      feature: "Bio Storefront & Media Hosting",
      freeTier: "Standard Storefront (Video/Audio)",
      proTier: "Custom Domain (name.monologg.co)",
    },
    {
      feature: "Profile & Customer Analytics",
      freeTier: "Limited",
      proTier: "Deep Traffic Sources & Conversion Analytics",
    },
    {
      feature: "24/7 AI Profile Agent (Thespian)",
      freeTier: "Included",
      proTier: "Priority AI Search Indexing",
    },
    {
      feature: "Audition & Calendar Bookings",
      freeTier: "Direct Calendar Sync",
      proTier: "Direct Calendar Sync + Auto-Booking",
    },
    {
      feature: "Milestone Escrow Protection",
      freeTier: "Included",
      proTier: "Included",
    },
    {
      feature: "Interactive AI Line-Reader & Rehearsals",
      freeTier: "---",
      proTier: "Included",
    },
    {
      feature: "Automated Press Kit (EPK) Generator",
      freeTier: "Included",
      proTier: "Unlimited Pro EPK Exports",
    },
    {
      feature: "Verified Artist Badge",
      freeTier: "---",
      proTier: "Verified Pro Badge",
    },
  ];

  // For Clients comparison rows & category headers (Figma 178359:18148)
  const clientRows: (
    | { isHeader: true; title: string }
    | { isHeader?: false; feature: string; freeTier: string; proTier: string }
  )[] = [
    {
      feature: "Monthly Subscription",
      freeTier: "$0 / month",
      proTier: "$20 / seat / month",
    },
    {
      feature: "Client Service Fee",
      freeTier: "9% per booking",
      proTier: "5% per booking",
    },
    {
      feature: "Contract Initiation Fee",
      freeTier: "$0",
      proTier: "$0",
    },
    // Category 1
    { isHeader: true, title: "Discover Trusted Performers" },
    {
      feature: "Global Performer Pool Access",
      freeTier: "Full Access",
      proTier: "Full Access",
    },
    {
      feature: "ID-Verified Performer Profiles",
      freeTier: "Included",
      proTier: "Included",
    },
    {
      feature: "Verified Reviews & Work History",
      freeTier: "Included",
      proTier: "Included",
    },
    {
      feature: "Expert-Vetted Talent Pool",
      freeTier: "Standard",
      proTier: "Priority Access",
    },
    // Category 2
    { isHeader: true, title: "Move Faster with Thespian AI" },
    {
      feature: "Auto-Invite Top Candidates",
      freeTier: "---",
      proTier: "Up to 100",
    },
    {
      feature: "Curated AI Shortlists",
      freeTier: "---",
      proTier: "Delivered in < 2 hrs",
    },
    {
      feature: "Script & PDF Parsing",
      freeTier: "---",
      proTier: "Included",
    },
    // Category 3
    { isHeader: true, title: "Analytics & Reporting" },
    {
      feature: "Spend & Escrow Reporting",
      freeTier: "Standard Reports",
      proTier: "Automated Export & ERP",
    },
    // Category 4
    { isHeader: true, title: "Engage & Contract Candidates" },
    {
      feature: "Performer Invites Per Brief Post",
      freeTier: "30 Invites",
      proTier: "Unlimited Invites",
    },
    {
      feature: "Direct Messages Per Day",
      freeTier: "15 messages/day",
      proTier: "Unlimited",
    },
    // Category 5
    { isHeader: true, title: "Collaborate & Management" },
    {
      feature: "Real-Time Chat, Video & Audition Calls",
      freeTier: "Built-in (15mins per call)",
      proTier: "Built-in (15mins per call)",
    },
    {
      feature: "Milestone Escrow & Dispute Protection",
      freeTier: "Included",
      proTier: "Included",
    },
    {
      feature: "Multi-User Team Seats",
      freeTier: "1 Seat",
      proTier: "Up to 5 Seats",
    },
    {
      feature: "Custom Roles & Billing Permissions",
      freeTier: "Basic",
      proTier: "Advanced",
    },
    {
      feature: "Unified Invoicing & HRIS Compliance",
      freeTier: "Standard Invoices",
      proTier: "Advanced",
    },
  ];

  // 10 Accordion FAQ items (Figma 178359:18323)
  const faqs = [
    {
      question: "What is Monologg and how does it work?",
      answer:
        "Monologg is like Upwork for Actors, Public speakers, Comperes, Comedians, Streamers, Artists, Musicians, and Creators. Performers get a personalized link to showcase their work, set prices, and manage bookings. Clients such as studios, directors, and event organizers use it to find verified talent, post jobs, and pay securely through the platform.",
    },
    {
      question: "What currency does Monologg support?",
      answer:
        "Currently, all transactions are processed in Nigerian Naira (₦) through secure payment gateways such as Paystack and Fincra. Future updates will include support for Dollar (USD) and Pound (GBP) payments.",
    },
    {
      question: "How does escrow payment protection work?",
      answer:
        "To ensure safety for all parties, clients deposit the agreed payment into an escrow account managed by Monologg before the performance begins. Once the job is completed and both parties provide feedback, the funds are released to the performer immediately.",
    },
    {
      question: "What are the platform fees?",
      answer:
        "Monologg charges a total fee of 16% for each booking, divided between performers and clients: 7% deducted from performer earnings, which is less than the typical 20% to 25% taken by traditional agents; clients bear an additional 9% on their invoices to ensure payment protection.",
    },
    {
      question: "How does Thespian AI work?",
      answer:
        "When performers upload their monologues or voice reels, Thespian AI analyzes the audio to identify key elements like accent, emotional tone, comedic timing, and performance style, automatically tagging the profile with relevant descriptors.",
    },
    {
      question: "What data can performers see?",
      answer:
        "Performers are provided with a user-friendly dashboard that tracks metrics such as profile views, video plays, traffic sources (e.g., Instagram, TikTok), and revenue generated from various packages.",
    },
    {
      question: "How does Monologg ensure safety for payments?",
      answer:
        "Monologg uses an escrow system to secure payments. Funds are held safely until the performer completes the job or delivers the shoutout, ensuring that clients only pay for work they approve.",
    },
    {
      question: "What features does Monologg offer to performers?",
      answer:
        "Performers can create personalized profiles, upload portfolios, set their own rates, and manage bookings seamlessly. They can also receive feedback from clients and showcase their experience, increasing their visibility and opportunities.",
    },
    {
      question: "How does Monologg support communication between clients and performers?",
      answer:
        "Monologg features an integrated messaging system that allows clients and performers to communicate directly, discuss project details, and finalize arrangements efficiently.",
    },
    {
      question: "What type of gigs can clients post on Monologg?",
      answer:
        "Clients can post a variety of gigs ranging from acting roles, public speaking events, and comedy performances to music gigs and custom video requests, catering to diverse entertainment needs.",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-[#16161A] font-sans antialiased overflow-x-hidden"
      data-node-id="178359:17960"
    >
      {/* ── 1. Top Announcement Bar (178359:17961) ── */}
      <div
        className="bg-[#16161a] border-[#26262e] border-b border-solid flex h-[40px] items-center justify-between px-4 sm:px-[24px] relative shrink-0 w-full z-50"
        data-node-id="178359:17961"
      >
        <div className="flex gap-[8px] items-center shrink-0">
          <div className="bg-[#f13030] rounded-full shrink-0 size-[8px] animate-pulse" />
          <p className="font-semibold text-[#f13030] text-[10px] tracking-[1px] uppercase leading-[13.33px] whitespace-nowrap">
            Monologg Marketplace v3.0 Live
          </p>
        </div>
        <div className="flex gap-2 sm:gap-[16px] items-center shrink-0">
          <p className="font-semibold text-[11px] text-[rgba(255,255,255,0.8)] leading-[14.67px] whitespace-nowrap">
            FINCRA Escrow Secured
          </p>
          <p className="font-semibold text-[11px] text-[rgba(255,255,255,0.8)] leading-[14.67px]">
            ·
          </p>
          <p className="font-mono font-bold text-[11px] text-[rgba(255,255,255,0.8)] leading-[14.67px] whitespace-nowrap">
            3,200+ Verified Talent Profiles
          </p>
        </div>
      </div>

      {/* ── 2. Sticky Header (178359:17973) ── */}
      <header
        className="backdrop-blur-[12px] bg-white/90 border-[#ecece8] border-b border-solid flex h-[68px] items-center justify-between px-4 sm:px-8 lg:px-[64px] shrink-0 sticky top-0 w-full z-40 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.06)]"
        data-node-id="178359:17973"
      >
        <div className="flex gap-[12px] items-center shrink-0">
          <div
            className="cursor-pointer flex items-center"
            onClick={() => navigate("/")}
          >
            <Logo className="h-[24px] w-auto text-[#16161a]" title="Monologg" />
          </div>
          <nav className="hidden md:flex gap-[4px] items-center">
            <button
              onClick={() => navigate("/")}
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#5d5d66] hover:text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
            >
              Product
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap flex items-center gap-[6px] bg-[#f5f5f3]"
            >
              <span className="size-[8px] rounded-full bg-[#f13030]" />
              <span>Pricing</span>
            </button>
            <button
              onClick={() => navigate("/resources")}
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#5d5d66] hover:text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
            >
              Resources
            </button>
          </nav>
        </div>

        <div className="flex gap-[12px] items-center shrink-0">
          <button
            onClick={toggle}
            className="border border-[#dbdbd6] rounded-full p-[10px] shrink-0 size-[36px] flex items-center justify-center text-[#16161a] hover:bg-[#f5f5f3] transition-colors"
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
                <Avatar
                  size="sm"
                  src={userAvatarUrl ?? undefined}
                  background="#F13030"
                  color="#FFFFFF"
                >
                  {userInitials}
                </Avatar>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6D6D75] transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
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
                      <Avatar
                        size="md"
                        src={userAvatarUrl ?? undefined}
                        background="#F13030"
                        color="#FFFFFF"
                      >
                        {userInitials}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-[#16161A]">
                          {loggedInUser.name}
                        </div>
                        <div className="text-xs truncate text-[#6D6D75]">
                          {loggedInUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate(item.path);
                          }}
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
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/auth?mode=signin")}
                className="border border-[#dbdbd6] rounded-full h-[40px] px-[20px] text-[13px] font-semibold text-[#16161a] hover:bg-[#f5f5f3] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="bg-[#f13030] hover:bg-[#d31f20] text-white rounded-full h-[40px] px-[20px] text-[13px] font-semibold shadow-sm transition-all active:scale-95"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── 3. Main Content Container ── */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* ── Hero Section (178359:18019) ── */}
        <section
          className="w-full pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 flex flex-col items-center text-center bg-white"
          data-node-id="178359:18019"
        >
          <div className="max-w-[664px] flex flex-col items-center">
            <h1 className="font-display font-medium text-5xl sm:text-7xl text-[#16161a] tracking-[-1.92px] leading-tight mb-4">
              Pricing
            </h1>
            <p className="text-[#6d6d75] text-[17px] sm:text-[18px] leading-relaxed mb-8">
              Simple, transparent pricing designed to maximize direct opportunities while
              protecting project payouts.
            </p>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-[#f13030] hover:bg-[#d31f20] text-white font-semibold text-[14px] h-[40px] px-[24px] rounded-[23px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── Audience Toggle Pill (178359:18032) ── */}
        <div className="w-full flex justify-center px-4 mb-14" data-node-id="178359:18032">
          <div className="border border-[#e8e8e8] bg-white rounded-[20px] p-[6px] inline-flex items-center gap-[10px] shadow-xs">
            <button
              onClick={() => handleAudienceClick("performers")}
              className={`flex items-center gap-[8px] px-3 py-1 rounded-[14px] text-[12px] font-medium transition-all ${
                activeAudience === "performers"
                  ? "text-[#16161a] font-semibold bg-[#fbfbfa]"
                  : "text-[#6d6d75] hover:text-[#16161a]"
              }`}
            >
              <div
                className={`size-[8px] rounded-full transition-all ${
                  activeAudience === "performers"
                    ? "bg-[#f13030] border border-[#f13030]/40"
                    : "opacity-0"
                }`}
              />
              <span>Performers</span>
            </button>

            <button
              onClick={() => handleAudienceClick("clients")}
              className={`flex items-center gap-[8px] px-3 py-1 rounded-[14px] text-[12px] font-medium transition-all ${
                activeAudience === "clients"
                  ? "text-[#16161a] font-semibold bg-[#fbfbfa]"
                  : "text-[#6d6d75] hover:text-[#16161a]"
              }`}
            >
              <div
                className={`size-[8px] rounded-full transition-all ${
                  activeAudience === "clients"
                    ? "bg-[#f13030] border border-[#f13030]/40"
                    : "opacity-0"
                }`}
              />
              <span>Clients</span>
            </button>
          </div>
        </div>

        {/* ── 4. For Performers Section (178359:18031) ── */}
        <section
          id="performers"
          className="w-full pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center scroll-mt-24"
          data-node-id="178359:18031"
        >
          {/* Overlapping Performer Avatars Stack (178359:18039) */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              {performerAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Performer ${i + 1}`}
                  className="size-[46px] rounded-full border border-white object-cover -mr-[15px] bg-[#f8f8f6] shadow-xs"
                />
              ))}
            </div>
          </div>

          <h2 className="font-display font-medium text-4xl sm:text-5xl text-[#16161a] text-center mb-3">
            For Performers
          </h2>
          <p className="text-[#6d6d75] text-[15px] sm:text-[16px] text-center max-w-[688px] mb-10 leading-relaxed">
            Keep 93% of your booking and shoutout revenue with zero agent commissions
            (compared to traditional 20%+ agency fees or Cameo&apos;s 25% platform cut).
          </p>

          {/* Table Container (178359:18050) */}
          <div className="w-full max-w-[1040px] border border-[#ecece8] rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Header row */}
            <div className="grid grid-cols-12 border-b border-[#ecece8] bg-[#fcfcfb] text-xs font-semibold text-[#16161a] py-4 px-4 sm:px-6">
              <div className="col-span-5 sm:col-span-5 text-[#16161a] text-[13px] font-medium">
                Feature / Capability
              </div>
              <div className="col-span-3 sm:col-span-3 text-[#16161a] text-[13px] font-medium">
                Free Tier
              </div>
              <div className="col-span-4 sm:col-span-4 flex items-center gap-2">
                <span className="text-[#16161a] text-[13px] font-medium">Monologg Pro</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#fdf2f2] text-[#f13030] text-[10px] font-mono uppercase tracking-wider font-semibold border border-[#f13030]/20">
                  <span className="size-1.5 rounded-full bg-[#f13030]" />
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#ecece8]">
              {performerRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 py-4 px-4 sm:px-6 items-center hover:bg-[#fafaf9] transition-colors"
                >
                  <div className="col-span-5 sm:col-span-5 text-[#16161a] text-[13px] sm:text-[14px] font-medium pr-2">
                    {row.feature}
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-[#6d6d75] text-[12.5px] sm:text-[13px] pr-2">
                    {row.freeTier}
                  </div>
                  <div className="col-span-4 sm:col-span-4 text-[#16161a] text-[12.5px] sm:text-[13px]">
                    {row.proTier}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button Under Performers Table (178359:18124) */}
          <div className="mt-10">
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-[#f13030] hover:bg-[#d31f20] text-white font-semibold text-[14px] h-[40px] px-[24px] rounded-[23px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 5. For Clients Section (178359:18130) ── */}
        <section
          id="clients"
          className="w-full pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center scroll-mt-24"
          data-node-id="178359:18130"
        >
          {/* Overlapping Studio Badges Stack (178359:18133) */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              {studioBadges.map((studio, i) => (
                <div
                  key={i}
                  className="size-[46px] rounded-full border border-[#e5e5e5] bg-[#f8f8f6] p-2.5 -mr-[15px] flex items-center justify-center shadow-xs"
                  title={studio.name}
                >
                  <img
                    src={studio.src}
                    alt={studio.name}
                    className="size-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <h2 className="font-display font-medium text-4xl sm:text-5xl text-[#16161a] text-center mb-3">
            For Clients
          </h2>
          <p className="text-[#6d6d75] text-[15px] sm:text-[16px] text-center max-w-[688px] mb-10 leading-relaxed">
            Choose the plan that fits your production scale. All client fees are structured
            on invoices as an Automated Casting, Escrow Protection, and Project Management
            Service Fee.
          </p>

          {/* Clients Comparison Table (178359:18148) */}
          <div className="w-full max-w-[1040px] border border-[#ecece8] rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Header row */}
            <div className="grid grid-cols-12 border-b border-[#ecece8] bg-[#fcfcfb] text-xs font-semibold text-[#16161a] py-4 px-4 sm:px-6">
              <div className="col-span-5 sm:col-span-5 text-[#16161a] text-[13px] font-medium">
                Feature / Capability
              </div>
              <div className="col-span-3 sm:col-span-3 text-[#16161a] text-[13px] font-medium">
                Free Tier
              </div>
              <div className="col-span-4 sm:col-span-4 flex items-center gap-2">
                <span className="text-[#16161a] text-[13px] font-medium">Monologg Pro</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#fdf2f2] text-[#f13030] text-[10px] font-mono uppercase tracking-wider font-semibold border border-[#f13030]/20">
                  <span className="size-1.5 rounded-full bg-[#f13030]" />
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Table Rows with Section Row Subheaders */}
            <div className="divide-y divide-[#ecece8]">
              {clientRows.map((item, idx) => {
                if ("isHeader" in item && item.isHeader) {
                  return (
                    <div
                      key={idx}
                      className="bg-[#f9f9f9] py-3.5 px-4 sm:px-6 font-semibold text-[13px] text-[#16161a] tracking-wide"
                    >
                      {item.title}
                    </div>
                  );
                }

                const row = item as {
                  feature: string;
                  freeTier: string;
                  proTier: string;
                };

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 py-4 px-4 sm:px-6 items-center hover:bg-[#fafaf9] transition-colors"
                  >
                    <div className="col-span-5 sm:col-span-5 text-[#16161a] text-[13px] sm:text-[14px] font-medium pr-2">
                      {row.feature}
                    </div>
                    <div className="col-span-3 sm:col-span-3 text-[#6d6d75] text-[12.5px] sm:text-[13px] pr-2">
                      {row.freeTier}
                    </div>
                    <div className="col-span-4 sm:col-span-4 text-[#16161a] text-[12.5px] sm:text-[13px]">
                      {row.proTier}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. Frequently Asked Questions Section (178359:18323) ── */}
        <section
          className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#ecece8] flex flex-col items-center"
          data-node-id="178359:18323"
        >
          <div className="w-full max-w-[910px] flex flex-col items-center">
            <h2 className="font-display font-medium text-4xl sm:text-5xl text-[#16161a] text-center mb-3 tracking-[-1.44px]">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6d6d75] text-[15px] sm:text-[16px] text-center max-w-[420px] mb-14 leading-relaxed">
              Got questions about how payments, escrow, or Thespian AI work? Here are the
              answers.
            </p>

            <div className="w-full flex flex-col gap-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#ecece8] rounded-[12px] bg-white overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-5 px-6 flex items-start justify-between text-left gap-4 hover:bg-[#fafaf9] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display font-medium text-[17px] text-[#16161a] leading-snug">
                        {faq.question}
                      </span>
                      <span className="size-[28px] rounded-full flex items-center justify-center bg-[#f5f5f3] text-[#16161a] shrink-0 mt-0.5">
                        {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-[14px] text-[#6d6d75] leading-[24px] border-t border-[#ecece8]/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 7. WebsiteFooter (178359:18324) ── */}
        <WebsiteFooter />
      </main>
    </div>
  );
}
