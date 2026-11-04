import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Sparkles,
  CreditCard,
  Compass,
  Menu,
  X,
  Users,
  Briefcase,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../Root";
import type { LoggedInUserSession } from "../../lib/state-sync";

export type NavPageId = "home" | "product" | "pricing" | "resources" | "legal";

interface BespokeMobileNavProps {
  /** The currently active main page */
  activePage: NavPageId;
  /** Whether the slide-down mobile menu drawer is open */
  isOpen: boolean;
  /** Callback to close the mobile menu drawer */
  onClose: () => void;
  /** Logged-in user session, or null if logged out */
  loggedInUser: LoggedInUserSession | null;
  /** Formatted user display name */
  displayName?: string;
  /** Profile avatar image URL or fallback */
  displayAvatar?: string;
  /** Whether current session is a client workspace */
  isClientSession?: boolean;
  /** Sign out callback */
  onSignOut?: () => void;
}

export const MAIN_PAGES = [
  {
    id: "home" as const,
    label: "Home",
    path: "/",
    badge: "Live Stage",
    description: "Creative marketplace for performers & casting leads",
    icon: Home,
  },
  {
    id: "product" as const,
    label: "Product",
    path: "/product",
    badge: "Thespian AI",
    description: "7-step interactive showcase, style tagging & escrow",
    icon: Sparkles,
  },
  {
    id: "pricing" as const,
    label: "Pricing",
    path: "/pricing",
    badge: "11% Split",
    description: "Fee calculators, escrow protection & instant payouts",
    icon: CreditCard,
  },
  {
    id: "resources" as const,
    label: "Resources",
    path: "/resources",
    badge: "Investor Hub",
    description: "Knowledge hub, creator guides & investor portal",
    icon: Compass,
  },
];

/**
 * Animated Hamburger / Close Button for Mobile Headers
 */
export function MobileMenuButton({
  isOpen,
  onClick,
  className = "",
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      className={`md:hidden flex items-center justify-center size-[36px] rounded-full border border-[#e8e8e8] dark:border-[#1a1a1a] bg-white dark:bg-[#000000] text-[#1a1a1a] dark:text-[#f9f9f9] hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-all cursor-pointer shadow-xs active:scale-95 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="close-icon"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <X className="size-4" />
          </motion.div>
        ) : (
          <motion.div
            key="menu-icon"
            initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Menu className="size-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

/**
 * Bespoke Full-Featured Mobile Navigation Drawer
 * Slides down beneath the sticky header with backdrop blur and fluid spring animation.
 */
export function BespokeMobileNavDrawer({
  activePage,
  isOpen,
  onClose,
  loggedInUser,
  displayName = "",
  displayAvatar = "",
  isClientSession = false,
  onSignOut,
}: BespokeMobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  // Lock body scroll while mobile drawer is open to prevent background bleed
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  const handleNav = (path: string) => {
    onClose();
    if (location.pathname !== path) {
      navigate(path);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const dashboardHref = isClientSession ? "/client" : "/dashboard";
  const userInitials = displayName
    ? displayName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur click-shield */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 top-[68px] z-40 bg-black/40 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[68px] bottom-0 z-50 md:hidden bg-white/98 dark:bg-[#000000]/98 backdrop-blur-2xl border-t border-[#e8e8e8] dark:border-[#1a1a1a] shadow-2xl flex flex-col overflow-y-auto"
          >
            <div className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-6 max-w-lg mx-auto w-full">
              {/* ── 1. Main Pages Navigation Cards ── */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-black uppercase tracking-wider text-[#767676] dark:text-[#a3a3a3]">
                    Main Pages
                  </span>
                  <span className="text-[10px] text-[#767676] dark:text-[#a3a3a3] font-mono">
                    4 pages
                  </span>
                </div>

                <nav className="flex flex-col gap-2">
                  {MAIN_PAGES.map((page) => {
                    const isActive = activePage === page.id;
                    const PageIcon = page.icon;
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => handleNav(page.path)}
                        className={`group w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? "bg-[#fff0f0] dark:bg-[#1a0808] border-[#f13030]/40 shadow-xs"
                            : "bg-white dark:bg-[#0a0a0c] border-[#e8e8e8] dark:border-[#1a1a1a] hover:bg-[#f9f9f9] dark:hover:bg-[#141417]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? "bg-[#f13030] text-white shadow-xs"
                                : "bg-[#f5f5f5] dark:bg-[#141417] text-[#484848] dark:text-[#bababa] group-hover:text-[#1a1a1a] dark:group-hover:text-white"
                            }`}
                          >
                            <PageIcon className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-bold ${
                                  isActive
                                    ? "text-[#f13030]"
                                    : "text-[#1a1a1a] dark:text-[#f9f9f9]"
                                }`}
                              >
                                {page.label}
                              </span>
                              {isActive && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#f13030]/10 text-[#f13030]">
                                  <span className="size-1.5 rounded-full bg-[#f13030] animate-pulse" />
                                  Active
                                </span>
                              )}
                              {!isActive && page.badge && (
                                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#767676] dark:text-[#a3a3a3]">
                                  {page.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-[#767676] dark:text-[#8e8e93] truncate max-w-[260px] sm:max-w-none">
                              {page.description}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`size-4 shrink-0 transition-transform ${
                            isActive
                              ? "text-[#f13030] translate-x-0.5"
                              : "text-[#a3a3a3] dark:text-[#525252] group-hover:translate-x-0.5"
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* ── 2. Quick Role Portals ── */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-black uppercase tracking-wider text-[#767676] dark:text-[#a3a3a3]">
                    Quick Portals
                  </span>
                  <span className="text-[10px] text-[#767676] dark:text-[#a3a3a3]">
                    Role specific
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleNav(loggedInUser ? "/client" : "/onboarding/client")}
                    className="p-3.5 rounded-2xl border border-[#e8e8e8] dark:border-[#1a1a1a] bg-[#fafafa] dark:bg-[#0a0a0c] hover:bg-[#f2f2f2] dark:hover:bg-[#141417] text-left transition-all cursor-pointer flex flex-col justify-between h-[96px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Users className="size-4" />
                      </div>
                      <ArrowRight className="size-3.5 text-[#a3a3a3]" />
                    </div>
                    <div>
                      <span className="block font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold text-[#1a1a1a] dark:text-[#f9f9f9]">
                        Find Performers
                      </span>
                      <span className="block text-[11px] text-[#767676] dark:text-[#8e8e93] truncate">
                        Cast creative talent
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav(loggedInUser ? "/dashboard" : "/onboarding")}
                    className="p-3.5 rounded-2xl border border-[#e8e8e8] dark:border-[#1a1a1a] bg-[#fafafa] dark:bg-[#0a0a0c] hover:bg-[#f2f2f2] dark:hover:bg-[#141417] text-left transition-all cursor-pointer flex flex-col justify-between h-[96px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="size-7 rounded-lg bg-red-500/10 text-[#f13030] flex items-center justify-center">
                        <Briefcase className="size-4" />
                      </div>
                      <ArrowRight className="size-3.5 text-[#a3a3a3]" />
                    </div>
                    <div>
                      <span className="block font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold text-[#1a1a1a] dark:text-[#f9f9f9]">
                        Find Gigs
                      </span>
                      <span className="block text-[11px] text-[#767676] dark:text-[#8e8e93] truncate">
                        Audition & get paid
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ── 3. Account / Authentication Hub ── */}
              <div className="pt-2 border-t border-[#e8e8e8] dark:border-[#1a1a1a]">
                {loggedInUser ? (
                  <div className="p-4 rounded-2xl border border-[#e8e8e8] dark:border-[#1a1a1a] bg-[#fbfbfb] dark:bg-[#0c0c0e] flex flex-col gap-3.5">
                    {/* User profile header */}
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full overflow-hidden bg-[#f0f0f0] dark:bg-[#1a1a1a] shrink-0 border border-black/10 dark:border-white/10 flex items-center justify-center">
                        {displayAvatar ? (
                          <img
                            src={displayAvatar}
                            alt={displayName}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#f13030]">
                            {userInitials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-bold text-[#1a1a1a] dark:text-[#f9f9f9] truncate">
                            {displayName || loggedInUser.name}
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FFF0F0] dark:bg-[#f13030]/20 text-[#f13030] shrink-0">
                            {isClientSession ? "Client" : "Performer"}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#767676] dark:text-[#a3a3a3] truncate">
                          {loggedInUser.email}
                        </p>
                      </div>
                    </div>

                    {/* Authenticated quick shortcuts */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e8e8e8] dark:border-[#1a1a1a]">
                      <button
                        type="button"
                        onClick={() => handleNav(dashboardHref)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-semibold text-[#1a1a1a] dark:text-[#f9f9f9] bg-white dark:bg-[#141417] border border-[#e8e8e8] dark:border-[#1a1a1a] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c20] transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="size-3.5 text-[#767676] dark:text-[#a3a3a3]" />
                        <span className="truncate">Dashboard</span>
                      </button>

                      {!isClientSession ? (
                        <button
                          type="button"
                          onClick={() => handleNav("/emeka-johnson")}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-semibold text-[#1a1a1a] dark:text-[#f9f9f9] bg-white dark:bg-[#141417] border border-[#e8e8e8] dark:border-[#1a1a1a] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c20] transition-colors cursor-pointer"
                        >
                          <Sparkles className="size-3.5 text-[#767676] dark:text-[#a3a3a3]" />
                          <span className="truncate">Storefront</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleNav("/brief")}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-semibold text-[#1a1a1a] dark:text-[#f9f9f9] bg-white dark:bg-[#141417] border border-[#e8e8e8] dark:border-[#1a1a1a] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c20] transition-colors cursor-pointer"
                        >
                          <Briefcase className="size-3.5 text-[#767676] dark:text-[#a3a3a3]" />
                          <span className="truncate">Post Brief</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleNav("/settings")}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-semibold text-[#1a1a1a] dark:text-[#f9f9f9] bg-white dark:bg-[#141417] border border-[#e8e8e8] dark:border-[#1a1a1a] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c20] transition-colors cursor-pointer"
                      >
                        <Settings className="size-3.5 text-[#767676] dark:text-[#a3a3a3]" />
                        <span className="truncate">Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNav("/support")}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-semibold text-[#1a1a1a] dark:text-[#f9f9f9] bg-white dark:bg-[#141417] border border-[#e8e8e8] dark:border-[#1a1a1a] hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c20] transition-colors cursor-pointer"
                      >
                        <HelpCircle className="size-3.5 text-[#767676] dark:text-[#a3a3a3]" />
                        <span className="truncate">Support</span>
                      </button>
                    </div>

                    {/* Sign out button */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onSignOut) {
                          onSignOut();
                        } else {
                          navigate("/");
                        }
                      }}
                      className="w-full mt-1 py-2 text-center text-[13px] font-bold text-[#f13030] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleNav("/auth?mode=signup")}
                      className="w-full h-12 rounded-full bg-[#f13030] text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] hover:bg-[#d02020] transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(241,48,48,0.35)] cursor-pointer"
                    >
                      <span>Get Started for Free</span>
                      <ArrowRight className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNav("/auth?mode=signin")}
                      className="w-full h-11 rounded-full border border-[#e8e8e8] dark:border-[#1a1a1a] bg-white dark:bg-[#0a0a0c] text-[#1a1a1a] dark:text-[#f9f9f9] font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#141417] transition-all flex items-center justify-center cursor-pointer"
                    >
                      Sign In to Account
                    </button>
                  </div>
                )}
              </div>

              {/* ── 4. Theme & Legal Utility Row ── */}
              <div className="pt-2 pb-6 border-t border-[#e8e8e8] dark:border-[#1a1a1a] flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Toggle theme"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e8e8e8] dark:border-[#1a1a1a] bg-white dark:bg-[#0a0a0c] text-[#767676] dark:text-[#a3a3a3] text-[12px] font-semibold hover:bg-[#f5f5f5] dark:hover:bg-[#141417] transition-colors cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="size-3.5 text-amber-500" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-3.5 text-slate-700" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 text-[11px] text-[#767676] dark:text-[#a3a3a3]">
                  <button
                    type="button"
                    onClick={() => handleNav("/terms")}
                    className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Terms
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleNav("/privacy")}
                    className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Privacy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleNav("/cookies")}
                    className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cookies
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Bespoke Mobile Floating Bottom Navigation Dock
 * Provides thumb-friendly 1-tap navigation between main pages on mobile.
 */
export function BespokeMobileBottomDock({
  activePage,
  isMenuOpen,
  onToggleMenu,
  loggedInUser,
  displayAvatar = "",
}: {
  activePage: NavPageId;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  loggedInUser?: LoggedInUserSession | null;
  displayAvatar?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    if (isMenuOpen) onToggleMenu();
    if (location.pathname !== path) {
      navigate(path);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-4 inset-x-3 max-w-sm mx-auto z-40 md:hidden pointer-events-none">
      <div className="pointer-events-auto backdrop-blur-2xl bg-white/92 dark:bg-[#0d0d10]/92 border border-[#e8e8e8]/90 dark:border-[#1f1f23] rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.16)] p-1.5 flex items-center justify-between">
        {MAIN_PAGES.map((page) => {
          const isActive = activePage === page.id && !isMenuOpen;
          const PageIcon = page.icon;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => handleNav(page.path)}
              aria-label={page.label}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all cursor-pointer min-w-[54px] ${
                isActive
                  ? "text-[#f13030]"
                  : "text-[#767676] dark:text-[#a3a3a3] hover:text-[#1a1a1a] dark:hover:text-[#f9f9f9]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-mobile-dock-pill"
                  className="absolute inset-0 rounded-full bg-[#fff0f0] dark:bg-[#1f1010] border border-[#f13030]/20 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <PageIcon className={`size-4 ${isActive ? "text-[#f13030]" : ""}`} />
              <span className="text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-bold leading-[12px] mt-0.5">
                {page.label}
              </span>
            </button>
          );
        })}

        {/* Menu / Account Toggle Button */}
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all cursor-pointer min-w-[54px] ${
            isMenuOpen
              ? "text-[#f13030]"
              : "text-[#767676] dark:text-[#a3a3a3] hover:text-[#1a1a1a] dark:hover:text-[#f9f9f9]"
          }`}
        >
          {isMenuOpen && (
            <motion.div
              layoutId="active-mobile-dock-pill"
              className="absolute inset-0 rounded-full bg-[#fff0f0] dark:bg-[#1f1010] border border-[#f13030]/20 -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}

          {isMenuOpen ? (
            <X className="size-4 text-[#f13030]" />
          ) : loggedInUser && displayAvatar ? (
            <div className="size-4 rounded-full overflow-hidden border border-[#e8e8e8] dark:border-[#1a1a1a] shrink-0">
              <img
                src={displayAvatar}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            </div>
          ) : (
            <Menu className="size-4" />
          )}

          <span className="text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-bold leading-[12px] mt-0.5">
            {isMenuOpen ? "Close" : loggedInUser ? "Account" : "Menu"}
          </span>
        </button>
      </div>
    </div>
  );
}
