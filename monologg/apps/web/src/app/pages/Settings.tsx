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
import type { ServiceRateCard } from "@monologg/types";
import {
  ChevronLeft, User, CreditCard, Bell, Shield, LogOut, ChevronRight,
  Sun, Moon, Camera, Check, Smartphone, Trash2, Plus, Receipt, LifeBuoy, FileText, Ruler, Briefcase, Building, Edit2, X,
  MapPin, Share2, Play, DollarSign, CheckCircle2, ExternalLink, Instagram, Youtube, Twitter, Linkedin, Music,
  Building2, Info
} from "lucide-react";
import { UploadPerformanceReelModal } from "../components/UploadPerformanceReelModal";
import { WatchPerformanceReelModal } from "../components/WatchPerformanceReelModal";

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
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Role detection: query param ?role=client or fallback to client detection
  const roleParam = searchParams.get("role");
  const isClient = roleParam === "client";

  const [section, setSection] = useState<Section>("main");
  
  // Talent fields
  const [name, setName] = useState("Emeka Johnson");
  const [email, setEmail] = useState("emeka@example.com");
  const [stageTitle, setStageTitle] = useState("Actor & Voice Artist");
  const [niche, setNiche] = useState("actors");
  const [bio, setBio] = useState("Specializing in intense dramatic monologues, voice-overs, and Nollywood screen roles.");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [isAvailable, setIsAvailable] = useState(true);
  const [tags, setTags] = useState<string[]>(["Dramatic", "Voice-Over", "Commercial", "Nollywood", "Authoritative"]);
  const [newTag, setNewTag] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "emekajohnson",
    youtube: "emekaofficial",
    twitter: "emekaj",
    tiktok: "emekaacts",
    linkedin: "emeka-johnson",
    spotify: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPreset, setCoverPreset] = useState("crimson-studio");
  const [performanceReelUrl, setPerformanceReelUrl] = useState<string | null>(null);
  const [performanceReelTitle, setPerformanceReelTitle] = useState<string | null>("Featured Audition Reel");
  const [hasReel, setHasReel] = useState(true);
  const [services, setServices] = useState<ServiceRateCard[]>(() => appStateSync.getServices());

  // Interactive profile editor states
  const [isEditingProfile, setIsEditingProfile] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showUploadReelModal, setShowUploadReelModal] = useState(false);
  const [showWatchReelModal, setShowWatchReelModal] = useState(false);

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

  const getBannerBackground = () => {
    if (coverUrl) {
      return `url(${coverUrl}) center / cover no-repeat`;
    }
    switch (coverPreset) {
      case "noir-velvet":
        return "linear-gradient(135deg, #26262E 0%, #16161A 50%, #0D0D11 100%)";
      case "amber-gold":
        return "linear-gradient(135deg, #D97706 0%, #92400E 60%, #1F1305 100%)";
      case "electric-violet":
        return "linear-gradient(135deg, #7C3AED 0%, #4C1D95 60%, #140727 100%)";
      case "crimson-studio":
      default:
        return "linear-gradient(135deg, #E52E2E 0%, #991B1B 50%, #450A0A 100%)";
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      setCoverUrl(url);
      setCoverPreset("custom");
      appStateSync.updateTalentProfile({ coverUrl: url, coverPreset: "custom" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsDataURL(file);
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
        if (tState.stageTitle) setStageTitle(tState.stageTitle);
        if (tState.niche) setNiche(tState.niche.toLowerCase());
        setBio(tState.bio);
        setLocation(tState.location);
        if (tState.isAvailable !== undefined) setIsAvailable(tState.isAvailable);
        if (tState.tags) setTags(tState.tags);
        if (tState.socialLinks) setSocialLinks((prev) => ({ ...prev, ...tState.socialLinks }));
        if (tState.avatarUrl !== undefined) setAvatarUrl(tState.avatarUrl);
        if (tState.coverUrl !== undefined) setCoverUrl(tState.coverUrl);
        if (tState.coverPreset) setCoverPreset(tState.coverPreset);
        if (tState.performanceReelUrl !== undefined) setPerformanceReelUrl(tState.performanceReelUrl);
        if (tState.performanceReelTitle !== undefined) setPerformanceReelTitle(tState.performanceReelTitle);
        if (tState.hasReel !== undefined) setHasReel(tState.hasReel);
        const storedServices = appStateSync.getServices();
        if (storedServices) setServices(storedServices);
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
        if (cp.avatarUrl) setAvatarUrl(cp.avatarUrl);
      }).catch(() => {});
    } else {
      apiClient.getCreatorProfile().then((profile) => {
        setName(profile.name);
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
      }).catch(() => {});
      apiClient.listServices().then((srvs) => {
        if (srvs && srvs.length > 0) setServices(srvs.slice(0, 2));
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
        appStateSync.updateTalentProfile({
          name: updated.name,
          email,
          stageTitle,
          niche,
          bio: updated.bio ?? "",
          location: updated.location ?? "",
          isAvailable,
          tags,
          socialLinks,
          avatarUrl,
          coverUrl,
          coverPreset,
          performanceReelUrl,
          performanceReelTitle,
          hasReel,
        });
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
    setBankDetails({ bankName, accountNumber, accountName });
    setEditingBank(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionBack = () => setSection("main");

  const effectiveServices: ServiceRateCard[] = services && services.length > 0 ? services : [
    {
      id: "srv-default-1",
      title: "Commercial Voice-Over (up to 60s)",
      price: "₦35,000",
      delivery: "24 Hours",
      bookings: 14,
    },
    {
      id: "srv-default-2",
      title: "Dramatic Video Audition Reel Monologue",
      price: "₦65,000",
      delivery: "48 Hours",
      bookings: 8,
    },
  ];

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
      {/* Hidden file inputs for avatar & cover photo upload */}
      <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" className="hidden" />
      <input type="file" ref={coverFileInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />

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
            {section === "payment" && (isClient ? "Billing & Payment Methods" : "Payment details")}
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

      <main id="main-content" className={`flex-1 px-4 py-5 w-full ${section === "profile" && !isClient ? "max-w-4xl mx-auto" : "max-w-lg mx-auto"}`}>
        <AnimatePresence mode="wait">

          {/* ── Main Settings Menu ── */}
          {section === "main" && (
            <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION_MED, ease: EASE_OUT }} exit={{ opacity: 0 }}>
              {/* Profile summary */}
              <div
                className="p-4 rounded-[var(--radius-xl)] flex items-center gap-4 mb-6 cursor-pointer hover:border-zinc-300 transition-all"
                style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}
                onClick={() => setSection("profile")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSection("profile"); } }}
              >
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
                </div>
                {/* Verified badge placed prominently on the right where Edit was */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
                  style={{
                    background: "var(--color-success-bg)",
                    color: "var(--color-success)",
                    border: "1px solid color-mix(in srgb, var(--color-success) 25%, transparent)",
                  }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isClient ? "Verified Studio" : "Verified"}</span>
                </div>
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
                    <ListItem label="Profile" icon={User} onClick={() => setSection("profile")} />
                    <ListItem label="Physical Attributes" icon={Ruler} onClick={() => setSection("attributes")} />
                    <ListItem label="Payment details" icon={CreditCard} onClick={() => setSection("payment")} />
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

          {/* ── Profile (Full Performer Profile Storefront in Editable Format) ── */}
          {section === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {isClient ? (
                <div className="space-y-5">
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
                      className="w-full h-[54px] rounded-[var(--radius-lg)] border px-4 font-body text-base"
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

                  <Button className="w-full h-12 font-semibold" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Action & Mode Bar */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border"
                    style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant={isEditingProfile ? "primary" : "secondary"}
                        className="h-9 px-3.5 text-xs gap-2 font-semibold"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {isEditingProfile ? "Preview Mode" : "Edit Profile"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-9 px-3.5 text-xs gap-2 font-semibold"
                        onClick={() => setShowShare(true)}
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share Profile
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-9 px-3.5 text-xs gap-2 font-semibold hidden sm:inline-flex"
                        onClick={() => navigate("/storefront/emeka")}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Public Storefront
                      </Button>
                    </div>
                    <Button
                      className="h-9 px-4 text-xs gap-1.5 font-semibold"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {savingProfile ? "Saving…" : "Save Profile"}
                    </Button>
                  </div>

                  {/* ── Rich Performer Profile Card ── */}
                  <div
                    className="rounded-[28px] overflow-hidden border shadow-sm transition-all"
                    style={{
                      background: "var(--color-bg-surface)",
                      borderColor: "var(--color-border-default)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {/* Hero Cover Banner */}
                    <div
                      className="h-44 sm:h-56 w-full relative transition-all group overflow-hidden"
                      style={{
                        background: getBannerBackground(),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/15 transition-opacity group-hover:bg-black/25" />
                      
                      {/* Change Cover Button */}
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="absolute top-4 right-4 h-9 px-3.5 rounded-full text-xs font-semibold flex items-center gap-2 backdrop-blur-md bg-black/50 hover:bg-black/75 text-white border border-white/20 transition-all shadow-md active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Change Cover</span>
                      </button>
                    </div>

                    {/* Main Profile Info Section */}
                    <div className="px-6 pb-8">
                      {/* Avatar & Badges Header */}
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
                        <div className="flex items-end gap-4">
                          <div
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 overflow-hidden shrink-0 shadow-lg relative group cursor-pointer"
                            style={{
                              borderColor: "var(--color-bg-surface)",
                              background: "var(--color-accent-soft)",
                              color: "var(--color-accent)",
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to change profile photo"
                          >
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-display font-bold text-2xl sm:text-3xl">
                                {initials}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          <div className="pb-1">
                            <Badge tone="success" className="border border-[var(--color-success)] gap-1">
                              <Shield className="w-3 h-3" /> Verified Performer
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant={isEditingProfile ? "primary" : "secondary"}
                            size="sm"
                            className="gap-2 text-xs h-9"
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                          >
                            <Edit2 className="w-3.5 h-3.5" /> {isEditingProfile ? "Preview Profile" : "Edit Profile"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 text-xs h-9"
                            onClick={() => setShowShare(true)}
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </Button>
                        </div>
                      </div>

                      {/* Performer Name & Title */}
                      <div className="mb-4">
                        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
                          {name || "Emeka Johnson"}
                        </h2>
                        <p className="text-sm font-body flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                          <span>{stageTitle || "Actor & Voice Artist"}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 opacity-60" /> {location || "Lagos, Nigeria"}
                          </span>
                        </p>
                      </div>

                      {/* Availability Status Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        {isAvailable !== false ? (
                          <>
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--color-success)" }}></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "var(--color-success)" }}></span>
                            </span>
                            <span className="text-xs font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                              Available for bookings &amp; casting
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                            <span className="text-xs font-semibold font-body text-amber-600 dark:text-amber-400">
                              Booked / Unavailable
                            </span>
                          </>
                        )}
                      </div>

                      {/* Social Media Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-6 pt-1">
                        {socialLinks?.instagram && (
                          <a
                            href={`https://instagram.com/${socialLinks.instagram.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#E1306C] hover:text-[#E1306C]"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            <span>@{socialLinks.instagram.replace(/^@/, "")}</span>
                          </a>
                        )}
                        {socialLinks?.youtube && (
                          <a
                            href={`https://youtube.com/@${socialLinks.youtube.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#FF0000] hover:text-[#FF0000]"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <Youtube className="w-3.5 h-3.5" />
                            <span>@{socialLinks.youtube.replace(/^@/, "")}</span>
                          </a>
                        )}
                        {socialLinks?.tiktok && (
                          <a
                            href={`https://tiktok.com/@${socialLinks.tiktok.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-black dark:hover:border-white"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 0 0 0 10.79 4.54V11.8a8.3 8.3 0 0 0 5.66 2.19V10.5a4.88 4.88 0 0 1-3.03-3.81z"/>
                            </svg>
                            <span>@{socialLinks.tiktok.replace(/^@/, "")}</span>
                          </a>
                        )}
                        {socialLinks?.twitter && (
                          <a
                            href={`https://x.com/${socialLinks.twitter.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <Twitter className="w-3.5 h-3.5" />
                            <span>@{socialLinks.twitter.replace(/^@/, "")}</span>
                          </a>
                        )}
                        {socialLinks?.linkedin && (
                          <a
                            href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#0A66C2] hover:text-[#0A66C2]"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {socialLinks?.spotify && (
                          <a
                            href={socialLinks.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#1DB954] hover:text-[#1DB954]"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <Music className="w-3.5 h-3.5" />
                            <span>Spotify</span>
                          </a>
                        )}
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-dashed border-[var(--color-hairline)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Social
                        </button>
                      </div>

                      {/* ── IN-PAGE PROFILE EDIT MODE ── */}
                      {isEditingProfile && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 rounded-[24px] border mb-8 space-y-6"
                          style={{
                            background: "var(--color-bg-elevated)",
                            borderColor: "var(--color-border-default)",
                          }}
                        >
                          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                            <div>
                              <h3 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                Edit Profile Details
                              </h3>
                              <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                                Changes saved here automatically update your profile and sync with settings.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Save Profile
                              </Button>
                            </div>
                          </div>

                          {/* Basic Info Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                                Performer Name
                              </label>
                              <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Stage Name or Full Name"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                                Stage Title / Primary Craft
                              </label>
                              <Input
                                value={stageTitle}
                                onChange={(e) => setStageTitle(e.target.value)}
                                placeholder="e.g. Actor & Voice Artist"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                                Location
                              </label>
                              <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, Nigeria"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                                Availability Status
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsAvailable(true)}
                                  className={`flex-1 h-11 rounded-[var(--radius-md)] border text-xs font-semibold font-body flex items-center justify-center gap-1.5 transition-all ${
                                    isAvailable
                                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]"
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAvailable(false)}
                                  className={`flex-1 h-11 rounded-[var(--radius-md)] border text-xs font-semibold font-body flex items-center justify-center gap-1.5 transition-all ${
                                    !isAvailable
                                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]"
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Booked
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Bio Field */}
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Performer Bio &amp; Summary
                            </label>
                            <textarea
                              rows={4}
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Describe your training, performance styles, notable credits, and vocal qualities..."
                              className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm font-body border resize-none outline-none focus:border-[var(--color-accent)]"
                              style={{
                                background: "var(--color-bg-surface)",
                                borderColor: "var(--color-border-default)",
                                color: "var(--color-text-primary)",
                              }}
                            />
                          </div>

                          {/* Profile Tags Editor */}
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Profile Tags &amp; Specialties
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-[var(--color-bg-surface)] border-[var(--color-border-default)]"
                                >
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 max-w-sm">
                              <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a new tag (e.g. Igbo Accent, Improvisation)"
                                className="h-9 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && newTag.trim()) {
                                    e.preventDefault();
                                    if (!tags.includes(newTag.trim())) {
                                      setTags([...tags, newTag.trim()]);
                                    }
                                    setNewTag("");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-9 text-xs"
                                onClick={() => {
                                  if (newTag.trim() && !tags.includes(newTag.trim())) {
                                    setTags([...tags, newTag.trim()]);
                                    setNewTag("");
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Social Media Links Inputs */}
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Social Media &amp; Portfolios (Linktree style)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#E1306C]">IG</span>
                                <Input
                                  value={socialLinks.instagram || ""}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                  placeholder="Instagram handle (e.g. emeka_acts)"
                                  className="pl-10 text-xs"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF0000]">YT</span>
                                <Input
                                  value={socialLinks.youtube || ""}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                                  placeholder="YouTube channel handle"
                                  className="pl-10 text-xs"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-primary)]">TT</span>
                                <Input
                                  value={socialLinks.tiktok || ""}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                                  placeholder="TikTok handle"
                                  className="pl-10 text-xs"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1DA1F2]">X</span>
                                <Input
                                  value={socialLinks.twitter || ""}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                  placeholder="X (Twitter) handle"
                                  className="pl-10 text-xs"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0A66C2]">IN</span>
                                <Input
                                  value={socialLinks.linkedin || ""}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                  placeholder="LinkedIn profile slug"
                                  className="pl-10 text-xs"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1DB954]">SP</span>
                                <Input
                                  value={socialLinks.spotify || ""}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, spotify: e.target.value })}
                                  placeholder="Spotify or audio artist URL"
                                  className="pl-10 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Banner Style Presets */}
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Banner Theme Presets
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                              {[
                                { id: "crimson-studio", name: "Crimson Studio", color: "from-[#E52E2E] to-[#450A0A]" },
                                { id: "noir-velvet", name: "Noir Velvet", color: "from-[#26262E] to-[#0D0D11]" },
                                { id: "amber-gold", name: "Amber Gold", color: "from-[#D97706] to-[#1F1305]" },
                                { id: "electric-violet", name: "Velvet Plum", color: "from-[#7C3AED] to-[#140727]" },
                              ].map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    setCoverPreset(preset.id);
                                    setCoverUrl(null);
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
                                    coverPreset === preset.id && !coverUrl
                                      ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 text-[var(--color-text-primary)]"
                                      : "border-[var(--color-border-default)] text-[var(--color-text-secondary)]"
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${preset.color}`} />
                                  <span>{preset.name}</span>
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => coverFileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-[var(--color-border-default)] hover:border-[var(--color-accent)] flex items-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" /> Upload Custom Banner
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                            <Button variant="secondary" onClick={() => setIsEditingProfile(false)}>
                              Done Editing
                            </Button>
                            <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
                              <Check className="w-4 h-4" /> Save Profile
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Tags List */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag) => (
                          <Badge key={tag} tone="neutral" size="lg">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Bio Section */}
                      {bio && bio.trim() && !bio.toLowerCase().includes("no bio") ? (
                        <div className="mb-8">
                          <h3 className="text-sm font-semibold font-body mb-2" style={{ color: "var(--color-text-primary)" }}>
                            About the Performer
                          </h3>
                          <p className="text-sm font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                            {bio}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-[var(--radius-lg)] mb-8 border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">No Bio Added Yet</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              Write a compelling summary of your craft, training, and vocal range to complete your profile.
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            className="h-8 text-xs shrink-0"
                            onClick={() => setIsEditingProfile(true)}
                          >
                            Add Bio
                          </Button>
                        </div>
                      )}

                      {/* Featured Performance Reel */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                            Featured Performance Reel
                          </h3>
                          <button
                            onClick={() => setShowUploadReelModal(true)}
                            className="text-xs font-semibold hover:underline flex items-center gap-1"
                            style={{ color: "var(--color-accent)" }}
                          >
                            <Play className="w-3 h-3" /> Replace Reel
                          </button>
                        </div>

                        <div
                          className="relative h-48 sm:h-56 md:h-60 w-full rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer border shadow-sm"
                          style={{
                            background: "var(--color-bg-elevated)",
                            borderColor: "var(--color-border-default)",
                          }}
                          onClick={() => setShowWatchReelModal(true)}
                        >
                          <img
                            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&fit=crop"
                            alt="Reel"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center pl-1 shadow-xl transition-transform group-hover:scale-110"
                              style={{ background: "var(--color-accent)" }}
                            >
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
                            {performanceReelTitle || "Featured Audition Reel"}
                          </div>
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded font-mono text-xs text-white bg-black/60 backdrop-blur-md">
                            01:30
                          </div>
                        </div>
                      </div>

                      {/* Rate Cards */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                            Rate Cards
                          </h3>
                          <button
                            onClick={() => navigate("/talent")}
                            className="text-xs font-semibold hover:underline flex items-center gap-1"
                            style={{ color: "var(--color-accent)" }}
                          >
                            Manage on Dashboard <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {effectiveServices.map((service) => (
                            <div
                              key={service.id}
                              className="p-4 rounded-[var(--radius-lg)] border flex flex-col justify-between transition-all hover:shadow-md"
                              style={{
                                background: "var(--color-bg-elevated)",
                                borderColor: "var(--color-border-default)",
                                borderLeft: "3px solid var(--color-accent)",
                              }}
                            >
                              <div>
                                <div className="flex justify-between items-start mb-1.5">
                                  <span className="text-sm font-bold font-body" style={{ color: "var(--color-text-primary)" }}>
                                    {service.title}
                                  </span>
                                </div>
                                <div className="text-xs font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>
                                  Delivery: {service.delivery}
                                </div>
                              </div>
                              <div className="pt-3 border-t flex items-baseline justify-between" style={{ borderColor: "var(--color-hairline)" }}>
                                <span className="text-[11px] uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Base Rate
                                </span>
                                <span className="font-display text-lg font-bold" style={{ color: "var(--color-accent)" }}>
                                  {service.price}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Save Button */}
                  <Button
                    className="w-full h-12 text-sm font-semibold"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Physical Attributes (features.md Phase 12A.3, Talent Only) ── */}
          {section === "attributes" && !isClient && (
            <motion.div key="attributes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <p className="text-xs font-body leading-relaxed" style={s.secondary}>
                Every field below is optional — fill in only what you're comfortable
                sharing, any time. Each has its own visibility: <strong>Private</strong> (never
                shown), <strong>Searchable</strong> (matches a client's filter, value never shown),
                or <strong>Public</strong> (shown on your profile).
              </p>

              {ATTRIBUTE_FIELDS.map((field) => (
                <FormField key={field.key as string} label={field.label}>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={field.label}
                      value={attrValues[field.key as string] ?? ""}
                      onChange={(e) => setAttrValues((prev) => ({ ...prev, [field.key as string]: e.target.value }))}
                      className="flex-1 h-[54px] rounded-[var(--radius-lg)] border px-4 font-body text-base"
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
              {/* Payout Bank Account (Performer Only) */}
              {!isClient && (
                <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] space-y-4">
                  <div>
                    <h3 className="font-display text-base font-semibold" style={s.text}>Payout Bank Account</h3>
                    <p className="text-xs font-body mt-0.5" style={s.tertiary}>Direct earnings withdrawal destination for your completed orders.</p>
                  </div>

                  {/* Operational Rule Notice (Visible both before and after) */}
                  <div
                    className="p-3.5 rounded-[var(--radius-lg)] flex items-start gap-2.5 text-xs font-body leading-relaxed"
                    style={{
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border-subtle)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                    <div>
                      <span className="font-semibold block mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                        One Payout Bank Account
                      </span>
                      You can only have one payout bank. This is how Monologg operates — all earnings withdrawals from your completed orders and milestones are routed directly to this single verified account.
                    </div>
                  </div>

                  {editingBank ? (
                    /* BEFORE: Setup / Edit Form */
                    <div className="space-y-3 pt-1">
                      <FormField label="Bank Name">
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full h-[54px] rounded-[var(--radius-lg)] border px-4 font-body text-base"
                          style={{ ...s.elevated, color: "var(--color-text-primary)" }}
                        >
                          <option value="Access Bank Plc">Access Bank Plc</option>
                          <option value="GTBank (Guaranty Trust Bank)">GTBank (Guaranty Trust Bank)</option>
                          <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                          <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                          <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                          <option value="Kuda Bank">Kuda Bank</option>
                          <option value="Moniepoint Microfinance Bank">Moniepoint Microfinance Bank</option>
                          <option value="OPay">OPay</option>
                          <option value="Palmpay">Palmpay</option>
                          <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                          <option value="Sterling Bank">Sterling Bank</option>
                          <option value="Fidelity Bank">Fidelity Bank</option>
                        </select>
                      </FormField>

                      <FormField label="Account Number (10 digits)">
                        <Input
                          value={accountNumber}
                          maxLength={10}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="font-mono tnum"
                          placeholder="9876543210"
                        />
                      </FormField>

                      <FormField label="Account Name">
                        <Input
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="EMEKA JOHNSON"
                        />
                      </FormField>

                      {/* Security Memo (Before save) */}
                      <div
                        className="p-3.5 rounded-[var(--radius-lg)] flex items-start gap-2.5 text-xs font-body leading-relaxed"
                        style={{
                          background: "color-mix(in srgb, var(--color-accent) 6%, var(--color-bg-surface))",
                          border: "1px solid color-mix(in srgb, var(--color-accent) 22%, transparent)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                        <div>
                          <span className="font-semibold block mb-0.5" style={{ color: "var(--color-accent)" }}>
                            Security Memo
                          </span>
                          You can change your bank account after 48hrs. Once updated, your payout destination is locked for 48 hours to protect your funds.
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        {bankDetails.accountNumber && (
                          <Button
                            variant="secondary"
                            className="flex-1 h-11 text-xs"
                            onClick={() => {
                              setEditingBank(false);
                              setBankName(bankDetails.bankName);
                              setAccountNumber(bankDetails.accountNumber);
                              setAccountName(bankDetails.accountName);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          className={`${bankDetails.accountNumber ? "flex-1" : "w-full"} h-11 text-xs`}
                          disabled={accountNumber.length !== 10 || !accountName.trim()}
                          onClick={() => {
                            appStateSync.updateBankDetails({ bankName, accountNumber, accountName });
                            setBankDetails({ bankName, accountNumber, accountName });
                            setEditingBank(false);
                            setSaved(true);
                            setTimeout(() => setSaved(false), 2000);
                          }}
                        >
                          {saved ? "Bank Details Saved! ✓" : "Save Payout Bank Account"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* AFTER: Saved / Active State */
                    <div className="space-y-4 pt-1">
                      <div
                        className="p-4 rounded-[var(--radius-lg)] flex items-center justify-between gap-3"
                        style={{
                          background: "var(--color-bg-elevated)",
                          border: "1px solid var(--color-border-subtle)",
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "var(--color-accent-soft)" }}
                          >
                            <Building2 className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold font-body truncate" style={s.text}>
                              {bankDetails.bankName} ···· {bankDetails.accountNumber.slice(-4)}
                            </div>
                            <div className="text-xs font-body font-medium truncate" style={s.secondary}>
                              {bankDetails.accountName || "Account Holder"}
                            </div>
                            <div className="text-[11px] font-mono mt-0.5" style={s.tertiary}>
                              Account Number: {bankDetails.accountNumber}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Memo (After save) */}
                      <div
                        className="p-3.5 rounded-[var(--radius-lg)] flex items-start gap-2.5 text-xs font-body leading-relaxed"
                        style={{
                          background: "color-mix(in srgb, var(--color-accent) 6%, var(--color-bg-surface))",
                          border: "1px solid color-mix(in srgb, var(--color-accent) 22%, transparent)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                        <div>
                          <span className="font-semibold block mb-0.5" style={{ color: "var(--color-accent)" }}>
                            Security Memo
                          </span>
                          You can change your bank account after 48hrs. Any change locks bank modifications for 48 hours to protect your funds.
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        className="w-full h-11 text-xs font-medium gap-2"
                        onClick={() => {
                          setEditingBank(true);
                          setBankName(bankDetails.bankName || "Access Bank Plc");
                          setAccountNumber(bankDetails.accountNumber || "");
                          setAccountName(bankDetails.accountName || "");
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Change Bank Account
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Saved Cards / Billing Methods (Clients Only) */}
              {isClient && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="text-xs font-medium uppercase tracking-wider font-body" style={s.tertiary}>
                        Saved Billing Cards
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
                    <Plus className="w-4 h-4" /> Add Corporate Billing Card
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* ── Notifications ── */}
          {section === "notifications" && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={s.surface}>
                {(isClient ? [
                  { key: "bookings" as const, label: "New Project Applications", desc: "When performers apply to your posted briefs" },
                  { key: "messages" as const, label: "Order Room Messages", desc: "New messages from booked performers" },
                  { key: "payments" as const, label: "Escrow Receipts & Charges", desc: "Escrow lock and release confirmations" },
                  { key: "reminders" as const, label: "Project Milestones", desc: "Applicant caps and deliverable updates" },
                  { key: "marketing" as const, label: "Casting Tips & Product Updates", desc: "Platform features and performer highlights" },
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

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <Modal onClose={() => setShowShare(false)}>
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="w-full max-w-sm rounded-[var(--radius-xl)] p-6"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Share Profile</h3>
                <button
                  onClick={() => setShowShare(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80"
                  style={{ background: "var(--color-bg-elevated)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-body mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Share your public Monologg talent profile with casting directors and clients.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-xl mb-4 border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                <div className="text-xs font-mono truncate flex-1 pl-2" style={{ color: "var(--color-text-primary)" }}>
                  monologg.co/emeka-johnson
                </div>
                <Button
                  variant="secondary"
                  className="h-8 px-3 text-xs shrink-0"
                  onClick={() => {
                    const url = `${window.location.origin}/storefront/emeka`;
                    navigator.clipboard?.writeText(url);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  }}
                >
                  Copy Link
                </Button>
              </div>
              <div className="mb-4">
                <Button
                  className="w-full h-10 text-xs font-semibold gap-2"
                  onClick={() => navigate("/storefront/emeka")}
                >
                  Open Public Storefront <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" className="h-9 text-xs" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.origin + "/storefront/emeka")}`)}>WhatsApp</Button>
                <Button variant="secondary" className="h-9 text-xs" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + "/storefront/emeka")}`)}>Twitter</Button>
                <Button variant="secondary" className="h-9 text-xs" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/storefront/emeka")}`)}>LinkedIn</Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <UploadPerformanceReelModal
        isOpen={showUploadReelModal}
        onClose={() => setShowUploadReelModal(false)}
        currentReelUrl={performanceReelUrl}
        onUploadSuccess={(url, title) => {
          setHasReel(true);
          setPerformanceReelUrl(url);
          if (title) setPerformanceReelTitle(title);
          appStateSync.updateTalentProfile({
            hasReel: true,
            performanceReelUrl: url,
            performanceReelTitle: title,
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      />

      <WatchPerformanceReelModal
        isOpen={showWatchReelModal}
        onClose={() => setShowWatchReelModal(false)}
        videoUrl={performanceReelUrl}
        title={performanceReelTitle || "Featured Audition Reel"}
        canUpload={true}
        onOpenUpload={() => setShowUploadReelModal(true)}
      />
    </div>
  );
}
