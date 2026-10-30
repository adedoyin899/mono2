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
  Check,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

export function ResourcesPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Investor form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [investorRole, setInvestorRole] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const handleInvestorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setInvestorRole("");
      setMessage("");
    }, 5000);
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

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-[#16161A] font-sans antialiased overflow-x-hidden"
      data-node-id="178359:18325"
    >
      {/* ── 1. Top Announcement Bar (178359:18326) ── */}
      <div
        className="bg-[#16161a] border-[#26262e] border-b border-solid flex h-[40px] items-center justify-between px-4 sm:px-[24px] relative shrink-0 w-full z-50"
        data-node-id="178359:18326"
      >
        <div className="flex gap-[8px] items-center shrink-0">
          <div className="bg-[#f13030] rounded-full shrink-0 size-[8px]" />
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

      {/* ── 2. Sticky Header (178359:18338) ── */}
      <header
        className="backdrop-blur-[12px] bg-white/90 border-[#ecece8] border-b border-solid flex h-[68px] items-center justify-between px-4 sm:px-8 lg:px-[64px] shrink-0 sticky top-0 w-full z-40 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
        data-node-id="178359:18338"
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
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#5d5d66] hover:text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/resources")}
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#16161a] text-[12px] leading-[16px] flex items-center gap-2 whitespace-nowrap"
            >
              <span className="size-2 rounded-full bg-[#f13030]" />
              <span>Resources</span>
            </button>
          </nav>
        </div>

        <div className="flex gap-[12px] items-center shrink-0">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="bg-white border border-[#ecece8] border-solid flex items-center justify-center rounded-full shrink-0 size-[36px] text-[#16161a] hover:bg-[#f9f9f9] transition-colors"
          >
            {isDark ? <Sun className="size-[16px]" /> : <Moon className="size-[16px]" />}
          </button>

          {loggedInUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-full p-1 pr-2 border border-[#ecece8] bg-white hover:bg-[#f9f9f9] transition-all active:scale-95 shadow-sm"
                aria-label="Account menu"
              >
                <Avatar
                  size="sm"
                  src={userAvatarUrl ?? undefined}
                  background="#f13030"
                  color="#ffffff"
                >
                  {userInitials}
                </Avatar>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6d6d75] transition-transform ${
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
                    className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl overflow-hidden z-50 bg-white border border-[#ecece8]"
                  >
                    <div className="flex items-center gap-3 p-4 border-b border-[#ecece8]">
                      <Avatar
                        size="md"
                        src={userAvatarUrl ?? undefined}
                        background="#f13030"
                        color="#ffffff"
                      >
                        {userInitials}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-[#16161a]">
                          {loggedInUser.name}
                        </div>
                        <div className="text-xs truncate text-[#6d6d75]">
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
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#16161a] hover:bg-[#f9f9f9] transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-[#6d6d75]" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="py-1.5 border-t border-[#ecece8]">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#f13030] hover:bg-[#fff5f5] transition-colors font-medium"
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
            <>
              <button
                onClick={() => navigate("/auth?mode=signin")}
                className="border border-[#dbdbd6] border-solid flex h-[40px] items-center justify-center pb-[11.5px] pt-[10.5px] px-[20px] rounded-full shrink-0 font-bold text-[#16161a] text-[12px] text-center tracking-[-0.12px] whitespace-nowrap hover:bg-[#f9f9f9] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="bg-[#f13030] hover:bg-[#d31f20] flex h-[40px] items-center justify-center pb-[12.5px] pt-[11.5px] px-[20px] rounded-full shrink-0 font-bold text-[12px] text-center text-white tracking-[-0.12px] whitespace-nowrap shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all active:scale-95"
              >
                Sign up free
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* ── 3. Resources Master Grid Card (Figma 178359:18384) ── */}
        <section
          className="bg-white flex flex-col gap-[80px] items-center px-6 md:px-16 xl:px-[200px] py-[112px] w-full"
          data-node-id="178359:18384"
        >
          <div
            className="flex flex-col items-center w-full max-w-[1000px]"
            data-node-id="178359:18409"
          >
            {/* Top Card Area */}
            <div
              className="bg-white border-l border-r border-t border-[#e8e8e8] border-solid flex flex-col gap-[32px] items-center p-6 sm:p-[32px] rounded-tl-[20px] rounded-tr-[20px] w-full"
              data-node-id="178359:18410"
            >
              {/* Terms of Service Pill */}
              <button
                onClick={() => navigate("/legal/terms")}
                className="bg-[#f7f7f7] hover:bg-[#ececec] flex gap-[10px] items-center px-[12px] py-[6px] rounded-[20px] transition-colors cursor-pointer group"
                data-node-id="178359:18411"
              >
                <img
                  src="/assets/social/gavel.svg"
                  alt=""
                  className="size-[14px]"
                  data-node-id="178359:18412"
                />
                <span className="font-display font-medium text-[#16161a] text-[14px] tracking-[-0.42px] leading-normal group-hover:text-[#f13030] transition-colors">
                  Terms of Service
                </span>
              </button>

              {/* Row 1: Escrow Guarantee Policy | Fair Trade Contracts */}
              <div
                className="bg-white flex flex-col md:flex-row gap-[24px] items-center w-full"
                data-node-id="178359:18414"
              >
                <div
                  className="flex-1 flex flex-col items-center w-full"
                  data-node-id="178359:18415"
                >
                  <div className="flex flex-col gap-[20px] items-center w-full">
                    <h3 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px] text-center">
                      Escrow Guarantee Policy
                    </h3>
                    <p className="text-[#6d6d75] text-[16px] leading-[24px] tracking-[0.48px] text-center max-w-[444px]">
                      All client and fan booking funds are locked securely in escrow before performance or recording begins and released upon project completion: guaranteed by FINCRA/PAYSTACK.
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-px h-[148px] bg-[#e8e8e8] shrink-0" />

                <div
                  className="flex-1 flex flex-col items-center w-full"
                  data-node-id="178359:18423"
                >
                  <div className="flex flex-col gap-[20px] items-center w-full">
                    <h3 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px] text-center">
                      Fair Trade Contracts
                    </h3>
                    <p className="text-[#6d6d75] text-[16px] leading-[24px] tracking-[0.48px] text-center max-w-[444px]">
                      Automated NDAs, usage rights, and performance contracts protect creator IP and guarantee performer payment terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Horizontal Divider */}
              <div className="w-full h-px bg-[#e8e8e8]" data-node-id="178359:18430" />

              {/* Support & Community Pill */}
              <button
                onClick={() => navigate("/support")}
                className="bg-[#f7f7f7] hover:bg-[#ececec] flex gap-[10px] items-center px-[12px] py-[6px] rounded-[20px] transition-colors cursor-pointer group"
                data-node-id="178359:18431"
              >
                <img
                  src="/assets/social/question.svg"
                  alt=""
                  className="size-[14px]"
                  data-node-id="178359:18432"
                />
                <span className="font-display font-medium text-[#16161a] text-[14px] tracking-[-0.42px] leading-normal group-hover:text-[#f13030] transition-colors">
                  Support &amp; Community
                </span>
              </button>

              {/* Row 2: 24/7 Creator Helpdesk | Onboarding & EPK Guides */}
              <div
                className="flex flex-col md:flex-row gap-[24px] items-center w-full"
                data-node-id="178359:18434"
              >
                <div
                  className="flex-1 flex flex-col items-center w-full"
                  data-node-id="178359:18435"
                >
                  <div className="flex flex-col gap-[20px] items-center w-full">
                    <h3 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px] text-center">
                      24/7 Creator Helpdesk
                    </h3>
                    <p className="text-[#6d6d75] text-[16px] leading-[24px] tracking-[0.48px] text-center max-w-[444px]">
                      Live assistance for booking disputes, account setup, and fast settlement inquiries.
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-px h-[148px] bg-[#e8e8e8] shrink-0" />

                <div
                  className="flex-1 flex flex-col items-center w-full"
                  data-node-id="178359:18442"
                >
                  <div className="flex flex-col gap-[20px] items-center w-full">
                    <h3 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px] text-center">
                      Onboarding &amp; EPK Guides
                    </h3>
                    <p className="text-[#6d6d75] text-[16px] leading-[24px] tracking-[0.48px] text-center max-w-[444px]">
                      Tutorials helping performers optimize showreels, rate cards, and bio storefronts for maximum booking conversions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Email & Social Avatars (Figma 178359:18448) */}
            <div
              className="bg-[#f9f9f9] border border-[#e8e8e8] border-solid flex flex-col sm:flex-row gap-[16px] sm:gap-[12px] items-center justify-center px-[32px] py-[16px] rounded-bl-[20px] rounded-br-[20px] w-full"
              data-node-id="178359:18448"
            >
              <div
                className="flex gap-[6px] items-center justify-center"
                data-node-id="178359:18449"
              >
                <img
                  src="/assets/social/gmail.svg"
                  alt=""
                  className="size-[18px]"
                  data-node-id="178359:18450"
                />
                <a
                  href="mailto:hello@monologg.co"
                  className="text-[#6d6d75] hover:text-[#16161a] text-[15px] underline transition-colors"
                >
                  hello@monologg.co
                </a>
              </div>

              <div
                className="flex gap-[6px] items-center"
                data-node-id="178359:18452"
              >
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/linkedin.svg"
                    alt="LinkedIn"
                    className="size-[18px]"
                  />
                </a>
                <a
                  href="https://producthunt.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Product Hunt"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/producthunt.svg"
                    alt="Product Hunt"
                    className="size-[18px]"
                  />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Twitter / X"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/twitter.svg"
                    alt="Twitter / X"
                    className="size-[18px]"
                  />
                </a>
                <a
                  href="https://twitch.tv"
                  target="_blank"
                  rel="noreferrer"
                  title="Twitch"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/twitch.svg"
                    alt="Twitch"
                    className="size-[18px]"
                  />
                </a>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  title="Telegram"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/telegram.svg"
                    alt="Telegram"
                    className="size-[18px]"
                  />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  title="TikTok"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/tiktok.svg"
                    alt="TikTok"
                    className="size-[18px]"
                  />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="size-[36px] rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:scale-105 transition-transform shadow-xs"
                >
                  <img
                    src="/assets/social/instagram.svg"
                    alt="Instagram"
                    className="size-[18px]"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Become an Investor Section (Figma 178359:18473) ── */}
        <section
          className="bg-white flex items-start justify-center px-6 md:px-16 xl:px-[200px] py-[112px] w-full border-t border-[#ecece8]"
          data-node-id="178359:18473"
        >
          <div
            className="w-full max-w-[1040px] flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-[40px]"
            data-node-id="178359:18474"
          >
            {/* Left Header Description */}
            <div
              className="flex flex-col gap-[32px] items-start max-w-[420px]"
              data-node-id="178359:18475"
            >
              <div
                className="flex flex-col gap-[16px] items-start text-[#16161a]"
                data-node-id="178359:18476"
              >
                <p
                  className="font-mono text-[14px] tracking-[1.26px] uppercase font-semibold text-[#16161a]"
                  data-node-id="178359:18477"
                >
                  RAISING SOON!
                </p>
                <h2
                  className="font-display font-medium text-4xl sm:text-5xl lg:text-[48px] tracking-[-1.44px] leading-[48px] text-[#16161a]"
                  data-node-id="178359:18478"
                >
                  Become an Investor
                </h2>
              </div>
              <p
                className="text-[#6d6d75] text-[18px] leading-[26px] tracking-[0.54px] max-w-[384px]"
                data-node-id="178359:18479"
              >
                Follow our investor updates and be notified on our next round
              </p>
            </div>

            {/* Right Application Form Card */}
            <form
              onSubmit={handleInvestorSubmit}
              className="bg-white border border-[#e5e7eb] border-solid shadow-[0px_1px_1px_rgba(0,0,0,0.1)] flex flex-col gap-[16px] items-start p-[25px] rounded-[18px] w-full lg:w-[530px]"
              data-node-id="178359:18480"
            >
              {submitted && (
                <div className="w-full p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-sm flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#059669]" />
                  <span>
                    Thank you for your interest! We will be in touch with investor deck updates.
                  </span>
                </div>
              )}

              {/* Row 1: First Name & Last Name */}
              <div className="flex flex-col sm:flex-row gap-[10px] items-start w-full">
                <div className="flex-1 flex flex-col gap-[8px] items-start w-full">
                  <label
                    htmlFor="first-name"
                    className="font-display font-medium text-[14px] text-[#4d4d4d] tracking-[-0.2px]"
                  >
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="bg-white border border-[#e5e7eb] h-[40px] px-[13px] py-[9px] rounded-[12px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full text-[14px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 focus:outline-none focus:border-[#f13030] transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-[8px] items-start w-full">
                  <label
                    htmlFor="last-name"
                    className="font-display font-medium text-[14px] text-[#4d4d4d] tracking-[-0.2px]"
                  >
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="bg-white border border-[#e5e7eb] h-[40px] px-[13px] py-[9px] rounded-[12px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full text-[14px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 focus:outline-none focus:border-[#f13030] transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone No */}
              <div className="flex flex-col sm:flex-row gap-[12px] items-start w-full">
                <div className="flex-1 flex flex-col gap-[8px] items-start w-full">
                  <label
                    htmlFor="investor-email"
                    className="font-display font-medium text-[14px] text-[#4d4d4d] tracking-[-0.2px]"
                  >
                    Email
                  </label>
                  <input
                    id="investor-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="bg-white border border-[#e5e7eb] h-[40px] px-[13px] py-[9px] rounded-[12px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full text-[14px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 focus:outline-none focus:border-[#f13030] transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-[8px] items-start w-full">
                  <label
                    htmlFor="phone-no"
                    className="font-display font-medium text-[14px] text-[#4d4d4d] tracking-[-0.2px]"
                  >
                    phone no
                  </label>
                  <input
                    id="phone-no"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 567 2907 67"
                    className="bg-white border border-[#e5e7eb] h-[40px] px-[13px] py-[9px] rounded-[12px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full text-[14px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 focus:outline-none focus:border-[#f13030] transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: Please tell us who you are */}
              <div className="flex flex-col gap-[8px] items-start w-full">
                <label
                  htmlFor="who-you-are"
                  className="font-display font-medium text-[14px] text-[#4d4d4d] tracking-[-0.2px]"
                >
                  Please tell us who you are
                </label>
                <div className="relative w-full">
                  <select
                    id="who-you-are"
                    value={investorRole}
                    onChange={(e) => setInvestorRole(e.target.value)}
                    className="bg-white border border-[#e5e7eb] h-[40px] px-[13px] py-[9px] pr-[36px] rounded-[12px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full text-[14px] text-[#1a1a1a] appearance-none cursor-pointer focus:outline-none focus:border-[#f13030] transition-colors"
                  >
                    <option value="" disabled>
                      Select an option...
                    </option>
                    <option value="Angel Investor">Angel Investor</option>
                    <option value="Venture Capital">Venture Capital</option>
                    <option value="Family Office">Family Office</option>
                    <option value="Creator / Talent">Creator / Talent</option>
                    <option value="Strategic Partner">Strategic Partner</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#6d6d75] pointer-events-none" />
                </div>
              </div>

              {/* Row 4: Message Textarea */}
              <div className="flex flex-col gap-[8px] items-start w-full">
                <label
                  htmlFor="investor-message"
                  className="font-display font-medium text-[14px] text-[#4d4d4d] tracking-[-0.2px]"
                >
                  Message
                </label>
                <textarea
                  id="investor-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave us a message..."
                  className="bg-white border border-[#e5e7eb] p-[16px] rounded-[18px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full text-[14px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/30 focus:outline-none focus:border-[#f13030] transition-colors resize-none"
                />
              </div>

              {/* Submit Application Button */}
              <button
                type="submit"
                className="bg-[#f13030] hover:bg-[#d31f20] h-[40px] rounded-[23px] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all active:scale-95 w-full cursor-pointer mt-2"
                data-node-id="178359:18489"
              >
                <span>Submit Application</span>
                <ArrowRight className="size-[16px]" />
              </button>
            </form>
          </div>
        </section>

        {/* ── 5. Website Footer (Figma 178359:18494) ── */}
        <WebsiteFooter />
      </main>
    </div>
  );
}
