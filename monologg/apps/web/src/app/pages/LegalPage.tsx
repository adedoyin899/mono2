import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { Avatar } from "../components/ui/Avatar";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import { useTheme } from "../Root";
import { appStateSync } from "../../lib/state-sync";
import { apiClient } from "../../lib/api-client";

export type LegalPageType = "terms" | "cookies" | "privacy";

const COMPLIANCE_ROWS = [
  {
    area: "Lawful Basis for Processing",
    overview:
      "Personal data is processed under legitimate grounds: contract performance, statutory obligation, explicit consent, or legitimate interest.",
  },
  {
    area: "Data Subject Rights",
    overview:
      'Users retain the right to access, request corrections, request deletion ("right to be forgotten"), restrict processing, and port their personal data.',
  },
  {
    area: "International Data Transfers",
    overview:
      "Data transfers across international borders adhere to standard contractual clauses and regulations recognized by the NDPC and EU authorities.",
  },
  {
    area: "Data Retention",
    overview:
      "Information is retained only for as long as necessary to fulfill service objectives, meet legal requirements, and resolve disputes.",
  },
];

const COOKIE_SUMMARY_ROWS = [
  {
    id: "__session_id",
    category: "Strictly Necessary",
    purpose: "Maintains user authentication & active session state",
    duration: "Session",
    type: "First-Party",
  },
  {
    id: "_csrf_token",
    category: "Strictly Necessary",
    purpose: "Protects against cross-site request forgery attacks",
    duration: "Session",
    type: "First-Party",
  },
  {
    id: "pref_theme",
    category: "Functional",
    purpose: "Remembers interface dark/light display preferences",
    duration: "1 year",
    type: "First-Party",
  },
  {
    id: "_analytics_id",
    category: "Performance",
    purpose: "Measures aggregate page navigation & loading speeds",
    duration: "2 years",
    type: "Third- Party",
  },
  {
    id: "_mkt_trkr",
    category: "Targeting",
    purpose: "Tracks referral sources & campaign conversion rate",
    duration: "90 Days",
    type: "Third- Party",
  },
];

export function LegalPage({ type }: { type: LegalPageType }) {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.scrollTo?.(0, 0);
    } catch {}
  }, [type]);

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

  const isTerms = type === "terms";

  return (
    <div
      className="bg-[#f6faf9] min-h-screen flex flex-col items-start relative w-full text-[#16161a] font-sans antialiased overflow-x-hidden"
      data-node-id={isTerms ? "178382:17926" : "178383:18857"}
    >
      {/* ── 1. Top Announcement Bar ── */}
      <div
        className="bg-[#16161a] border-[#26262e] border-b border-solid flex h-[40px] items-center justify-between px-4 sm:px-[24px] relative shrink-0 w-full z-50"
        data-node-id={isTerms ? "178382:17927" : "178383:18858"}
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

      {/* ── 2. Sticky Header ── */}
      <header
        className="backdrop-blur-[12px] bg-white/90 border-[#ecece8] border-b border-solid flex h-[68px] items-center justify-between px-4 sm:px-8 lg:px-[64px] shrink-0 sticky top-0 w-full z-40 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
        data-node-id={isTerms ? "178382:17939" : "178387:19943"}
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
              className="px-[16px] py-[6px] rounded-full font-semibold text-[#5d5d66] hover:text-[#16161a] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
            >
              Resources
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

      {/* ── 3. Main Legal Document Body ── */}
      {isTerms ? (
        <main
          className="bg-white flex flex-col gap-[80px] items-center px-6 md:px-16 xl:px-[200px] py-[112px] relative shrink-0 w-full"
          data-node-id="178382:17985"
        >
          {/* Hero Header */}
          <div
            className="flex flex-col items-center relative shrink-0 w-full max-w-[1040px]"
            data-node-id="178382:17999"
          >
            <div className="flex flex-col gap-[20px] items-center relative shrink-0 w-full">
              <div className="flex flex-col gap-[12px] items-center relative shrink-0">
                <div className="flex gap-[10px] items-center justify-center relative shrink-0">
                  <div className="bg-[rgba(241,48,48,0.8)] border border-[rgba(241,48,48,0.4)] border-solid rounded-full shrink-0 size-[8px]" />
                  <p className="font-mono text-[#f13030] text-[14px] tracking-[1.26px] uppercase whitespace-nowrap leading-normal">
                    Last Updated: 29 Oct 2026
                  </p>
                </div>
                <h1 className="font-display font-medium text-[#16161a] text-4xl sm:text-5xl md:text-[64px] text-center tracking-[-1.92px] leading-none">
                  Terms of Service
                </h1>
              </div>

              <div className="text-[#6d6d75] text-[18px] text-center tracking-[0.54px] max-w-[664px] w-full">
                <p className="leading-[26px] mb-0">
                  Welcome to Monologg. Please review these Terms of Service (&quot;Terms&quot;) before using our website, platform, and digital services (collectively, the &quot;Services&quot;).
                </p>
                <p className="leading-[26px] mb-0" aria-hidden="true">
                  &nbsp;
                </p>
                <p className="leading-[26px] mb-0">
                  By accessing or using our Services, you agree to be legally bound by these Terms and our Privacy Policy. If you do not agree, please discontinue use of the Services immediately.
                </p>
              </div>
            </div>
          </div>

          {/* 12 Section Cards */}
          <div
            className="flex flex-col gap-[40px] items-start relative shrink-0 w-full max-w-[911px]"
            data-node-id="178385:19525"
          >
            {/* Card 1 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19508"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                1. Eligibility &amp; Account Responsibilities
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  Minimum Age: You must be at least 18 years of age (or the legal age of digital consent in your jurisdiction) to create an account or use our Services.
                </p>
                <p className="leading-[24px] mb-0" aria-hidden="true">
                  &nbsp;
                </p>
                <p className="leading-[24px] mb-0">
                  Account Credentials: You are responsible for maintaining the confidentiality of your login credentials and for all actions taking place under your account.
                </p>
                <p className="leading-[24px] mb-0" aria-hidden="true">
                  &nbsp;
                </p>
                <p className="leading-[24px]">
                  Accurate Information: You agree to provide accurate, current, and complete details during account setup and maintain updated account information.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19517"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                2. Data Protection &amp; Regulatory Compliance
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                We handle personal information in strict compliance with the EU General Data Protection Regulation (GDPR) and the Nigeria Data Protection Act (NDPA) / NDPR.
              </p>

              <div className="h-px w-full bg-[#e8e8e8]" />

              <div
                className="flex flex-col gap-[12px] items-start relative shrink-0 w-full"
                data-node-id="178386:19683"
              >
                <div className="flex flex-col md:flex-row font-mono items-start justify-between text-[#f13030] text-[12px] tracking-[1.26px] uppercase w-full gap-2">
                  <div className="shrink-0 whitespace-nowrap">
                    <p className="leading-normal">Compliance Area</p>
                  </div>
                  <div className="w-full md:w-[489px] shrink-0">
                    <p className="leading-normal">Overview of Protections &amp; Rights</p>
                  </div>
                </div>

                {COMPLIANCE_ROWS.map((row) => (
                  <div
                    key={row.area}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between relative rounded-[20px] shrink-0 w-full gap-2 md:gap-4"
                  >
                    <div className="font-display font-medium text-[#16161a] text-[18px] leading-[24px] shrink-0">
                      {row.area}
                    </div>
                    <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full md:w-[489px] shrink-0">
                      {row.overview}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-[#e8e8e8]" />

              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                For complete details regarding our data collection, processing, and security practices, please consult our dedicated Privacy Policy.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19608"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                3. Prohibited Conduct &amp; Acceptable Use
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  When using our Services, you agree not to:
                </p>
                <p className="leading-[24px] mb-0" aria-hidden="true">
                  &nbsp;
                </p>
                <ul className="list-disc">
                  <li className="mb-0 ms-[24px] leading-[24px]">
                    Violate any local, national, or international laws, including applicable Nigerian cybercrime legislation and European privacy laws.
                  </li>
                  <li className="mb-0 ms-[24px] leading-[24px]">
                    Copy, modify, decompile, or attempt to extract source code from our software or website.
                  </li>
                  <li className="mb-0 ms-[24px] leading-[24px]">
                    Engage in automated web scraping, data mining, or unauthorized API interactions.
                  </li>
                  <li className="mb-0 ms-[24px] leading-[24px]">
                    Distribute viruses, malware, trojans, or any disruptive digital content.
                  </li>
                  <li className="mb-0 ms-[24px] leading-[24px]">
                    Impersonate any person, entity, or representative of Monologg.
                  </li>
                  <li className="ms-[24px] leading-[24px]">
                    Circumvent or attempt to disable security protocols, access controls, or platform limitations.
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 4 (Soft grey fill #f9f9f9) */}
            <div
              className="bg-[#f9f9f9] flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19591"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                4. Intellectual Property Rights
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  All branding, user interface design, domain names, logos, software code, written content, and visual assets associated with Monologg are the exclusive property of the Company or its licensors.
                </p>
                <p className="leading-[24px] mb-0" aria-hidden="true">
                  &nbsp;
                </p>
                <p className="leading-[24px]">
                  We grant you a personal, revocable, non-exclusive, non-transferable, and limited license to access and use the platform strictly in accordance with these Terms.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19584"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                5. User Content &amp; Licensing
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  Ownership: You retain ownership of any text, files, or media submitted or uploaded through the Services (&quot;User Content&quot;).
                </p>
                <p className="leading-[24px] mb-0">
                  Operating License: By uploading content, you grant Monologg a worldwide, non-exclusive, royalty-free license to host, process, and display your User Content solely as required to operate and deliver the Services to you.
                </p>
                <p className="leading-[24px]">
                  Content Guarantee: You confirm that you hold all rights, licenses, and permissions necessary to publish and share your User Content.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19577"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                6. Subscriptions, Fees &amp; Payment
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  Payment Terms: Certain features or service tiers may require recurring subscription fees or single payments. Fees are displayed clearly prior to checkout.
                </p>
                <p className="leading-[24px] mb-0">
                  Taxation: Unless stated otherwise, prices are exclusive of statutory taxes (such as Value Added Tax / VAT), which will be applied where applicable by law.
                </p>
                <p className="leading-[24px]">
                  Refund Policy: All purchases are governed by the refund rules presented at the point of transaction.
                </p>
              </div>
            </div>

            {/* Card 7 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19570"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                7. Third-Party Links &amp; Services
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                Our platform may include links or integrations to external services, websites, or software. Monologg does not control, endorse, or accept liability for any third-party content, terms, or privacy practices. Your interaction with third parties is conducted entirely at your own risk.
              </p>
            </div>

            {/* Card 8 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19526"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                8. Disclaimers &amp; Limitation of Liability
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  Service Availability: The Services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
                </p>
                <p className="leading-[24px] mb-0">
                  Limitation of Liability: To the maximum extent permitted by applicable law (including Nigerian contract law and mandatory consumer protections), Monologg and its officers shall not be liable for indirect, incidental, special, consequential, or punitive damages.
                </p>
                <p className="leading-[24px]">
                  Liability Cap: In all circumstances, Monologg&apos;s total cumulative liability to you shall not exceed the amount paid by you to the Company in the twelve (12) months prior to the event giving rise to the claim.
                </p>
              </div>
            </div>

            {/* Card 9 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19563"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                9. Indemnification
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                You agree to defend, indemnify, and hold harmless Monologg, its directors, employees, and affiliates against any third-party claims, liabilities, losses, costs, or expenses (including reasonable attorney fees) resulting from your breach of these Terms, misuse of the platform, or violation of third-party rights.
              </p>
            </div>

            {/* Card 10 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19556"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                10. Suspension &amp; Termination
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  Termination by User: You may cancel your account at any time by accessing your account settings or contacting support.
                </p>
                <p className="leading-[24px]">
                  Termination by Company: We reserve the right to suspend or close your account immediately if you breach these Terms, engage in unlawful activities, or if requested by law enforcement or regulatory bodies.
                </p>
              </div>
            </div>

            {/* Card 11 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19533"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                11. Governing Law &amp; Dispute Resolution
              </h2>
              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="leading-[24px] mb-0">
                  <span className="font-semibold">Governing Law:</span> These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
                </p>
                <p className="leading-[24px] mb-0">
                  <span className="font-semibold">Dispute Resolution:</span> Any dispute, disagreement, or claim arising out of these Terms shall first be addressed through informal, good-faith negotiations. If unresolved within 30 days, the matter shall be referred to arbitration or resolved in competent courts within Nigeria.
                </p>
                <p className="leading-[24px]">
                  <span className="font-semibold">Mandatory Statutory Rights:</span> Nothing in these provisions waives statutory consumer protections that cannot be contractually excluded under applicable local law.
                </p>
              </div>
            </div>

            {/* Card 12 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178385:19540"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                12. Modifications to Terms
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                We may update these Terms periodically to align with legal, technical, or operational updates. Material modifications will be communicated by updating the date at the top of this document or via platform notifications. Continued use of the platform after updates indicates acceptance of the amended Terms.
              </p>
            </div>
          </div>
        </main>
      ) : (
        /* ── Cookie Settings & Policy (Figma 178383:18857) ── */
        <main
          className="bg-white flex flex-col gap-[80px] items-center px-6 md:px-16 xl:px-[200px] py-[112px] relative shrink-0 w-full"
          data-node-id="178383:18916"
        >
          {/* Hero Header */}
          <div
            className="flex flex-col items-center relative shrink-0 w-full max-w-[1040px]"
            data-node-id="178383:18930"
          >
            <div className="flex flex-col gap-[20px] items-center relative shrink-0 w-full">
              <div className="flex flex-col gap-[12px] items-center relative shrink-0">
                <div className="flex gap-[10px] items-center justify-center relative shrink-0">
                  <div className="bg-[rgba(241,48,48,0.8)] border border-[rgba(241,48,48,0.4)] border-solid rounded-full shrink-0 size-[8px]" />
                  <p className="font-mono text-[#f13030] text-[14px] tracking-[1.26px] uppercase whitespace-nowrap leading-normal">
                    Effective Date: October 29, 2026
                  </p>
                </div>
                <h1 className="font-display font-medium text-[#16161a] text-4xl sm:text-5xl md:text-[64px] text-center tracking-[-1.92px] leading-none">
                  Cookie Settings &amp; Policy
                </h1>
              </div>

              <p className="leading-[26px] text-[#6d6d75] text-[18px] text-center tracking-[0.54px] max-w-[664px] w-full">
                This Cookie Policy forms an integral part of our Terms of Service. It details how cookies, tracking pixels, local storage, and similar technologies are utilized when you access our platform, website, and associated applications.
              </p>
            </div>
          </div>

          {/* 7 Section Cards */}
          <div
            className="flex flex-col gap-[40px] items-start relative shrink-0 w-full max-w-[911px]"
            data-node-id="178387:19707"
          >
            {/* Card 1 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19791"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                1. Scope &amp; Relationship to Terms of Service
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                By accessing or using our platform, you acknowledge and agree that cookies and local data storage technologies may be stored on your device in accordance with this policy. Your continued use of the platform is subject to the terms outlined here and in our Terms of Service.
              </p>
            </div>

            {/* Card 2 (Soft grey fill #f9f9f9) */}
            <div
              className="bg-[#f9f9f9] flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19798"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                2. What Are Cookies?
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                Cookies are small text files placed on your browser or hardware device when visiting a online service. They allow platforms to retain session state, save user settings, deliver personalized experiences, and gather aggregate statistical insights regarding site usage and performance.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19715"
            >
              <div className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                <ol className="list-decimal" start={3}>
                  <li className="ms-[27px]">
                    <span className="leading-[24px]">Cookie Categories &amp; Settings</span>
                  </li>
                </ol>
              </div>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                We classify the cookies utilized on our platform into four main categories based on function and consent requirements:
              </p>
              <ul className="list-disc text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <li className="mb-0 ms-[24px] leading-[24px]">
                  Strictly Necessary Cookies: Required for basic operational functions, secure authentication, session persistence, and system integrity. These cookies are essential to fulfill services requested under our Terms of Service and cannot be disabled in our preference systems.
                </li>
                <li className="mb-0 ms-[24px] leading-[24px]">
                  Performance &amp; Analytics Cookies: Collect aggregated data on how users navigate and interact with our platform. These insights help us analyze error reports, page performance, and overall system scalability.
                </li>
                <li className="mb-0 ms-[24px] leading-[24px]">
                  Functional Cookies: Store user preferences (such as display theme, language settings, and regional configurations) to provide a tailored and consistent user experience.
                </li>
                <li className="ms-[24px] leading-[24px]">
                  Targeting &amp; Advertising Cookies: Placed by our platform or verified third-party partners to monitor user engagement across pages and deliver customized communications or promotional content.
                </li>
              </ul>
            </div>

            {/* Card 4 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19853"
            >
              <div className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                <ol className="list-decimal" start={4}>
                  <li className="ms-[27px]">
                    <span className="leading-[24px]">Summary of Cookies Used</span>
                  </li>
                </ol>
              </div>

              <div className="h-px w-full bg-[#e8e8e8]" />

              <div
                className="flex flex-col gap-[12px] items-start relative shrink-0 w-full overflow-x-auto"
                data-node-id="178387:19860"
              >
                <div className="flex font-mono items-start justify-between text-[#f13030] text-[12px] tracking-[1.26px] uppercase min-w-[760px] w-full">
                  <div className="w-[136px] shrink-0">
                    <p className="leading-normal mb-0">Cookie </p>
                    <p className="leading-normal">Identifier</p>
                  </div>
                  <div className="w-[143px] shrink-0">
                    <p className="leading-normal">Category</p>
                  </div>
                  <div className="w-[312px] shrink-0">
                    <p className="leading-normal">Primary Purpose</p>
                  </div>
                  <div className="w-[90px] shrink-0">
                    <p className="leading-normal">Duration</p>
                  </div>
                  <div className="w-[90px] shrink-0">
                    <p className="leading-normal">type</p>
                  </div>
                </div>

                {COOKIE_SUMMARY_ROWS.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between leading-[20px] text-[#6d6d75] text-[14px] tracking-[0.42px] min-w-[760px] w-full"
                  >
                    <p className="shrink-0 w-[136px]">{row.id}</p>
                    <p className="shrink-0 w-[143px]">{row.category}</p>
                    <p className="shrink-0 w-[312px]">{row.purpose}</p>
                    <p className="shrink-0 w-[90px]">{row.duration}</p>
                    <p className="shrink-0 w-[90px]">{row.type}</p>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-[#e8e8e8]" />
            </div>

            {/* Card 5 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19805"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                5. Managing Your Preferences
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                You maintain control over non-essential cookies on our platform. You may adjust your choices at any time through the following methods:
              </p>

              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="font-semibold leading-[24px] mb-0">
                  In-App Consent Preferences
                </p>
                <p className="leading-[24px]">
                  You can update your cookie settings by accessing the interactive Cookie Preference Center available in your Account Settings or the footer of our web application.
                </p>
              </div>

              <div className="text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                <p className="font-semibold leading-[24px] mb-0">
                  Web Browser Controls
                </p>
                <p className="leading-[24px] mb-0">
                  Most internet browsers allow you to modify cookie handling rules via their settings menus. You can instruct your browser to refuse all cookies, prompt before accepting a cookie, or delete existing local storage data:
                </p>
                <p className="leading-[24px] mb-0" aria-hidden="true">
                  &nbsp;
                </p>
                <p className="leading-[24px] mb-0">
                  Google Chrome: Settings → Privacy and Security → Cookies and other site data
                </p>
                <p className="leading-[24px] mb-0">
                  Mozilla Firefox: Preferences → Privacy &amp; Security → Cookies and Site Data
                </p>
                <p className="leading-[24px] mb-0">
                  Apple Safari: Preferences → Privacy → Manage Website Data
                </p>
                <p className="leading-[24px]">
                  Microsoft Edge: Settings → Site permissions → Cookies and site data
                </p>
              </div>

              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                Note: Rejecting or disabling strictly necessary cookies may restrict access to essential account features and cause platform instability.
              </p>
            </div>

            {/* Card 6 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19812"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                6. Third-Party Integrations
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                Some features incorporated within our services—such as embedded media players, secure payment gateways, and authentication providers—may issue cookies directly from their external domains. The management of those cookies is governed by the respective privacy policies of those third-party providers.
              </p>
            </div>

            {/* Card 7 */}
            <div
              className="border border-[#e8e8e8] border-solid flex flex-col gap-[24px] items-start p-[24px] relative rounded-[20px] shrink-0 w-full"
              data-node-id="178387:19819"
            >
              <h2 className="font-display font-medium text-[#16161a] text-[18px] leading-[24px]">
                7. Updates to This Policy
              </h2>
              <p className="leading-[24px] text-[#6d6d75] text-[16px] tracking-[0.48px] w-full">
                We may update this Cookie Policy periodically to maintain alignment with technological modifications, operational requirements, or changing legal obligations. Any updates will become effective upon publication on this page with an updated effective date.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ── 4. Shared Website Footer (Figma Frame 178151:50146) ── */}
      <WebsiteFooter />
    </div>
  );
}
