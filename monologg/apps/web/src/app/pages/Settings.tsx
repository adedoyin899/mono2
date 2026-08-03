import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../Root";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import { apiClient, type PhysicalAttributes, type AttributeVisibility, type UpdateAttributesInput } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import { Modal } from "../components/ui/Modal";
import {
  ChevronLeft, User, CreditCard, Bell, Shield, LogOut, ChevronRight,
  Sun, Moon, Camera, Check, Smartphone, Trash2, Plus, Receipt, LifeBuoy, FileText, Ruler, Briefcase, Building, Edit2, X
} from "lucide-react";

type Section = "main" | "profile" | "payment" | "notifications" | "security" | "attributes";

const ATTRIBUTE_FIELDS: Array<{ key: keyof UpdateAttributesInput; label: string; options: string[] }> = [
  { key: "heightRange", label: "Height", options: ["UNDER_150CM", "CM_150_160", "CM_160_170", "CM_170_180", "CM_180_190", "OVER_190CM"] },
  { key: "weightRange", label: "Weight", options: ["UNDER_50KG", "KG_50_65", "KG_65_80", "KG_80_95", "OVER_95KG"] },
  { key: "ageRange", label: "Age range", options: ["RANGE_18_25", "RANGE_26_35", "RANGE_36_45", "RANGE_46_55", "RANGE_56_65", "OVER_65"] },
  { key: "build", label: "Build", options: ["SLIM", "ATHLETIC", "AVERAGE", "CURVY", "PLUS_SIZE", "MUSCULAR"] },
  { key: "complexion", label: "Complexion", options: ["FAIR", "LIGHT", "MEDIUM", "TAN", "DARK", "DEEP"] },
  { key: "hairColor", label: "Hair color", options: ["BLACK", "BROWN", "BLONDE", "RED", "GREY", "WHITE", "DYED_OTHER"] },
  { key: "eyeColor", label: "Eye color", options: ["BROWN", "BLACK", "HAZEL", "GREEN", "BLUE", "GREY"] },
  { key: "genderPresentation", label: "Gender presentation", options: ["MASCULINE", "FEMININE", "ANDROGYNOUS", "NON_BINARY"] },
];
const ATTRIBUTES_CONSENT_VERSION = "attrs-v1";
const VISIBILITY_LEVELS: AttributeVisibility[] = ["PRIVATE", "SEARCHABLE", "PUBLIC"];

const TOGGLE = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
  <button
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onToggle}
    className="w-11 h-6 rounded-full transition-all relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    style={{ background: on ? "var(--color-accent)" : "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}
  >
    <div
      className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
      style={{ background: on ? "var(--color-accent-on)" : "var(--color-text-primary)", opacity: on ? 1 : 0.6, left: on ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
    />
  </button>
);

export function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role detection: query param ?role=client or fallback to client detection
  const roleParam = searchParams.get("role");
  const isClient = roleParam === "client";

  const [section, setSection] = useState<Section>("main");
  
  // Talent fields
  const [name, setName] = useState("Emeka Johnson");
  const [email, setEmail] = useState("emeka@example.com");
  const [bio, setBio] = useState("Specializing in intense dramatic monologues, voice-overs, and Nollywood screen roles.");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Client fields
  const [clientName, setClientName] = useState("Sarah Jenkins");
  const [clientOrgName, setClientOrgName] = useState("FilmCraft Studios");
  const [clientOrgType, setClientOrgType] = useState("STUDIO");
  const [clientEmail, setClientEmail] = useState("sarah@filmcraft.com");
  const [clientLocation, setClientLocation] = useState("Lagos, Nigeria");

  // Bank details
  const [bankDetails, setBankDetails] = useState(() => appStateSync.getBankDetails());
  const [editingBank, setEditingBank] = useState(false);
  const [bankName, setBankName] = useState(bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(bankDetails.accountNumber);
  const [accountName, setAccountName] = useState(bankDetails.accountName);

  // Payment Cards state
  const [paymentCards, setPaymentCards] = useState<Array<{ id: string; type: string; last4: string; expiry: string; isDefault: boolean }>>([
    { id: "card-1", type: "Mastercard", last4: "4242", expiry: "08/28", isDefault: true },
    { id: "card-2", type: "Visa", last4: "8899", expiry: "11/27", isDefault: false },
  ]);
  const [deleteCardModal, setDeleteCardModal] = useState<{ id: string; type: string; last4: string } | null>(null);

  const [notif, setNotif] = useState({ bookings: true, messages: true, payments: true, marketing: false, reminders: true });
  const [securityPasscode, setSecurityPasscode] = useState(() => localStorage.getItem("monologg_withdrawal_passcode") || "1234");
  const [passcodeSaved, setPasscodeSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Physical attributes
  const [attributes, setAttributes] = useState<PhysicalAttributes | null>(null);
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});
  const [attrVisibility, setAttrVisibility] = useState<Record<string, AttributeVisibility>>({});
  const [distinctiveFeatures, setDistinctiveFeatures] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [savingAttributes, setSavingAttributes] = useState(false);

  useEffect(() => {
    if (section !== "attributes") return;
    apiClient.getMyAttributes().then((record) => {
      if (!record) return;
      setAttributes(record);
      const values: Record<string, string> = {};
      for (const field of ATTRIBUTE_FIELDS) {
        const v = record[field.key as keyof PhysicalAttributes];
        if (typeof v === "string") values[field.key] = v;
      }
      setAttrValues(values);
      setAttrVisibility((record.visibility as Record<string, AttributeVisibility>) ?? {});
      setDistinctiveFeatures(record.distinctiveFeatures ?? "");
      setConsentChecked(true);
    });
  }, [section]);

  const handleSaveAttributes = async () => {
    setSavingAttributes(true);
    try {
      const input: UpdateAttributesInput = {
        consentVersion: ATTRIBUTES_CONSENT_VERSION,
        visibility: attrVisibility,
        distinctiveFeatures: distinctiveFeatures || undefined,
      };
      for (const field of ATTRIBUTE_FIELDS) {
        const value = attrValues[field.key as string];
        if (value) (input as Record<string, unknown>)[field.key as string] = value;
      }
      const updated = await apiClient.updateMyAttributes(input);
      setAttributes(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingAttributes(false);
    }
  };

  const handleDeleteAttributes = async () => {
    await apiClient.deleteMyAttributes();
    setAttributes(null);
    setAttrValues({});
    setAttrVisibility({});
    setDistinctiveFeatures("");
    setConsentChecked(false);
  };

  // Sync profile & bank data on mount & from appStateSync
  useEffect(() => {
    const syncData = () => {
      if (isClient) {
        const cState = appStateSync.getClientProfile();
        setClientName(cState.name);
        setClientOrgName(cState.orgName);
        setClientOrgType(cState.orgType);
        setClientEmail(cState.email);
        setClientLocation(cState.location);
        if (cState.avatarUrl !== undefined) setAvatarUrl(cState.avatarUrl);
      } else {
        const tState = appStateSync.getTalentProfile();
        setName(tState.name);
        setEmail(tState.email);
        setBio(tState.bio);
        setLocation(tState.location);
        if (tState.avatarUrl !== undefined) setAvatarUrl(tState.avatarUrl);
      }
      const bState = appStateSync.getBankDetails();
      setBankDetails(bState);
      setBankName(bState.bankName);
      setAccountNumber(bState.accountNumber);
      setAccountName(bState.accountName);
    };

    syncData();
    const unsubscribe = appStateSync.subscribe(syncData);

    if (isClient) {
      apiClient.getClientProfile().then((cp) => {
        setClientName(cp.name);
        if (cp.orgName) setClientOrgName(cp.orgName);
        if (cp.orgType) setClientOrgType(cp.orgType);
        if (cp.location) setClientLocation(cp.location);
      }).catch(() => {});
    } else {
      apiClient.getCreatorProfile().then((profile) => {
        setName(profile.name);
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
      }).catch(() => {});
    }

    return unsubscribe;
  }, [isClient]);

  const initials = isClient
    ? clientOrgName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]!.toUpperCase()).join("") || "FS"
    : name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]!.toUpperCase()).join("") || "EJ";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (isClient) {
        const updated = await apiClient.updateClientProfile({
          name: clientName,
          orgName: clientOrgName,
          orgType: clientOrgType as any,
          location: clientLocation,
        });
        setClientName(updated.name);
        if (updated.orgName) setClientOrgName(updated.orgName);
        appStateSync.updateClientProfile({
          name: updated.name,
          orgName: updated.orgName ?? undefined,
          orgType: updated.orgType ?? undefined,
          location: updated.location ?? undefined,
        });
      } else {
        const updated = await apiClient.updateCreatorProfile({ name, bio, location });
        setName(updated.name);
        setBio(updated.bio ?? "");
        setLocation(updated.location ?? "");
        appStateSync.updateTalentProfile({ name: updated.name, bio: updated.bio ?? "", location: updated.location ?? "" });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      setAvatarUrl(url);
      if (isClient) {
        appStateSync.updateClientProfile({ avatarUrl: url });
      } else {
        appStateSync.updateTalentProfile({ avatarUrl: url });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBank = () => {
    appStateSync.updateBankDetails({ bankName, accountNumber, accountName });
    setEditingBank(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    <div className={isClient ? "role-client min-h-screen flex flex-col" : "role-talent min-h-screen flex flex-col"} style={{ background: "var(--color-bg-canvas)" }}>
      {/* Hidden file input for avatar photo upload */}
      <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" className="hidden" />

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
            {section === "main" && (isClient ? "Client Settings" : "Settings")}
            {section === "profile" && (isClient ? "Organization Profile" : "Edit Profile")}
            {section === "payment" && (isClient ? "Billing & Payment Methods" : "Payment Methods")}
            {section === "notifications" && "Notifications"}
            {section === "security" && "Security & Privacy"}
            {section === "attributes" && "Physical Attributes"}
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

      <main id="main-content" className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── Main Settings Menu ── */}
          {section === "main" && (
            <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION_MED, ease: EASE_OUT }} exit={{ opacity: 0 }}>
              {/* Profile summary */}
              <div className="p-4 rounded-[var(--radius-xl)] flex items-center gap-4 mb-6" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-semibold text-xl font-body shrink-0" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold truncate" style={s.text}>
                    {isClient ? clientOrgName : name}
                  </div>
                  <div className="text-sm font-body truncate" style={s.secondary}>
                    {isClient ? clientEmail : email}
                  </div>
                  <div className="text-xs font-body mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)]" style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
                    <Shield className="w-3 h-3" /> {isClient ? "Verified Studio" : "Verified"}
                  </div>
                </div>
                <Button variant="secondary" className="h-9 px-4 text-xs shrink-0" onClick={() => setSection("profile")}>
                  Edit
                </Button>
              </div>

              {/* Settings sections */}
              <div className="text-xs font-medium uppercase tracking-wider mb-2 px-1 font-body" style={s.tertiary}>Account</div>
              <div className="rounded-[var(--radius-xl)] overflow-hidden mb-6" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
                {isClient ? (
                  <>
                    <ListItem label="Organization Profile" icon={Building} onClick={() => setSection("profile")} />
                    <ListItem label="Billing & Invoicing" icon={CreditCard} onClick={() => setSection("payment")} />
                    <ListItem label="Transaction History" icon={Receipt} onClick={() => navigate("/transactions")} />
                    <ListItem label="Project Briefs History" icon={Briefcase} onClick={() => navigate("/client")} />
                    <ListItem label="Notifications" icon={Bell} onClick={() => setSection("notifications")} />
                    <ListItem label="Security & Privacy" icon={Shield} onClick={() => setSection("security")} />
                  </>
                ) : (
                  <>
                    <ListItem label="Profile & Storefront" icon={User} onClick={() => setSection("profile")} />
                    <ListItem label="Physical Attributes" icon={Ruler} onClick={() => setSection("attributes")} />
                    <ListItem label="Payment Methods" icon={CreditCard} onClick={() => setSection("payment")} />
                    <ListItem label="Transaction History" icon={Receipt} onClick={() => navigate("/transactions")} />
                    <ListItem label="Notifications" icon={Bell} onClick={() => setSection("notifications")} />
                    <ListItem label="Security & Privacy" icon={Shield} onClick={() => setSection("security")} />
                  </>
                )}
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
                  <TOGGLE on={isDark} onToggle={toggle} label={isDark ? "Switch to light mode" : "Switch to dark mode"} />
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
              <div className="flex flex-col items-center py-2">
                <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-semibold text-2xl font-body" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <button
                    aria-label="Change profile photo"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                    style={{ background: "var(--color-accent)" }}
                  >
                    <Camera className="w-4 h-4" style={{ color: "var(--color-accent-on)" }} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-body mt-3 underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Change Profile Photo
                </button>
              </div>

              {isClient ? (
                <>
                  <FormField label="Organization / Studio Name">
                    <Input value={clientOrgName} onChange={e => setClientOrgName(e.target.value)} />
                  </FormField>
                  <FormField label="Primary Contact Person">
                    <Input value={clientName} onChange={e => setClientName(e.target.value)} />
                  </FormField>
                  <FormField label="Organization Type">
                    <select
                      value={clientOrgType}
                      onChange={e => setClientOrgType(e.target.value)}
                      className="w-full h-11 rounded-[var(--radius-lg)] border px-3 font-body text-sm"
                      style={{ ...s.elevated, color: "var(--color-text-primary)" }}
                    >
                      <option value="STUDIO">Studio</option>
                      <option value="BRAND">Brand Agency</option>
                      <option value="EVENT">Event Production</option>
                      <option value="CHURCH">Church / Non-Profit</option>
                    </select>
                  </FormField>
                  <FormField label="Email Address">
                    <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                  </FormField>
                  <FormField label="Location">
                    <Input value={clientLocation} onChange={e => setClientLocation(e.target.value)} />
                  </FormField>
                </>
              ) : (
                <>
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
                </>
              )}

              <Button className="w-full h-12" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save Changes"}
              </Button>
            </motion.div>
          )}

          {/* ── Physical Attributes (features.md Phase 12A.3, Talent Only) ── */}
          {section === "attributes" && !isClient && (
            <motion.div key="attributes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <p className="text-xs font-body leading-relaxed" style={s.secondary}>
                Every field below is optional — fill in only what you're comfortable
                sharing, any time. Each has its own visibility: <strong>Private</strong> (never
                shown), <strong>Searchable</strong> (matches a client's filter, value never shown),
                or <strong>Public</strong> (shown on your storefront).
              </p>

              {ATTRIBUTE_FIELDS.map((field) => (
                <FormField key={field.key as string} label={field.label}>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={field.label}
                      value={attrValues[field.key as string] ?? ""}
                      onChange={(e) => setAttrValues((prev) => ({ ...prev, [field.key as string]: e.target.value }))}
                      className="flex-1 h-11 rounded-[var(--radius-lg)] border px-3 font-body text-sm"
                      style={{ ...s.elevated, color: "var(--color-text-primary)" }}
                    >
                      <option value="">Not set</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <div className="flex rounded-[var(--radius-lg)] overflow-hidden border shrink-0" style={{ borderColor: "var(--color-hairline)" }}>
                      {VISIBILITY_LEVELS.map((level) => {
                        const active = (attrVisibility[field.key as string] ?? "SEARCHABLE") === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            aria-label={`${field.label} visibility: ${level}`}
                            aria-pressed={active}
                            disabled={!attrValues[field.key as string]}
                            onClick={() => setAttrVisibility((prev) => ({ ...prev, [field.key as string]: level }))}
                            className="px-2 h-11 text-[10px] font-semibold font-body uppercase tracking-wide disabled:opacity-30"
                            style={{
                              background: active ? "var(--color-accent)" : "var(--color-bg-elevated)",
                              color: active ? "var(--color-accent-on)" : "var(--color-text-tertiary)",
                            }}
                          >
                            {level[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </FormField>
              ))}

              <FormField label="Distinctive features (up to 120 characters)">
                <textarea
                  maxLength={120}
                  rows={2}
                  value={distinctiveFeatures}
                  onChange={(e) => setDistinctiveFeatures(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-body border resize-none"
                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                />
              </FormField>

              <label className="flex items-start gap-2.5 text-xs font-body cursor-pointer" style={s.secondary}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5"
                />
                I consent to storing this information under the visibility settings I've chosen above, and understand it's used for casting search filters only — never automated shortlisting or scoring.
              </label>

              <Button className="w-full h-12" onClick={handleSaveAttributes} disabled={savingAttributes || !consentChecked}>
                {savingAttributes ? "Saving…" : "Save Attributes"}
              </Button>

              {attributes && (
                <button
                  onClick={handleDeleteAttributes}
                  className="w-full h-11 text-sm font-body font-medium flex items-center justify-center gap-2"
                  style={{ color: "var(--color-error)" }}
                >
                  <Trash2 className="w-4 h-4" /> Delete all attribute data
                </button>
              )}
            </motion.div>
          )}

          {/* ── Payment / Billing Methods ── */}
          {section === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Payout Bank Account (Talent Only) */}
              {!isClient && (
                <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base font-semibold" style={s.text}>Payout Bank Account</h3>
                      <p className="text-xs font-body" style={s.tertiary}>Direct earnings withdrawal destination for your completed orders.</p>
                    </div>
                    <Badge tone="success" size="md">Verified</Badge>
                  </div>

                  <div className="space-y-3 pt-1">
                    <FormField label="Bank Name">
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full h-11 rounded-[var(--radius-lg)] border px-3 font-body text-sm"
                        style={{ ...s.elevated, color: "var(--color-text-primary)" }}
                      >
                        <option value="GTBank (Guaranty Trust Bank)">GTBank (Guaranty Trust Bank)</option>
                        <option value="Access Bank Plc">Access Bank Plc</option>
                        <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                        <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                        <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                        <option value="Kuda Bank">Kuda Bank</option>
                        <option value="Moniepoint Microfinance Bank">Moniepoint Microfinance Bank</option>
                        <option value="OPay">OPay</option>
                      </select>
                    </FormField>

                    <FormField label="Account Number">
                      <Input
                        value={accountNumber}
                        maxLength={10}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="font-mono tnum"
                        placeholder="0123456789"
                      />
                    </FormField>

                    <FormField label="Account Name">
                      <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="EMEKA JOHNSON"
                      />
                    </FormField>

                    <Button
                      className="w-full h-11 text-xs"
                      onClick={() => {
                        appStateSync.updateBankDetails({ bankName, accountNumber, accountName });
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      }}
                    >
                      {saved ? "Bank Details Saved! ✓" : "Save Payout Bank Account"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Saved Cards / Billing Methods */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-medium uppercase tracking-wider font-body" style={s.tertiary}>
                    {isClient ? "Saved Billing Cards" : "Saved Cards (Optional Backup)"}
                  </div>
                  <Button
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      const newCard = {
                        id: `card-${Date.now()}`,
                        type: "Visa",
                        last4: String(Math.floor(1000 + Math.random() * 9000)),
                        expiry: "12/28",
                        isDefault: false,
                      };
                      setPaymentCards((prev) => [...prev, newCard]);
                    }}
                  >
                    + Add Card
                  </Button>
                </div>

                {paymentCards.map((card) => (
                  <div key={card.id} className="p-4 rounded-xl flex items-center gap-3" style={s.surface}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                      <CreditCard className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold font-body" style={s.text}>{card.type} ···· {card.last4}</div>
                      <div className="text-xs font-body" style={s.tertiary}>Expires {card.expiry}</div>
                    </div>
                    {card.isDefault ? (
                      <Badge tone="success" size="md">Default</Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === card.id })));
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-md)] border hover:border-[var(--color-accent)] transition-all font-body"
                        style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${card.type} ending ${card.last4}`}
                      onClick={() => setDeleteCardModal({ id: card.id, type: card.type, last4: card.last4 })}
                      className="p-1 rounded hover:opacity-70 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: "var(--color-error)" }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delete Payment Method Confirmation Modal */}
              {deleteCardModal && (
                <Modal onClose={() => setDeleteCardModal(null)}>
                  <div className="w-full max-w-sm rounded-[var(--radius-xl)] p-6" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>Delete Payment Method</h3>
                      <button onClick={() => setDeleteCardModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-body mb-6" style={{ color: "var(--color-text-secondary)" }}>
                      Are you sure you want to remove <strong>{deleteCardModal.type} ending in {deleteCardModal.last4}</strong>? You will need to re-add this card for future transactions.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1 h-10 text-xs" onClick={() => setDeleteCardModal(null)}>Cancel</Button>
                      <Button
                        className="flex-1 h-10 text-xs"
                        style={{ background: "var(--color-error)", color: "#fff" }}
                        onClick={() => {
                          setPaymentCards((prev) => prev.filter((c) => c.id !== deleteCardModal.id));
                          setDeleteCardModal(null);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Modal>
              )}

              <button
                className="w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium font-body hover:border-[var(--color-accent)] hover:opacity-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                style={{ borderColor: "var(--color-hairline)", color: "var(--color-text-secondary)" }}
              >
                <Plus className="w-4 h-4" /> {isClient ? "Add Corporate Billing Card" : "Add Payment Method"}
              </button>

              {/* Bank / Payout account */}
              {!isClient && (
                <div className="rounded-2xl overflow-hidden" style={s.surface}>
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between mb-3 font-body">
                      <div className="text-xs font-medium uppercase tracking-wider" style={s.tertiary}>Payout Bank Account</div>
                      <Button variant="secondary" className="h-7 px-2.5 text-xs gap-1" onClick={() => setEditingBank(!editingBank)}>
                        <Edit2 className="w-3 h-3" /> {editingBank ? "Cancel" : "Edit"}
                      </Button>
                    </div>

                    {editingBank ? (
                      <div className="space-y-3 pt-1">
                        <FormField label="Bank Name">
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full h-11 rounded-[var(--radius-lg)] border px-3 font-body text-sm"
                            style={{ ...s.elevated, color: "var(--color-text-primary)" }}
                          >
                            <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                            <option value="Zenith Bank">Zenith Bank</option>
                            <option value="Access Bank">Access Bank</option>
                            <option value="First Bank">First Bank Nigeria</option>
                            <option value="Kuda Bank">Kuda Microfinance Bank</option>
                            <option value="OPay">OPay Digital Bank</option>
                            <option value="Palmpay">Palmpay</option>
                          </select>
                        </FormField>
                        <FormField label="Account Number (10 digits)">
                          <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} maxLength={10} />
                        </FormField>
                        <FormField label="Account Name">
                          <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                        </FormField>
                        <Button className="w-full h-10 text-xs mt-2" onClick={handleSaveBank}>
                          Save Bank Account
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-soft)" }}>
                          <Smartphone className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold font-body" style={s.text}>{bankDetails.bankName} ···· {bankDetails.accountNumber.slice(-4)}</div>
                          <div className="text-xs font-body" style={s.tertiary}>{bankDetails.accountName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Notifications ── */}
          {section === "notifications" && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                {(isClient ? [
                  { key: "bookings" as const, label: "New Project Applications", desc: "When talent applies to your posted briefs" },
                  { key: "messages" as const, label: "Order Room Messages", desc: "New messages from booked talent" },
                  { key: "payments" as const, label: "Escrow Receipts & Charges", desc: "Escrow lock and release confirmations" },
                  { key: "reminders" as const, label: "Project Milestones", desc: "Applicant caps and deliverable updates" },
                  { key: "marketing" as const, label: "Casting Tips & Product Updates", desc: "Platform features and talent highlights" },
                ] : [
                  { key: "bookings" as const, label: "New Booking Requests", desc: "When a client books one of your services" },
                  { key: "messages" as const, label: "Messages", desc: "New messages in your Order Rooms" },
                  { key: "payments" as const, label: "Payment Updates", desc: "Escrow releases, payouts, and payment confirmations" },
                  { key: "reminders" as const, label: "Deadline Reminders", desc: "Upcoming order deadlines and schedule alerts" },
                  { key: "marketing" as const, label: "Tips & Product Updates", desc: "Platform tips, new features, and newsletters" },
                ]).map((item, i, arr) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-4 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-hairline)" : undefined }}
                  >
                    <div className="flex-1 pr-4">
                      <div className="text-sm font-semibold font-body" style={s.text}>{item.label}</div>
                      <div className="text-xs font-body mt-0.5" style={s.tertiary}>{item.desc}</div>
                    </div>
                    <TOGGLE on={notif[item.key]} onToggle={() => setNotif(prev => ({ ...prev, [item.key]: !prev[item.key] }))} label={item.label} />
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

              {/* Security Withdrawal Passcode */}
              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                <div className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold font-body" style={s.text}>Security Withdrawal Passcode</div>
                      <div className="text-xs font-body" style={s.tertiary}>4-digit PIN required to authorise earnings withdrawals (separate from password)</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      type="password"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      className="w-36 font-mono text-center tracking-widest text-lg"
                      value={securityPasscode}
                      onChange={(e) => setSecurityPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 px-4 text-xs font-semibold"
                      disabled={securityPasscode.length !== 4}
                      onClick={() => {
                        localStorage.setItem("monologg_withdrawal_passcode", securityPasscode);
                        setPasscodeSaved(true);
                        setTimeout(() => setPasscodeSaved(false), 3000);
                      }}
                    >
                      {passcodeSaved ? "Passcode Saved ✓" : "Save Passcode"}
                    </Button>
                  </div>
                  {passcodeSaved && (
                    <div className="text-xs text-[var(--color-success)] font-body mt-2">Withdrawal security passcode updated successfully.</div>
                  )}
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
      </main>
    </div>
  );
}
