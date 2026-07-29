import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../Root";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import { apiClient } from "../../lib/api-client";
import {
  ChevronLeft, User, CreditCard, Bell, Shield, LogOut, ChevronRight,
  Sun, Moon, Camera, Check, Smartphone, Trash2, Plus, Receipt, LifeBuoy, FileText
} from "lucide-react";

type Section = "main" | "profile" | "payment" | "notifications" | "security";

const TOGGLE = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    className="w-11 h-6 rounded-full transition-all relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    style={{ background: on ? "var(--color-accent)" : "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}
  >
    {/* thumb: dark on gold (passes ~10:1), light on grey track */}
    <div
      className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
      style={{ background: on ? "var(--color-accent-on)" : "var(--color-text-primary)", opacity: on ? 1 : 0.6, left: on ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
    />
  </button>
);

export function Settings() {
  const [section, setSection] = useState<Section>("main");
  const [name, setName] = useState("Elias Thorne");
  const [email, setEmail] = useState("elias@example.com");
  const [bio, setBio] = useState("Specializing in intense dramatic monologues and authoritative voice-overs. 10+ years stage experience.");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [notif, setNotif] = useState({ bookings: true, messages: true, payments: true, marketing: false, reminders: true });
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  // features.md Phase 12: this screen previously never read or wrote real data
  // in either mock or live mode (handleSave below was purely a "Saved" toast).
  // Fetches the real profile once on mount so a live-mode name/bio/location
  // edit actually starts from — and persists back to — the signed-in talent's
  // Creator row. Mock mode's fetch is a same-shape, no-network echo (see
  // api-client.ts's getCreatorProfile), so this doesn't change mock behavior.
  useEffect(() => {
    let cancelled = false;
    apiClient.getCreatorProfile().then((profile) => {
      if (cancelled) return;
      setName(profile.name);
      setBio(profile.bio ?? "");
      setLocation(profile.location);
    }).catch(() => {
      // No creator profile for this session (e.g. viewing as a client, or
      // logged out in live mode) — keep the mock-shaped defaults above rather
      // than surfacing an error on a settings screen.
    });
    return () => { cancelled = true; };
  }, []);

  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await apiClient.updateCreatorProfile({ name, bio, location });
      setName(updated.name);
      setBio(updated.bio ?? "");
      setLocation(updated.location);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  };

  const sectionBack = () => setSection("main");

  const s = {
    text: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    tertiary: { color: "var(--color-text-tertiary)" } as React.CSSProperties,
    surface: { background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
    elevated: { background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
  };

  const ListItem = ({ label, icon: Icon, onClick, danger = false, value }: { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; onClick?: () => void; danger?: boolean; value?: string }) => (
    <button
      className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[56px] text-left border-b border-[var(--color-hairline)] last:border-b-0 hover:bg-[var(--color-bg-elevated)] active:scale-[0.99] transition-all"
      onClick={onClick}
    >
      <span
        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
        style={{ background: danger ? "var(--color-error-bg)" : "var(--color-accent-soft)" }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: danger ? "var(--color-error)" : "var(--color-accent)" }} />
      </span>
      <span className="flex-1 text-sm font-body font-medium" style={{ color: danger ? "var(--color-error)" : "var(--color-text-primary)" }}>{label}</span>
      {value && <span className="text-sm font-body font-mono tnum" style={s.tertiary}>{value}</span>}
      {!danger && <ChevronRight className="w-4 h-4" style={s.tertiary} />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      {/* Header */}
      <div className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <button
          aria-label={section === "main" ? "Go back" : "Back to settings"}
          onClick={section === "main" ? () => navigate(-1) : sectionBack}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-semibold font-display" style={s.text}>
            {section === "main" && "Settings"}
            {section === "profile" && "Edit Profile"}
            {section === "payment" && "Payment Methods"}
            {section === "notifications" && "Notifications"}
            {section === "security" && "Security & Privacy"}
          </div>
        </div>
        {section !== "main" && (
          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Badge tone="success" size="lg">
                  <Check className="w-3 h-3" /> Saved
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── Main Settings Menu ── */}
          {section === "main" && (
            <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION_MED, ease: EASE_OUT }} exit={{ opacity: 0 }}>
              {/* Profile summary */}
              <div className="p-4 rounded-[var(--radius-xl)] flex items-center gap-4 mb-6" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-xl font-body shrink-0" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                  ET
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold truncate" style={s.text}>{name}</div>
                  <div className="text-sm font-body truncate" style={s.secondary}>{email}</div>
                  <div className="text-xs font-body mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)]" style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
                    <Shield className="w-3 h-3" /> Verified
                  </div>
                </div>
                <Button variant="secondary" className="h-9 px-4 text-xs shrink-0" onClick={() => setSection("profile")}>
                  Edit
                </Button>
              </div>

              {/* Settings sections */}
              <div className="text-xs font-medium uppercase tracking-wider mb-2 px-1 font-body" style={s.tertiary}>Account</div>
              <div className="rounded-[var(--radius-xl)] overflow-hidden mb-6" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                <ListItem label="Profile & Storefront" icon={User} onClick={() => setSection("profile")} />
                <ListItem label="Payment Methods" icon={CreditCard} onClick={() => setSection("payment")} />
                <ListItem label="Transaction History" icon={Receipt} onClick={() => navigate("/transactions")} />
                <ListItem label="Notifications" icon={Bell} onClick={() => setSection("notifications")} />
                <ListItem label="Security & Privacy" icon={Shield} onClick={() => setSection("security")} />
              </div>

              {/* Appearance */}
              <div className="text-xs font-medium uppercase tracking-wider mb-2 px-1 font-body" style={s.tertiary}>Appearance</div>
              <div className="rounded-[var(--radius-xl)] overflow-hidden mb-6" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                <div className="px-4 py-3.5 min-h-[56px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                      {isDark ? <Moon className="w-[18px] h-[18px]" style={{ color: "var(--color-accent)" }} /> : <Sun className="w-[18px] h-[18px]" style={{ color: "var(--color-accent)" }} />}
                    </span>
                    <span className="text-sm font-medium font-body" style={s.text}>{isDark ? "Dark Mode" : "Light Mode"}</span>
                  </div>
                  <TOGGLE on={isDark} onToggle={toggle} />
                </div>
              </div>

              {/* Support */}
              <div className="text-xs font-medium uppercase tracking-wider mb-2 px-1 font-body" style={s.tertiary}>Support & Legal</div>
              <div className="rounded-[var(--radius-xl)] overflow-hidden mb-6" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                <ListItem label="Help Center" icon={LifeBuoy} onClick={() => navigate("/support")} />
                <ListItem label="Terms of Service" icon={FileText} onClick={() => navigate("/legal/terms")} />
                <ListItem label="Privacy Policy" icon={Shield} onClick={() => navigate("/legal/privacy")} />
              </div>

              <div className="rounded-[var(--radius-xl)] overflow-hidden" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[56px] text-left hover:bg-[var(--color-error-bg)] active:scale-[0.99] transition-all"
                  onClick={() => navigate("/")}
                >
                  <span className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: "var(--color-error-bg)" }}>
                    <LogOut className="w-[18px] h-[18px]" style={{ color: "var(--color-error)" }} />
                  </span>
                  <span className="text-sm font-medium font-body" style={{ color: "var(--color-error)" }}>Sign Out</span>
                </button>
              </div>

              <p className="text-xs text-center mt-6 font-body" style={s.tertiary}>
                Monologg v1.0.0 · © 2024 Monologg Inc.
              </p>
            </motion.div>
          )}

          {/* ── Profile ── */}
          {section === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center py-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center font-semibold text-2xl font-body" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                    {initials}
                  </div>
                  <button
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {/* dark icon on gold = ~10:1 contrast */}
                    <Camera className="w-4 h-4" style={{ color: "var(--color-accent-on)" }} />
                  </button>
                </div>
                <button
                  className="text-xs font-body mt-3 underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Change Photo
                </button>
              </div>

              <FormField label="Full Name">
                <Input value={name} onChange={e => setName(e.target.value)} />
              </FormField>
              <FormField label="Email Address">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </FormField>
              <FormField label="Niche / Role">
                <Input defaultValue="Actor & Voice Artist" />
              </FormField>
              <FormField label="Location">
                <Input value={location} onChange={e => setLocation(e.target.value)} />
              </FormField>
              <FormField label="Bio">
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm font-body border resize-none"
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                />
              </FormField>
              <Button className="w-full h-12" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save Changes"}
              </Button>
            </motion.div>
          )}

          {/* ── Payment Methods ── */}
          {section === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="space-y-3">
                {[
                  { type: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
                  { type: "Mastercard", last4: "8104", expiry: "06/25", isDefault: false },
                ].map((card, i) => (
                  <div key={i} className="p-4 rounded-xl flex items-center gap-3" style={s.surface}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                      <CreditCard className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold font-body" style={s.text}>{card.type} ···· {card.last4}</div>
                      <div className="text-xs font-body" style={s.tertiary}>Expires {card.expiry}</div>
                    </div>
                    {card.isDefault && <Badge tone="success" size="md">Default</Badge>}
                    <button aria-label={`Remove ${card.type} ending ${card.last4}`} className="p-1 rounded hover:opacity-70 transition-opacity">
                      <Trash2 className="w-4 h-4" style={{ color: "var(--color-error)" }} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium font-body hover:border-[var(--color-accent)] hover:opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                style={{ borderColor: "var(--color-hairline)", color: "var(--color-text-secondary)" }}
              >
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>

              {/* Bank account */}
              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                <div className="px-4 py-3.5">
                  <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={s.tertiary}>Payout Bank Account</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                      <Smartphone className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold font-body" style={s.text}>GTBank ···· 6789</div>
                      <div className="text-xs font-body" style={s.tertiary}>ELIAS THORNE</div>
                    </div>
                    <Button variant="secondary" className="h-8 px-3 text-xs">Change</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Notifications ── */}
          {section === "notifications" && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                {[
                  { key: "bookings" as const, label: "New Booking Requests", desc: "When a client books one of your services" },
                  { key: "messages" as const, label: "Messages", desc: "New messages in your Order Rooms" },
                  { key: "payments" as const, label: "Payment Updates", desc: "Escrow releases, payouts, and payment confirmations" },
                  { key: "reminders" as const, label: "Deadline Reminders", desc: "Upcoming order deadlines and schedule alerts" },
                  { key: "marketing" as const, label: "Tips & Product Updates", desc: "Platform tips, new features, and newsletters" },
                ].map((item, i, arr) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-4 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-hairline)" : undefined }}
                  >
                    <div className="flex-1 pr-4">
                      <div className="text-sm font-semibold font-body" style={s.text}>{item.label}</div>
                      <div className="text-xs font-body mt-0.5" style={s.tertiary}>{item.desc}</div>
                    </div>
                    <TOGGLE on={notif[item.key]} onToggle={() => setNotif(prev => ({ ...prev, [item.key]: !prev[item.key] }))} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Security ── */}
          {section === "security" && (
            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
                  <div className="text-sm font-semibold font-body mb-3" style={s.text}>Change Password</div>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Current Password" />
                    <Input type="password" placeholder="New Password" />
                    <Input type="password" placeholder="Confirm New Password" />
                  </div>
                  <Button className="w-full h-11 mt-3 text-sm" onClick={handleSave}>Update Password</Button>
                </div>

                <div className="px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold font-body" style={s.text}>Two-Factor Authentication</div>
                    <div className="text-xs font-body" style={s.tertiary}>Add an extra layer of security</div>
                  </div>
                  <Button variant="secondary" className="h-8 px-3 text-xs">Enable</Button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                <div className="px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold font-body" style={s.text}>Active Sessions</div>
                    <div className="text-xs font-body" style={s.tertiary}>2 devices logged in</div>
                  </div>
                  <Button variant="secondary" className="h-8 px-3 text-xs">Manage</Button>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error)" }}>
                <button className="w-full px-4 py-3.5 text-left">
                  <div className="text-sm font-semibold font-body" style={{ color: "var(--color-error)" }}>Delete Account</div>
                  <div className="text-xs font-body mt-0.5" style={{ color: "var(--color-error)", opacity: 0.7 }}>Permanently delete your account and all data</div>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
