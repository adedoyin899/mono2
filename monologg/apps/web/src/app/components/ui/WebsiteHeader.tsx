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
      className="h-18 sticky top-0 z-50 px-5 md:px-16 flex items-center justify-between backdrop-blur-xl transition-colors"
      style={{
        background: isDark ? "rgba(2, 9, 58, 0.88)" : "rgba(246, 245, 244, 0.88)",
        borderBottom: "1px solid var(--color-faint-line)",
      }}
    >
      <button onClick={() => navigate("/")} aria-label="Monologg home" className="flex items-center gap-2">
        <Logo className="h-6 w-auto" style={{ color: "var(--color-text-primary)" }} title="Monologg" />
      </button>

      <nav className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="font-body text-[14px] font-medium transition-colors hover:text-[var(--color-text-primary)]"
            style={{ color: "var(--color-warm-gray)" }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors active:scale-95"
          style={{ borderColor: "var(--color-faint-line)", background: "var(--color-pure-white)", color: "var(--color-warm-gray)" }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {loggedInUser ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-full p-1 pr-2 border transition-colors active:scale-95"
              style={{ borderColor: "var(--color-faint-line)", background: "var(--color-pure-white)" }}
              aria-label="Account menu"
              aria-expanded={showUserMenu}
            >
              <Avatar size="sm" src={userAvatarUrl ?? undefined} background="var(--color-accent-glow)" color="var(--color-accent)">
                {userInitials}
              </Avatar>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                style={{ color: "var(--color-warm-gray)" }}
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden z-50"
                  style={{ background: "var(--color-pure-white)", border: "1px solid var(--color-faint-line)", boxShadow: "var(--shadow-elevated)" }}
                >
                  <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid var(--color-faint-line)" }}>
                    <Avatar size="md" src={userAvatarUrl ?? undefined} background="var(--color-accent-glow)" color="var(--color-accent)">
                      {userInitials}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate font-body" style={{ color: "var(--color-text-primary)" }}>{loggedInUser.name}</div>
                      <div className="text-xs truncate font-body" style={{ color: "var(--color-warm-gray)" }}>{loggedInUser.email}</div>
                    </div>
                  </div>

                  <div className="py-1.5">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setShowUserMenu(false); navigate(item.path); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-body text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        <item.icon className="w-4 h-4" style={{ color: "var(--color-warm-gray)" }} />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="py-1.5" style={{ borderTop: "1px solid var(--color-faint-line)" }}>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-body text-left hover:bg-red-500/10 transition-colors"
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
              className="h-9 px-3.5 text-sm font-medium rounded-lg hidden md:inline-flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="h-9 px-4 text-sm font-medium rounded-lg"
              style={{ background: "var(--color-signal-blue)", color: "#ffffff" }}
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
