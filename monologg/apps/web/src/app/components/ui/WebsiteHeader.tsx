import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { useTheme } from "../../Root";
import { appStateSync } from "../../../lib/state-sync";
import { apiClient } from "../../../lib/api-client";
import {
  ChevronDown, Sun, Moon, LayoutDashboard, FileText, Receipt,
  Settings as SettingsIcon, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Product", path: "/product" },
  { label: "Pricing", path: "/pricing" },
  { label: "Resources", path: "/resources" },
];

/** Shared marketing-site header — used by the Home, Product, Pricing, and
 * Resources pages. Owns real session state (not just visual): shows the
 * signed-in avatar/account menu once a session exists, and Sign Out clears
 * it for real via apiClient.logout(). */
export function WebsiteHeader() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [loggedInUser, setLoggedInUserState] = useState(() => appStateSync.getLoggedInUser());
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null | undefined>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => {
      const u = appStateSync.getLoggedInUser();
      setLoggedInUserState(u);
      if (u) {
        const profile = u.userType === "CLIENT" ? appStateSync.getClientProfile() : appStateSync.getTalentProfile();
        setUserAvatarUrl(profile.avatarUrl);
      }
    };
    syncUser();
    return appStateSync.subscribe(syncUser);
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showUserMenu]);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await apiClient.logout();
    navigate("/");
  };

  const userInitials = loggedInUser?.name
    ? loggedInUser.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")
    : "U";

  const userMenuItems = loggedInUser?.userType === "CLIENT"
    ? [
        { label: "Dashboard", icon: LayoutDashboard, path: "/client" },
        { label: "Post a Project", icon: FileText, path: "/brief" },
        { label: "Transactions", icon: Receipt, path: "/transactions" },
        { label: "Settings", icon: SettingsIcon, path: "/settings?role=client" },
      ]
    : [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "My Media Kit", icon: FileText, path: "/media-kit" },
        { label: "Transactions", icon: Receipt, path: "/transactions" },
        { label: "Settings", icon: SettingsIcon, path: "/settings?role=talent" },
      ];

  return (
    <header
      className="h-20 sticky top-0 z-50 px-5 md:px-16 flex items-center justify-between backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--color-bg-canvas) 72%, transparent)", borderBottom: "1px solid var(--color-hairline)" }}
    >
      <button onClick={() => navigate("/")} aria-label="Monologg home">
        <Logo className="h-6 w-auto" style={{ color: "var(--color-text-primary)" }} title="Monologg" />
      </button>
      <nav className="hidden md:flex items-center gap-9">
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="font-body text-[14px] opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggle}
          className="w-11 h-11 rounded-[var(--radius-full)] flex items-center justify-center border transition-colors active:scale-[0.97]"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
        {loggedInUser ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 border transition-colors active:scale-95"
              style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)" }}
              aria-label="Account menu"
              aria-expanded={showUserMenu}
            >
              <Avatar size="sm" src={userAvatarUrl ?? undefined} background="var(--color-accent-glow)" color="var(--color-accent)">
                {userInitials}
              </Avatar>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                style={{ color: "var(--color-text-tertiary)" }}
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-[var(--radius-lg)] overflow-hidden z-50"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-elevated)" }}
                >
                  <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
                    <Avatar size="md" src={userAvatarUrl ?? undefined} background="var(--color-accent-glow)" color="var(--color-accent)">
                      {userInitials}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate font-body" style={{ color: "var(--color-text-primary)" }}>{loggedInUser.name}</div>
                      <div className="text-xs truncate font-body" style={{ color: "var(--color-text-tertiary)" }}>{loggedInUser.email}</div>
                    </div>
                  </div>

                  <div className="py-1.5">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setShowUserMenu(false); navigate(item.path); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left hover:opacity-80 transition-opacity"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        <item.icon className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="py-1.5" style={{ borderTop: "1px solid var(--color-hairline)" }}>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left hover:opacity-80 transition-opacity"
                      style={{ color: "var(--color-error)" }}
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
            <Button
              variant="ghost"
              className="h-11 px-4 text-sm hidden md:inline-flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="h-11 px-5 text-sm"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
