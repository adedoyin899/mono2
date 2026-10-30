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
  Sun, Moon, ChevronDown, Check, ArrowRight, Copy, QrCode, Sparkles,
  Shield, Mic, Video, User, Star, DollarSign, BarChart2, Plus, X,
  LayoutDashboard, Settings as SettingsIcon, LogOut, Radio, Headphones,
  Smile, Theater, Zap, ExternalLink, Calendar, FileText
} from "lucide-react";

// Performer avatars for the Hero stack
const HERO_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces",
];

// Categories for "YOU BELONG HERE"
const CATEGORIES = [
  { name: "Actors", icon: Theater },
  { name: "Speakers", icon: Radio },
  { name: "Comperes", icon: Mic },
  { name: "Comedians", icon: Smile },
  { name: "Artists", icon: Headphones },
  { name: "Creators", icon: Video },
];

// 10 FAQ items matching Figma
const FAQS = [
  {
    q: "What is Monologg and how does it work?",
    a: "Monologg is like Upwork for Actors, Public speakers, Comperes, Comedians, Streamers, Artists, Musicians, and Creators. Performers get a personalized link to showcase their work, set prices, and manage bookings. Clients such as studios, directors, and event organizers use it to find verified talent, post jobs, and pay securely through the platform.",
  },
  {
    q: "What currency does Monologg support?",
    a: "Currently, all transactions are processed in Nigerian Naira (₦) through secure payment gateways such as Paystack and Fincra. Future updates will include support for Dollar (USD) and Pound (GBP) payments.",
  },
  {
    q: "How does escrow payment protection work?",
    a: "To ensure safety for all parties, clients deposit the agreed payment into an escrow account managed by Monologg before the performance begins. Once the job is completed and both parties provide feedback, the funds are released to the performer immediately.",
  },
  {
    q: "What are the platform fees?",
    a: "Monologg charges a total fee of 16% for each booking, divided between performers and clients: 7% deducted from performer earnings, which is less than the typical 20% to 25% taken by traditional agents; clients bear an additional 9% on their invoices to ensure payment protection.",
  },
  {
    q: "How does Thespian AI work?",
    a: "When performers upload their monologues or voice reels, Thespian AI analyzes the audio to identify key elements like accent, emotional tone, comedic timing, and performance style, automatically tagging the profile with relevant descriptors.",
  },
  {
    q: "What data can performers see?",
    a: "Performers are provided with a user-friendly dashboard that tracks metrics such as profile views, video plays, traffic sources (e.g., Instagram, TikTok), and revenue generated from various packages.",
  },
  {
    q: "How does Monologg ensure safety for payments?",
    a: "Monologg uses an escrow system to secure payments. Funds are held safely until the performer completes the job or delivers the shoutout, ensuring that clients only pay for work they approve.",
  },
  {
    q: "What features does Monologg offer to performers?",
    a: "Performers can create personalized profiles, upload portfolios, set their own rates, and manage bookings seamlessly. They can also receive feedback from clients and showcase their experience, increasing their visibility and opportunities.",
  },
  {
    q: "How does Monologg support communication between clients and performers?",
    a: "Monologg features an integrated messaging system that allows clients and performers to communicate directly, discuss project details, and finalize arrangements efficiently.",
  },
  {
    q: "What type of gigs can clients post on Monologg?",
    a: "Clients can post a variety of gigs ranging from acting roles, public speaking events, and comedy performances to music gigs and custom video requests, catering to diverse entertainment needs.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  // Signed-in user session state
  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Active feature index for timeline scroll/click
  const [activeFeature, setActiveFeature] = useState(0);

  // FAQ open item
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Bio Link copy state
  const [copiedBio, setCopiedBio] = useState(false);
  const [bioUsername, setBioUsername] = useState("adeola_voice");

  // Currency toggle in Rate Cards (₦ vs $)
  const [currencyRate, setCurrencyRate] = useState<"NGN" | "USD">("NGN");

  useEffect(() => {
    return appStateSync.subscribe(() => {
      setLoggedInUser(appStateSync.getLoggedInUser());
    });
  }, []);

  // Close user menu on outside click
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
    } catch {
      // Continue even if network error
    }
    appStateSync.setLoggedInUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(`https://monologg.co/@${bioUsername}`);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2500);
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#16161A] font-sans antialiased selection:bg-[#F13030]/20 selection:text-[#F13030]">
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

      {/* ── 2. Fixed Sticky Header ── */}
      <header className="h-[68px] sticky top-0 z-40 px-4 sm:px-6 md:px-16 flex items-center justify-between backdrop-blur-xl bg-white/90 border-b border-[#ECECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="h-6 w-auto text-[#16161A]" title="Monologg" />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => navigate("/product")}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#16161A] hover:bg-[#F5F5F3] transition-colors"
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
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#6D6D75] hover:text-[#16161A] hover:bg-[#F5F5F3] transition-colors"
          >
            Resources
          </button>
        </nav>

        {/* Right actions: Theme toggle + Sign In / User menu */}
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
                aria-expanded={showUserMenu}
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
                    transition={{ duration: 0.15 }}
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
                className="h-10 px-5 rounded-full bg-[#F13030] hover:bg-[#D31F20] text-white text-xs font-bold shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all active:scale-95"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* ── 3. Hero Section (Figma Frame 178359:16911) ── */}
        <section className="w-full flex flex-col items-center pt-16 sm:pt-24 pb-16 px-6 lg:px-12 bg-white relative overflow-hidden">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-[#FFF2F2]/60 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-[1040px] flex flex-col items-center text-center relative z-10">
            {/* Overlapping Performer Avatars */}
            <div className="flex items-center justify-center -space-x-3 mb-6">
              {HERO_AVATARS.map((src, idx) => (
                <div
                  key={idx}
                  className="size-11 sm:size-12 rounded-full ring-2 ring-white overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-20"
                >
                  <img src={src} alt="Performer avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-semibold text-[#16161A] tracking-[-0.03em] leading-[1.08] max-w-[720px] mb-6 font-display">
              Find Performers<span className="text-[#F13030] animate-pulse">|</span> <br />
              Finish Your Project.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6D6D75] max-w-[640px] leading-relaxed mb-8">
              Discover the performing arts’ best-kept secrets. Connect directly with directors, studios, agencies, brand managers, and live event organizers.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#F13030] hover:bg-[#D31F20] text-white text-sm font-semibold shadow-md transition-all active:scale-95"
              >
                <span>Find Performers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-white hover:bg-[#F9F9F9] border border-[#E8E8E8] text-[#16161A] text-sm font-medium transition-colors shadow-sm"
              >
                Find Gigs
              </button>
            </div>

            {/* Centered iPhone 15 Device Mockup */}
            <div className="relative w-full max-w-[360px] sm:max-w-[385px] mx-auto rounded-[52px] p-3.5 bg-[#1F1F24] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.1)_inset]">
              {/* Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-end pr-2.5">
                <span className="size-2.5 rounded-full bg-[#1A1A1A] ring-1 ring-white/10" />
              </div>

              {/* iPhone Screen Container */}
              <div className="relative w-full aspect-[359/779] bg-white rounded-[40px] overflow-hidden shadow-inner flex flex-col justify-center items-center">
                <img
                  src="/auth-performer-device.png"
                  alt="Monologg Performer Storefront preview on iPhone"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* ── YOU BELONG HERE Category Row ── */}
            <div className="w-full mt-16 pt-8 border-t border-[#ECECE8]">
              <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#6D6D75] mb-5">
                YOU BELONG HERE
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm font-medium text-[#16161A]">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => navigate("/auth?mode=signup")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F9F9F9] hover:bg-[#F0F0EE] border border-[#ECECE8] cursor-pointer transition-all hover:scale-105"
                    >
                      <Icon className="w-4 h-4 text-[#F13030]" />
                      <span>{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Stepper Features Section (Figma Frame 178359:16989) ── */}
        <section id="features" className="w-full py-20 lg:py-28 px-6 lg:px-12 bg-[#FBFBFA] border-t border-[#ECECE8] flex justify-center">
          <div className="w-full max-w-[1040px] flex flex-col items-center">
            {/* Header */}
            <div className="max-w-[760px] text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#16161A] tracking-[-0.03em] leading-tight mb-4 font-display">
                From audition tapes to instant payouts — all your operations in one place.
              </h2>
              <p className="text-base sm:text-lg text-[#6D6D75]">
                Designed specifically for actors, voice talent, comperes, and content creators to build their brand and run bookings smoothly.
              </p>
            </div>

            {/* Interactive 6-Feature Stepper / Layout */}
            <div className="w-full grid lg:grid-cols-12 gap-10 items-start">
              {/* Left Timeline Progress Rail */}
              <div className="lg:col-span-5 sticky top-28 flex flex-col gap-3">
                {[
                  { title: "Share Your Stage Anywhere", desc: "Single master link & instant QR code" },
                  { title: "Monetize Fan Shoutouts", desc: "Sell custom videos, voice drops & consultations" },
                  { title: "Analyze your audience", desc: "Real-time traffic, profile visits & top earnings" },
                  { title: "Custom Rate Cards", desc: "Upfront transparent Naira rates for quick booking" },
                  { title: "Powered by Thespian AI", desc: "24/7 smart assistant answering scripts & calendars" },
                  { title: "Bank-Grade Escrow", desc: "100% upfront booking funds held safely" },
                ].map((item, index) => {
                  const isActive = activeFeature === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        isActive
                          ? "bg-white border-[#F13030]/40 shadow-sm"
                          : "bg-transparent border-transparent hover:bg-white/50 text-[#6D6D75]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                            isActive ? "bg-[#F13030] text-white" : "bg-[#ECECE8] text-[#6D6D75]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${isActive ? "text-[#16161A]" : "text-[#6D6D75]"}`}>
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#9E9EA7] truncate">{item.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Feature Detail Cards */}
              <div className="lg:col-span-7 flex flex-col gap-12">
                {/* 1. Share Your Stage Anywhere */}
                <div
                  id="feature-1"
                  className={`bg-white rounded-3xl p-8 sm:p-10 border transition-all ${
                    activeFeature === 0 ? "border-[#F13030]/40 ring-1 ring-[#F13030]/20 shadow-md" : "border-[#ECECE8]"
                  }`}
                  onMouseEnter={() => setActiveFeature(0)}
                >
                  <h3 className="text-2xl font-semibold text-[#16161A] mb-3 font-display">
                    Share Your Stage Anywhere
                  </h3>
                  <p className="text-base text-[#6D6D75] leading-relaxed mb-8">
                    Join other performers using a single master link and instant QR code to share their portfolios, showreels, and press kits directly with casting directors, studios, agencies, brand managers, and live event organizers globally across all platforms.
                  </p>

                  <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#ECECE8] flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-white rounded-xl border border-[#ECECE8] shadow-sm flex flex-col items-center shrink-0">
                      <QrCode className="size-20 text-[#16161A]" />
                      <span className="text-[10px] font-mono text-[#6D6D75] mt-1">SCAN STAGE</span>
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-3">
                      <label className="text-xs font-medium text-[#6D6D75]">Your Performer Bio Link</label>
                      <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 shadow-sm focus-within:border-[#F13030]">
                        <span className="text-xs text-[#9E9EA7] select-none">monologg.co/@</span>
                        <input
                          type="text"
                          value={bioUsername}
                          onChange={(e) => setBioUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                          className="w-full text-xs font-semibold text-[#16161A] bg-transparent outline-none pl-1"
                        />
                      </div>
                      <button
                        onClick={handleCopyBio}
                        className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-[#F13030] hover:text-[#D31F20]"
                      >
                        {copiedBio ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBio ? "Copied bio link!" : "Copy bio link"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Monetize Fan Shoutouts & Micro-Deliverables */}
                <div
                  id="feature-2"
                  className={`bg-white rounded-3xl p-8 sm:p-10 border transition-all ${
                    activeFeature === 1 ? "border-[#F13030]/40 ring-1 ring-[#F13030]/20 shadow-md" : "border-[#ECECE8]"
                  }`}
                  onMouseEnter={() => setActiveFeature(1)}
                >
                  <h3 className="text-2xl font-semibold text-[#16161A] mb-3 font-display">
                    Monetize Fan Shoutouts & Micro-Deliverables
                  </h3>
                  <p className="text-base text-[#6D6D75] leading-relaxed mb-8">
                    Earn up to 93% of your rate by selling custom video shoutouts, voice drops, and private consultations directly from your bio link—on your own prices and delivery timelines.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { title: "Video Shoutout", price: "₦35,000", time: "24h turn", icon: Video },
                      { title: "Voice Reel Intro", price: "₦20,000", time: "48h turn", icon: Mic },
                      { title: "1:1 Monologue Prep", price: "₦60,000", time: "Live session", icon: User },
                    ].map((pkg, idx) => {
                      const Icon = pkg.icon;
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-[#FBFBFA] border border-[#ECECE8] flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-3">
                            <span className="p-2 rounded-lg bg-white border border-[#ECECE8]">
                              <Icon className="w-4 h-4 text-[#F13030]" />
                            </span>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#FFECEC] text-[#F13030]">
                              {pkg.time}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs text-[#6D6D75]">{pkg.title}</div>
                            <div className="text-sm font-bold text-[#16161A] mt-0.5">{pkg.price}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Analyze your audience */}
                <div
                  id="feature-3"
                  className={`bg-white rounded-3xl p-8 sm:p-10 border transition-all ${
                    activeFeature === 2 ? "border-[#F13030]/40 ring-1 ring-[#F13030]/20 shadow-md" : "border-[#ECECE8]"
                  }`}
                  onMouseEnter={() => setActiveFeature(2)}
                >
                  <h3 className="text-2xl font-semibold text-[#16161A] mb-3 font-display">
                    Analyze your audience
                  </h3>
                  <p className="text-base text-[#6D6D75] leading-relaxed mb-8">
                    Track your profile visits, and link clicks in real time to see exactly where your fans are coming from and which packages make you the most money.
                  </p>

                  <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#ECECE8] flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-4 border-b border-[#ECECE8] pb-4">
                      <div>
                        <div className="text-xs text-[#6D6D75]">Profile Views</div>
                        <div className="text-xl font-bold font-mono text-[#16161A]">12,480</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#6D6D75]">Booking Rate</div>
                        <div className="text-xl font-bold font-mono text-[#F13030]">14.2%</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#6D6D75]">Monthly Net</div>
                        <div className="text-xl font-bold font-mono text-[#16161A]">₦1.85M</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-1 text-xs">
                      <div className="flex justify-between text-[#6D6D75]">
                        <span>Instagram Bio traffic</span>
                        <span className="font-semibold text-[#16161A]">58%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#F13030] h-full rounded-full" style={{ width: "58%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Set Transparent Custom Rate Cards */}
                <div
                  id="feature-4"
                  className={`bg-white rounded-3xl p-8 sm:p-10 border transition-all ${
                    activeFeature === 3 ? "border-[#F13030]/40 ring-1 ring-[#F13030]/20 shadow-md" : "border-[#ECECE8]"
                  }`}
                  onMouseEnter={() => setActiveFeature(3)}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-2xl font-semibold text-[#16161A] font-display">
                      Set Transparent Custom Rate Cards
                    </h3>
                    <div className="inline-flex items-center rounded-full bg-[#F5F5F3] p-0.5 border border-[#ECECE8] text-xs font-semibold">
                      <button
                        onClick={() => setCurrencyRate("NGN")}
                        className={`px-2.5 py-1 rounded-full ${
                          currencyRate === "NGN" ? "bg-white text-[#16161A] shadow-xs" : "text-[#6D6D75]"
                        }`}
                      >
                        ₦ NGN
                      </button>
                      <button
                        onClick={() => setCurrencyRate("USD")}
                        className={`px-2.5 py-1 rounded-full ${
                          currencyRate === "USD" ? "bg-white text-[#16161A] shadow-xs" : "text-[#6D6D75]"
                        }`}
                      >
                        $ USD
                      </button>
                    </div>
                  </div>
                  <p className="text-base text-[#6D6D75] leading-relaxed mb-8">
                    Stop wasting time emailing back and forth—set clear, upfront rates for auditions, hosting, voiceovers, or comedy sets so clients can book you instantly.
                  </p>

                  <div className="flex flex-col divide-y divide-[#ECECE8] rounded-2xl bg-[#FBFBFA] border border-[#ECECE8] p-4">
                    {[
                      { role: "Feature Film Day Rate", ngn: "₦250,000", usd: "$180", time: "per shoot day" },
                      { role: "Corporate Event Compere", ngn: "₦180,000", usd: "$130", time: "up to 4 hours" },
                      { role: "Commercial VO Broadcast", ngn: "₦120,000", usd: "$90", time: "30s spot" },
                    ].map((rate, i) => (
                      <div key={i} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                        <div>
                          <div className="text-sm font-semibold text-[#16161A]">{rate.role}</div>
                          <div className="text-xs text-[#6D6D75]">{rate.time}</div>
                        </div>
                        <div className="text-sm font-bold font-mono text-[#16161A]">
                          {currencyRate === "NGN" ? rate.ngn : rate.usd}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Powered by Thespian AI */}
                <div
                  id="feature-5"
                  className={`bg-white rounded-3xl p-8 sm:p-10 border transition-all ${
                    activeFeature === 4 ? "border-[#F13030]/40 ring-1 ring-[#F13030]/20 shadow-md" : "border-[#ECECE8]"
                  }`}
                  onMouseEnter={() => setActiveFeature(4)}
                >
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFECEC] text-[#F13030] text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thespian AI Engine</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#16161A] mb-3 font-display">
                    Powered by Thespian AI
                  </h3>
                  <p className="text-base text-[#6D6D75] leading-relaxed mb-8">
                    Get a 24/7 AI agent that automatically responds to questions on your behalf and books gigs onto your calendar while you sleep, and scans script PDFs to pitch your talent for open roles. Terms and Conditions apply.
                  </p>

                  <div className="p-5 rounded-2xl bg-[#16161A] text-white border border-[#26262E] flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-white/70 border-b border-white/10 pb-3">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Thespian AI Assistant · Online</span>
                      </span>
                      <span className="font-mono text-white/50">Auto-Booking Active</span>
                    </div>
                    <div className="text-xs text-white/90 leading-relaxed font-mono bg-white/5 p-3 rounded-xl">
                      &gt; "Audition script parsed: Romantic Comedy lead · Tone: charismatic, witty · Matched Elena's voice reel #2 · Availability verified for Tuesday 10:00 AM."
                    </div>
                  </div>
                </div>

                {/* 6. Bank-Grade Escrow Protection */}
                <div
                  id="feature-6"
                  className={`bg-white rounded-3xl p-8 sm:p-10 border transition-all ${
                    activeFeature === 5 ? "border-[#F13030]/40 ring-1 ring-[#F13030]/20 shadow-md" : "border-[#ECECE8]"
                  }`}
                  onMouseEnter={() => setActiveFeature(5)}
                >
                  <h3 className="text-2xl font-semibold text-[#16161A] mb-3 font-display">
                    Bank-Grade Escrow Protection
                  </h3>
                  <p className="text-base text-[#6D6D75] leading-relaxed mb-8">
                    Never worry about late payments again—booking funds are safely held in escrow before you start working and sent straight to your bank account the moment you finish.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#FBFBFA] border border-[#ECECE8]">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#16161A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#16161A]">Client Funds Escrow</div>
                        <div className="text-[11px] text-[#6D6D75]">Deposited prior to shoot</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6D6D75] hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#16161A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#16161A]">Work Performed</div>
                        <div className="text-[11px] text-[#6D6D75]">Shoot or file delivered</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6D6D75] hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#F13030] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        3
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#16161A]">Instant Bank Payout</div>
                        <div className="text-[11px] text-[#6D6D75]">Via Fincra / Paystack</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. FAQ Section (Figma Frame 178359:17242) ── */}
        <section id="faq" className="w-full py-20 lg:py-28 px-6 lg:px-12 bg-white flex justify-center">
          <div className="w-full max-w-[910px] flex flex-col items-center">
            {/* FAQ Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-[#16161A] tracking-[-0.03em] mb-4 font-display">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-[#6D6D75] max-w-[420px] mx-auto leading-relaxed">
                Got questions about how payments, escrow, or Thespian AI work? Here are the answers.
              </p>
            </div>

            {/* Accordion List */}
            <div className="w-full flex flex-col gap-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#ECECE8] rounded-2xl bg-white overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-5 px-6 flex items-center justify-between text-left gap-4 hover:bg-[#FBFBFA] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-medium text-[#16161A]">
                        {faq.q}
                      </span>
                      <span className="size-7 rounded-full flex items-center justify-center bg-[#F9F9F9] border border-[#ECECE8] text-[#16161A] shrink-0 transition-transform">
                        {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-[#6D6D75] leading-relaxed border-t border-[#ECECE8]/60 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. WebsiteFooter with CTA Banner (Figma Frame 178359:17243) ── */}
        <WebsiteFooter />
      </main>
    </div>
  );
}
