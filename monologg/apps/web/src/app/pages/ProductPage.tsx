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
  ShieldCheck,
  MessageSquare,
  FileText,
  Lock,
  ArrowUpRight,
  Check,
} from "lucide-react";

export function ProductPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Active step in the 7-step interactive showcase (0-indexed)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Thespian AI section audience toggle: "performer" | "client"
  const [thespianAudience, setThespianAudience] = useState<"performer" | "client">("performer");

  // FAQ open item
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

  // Studio badges
  const studioBadges = [
    { name: "Vimeo", src: "/assets/studios/vimeo.svg" },
    { name: "Netflix", src: "/assets/studios/netflix.svg" },
    { name: "Amazon Prime", src: "/assets/studios/amazon.svg" },
    { name: "Disney+", src: "/assets/studios/disney.svg" },
    { name: "Hulu", src: "/assets/studios/hulu.svg" },
    { name: "Twitch", src: "/assets/studios/twitch.svg" },
  ];

  // 7 Interactive Showcase Steps (Figma 178359:17392)
  const steps = [
    {
      id: "01",
      title: "Interactive AI Agent",
      description:
        "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
      previewType: "ai-agent",
    },
    {
      id: "02",
      title: "Custom Rate Cards & Micro-Deliverables",
      description:
        "Set clear baseline prices for gigs and fan requests so clients can book your auditions, MC hosting, voiceovers, or personalized shoutouts instantly.",
      previewType: "rate-cards",
    },
    {
      id: "03",
      title: "Real-Time Performer Analytics & Visitor Intelligence",
      description:
        "See exactly who is visiting your page, which monologues they play, where they find your link, and how many views turn into paid bookings.",
      previewType: "analytics",
    },
    {
      id: "04",
      title: "Escrow Security",
      description:
        "Never worry about non-payment or client ghosting again. Funds for gigs and custom shoutouts are deposited safely into escrow prior to production or recording and released immediately upon project completion.",
      previewType: "escrow",
    },
    {
      id: "05",
      title: "Direct Proposal Bidding:",
      description:
        "Browse open casting briefs posted by verified studios and commercial media vendors; submit auditions and proposals in seconds.",
      previewType: "bidding",
    },
    {
      id: "06",
      title: "Sleek Bio Storefront",
      description:
        "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
      previewType: "storefront",
    },
    {
      id: "07",
      title: "Integrated Scheduling",
      description:
        "Sync your calendar so visitors can book audition slots, phone consultations, or quick custom messages without back-and-forth emails.",
      previewType: "scheduling",
    },
  ];

  // Client Portal 4 Capabilities
  const clientCapabilities = [
    {
      icon: ShieldCheck,
      title: "Verified Creator Pool",
      description:
        "Browse rich, data-verified candidate pipelines across Actors, Comedians, Voiceover Artistes, Comperes, Musicians, Public speakers, Streamers, and Content Creators.",
    },
    {
      icon: MessageSquare,
      title: "Chat with AI Performer Profiles",
      description:
        "Instant Q&A with a performer's AI agent to verify availability, review project fits, book audition slots, or request custom video drops in seconds.",
    },
    {
      icon: FileText,
      title: "Post Gigs & Micro-Briefs",
      description:
        "Publish creative briefs, indie movie roles, corporate event jobs, or direct shoutout requests in minutes and receive direct, structured applications or instant fulfillments.",
    },
    {
      icon: Lock,
      title: "Secure Contracts & Escrow Payments",
      description:
        "Sign standard digital agreements with built-in milestones and escrow payment safety.",
    },
  ];

  // Thespian AI features for Performers
  const performerAiFeatures = [
    {
      title: "Instant AI Onboarding",
      isComingSoon: false,
      description:
        "Upload a monologue or audio reel, Thespian AI analyzes your media to automatically detect your vocal texture (pitch, accent, projection), comedic timing, and stage presence filling out your performance attributes automatically without having to fill tedious forms.",
    },
    {
      title: "24/7 AI Booking Agent",
      isComingSoon: true,
      description:
        "Let visitors chat with your profile about your roles and book auditions directly onto your calendar anytime.",
    },
    {
      title: "Automatic Gig Pitching",
      isComingSoon: true,
      description:
        "Thespian constantly scans scripts and open casting briefs across production networks to pitch your profile proactively to matching casting directors.",
    },
  ];

  // Thespian AI features for Clients
  const clientAiFeatures = [
    {
      title: "Vibe & Texture Matching",
      isComingSoon: false,
      description:
        "Match performers based on actual artistic texture, including comedic timing, vocal cadence, accent, and stage presence.",
    },
    {
      title: "Automated Logistics",
      isComingSoon: true,
      description:
        "Automatically handle identity verification, availability checks, audition invites, calendar scheduling, and escrow protection.",
    },
    {
      title: "Script & Prompt Parsing",
      isComingSoon: true,
      description:
        "Drop in a PDF script or creative brief, and the AI reads the dialogue to generate a curated performer shortlist instantly.",
    },
  ];

  // 10 FAQs
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
      data-node-id="178359:17305"
    >
      {/* ── 1. Top Announcement Bar (178359:17306) ── */}
      <div
        className="bg-[#16161a] border-[#26262e] border-b border-solid flex h-[40px] items-center justify-between px-4 sm:px-[24px] relative shrink-0 w-full z-50"
        data-node-id="178359:17306"
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

      {/* ── 2. Sticky Header (178359:17318) ── */}
      <header
        className="backdrop-blur-[12px] bg-white/90 border-[#ecece8] border-b border-solid flex h-[68px] items-center justify-between px-4 sm:px-8 lg:px-[64px] shrink-0 sticky top-0 w-full z-40 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.06)]"
        data-node-id="178359:17318"
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
              onClick={() => navigate("/product")}
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap flex items-center gap-[6px] bg-[#f5f5f3]"
            >
              <span className="size-[8px] rounded-full bg-[#f13030]" />
              <span>Product</span>
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#5d5d66] hover:text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
            >
              Pricing
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
        {/* ── Section A: Performer Portal Hero (178359:17378) ── */}
        <section
          className="w-full pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 flex flex-col items-center text-center bg-white"
          data-node-id="178359:17378"
        >
          <div className="max-w-[700px] flex flex-col items-center">
            {/* Red dot badge: Performer Portal */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf2f2] text-[#f13030] text-[11px] font-mono uppercase tracking-wider font-semibold border border-[#f13030]/20 mb-4">
              <span className="size-2 rounded-full bg-[#f13030]" />
              <span>Performer Portal</span>
            </div>

            <h1 className="font-display font-medium text-4xl sm:text-6xl lg:text-7xl text-[#16161a] tracking-[-1.92px] leading-[1.08] mb-5">
              Build your personal digital stage
            </h1>

            <p className="text-[#6d6d75] text-[16px] sm:text-[18px] leading-relaxed mb-8 max-w-[620px]">
              Pitch on live casting briefs, set your custom service rates, track customer
              analytics, and get paid securely.
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

        {/* ── Section B: Interactive 7-Step Showcase (Frame 10, 178359:17392) ── */}
        {/* Strictly matching user's attached image: single interactive stepper, no duplicate artboards */}
        <section
          className="w-full pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center"
          data-node-id="178359:17392"
        >
          <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 7 selectable steps */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`cursor-pointer border rounded-2xl transition-all duration-200 p-5 ${
                      isActive
                        ? "bg-[#fafaf9] border-[#16161a]/30 shadow-xs"
                        : "bg-white border-[#ecece8] hover:border-[#16161a]/20 hover:bg-[#fafaf9]/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number or Active Indicator */}
                      <div className="shrink-0 mt-0.5">
                        {isActive ? (
                          <div className="size-6 rounded-full bg-[#16161a] text-white flex items-center justify-center shadow-xs">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="font-mono font-medium text-[13px] text-[#6d6d75] w-6 inline-block">
                            {step.id}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-display text-[15px] sm:text-[16px] leading-snug transition-colors ${
                              isActive ? "font-semibold text-[#16161a]" : "font-medium text-[#16161a]"
                            }`}
                          >
                            {step.title}
                          </h3>
                        </div>

                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[#6d6d75] text-[13.5px] sm:text-[14px] leading-relaxed mt-2.5 pt-2 border-t border-[#ecece8]/60"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Dynamic phone preview frame updating with active step */}
            <div className="lg:col-span-6 flex items-center justify-center lg:sticky lg:top-28">
              <div className="w-full max-w-[480px] bg-[#f9f9f9] border border-[#ecece8] rounded-[28px] p-6 sm:p-8 flex flex-col items-center justify-center min-h-[540px] shadow-xs">
                {/* Smartphone Mockup */}
                <div className="w-[280px] sm:w-[300px] bg-white border border-[#e5e5e5] rounded-[36px] shadow-lg overflow-hidden flex flex-col">
                  {/* Phone Top Notch Bar */}
                  <div className="h-6 bg-white flex items-center justify-between px-6 pt-3">
                    <span className="text-[10px] font-semibold text-[#16161a]">9:41</span>
                    <div className="w-16 h-3 bg-[#16161a] rounded-full" />
                    <div className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-[#16161a]" />
                      <span className="size-2 rounded-full bg-[#16161a]" />
                    </div>
                  </div>

                  {/* Dynamic Interactive Preview Content Based on Active Step */}
                  <div className="p-5 flex flex-col min-h-[380px] justify-between">
                    {/* Header in phone */}
                    <div className="flex items-center justify-between border-b border-[#f0f0ee] pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-[#f13030] text-white text-[11px] font-bold flex items-center justify-center">
                          M
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-[#16161a]">monologg.co/ade</div>
                          <div className="text-[9px] text-[#6d6d75]">Verified Performer</div>
                        </div>
                      </div>
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    {/* Step-specific visual preview cards */}
                    <div className="flex-1 flex flex-col justify-center">
                      {activeStep === 0 && (
                        <div className="space-y-3">
                          <div className="bg-[#f5f5f3] p-3 rounded-2xl text-[11px] text-[#16161a] max-w-[85%]">
                            Hey! Are you free for a commercial shoot next Tuesday?
                          </div>
                          <div className="bg-[#fdf2f2] p-3 rounded-2xl text-[11px] text-[#16161a] border border-[#f13030]/20 ml-auto max-w-[85%]">
                            <span className="font-semibold text-[#f13030] block mb-1">Thespian AI Agent:</span>
                            Yes! Ade is available. Audition rate is ₦50,000 via Monologg Escrow.
                          </div>
                          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-[10px] text-emerald-800 flex items-center gap-2">
                            <Check className="size-3.5 text-emerald-600 shrink-0" />
                            <span>Direct calendar auto-booking verified</span>
                          </div>
                        </div>
                      )}

                      {activeStep === 1 && (
                        <div className="space-y-2.5">
                          <div className="text-[12px] font-semibold text-[#16161a] mb-1">Custom Rate Card</div>
                          <div className="p-3 rounded-xl border border-[#ecece8] bg-[#fafaf9] flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-medium text-[#16161a]">Commercial Audition</div>
                              <div className="text-[9px] text-[#6d6d75]">1-hour read & self-tape</div>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#16161a]">₦50,000</span>
                          </div>
                          <div className="p-3 rounded-xl border border-[#ecece8] bg-[#fafaf9] flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-medium text-[#16161a]">MC & Live Event Hosting</div>
                              <div className="text-[9px] text-[#6d6d75]">Full-day corporate host</div>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#16161a]">₦150,000</span>
                          </div>
                          <div className="p-3 rounded-xl border border-[#ecece8] bg-[#fafaf9] flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-medium text-[#16161a]">Personalized Video Shoutout</div>
                              <div className="text-[9px] text-[#6d6d75]">24-hr turnaround HD video</div>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#16161a]">₦30,000</span>
                          </div>
                        </div>
                      )}

                      {activeStep === 2 && (
                        <div className="space-y-3">
                          <div className="text-[12px] font-semibold text-[#16161a]">Visitor Intelligence</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-[#fafaf9] border border-[#ecece8]">
                              <div className="text-[9px] text-[#6d6d75]">Page Views</div>
                              <div className="text-[15px] font-bold text-[#16161a]">4,210</div>
                              <span className="text-[9px] text-emerald-600 font-medium">+28% this wk</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#fafaf9] border border-[#ecece8]">
                              <div className="text-[9px] text-[#6d6d75]">Reel Plays</div>
                              <div className="text-[15px] font-bold text-[#16161a]">1,840</div>
                              <span className="text-[9px] text-emerald-600 font-medium">+42% this wk</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#fdf2f2] border border-[#f13030]/20 text-[10px] text-[#16161a]">
                            <span className="font-semibold text-[#f13030]">Top Source:</span> Instagram Link-in-Bio (64% conversions)
                          </div>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                            <ShieldCheck className="size-8 text-emerald-600 mx-auto mb-2" />
                            <div className="text-[12px] font-bold text-emerald-950">100% Escrow Protected</div>
                            <div className="text-[10px] text-emerald-800 mt-1">
                              ₦150,000 deposited in FINCRA Escrow prior to project commencement.
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#6d6d75] px-1">
                            <span>Client Deposit: Complete</span>
                            <span>Release: Upon Delivery</span>
                          </div>
                        </div>
                      )}

                      {activeStep === 4 && (
                        <div className="space-y-2.5">
                          <div className="text-[12px] font-semibold text-[#16161a]">Open Brief Bidding</div>
                          <div className="p-3 rounded-xl border border-[#ecece8] bg-[#fafaf9]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-[#f13030]">Netflix Feature Film</span>
                              <span className="font-mono text-[10px] font-semibold text-emerald-700">₦450,000</span>
                            </div>
                            <div className="text-[10px] text-[#6d6d75]">Lead Role: Detective (Age 28-35)</div>
                            <button className="mt-2 w-full py-1.5 rounded-lg bg-[#16161a] text-white text-[10px] font-semibold">
                              Submit 1-Click Audition
                            </button>
                          </div>
                        </div>
                      )}

                      {activeStep === 5 && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <img
                              src="/assets/pricing/avatar-1.png"
                              alt="Performer avatar"
                              className="size-12 rounded-full object-cover border border-[#ecece8]"
                            />
                            <div>
                              <div className="text-[13px] font-bold text-[#16161a]">Ade Oyeniyi</div>
                              <div className="text-[10px] text-[#6d6d75]">Screen Actor & Voiceover Artist</div>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#fafaf9] border border-[#ecece8] text-[10px] text-[#6d6d75]">
                            Monologue reel: &ldquo;Othello Act III&rdquo; (2m 14s) · 4.9 ★ (34 reviews)
                          </div>
                          <button className="w-full py-2 rounded-xl bg-[#f13030] text-white text-[11px] font-semibold shadow-xs">
                            Book Direct Audition
                          </button>
                        </div>
                      )}

                      {activeStep === 6 && (
                        <div className="space-y-2.5">
                          <div className="text-[12px] font-semibold text-[#16161a]">Audition Scheduling</div>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="p-2 rounded-lg border border-[#f13030] bg-[#fdf2f2] text-[#f13030] text-[10px] font-bold">
                              10:00 AM
                            </div>
                            <div className="p-2 rounded-lg border border-[#ecece8] bg-[#fafaf9] text-[#16161a] text-[10px]">
                              1:30 PM
                            </div>
                            <div className="p-2 rounded-lg border border-[#ecece8] bg-[#fafaf9] text-[#16161a] text-[10px]">
                              4:00 PM
                            </div>
                          </div>
                          <div className="text-[10px] text-[#6d6d75] text-center pt-2">
                            Synced live with Google & Apple Calendar
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom action button inside phone */}
                    <div className="pt-3 border-t border-[#f0f0ee]">
                      <div className="h-8 rounded-full bg-[#16161a] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5">
                        <span>Instant Escrow Booking</span>
                        <ArrowRight className="size-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section C: Client Portal Section (178359:17765) ── */}
        <section
          className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#fbfbfa] border-t border-[#ecece8] flex flex-col items-center"
          data-node-id="178359:17765"
        >
          <div className="w-full max-w-[1040px] flex flex-col items-center text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf2f2] text-[#f13030] text-[11px] font-mono uppercase tracking-wider font-semibold border border-[#f13030]/20 mb-4">
              <span className="size-2 rounded-full bg-[#f13030]" />
              <span>client Portal</span>
            </div>

            <h2 className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl text-[#16161a] tracking-tight mb-4 max-w-[800px]">
              The Upwork for Performer Acquisition
            </h2>

            <p className="text-[#6d6d75] text-[16px] sm:text-[18px] leading-relaxed max-w-[620px] mb-8">
              A professional performer acquisition network built for production houses,
              casting directors, brand managers, live event organizers, and fans.
            </p>

            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-[#f13030] hover:bg-[#d31f20] text-white font-semibold text-[14px] h-[40px] px-[24px] rounded-[23px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Capability Cards Grid (178359:17784) */}
          <div className="w-full max-w-[1000px] border border-[#ecece8] rounded-2xl bg-white shadow-xs overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#ecece8]">
              {/* Card 1 */}
              <div className="p-8 sm:p-10 flex flex-col items-center text-center border-b border-[#ecece8]">
                <ShieldCheck className="size-8 text-[#f13030] mb-5" />
                <h3 className="font-display font-semibold text-[18px] text-[#16161a] mb-3">
                  {clientCapabilities[0].title}
                </h3>
                <p className="text-[#6d6d75] text-[14px] leading-relaxed">
                  {clientCapabilities[0].description}
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 sm:p-10 flex flex-col items-center text-center border-b border-[#ecece8]">
                <MessageSquare className="size-8 text-[#f13030] mb-5" />
                <h3 className="font-display font-semibold text-[18px] text-[#16161a] mb-3">
                  {clientCapabilities[1].title}
                </h3>
                <p className="text-[#6d6d75] text-[14px] leading-relaxed">
                  {clientCapabilities[1].description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#ecece8]">
              {/* Card 3 */}
              <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                <FileText className="size-8 text-[#f13030] mb-5" />
                <h3 className="font-display font-semibold text-[18px] text-[#16161a] mb-3">
                  {clientCapabilities[2].title}
                </h3>
                <p className="text-[#6d6d75] text-[14px] leading-relaxed">
                  {clientCapabilities[2].description}
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                <Lock className="size-8 text-[#f13030] mb-5" />
                <h3 className="font-display font-semibold text-[18px] text-[#16161a] mb-3">
                  {clientCapabilities[3].title}
                </h3>
                <p className="text-[#6d6d75] text-[14px] leading-relaxed">
                  {clientCapabilities[3].description}
                </p>
              </div>
            </div>

            {/* Bottom Bar: 6 Studio Logos & Trust Bar (178359:17816) */}
            <div className="bg-[#fafaf9] border-t border-[#ecece8] py-4 px-6 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center">
                {studioBadges.map((studio, i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border border-[#e5e5e5] bg-white p-1.5 -mr-2.5 flex items-center justify-center shadow-xs"
                    title={studio.name}
                  >
                    <img src={studio.src} alt={studio.name} className="size-full object-contain" />
                  </div>
                ))}
              </div>
              <span className="text-[13px] font-medium text-[#6d6d75]">
                Trusted by top media houses
              </span>
            </div>
          </div>
        </section>

        {/* ── Section D: Thespian AI Section (178359:17831) ── */}
        <section
          className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#ecece8] flex flex-col items-center"
          data-node-id="178359:17831"
        >
          <div className="w-full max-w-[800px] flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf2f2] text-[#f13030] text-[11px] font-mono uppercase tracking-wider font-semibold border border-[#f13030]/20 mb-4">
              <span className="size-2 rounded-full bg-[#f13030]" />
              <span>Thespian ai</span>
            </div>

            <h2 className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl text-[#16161a] tracking-tight mb-4">
              Performance Intelligence Engine
            </h2>

            <p className="text-[#6d6d75] text-[16px] sm:text-[18px] leading-relaxed">
              Say goodbye to manual form fatigue and endless email threads. Thespian AI works
              for both sides of the stage acting as an untiring, 24/7 digital agent for
              performers and an automated casting butler for studios.
            </p>
          </div>

          {/* Performer vs Client Toggle for Thespian AI */}
          <div className="w-full max-w-[910px] flex flex-col items-center">
            <div className="border border-[#e8e8e8] bg-white rounded-[20px] p-[6px] inline-flex items-center gap-[10px] shadow-xs mb-10">
              <button
                onClick={() => setThespianAudience("performer")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-[14px] text-[12px] font-medium transition-all ${
                  thespianAudience === "performer"
                    ? "text-[#16161a] font-semibold bg-[#fafaf9] shadow-xs"
                    : "text-[#6d6d75] hover:text-[#16161a]"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    thespianAudience === "performer" ? "bg-[#f13030]" : "bg-transparent"
                  }`}
                />
                <span>performer</span>
              </button>

              <span className="text-[#dbdbd6]">|</span>

              <button
                onClick={() => setThespianAudience("client")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-[14px] text-[12px] font-medium transition-all ${
                  thespianAudience === "client"
                    ? "text-[#16161a] font-semibold bg-[#fafaf9] shadow-xs"
                    : "text-[#6d6d75] hover:text-[#16161a]"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    thespianAudience === "client" ? "bg-[#f13030]" : "bg-transparent"
                  }`}
                />
                <span>client</span>
              </button>
            </div>

            {/* Subheading for Active Tab */}
            <div className="text-center mb-8">
              <h3 className="font-display font-medium text-2xl sm:text-3xl text-[#16161a] mb-1">
                {thespianAudience === "performer"
                  ? "What Thespian AI Does for the Performer"
                  : "What Thespian AI Does for the Client"}
              </h3>
              <p className="text-[15px] font-semibold text-[#f13030]">
                {thespianAudience === "performer"
                  ? "Your Digital AI Agent"
                  : "Your Automated Casting Butler"}
              </p>
            </div>

            {/* Feature List Cards with Horizontal Dividers */}
            <div className="w-full border border-[#ecece8] rounded-2xl bg-white shadow-xs divide-y divide-[#ecece8] overflow-hidden">
              {(thespianAudience === "performer" ? performerAiFeatures : clientAiFeatures).map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-[#fafaf9] transition-colors"
                  >
                    <div className="md:col-span-4 flex flex-col items-start gap-1">
                      {item.isComingSoon && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#fdf2f2] text-[#f13030] text-[9px] font-mono uppercase tracking-wider font-semibold border border-[#f13030]/20 mb-1">
                          <span className="size-1.5 rounded-full bg-[#f13030]" />
                          coming soon
                        </span>
                      )}
                      <h4 className="font-display font-semibold text-[17px] text-[#16161a]">
                        {item.title}
                      </h4>
                    </div>

                    <div className="md:col-span-8 text-[#6d6d75] text-[14px] leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                ),
              )}

              {/* Bottom CTA bar if client view */}
              {thespianAudience === "client" && (
                <div className="p-5 bg-[#fafaf9] flex items-center justify-between">
                  <span className="font-display font-semibold text-[14px] text-[#16161a]">
                    Start hiring today
                  </span>
                  <button
                    onClick={() => navigate("/auth?mode=signup")}
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#f13030] hover:text-[#d31f20]"
                  >
                    <span>Get started for free</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Section E: FAQ Section (178359:17958) ── */}
        <section
          className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#fbfbfa] border-t border-[#ecece8] flex flex-col items-center"
          data-node-id="178359:17958"
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

        {/* ── Section F: WebsiteFooter (178359:17959) ── */}
        <WebsiteFooter />
      </main>
    </div>
  );
}
