import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { EASE_OUT } from "../../lib/motionTokens";
import { Sidebar, type SidebarNavItem } from "../components/ui/Sidebar";
import { BottomNav } from "../components/ui/BottomNav";
import { apiClient, type TalentFilters } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import type { Applicant, ClientProject, Order, PublicRateCard, StatMetric, Talent } from "@monologg/types";
import {
  Home, Search, Briefcase, MessageSquare, Bell,
  Plus, Star, Shield, Filter, Users,
  ChevronRight, Play, X, Check, AlertCircle, TrendingUp
} from "lucide-react";

// features.md Phase 14 (PWA-17) — the same fixed-hour slot-picker pattern
// Checkout.tsx uses for booking a real, server-verified open slot; small
// enough (and stable enough) that duplicating it here beats importing across
// a page-to-page boundary, the same tradeoff routes/talent.ts documents for
// its own small enum duplication.
const APPLICANT_STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};
const CANDIDATE_SLOT_HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const SLOT_DURATION_MIN = 60;
function toTimeStr(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function addMinutes(time: string, minutes: number): string {
  return toTimeStr(minutesOf(time) + minutes);
}

type Tab = "home" | "discover" | "projects" | "orders" | "shortlist" | "activity" | "analytics";

// Filter option list — UI configuration, not domain data; stays local
// (see apps/web/src/lib/api-client.ts doc comment for the mock-data boundary).
const NICHES = ["All", "Actor", "Voice-Over", "Comedian", "Compere", "Speaker", "Content Creator"];

// features.md Phase 12A.3 — PWA-10 attribute filters. Chip multi-selects
// (spec's own words) collapse to single-select here: the search rule is an
// AND across active filters (routes/talent.ts), and true multi-value-per-field
// OR-within-a-field filtering isn't something the backend's current query
// shape supports — a real "multi-select" would need an `in: [...]` clause per
// field, which is a bigger backend change than this UI pass. Flagged, not
// silently narrowed.
const ATTRIBUTE_FILTER_FIELDS: Array<{ key: keyof TalentFilters; label: string; options: string[] }> = [
  { key: "heightRange", label: "Height", options: ["UNDER_150CM", "CM_150_160", "CM_160_170", "CM_170_180", "CM_180_190", "OVER_190CM"] },
  { key: "build", label: "Build", options: ["SLIM", "ATHLETIC", "AVERAGE", "CURVY", "PLUS_SIZE", "MUSCULAR"] },
  { key: "complexion", label: "Complexion", options: ["FAIR", "LIGHT", "MEDIUM", "TAN", "DARK", "DEEP"] },
  { key: "hairColor", label: "Hair", options: ["BLACK", "BROWN", "BLONDE", "RED", "GREY", "WHITE", "DYED_OTHER"] },
  { key: "genderPresentation", label: "Presentation", options: ["MASCULINE", "FEMININE", "ANDROGYNOUS", "NON_BINARY"] },
];

const CLIENT_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "discover", label: "Find Talent", icon: Search },
  { id: "projects", label: "My Projects", icon: Briefcase },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "shortlist", label: "Shortlist", icon: Star },
  { id: "activity", label: "Activity", icon: AlertCircle },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

const CLIENT_BOTTOM_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Find", icon: Search },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "shortlist", label: "Saved", icon: Star },
];

interface ClientNotificationItem {
  id: string;
  kind: string;
  createdAt: string;
  readAt?: string;
  payload: Record<string, any>;
}

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [clientProfile, setClientProfile] = useState(() => appStateSync.getClientProfile());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [stats, setStats] = useState<StatMetric[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAttributeFilters, setShowAttributeFilters] = useState(false);
  const [showMoreFiltersModal, setShowMoreFiltersModal] = useState(false);
  const [attributeFilters, setAttributeFilters] = useState<TalentFilters>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<ClientNotificationItem[]>(() => appStateSync.getNotifications());
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ClientProject | null>(null);
  const [isEditingProjectInfo, setIsEditingProjectInfo] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [editedProjectBudget, setEditedProjectBudget] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<"all" | "project" | "application" | "payment" | "message">("all");
  const [activity] = useState([
    { id: "act-1", type: "project", title: "Project Posted", desc: "Nike Q1 Campaign brief created", time: "10m ago", refId: "P-001" },
    { id: "act-2", type: "application", title: "New Application", desc: "Adaeze Obi applied to Tech Summit Compere", time: "1h ago", refId: "P-002" },
    { id: "act-3", type: "payment", title: "Escrow Locked", desc: "₦120,000 locked securely for Nike Campaign VO", time: "2d ago", refId: "ORD-001" },
    { id: "act-4", type: "message", title: "New Message", desc: "Emeka Johnson uploaded script audio file", time: "3d ago", refId: "ORD-001" },
  ]);
  const currentUser = appStateSync.getLoggedInUser();
  const [isNewUser, setIsNewUser] = useState(() => currentUser ? (currentUser.isNewUser ?? false) : false);

  const effectiveProjects = isNewUser ? [] : projects;
  const effectiveOrders = isNewUser ? [] : orders;
  const effectiveShortlist = isNewUser ? [] : shortlist;
  const effectiveActivity = isNewUser ? [] : activity;
  const effectiveStats = isNewUser
    ? [
        { label: "Total Spent", value: "₦0" },
        { label: "Active Projects", value: "0" },
        { label: "Talent Hired", value: "0" },
        { label: "Applicants", value: "0" },
      ]
    : stats;
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => {
      setClientProfile(appStateSync.getClientProfile());
      apiClient.listClientProjects().then(setProjects);
      setNotifications(appStateSync.getNotifications());
    };
    const unsub = appStateSync.subscribe(sync);
    apiClient.getClientStats().then(setStats);
    apiClient.listClientProjects().then(setProjects);
    apiClient.listClientOrders().then(setOrders);
    apiClient.getShortlistedTalentIds().then(setShortlist);
    return unsub;
  }, []);

  // features.md Phase 14 (PWA-17) — applicant management.
  const [applicantsProject, setApplicantsProject] = useState<ClientProject | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantActionError, setApplicantActionError] = useState<string | null>(null);
  const [selectingApplicationId, setSelectingApplicationId] = useState<string | null>(null);
  const [selectRateCards, setSelectRateCards] = useState<PublicRateCard[]>([]);
  const [selectRateCardId, setSelectRateCardId] = useState("");
  const [selectDate, setSelectDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectOpenSlots, setSelectOpenSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectSlotStart, setSelectSlotStart] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  const openProjectDetail = (project: ClientProject) => {
    setSelectedProjectDetail(project);
    setEditedProjectName(project.name);
    setEditedProjectBudget(project.budget);
    setIsEditingProjectInfo(false);
    setApplicantsProject(project);
    setApplicantActionError(null);
    setLoadingApplicants(true);
    apiClient.listApplicants(project.id).then((list) => {
      setApplicants(list);
      setLoadingApplicants(false);
    });
  };

  const refreshApplicants = () => {
    if (!applicantsProject) return;
    apiClient.listApplicants(applicantsProject.id).then(setApplicants);
    apiClient.listClientProjects().then(setProjects);
  };

  const handleShortlist = async (applicationId: string) => {
    setApplicantActionError(null);
    await apiClient.shortlistApplicant(applicationId);
    refreshApplicants();
  };

  const handleRejectApplicant = async (applicationId: string) => {
    setApplicantActionError(null);
    await apiClient.rejectApplicant(applicationId);
    refreshApplicants();
  };

  const openSelectFlow = (applicant: Applicant) => {
    setSelectingApplicationId(applicant.applicationId);
    setSelectRateCardId("");
    setSelectSlotStart(null);
    setApplicantActionError(null);
    apiClient.getCreatorRateCardsPublic(applicant.creator.id).then((cards) => {
      setSelectRateCards(cards);
      if (cards.length === 1) setSelectRateCardId(cards[0].id);
    });
  };

  useEffect(() => {
    if (!selectingApplicationId) return;
    const applicant = applicants.find((a) => a.applicationId === selectingApplicationId);
    if (!applicant) return;
    setSelectSlotStart(null);
    apiClient.getOpenSlots(applicant.creator.id, selectDate).then(setSelectOpenSlots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectingApplicationId, selectDate]);

  const selectSlotFits = (start: string): boolean => {
    const end = addMinutes(start, SLOT_DURATION_MIN);
    return selectOpenSlots.some((o) => o.start <= start && o.end >= end);
  };

  const handleConfirmSelect = async () => {
    if (!selectingApplicationId || !selectRateCardId || !selectSlotStart) return;
    setSelecting(true);
    setApplicantActionError(null);
    try {
      await apiClient.selectApplicant(selectingApplicationId, {
        rateCardId: selectRateCardId,
        slotDate: selectDate,
        slotStart: selectSlotStart,
        slotEnd: addMinutes(selectSlotStart, SLOT_DURATION_MIN),
      });
      setSelectingApplicationId(null);
      refreshApplicants();
    } catch {
      setApplicantActionError("That slot was just taken, or this application can no longer be selected — please try again.");
    } finally {
      setSelecting(false);
    }
  };

  // features.md Phase 12A.3: attribute filters are server-authoritative
  // (visibility rules can't be evaluated client-side without leaking
  // SEARCHABLE/PRIVATE values), so changing them re-fetches rather than
  // filtering the already-loaded `talents` list in memory.
  useEffect(() => {
    apiClient.listTalents(attributeFilters).then(setTalents);
  }, [attributeFilters]);

  const toggleAttributeFilter = (key: keyof TalentFilters, value: string) => {
    setAttributeFilters((prev) => (prev[key] === value ? { ...prev, [key]: undefined } : { ...prev, [key]: value }));
  };

  const toggleShortlist = (id: string) => {
    setShortlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredTalents = talents.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = selectedNiche === "All" || t.role.toLowerCase().includes(selectedNiche.toLowerCase());
    return matchesSearch && matchesNiche;
  });

  const filteredActivity = effectiveActivity.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(activitySearch.toLowerCase()) || item.desc.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesKind = activityFilter === "all" || item.type === activityFilter;
    return matchesQuery && matchesKind;
  });

  const screenTitle =
    activeTab === "home" ? "Dashboard"
    : activeTab === "discover" ? "Find Talent"
    : activeTab === "projects" ? "My Projects"
    : activeTab === "orders" ? "Active Orders"
    : activeTab === "activity" ? "Activity History"
    : activeTab === "analytics" ? "Hiring Analytics"
    : "Shortlist";

  const orgName = clientProfile.orgName || clientProfile.name || "FilmCraft Studios";
  const clientInitials = orgName.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]!.toUpperCase()).join("") || "FS";

  return (
    <div className="role-client min-h-screen" style={{ background: "var(--color-bg-canvas)" }}>
      <Sidebar
        portalLabel="Client Portal"
        navItems={CLIENT_NAV_ITEMS}
        activeTab={activeTab}
        onTab={setActiveTab}
        onNavigate={navigate}
        identity={{ initials: clientInitials, name: orgName, subtitle: "Client Account" }}
      />

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-2.5 sticky top-0 z-40 glass-panel" style={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <div className="min-w-0">
          <div className="text-[11px] font-body uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>{orgName}</div>
          <div className="font-display text-lg leading-tight truncate" style={{ color: "var(--color-text-primary)" }}>{screenTitle}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsNewUser(!isNewUser)}
            className="text-xs px-2.5 py-1 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-secondary)] flex items-center gap-1.5 font-body"
            title="Toggle between New User empty state and Active Demo state"
          >
            <span className={`w-2 h-2 rounded-full ${isNewUser ? "bg-amber-500" : "bg-emerald-500"}`} />
            {isNewUser ? "New User" : "Demo"}
          </button>
          <button
            aria-label="View notifications"
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: "var(--color-bg-elevated)" }}
          >
            <Bell className="w-[18px] h-[18px]" style={{ color: "var(--color-text-secondary)" }} />
            {notifications.some(n => !n.readAt) && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
            )}
          </button>
          <button
            aria-label="Account"
            onClick={() => navigate("/settings?role=client")}
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm font-body"
            style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}
          >
            {clientInitials}
          </button>
        </div>
      </div>

      <main id="main-content" className="lg:pl-60 pb-28 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">

          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {activeTab === "home" && `Good morning, ${orgName} 🎬`}
                {activeTab === "discover" && "Find Talent"}
                {activeTab === "projects" && "My Projects"}
                {activeTab === "orders" && "Active Orders"}
                {activeTab === "shortlist" && "Shortlisted Talent"}
                {activeTab === "activity" && "Activity History"}
              </h1>
              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {activeTab === "home" && "Your next project is just a few clicks away."}
                {activeTab === "discover" && "Browse verified talent, style-tagged by AI, across all niches."}
                {activeTab === "projects" && "Manage your project briefs and applications."}
                {activeTab === "orders" && "Track your active collaborations."}
                {activeTab === "shortlist" && "Talent you've saved for future bookings."}
                {activeTab === "activity" && "Complete log of your project creations, applications, payments, and messages."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="h-10 px-4 text-sm gap-2" onClick={() => navigate("/brief")}>
                <Plus className="w-4 h-4" /> Post Project
              </Button>
              <button
                aria-label="View notifications"
                onClick={() => setShowNotifications(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity relative"
                style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
              >
                <Bell className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                {notifications.some(n => !n.readAt) && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Home ── */}
            {activeTab === "home" && (
              <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {/* Onboarding Action Nudges Checklist Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-5 rounded-[var(--radius-xl)] border border-[var(--color-accent)]/30 bg-gradient-to-r from-[var(--color-accent-soft)] via-[var(--color-bg-surface)] to-[var(--color-bg-surface)] relative overflow-hidden"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent-on)] text-xs font-bold font-mono">
                        {isNewUser ? "1/4" : "3/4"}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {isNewUser ? "Welcome! Get Started as a Client" : "Client Onboarding & Action Nudges"}
                        </h3>
                        <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                          {isNewUser ? "Follow these steps to discover, shortlist, and hire top talent for your productions." : "Actions to streamline talent acquisition for your current projects."}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isNewUser ? "accent" : "success"}>{isNewUser ? "Onboarding" : "Active Client"}</Badge>
                  </div>

                  <div className="w-full h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500" style={{ width: isNewUser ? "25%" : "75%" }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => navigate("/settings?role=client")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Company Profile <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Brand details</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate("/brief")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Post Project Brief <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Receive applications</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("discover")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Find Talent <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Filter by niche & style</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("shortlist")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Shortlist Creators <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Bookmark favorites</div>
                      </div>
                    </button>
                  </div>
                </motion.div>

                {/* HERO — spend / budget moment */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="relative overflow-hidden mb-5 p-6 lg:p-7"
                  style={{
                    borderRadius: "var(--radius-2xl)",
                    background: "linear-gradient(140deg, var(--color-accent) 0%, var(--color-accent-press) 100%)",
                    boxShadow: "var(--shadow-elevated)",
                    color: "var(--color-accent-on)",
                  }}
                >
                  <div className="absolute -top-16 -right-10 w-52 h-52 rounded-full" style={{ background: "rgba(255,255,255,0.14)" }} />
                  <div className="relative">
                    <div className="text-xs font-body uppercase tracking-wider" style={{ opacity: 0.85 }}>Total spent · 2024</div>
                    <div className="font-display tnum leading-none mt-2" style={{ fontSize: "clamp(2.5rem, 9vw, 3.5rem)" }}>
                      {isNewUser ? "₦0" : "₦850,000"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm font-body" style={{ opacity: 0.9 }}>
                      <Briefcase className="w-4 h-4" /> {isNewUser ? "0 active projects · 0 talents hired" : "4 active projects · 12 talents hired"}
                    </div>
                    <div className="flex gap-2.5 mt-5">
                      <button onClick={() => navigate("/brief")} className="h-10 px-4 rounded-full text-sm font-semibold font-body transition-transform active:scale-95" style={{ background: "var(--color-bg-surface)", color: "var(--color-accent)" }}>Post a project</button>
                      <button onClick={() => setActiveTab("discover")} className="h-10 px-4 rounded-full text-sm font-semibold font-body transition-transform active:scale-95" style={{ background: "rgba(255,255,255,0.18)", color: "var(--color-accent-on)" }}>Find talent</button>
                    </div>
                  </div>
                </motion.div>

                {/* Quick-action ghost-circle row */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { label: "Post", icon: Plus, action: () => navigate("/brief") },
                    { label: "Discover", icon: Search, action: () => setActiveTab("discover") },
                    { label: "Projects", icon: Briefcase, action: () => setActiveTab("projects") },
                    { label: "Orders", icon: MessageSquare, action: () => setActiveTab("orders") },
                  ].map((qa, i) => (
                    <button key={i} onClick={qa.action} className="flex flex-col items-center gap-2 py-1 group">
                      <span
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95"
                        style={{ background: "var(--color-accent-glow)", border: "1px solid var(--color-hairline)" }}
                      >
                        <qa.icon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                      </span>
                      <span className="text-[11px] font-body text-center" style={{ color: "var(--color-text-secondary)" }}>{qa.label}</span>
                    </button>
                  ))}
                </div>

                {/* Stat cluster */}
                <div
                  className="grid grid-cols-3 mb-6 p-5 rounded-[var(--radius-lg)]"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}
                >
                  {effectiveStats.filter((_, i) => i !== 2).map((stat, i) => (
                    <div key={i} className="text-center px-2" style={{ borderLeft: i > 0 ? "1px solid var(--color-hairline)" : undefined }}>
                      <div className="font-display text-2xl tnum" style={{ color: "var(--color-text-primary)" }}>{stat.value}</div>
                      <div className="text-[11px] font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>Recent Activity</span>
                  <button className="text-xs font-body" style={{ color: "var(--color-accent)" }} onClick={() => setActiveTab("activity")}>View all →</button>
                </div>
                {effectiveActivity.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mx-auto mb-3 text-[var(--color-accent)]">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>No activity logged yet</p>
                    <p className="text-xs font-body mt-1 mb-4 text-[var(--color-text-secondary)]">Post a project brief or discover talent to start building your activity log.</p>
                    <Button onClick={() => navigate("/brief")} className="h-9 px-4 text-xs">
                      Post a Project Brief
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {effectiveActivity.slice(0, 4).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)] cursor-pointer transition-transform active:scale-[0.98]"
                        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)", minHeight: 64 }}
                        onClick={() => {
                          if (item.type === "project" || item.type === "application") {
                            setActiveTab("projects");
                          } else if (item.type === "payment") {
                            navigate("/transactions");
                          } else {
                            navigate("/order/ORD-001");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-glow)" }}>
                          {item.type === "project" && <Briefcase className="w-4 h-4" style={{ color: "var(--color-accent)" }} />}
                          {item.type === "application" && <Users className="w-4 h-4" style={{ color: "var(--color-accent)" }} />}
                          {item.type === "payment" && <Shield className="w-4 h-4" style={{ color: "var(--color-success)" }} />}
                          {item.type === "message" && <MessageSquare className="w-4 h-4" style={{ color: "var(--color-accent)" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold font-body truncate" style={{ color: "var(--color-text-primary)" }}>{item.title}</div>
                          <div className="text-xs font-body truncate" style={{ color: "var(--color-text-tertiary)" }}>{item.desc}</div>
                        </div>
                        <div className="text-[11px] font-body shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                          {item.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Activity History Tab ── */}
            {activeTab === "activity" && (
              <motion.div key="activity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                    <Input
                      className="pl-9"
                      placeholder="Search activity records..."
                      value={activitySearch}
                      onChange={e => setActivitySearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {(["all", "project", "application", "payment", "message"] as const).map(kind => (
                    <button
                      key={kind}
                      onClick={() => setActivityFilter(kind)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium font-body capitalize transition-all"
                      style={{
                        background: activityFilter === kind ? "var(--color-accent)" : "var(--color-bg-surface)",
                        color: activityFilter === kind ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                        border: `1px solid ${activityFilter === kind ? "var(--color-accent)" : "var(--color-border-default)"}`,
                      }}
                    >
                      {kind === "all" ? "All Activity" : kind}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredActivity.length === 0 ? (
                    <div className="text-center py-12 rounded-[var(--radius-lg)] p-6" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <p className="text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>No activity records found.</p>
                    </div>
                  ) : (
                    filteredActivity.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.type === "project" || item.type === "application") {
                            setActiveTab("projects");
                          } else if (item.type === "payment") {
                            navigate("/transactions");
                          } else {
                            navigate("/order/ORD-001");
                          }
                        }}
                        className="p-4 rounded-[var(--radius-lg)] flex items-center justify-between cursor-pointer hover:border-[var(--color-accent)] transition-all"
                        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-glow)" }}>
                            {item.type === "project" && <Briefcase className="w-4 h-4" style={{ color: "var(--color-accent)" }} />}
                            {item.type === "application" && <Users className="w-4 h-4" style={{ color: "var(--color-accent)" }} />}
                            {item.type === "payment" && <Shield className="w-4 h-4" style={{ color: "var(--color-success)" }} />}
                            {item.type === "message" && <MessageSquare className="w-4 h-4" style={{ color: "var(--color-accent)" }} />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{item.title}</div>
                            <div className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{item.desc}</div>
                          </div>
                        </div>
                        <div className="text-xs font-body text-right" style={{ color: "var(--color-text-tertiary)" }}>
                          {item.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Discover Tab ── */}
            {activeTab === "discover" && (
              <motion.div key="discover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Find Talent</h2>

                {/* Search + filter */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                    <Input
                      className="pl-9"
                      placeholder="Search by name, role, or vibe..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    aria-label="Filter talent"
                    aria-pressed={showAttributeFilters}
                    onClick={() => setShowAttributeFilters((v) => !v)}
                    className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center border hover:border-[var(--color-accent)] transition-colors relative"
                    style={{
                      background: showAttributeFilters ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                      borderColor: showAttributeFilters ? "var(--color-accent)" : "var(--color-border-default)",
                    }}
                  >
                    <Filter className="w-4 h-4" style={{ color: showAttributeFilters ? "var(--color-accent)" : "var(--color-text-secondary)" }} />
                    {Object.values(attributeFilters).some(Boolean) && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
                    )}
                  </button>
                </div>

                {/* Attribute filters — features.md Phase 12A.3, PWA-10. */}
                {showAttributeFilters && (
                  <div className="rounded-[var(--radius-lg)] p-4 mb-6 space-y-3" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                    {ATTRIBUTE_FILTER_FIELDS.map((field) => (
                      <div key={field.key as string}>
                        <div className="text-xs font-medium uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-tertiary)" }}>{field.label}</div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                          {field.options.map((opt) => {
                            const active = attributeFilters[field.key] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => toggleAttributeFilter(field.key, opt)}
                                aria-pressed={active}
                                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium font-body transition-all"
                                style={{
                                  background: active ? "var(--color-accent)" : "var(--color-bg-elevated)",
                                  color: active ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                                  border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-default)"}`,
                                }}
                              >
                                {opt.replace(/_/g, " ")}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {Object.values(attributeFilters).some(Boolean) && (
                      <div className="pt-2 border-t flex justify-end" style={{ borderColor: "var(--color-border-default)" }}>
                        <button
                          onClick={() => setAttributeFilters({})}
                          className="px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-body font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", border: "1px solid var(--color-border-default)" }}
                        >
                          <X className="w-3.5 h-3.5" style={{ color: "var(--color-text-secondary)" }} />
                          Clear attribute filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Niche pills + More Filters Modal Button */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                  <Button variant="secondary" className="h-9 px-3 text-xs gap-1.5 shrink-0" onClick={() => setShowMoreFiltersModal(true)}>
                    <Filter className="w-3.5 h-3.5" /> More Filters
                  </Button>
                  {NICHES.map(niche => (
                    <button
                      key={niche}
                      onClick={() => setSelectedNiche(niche)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium font-body transition-all"
                      style={{
                        background: selectedNiche === niche ? "var(--color-accent)" : "var(--color-bg-surface)",
                        color: selectedNiche === niche ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                        border: `1px solid ${selectedNiche === niche ? "var(--color-accent)" : "var(--color-border-default)"}`,
                      }}
                    >
                      {niche}
                    </button>
                  ))}
                </div>

                {/* Talent grid */}
                {filteredTalents.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Creators Found</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      We couldn't find any talent matching your current search or filter criteria. Try clearing your filters or posting a project brief to receive direct pitches.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedNiche("All");
                          setAttributeFilters({});
                        }}
                      >
                        Clear Search & Filters
                      </Button>
                      <Button onClick={() => navigate("/brief")} className="gap-2">
                        <Plus className="w-4 h-4" /> Post a Project Brief
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTalents.map(talent => (
                      <div
                        key={talent.id}
                        className="p-4 rounded-[var(--radius-lg)] cursor-pointer hover:scale-[1.01] transition-transform"
                        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                        onClick={() => setSelectedTalent(talent)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-12 h-12 text-base" background="var(--color-accent-glow)" color="var(--color-accent)">
                            {talent.avatar}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{talent.name}</span>
                              {talent.verified && <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />}
                            </div>
                            <div className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{talent.role} · {talent.location}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-current" style={{ color: "var(--color-gold)" }} />
                              <span className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{talent.rating} ({talent.reviews})</span>
                            </div>
                          </div>
                          <button
                            aria-label={shortlist.includes(talent.id) ? `Remove ${talent.name} from shortlist` : `Shortlist ${talent.name}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                            style={{ background: shortlist.includes(talent.id) ? "var(--color-accent-glow)" : "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                            onClick={e => { e.stopPropagation(); toggleShortlist(talent.id); }}
                          >
                            <Star className={`w-4 h-4 ${shortlist.includes(talent.id) ? "fill-current" : ""}`} style={{ color: shortlist.includes(talent.id) ? "var(--color-accent)" : "var(--color-text-secondary)" }} />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {talent.tags.map(tag => (
                            <Badge key={tag} tone="neutral" size="sm">{tag}</Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-display text-base tnum" style={{ color: "var(--color-accent)" }}>{talent.price}</span>
                            <span className="text-xs font-body ml-1" style={{ color: "var(--color-text-tertiary)" }}>/ booking</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: talent.available ? "var(--color-success)" : "var(--color-text-tertiary)" }} />
                            <span className="text-xs font-body" style={{ color: talent.available ? "var(--color-success)" : "var(--color-text-tertiary)" }}>
                              {talent.available ? "Available" : "Booked"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Talent profile modal */}
                <AnimatePresence>
                  {selectedTalent && (
                    <Modal onClose={() => setSelectedTalent(null)} align="end">
                      <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        className="w-full max-w-md rounded-[var(--radius-lg)] overflow-hidden max-h-[90vh] overflow-y-auto"
                        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Modal header */}
                        <div className="h-20" style={{ background: "linear-gradient(135deg, var(--color-accent-glow), var(--color-bg-elevated))" }} />
                        <div className="px-5 pb-5">
                          <div className="flex items-end gap-3 -mt-8 mb-3">
                            <Avatar
                              className="w-16 h-16 text-xl border-4 border-[var(--color-bg-surface)]"
                              background="var(--color-accent-glow)"
                              color="var(--color-accent)"
                            >
                              {selectedTalent.avatar}
                            </Avatar>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity" style={{ background: "var(--color-bg-elevated)" }} onClick={() => setSelectedTalent(null)}>
                              <X className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{selectedTalent.name}</h3>
                            {selectedTalent.verified && <Shield className="w-4 h-4" style={{ color: "var(--color-success)" }} />}
                          </div>
                          <p className="text-sm font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>{selectedTalent.role} · {selectedTalent.location}</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {selectedTalent.tags.map(tag => (
                              <Badge key={tag} tone="neutral" size="md">{tag}</Badge>
                            ))}
                          </div>

                          {/* Reel preview */}
                          <div className="relative aspect-video rounded-[var(--radius-md)] overflow-hidden mb-4 cursor-pointer group" style={{ background: "var(--color-bg-elevated)" }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center pl-1" style={{ background: "var(--color-accent)" }}>
                                <Play className="w-5 h-5" style={{ color: "var(--color-text-inverse)" }} />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded font-mono text-xs text-white" style={{ background: "rgba(0,0,0,0.6)" }}>02:30</div>
                          </div>

                          {/* Services */}
                          <div className="space-y-2 mb-4">
                            {["Standard Booking", "Rush Delivery"].map((svc, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                                <span className="text-sm font-body" style={{ color: "var(--color-text-primary)" }}>{svc}</span>
                                <span className="font-display text-sm tnum" style={{ color: "var(--color-accent)" }}>
                                  {i === 0 ? selectedTalent.price : `₦${(parseInt(selectedTalent.price.replace(/[₦,]/g, "")) * 1.5).toLocaleString()}`}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="secondary" className="flex-1 h-11 text-sm gap-1.5" onClick={() => { toggleShortlist(selectedTalent.id); }}>
                              <Star className={`w-4 h-4 ${shortlist.includes(selectedTalent.id) ? "fill-current" : ""}`} /> {shortlist.includes(selectedTalent.id) ? "Saved" : "Save"}
                            </Button>
                            <Button
                              className="flex-1 h-11 text-sm"
                              onClick={() => {
                                const talentId = selectedTalent.id;
                                setSelectedTalent(null);
                                // features.md Phase 13: real creatorId in state routes Checkout into
                                // the live slot-aware booking flow; mock mode's demo entry (no id
                                // wired anywhere yet) falls back to the prototype's static flow.
                                navigate("/checkout", { state: { creatorId: talentId, creatorName: selectedTalent.name } });
                              }}
                            >
                              Book Now →
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </Modal>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Projects Tab ── */}
            {activeTab === "projects" && (
              <motion.div key="projects" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {selectedProjectDetail ? (
                  /* Dedicated Project Management Page */
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                      <button
                        onClick={() => setSelectedProjectDetail(null)}
                        className="flex items-center gap-2 text-xs font-semibold font-body"
                        style={{ color: "var(--color-accent)" }}
                      >
                        ← Back to My Projects
                      </button>
                      <Badge tone={selectedProjectDetail.status === "active" ? "success" : "neutral"} size="md">
                        {selectedProjectDetail.status}
                      </Badge>
                    </div>

                    {/* Project Header Info */}
                    <div className="p-6 rounded-[var(--radius-xl)] mb-6" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="text-xs font-mono mb-1" style={{ color: "var(--color-text-tertiary)" }}>{selectedProjectDetail.id}</div>
                          {isEditingProjectInfo ? (
                            <div className="space-y-3 mb-3">
                              <Input value={editedProjectName} onChange={e => setEditedProjectName(e.target.value)} placeholder="Project Name" />
                              <Input value={editedProjectBudget} onChange={e => setEditedProjectBudget(e.target.value)} placeholder="Budget" />
                              <div className="flex gap-2">
                                <Button className="h-8 text-xs" onClick={() => {
                                  setSelectedProjectDetail(prev => prev ? { ...prev, name: editedProjectName, budget: editedProjectBudget } : null);
                                  setProjects(prev => prev.map(p => p.id === selectedProjectDetail.id ? { ...p, name: editedProjectName, budget: editedProjectBudget } : p));
                                  setIsEditingProjectInfo(false);
                                }}>Save Project Info</Button>
                                <Button variant="secondary" className="h-8 text-xs" onClick={() => setIsEditingProjectInfo(false)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>{selectedProjectDetail.name}</h2>
                              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                {selectedProjectDetail.niche} · Posted {selectedProjectDetail.posted}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl tnum" style={{ color: "var(--color-accent)" }}>{selectedProjectDetail.budget}</div>
                          {!isEditingProjectInfo && (
                            <button
                              onClick={() => setIsEditingProjectInfo(true)}
                              className="text-xs font-body hover:underline mt-1 block text-right"
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              Edit Brief Info
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-[var(--radius-md)] mb-4" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Project Overview</div>
                        <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          Looking for professional performing arts talent for production recording and campaign rollout. Requires high quality deliverables and prompt communication.
                        </p>
                      </div>
                    </div>

                    {/* Applicants List */}
                    <div className="p-6 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                        <h3 className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>
                          Applicants ({applicants.length})
                        </h3>
                        <span className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                          Select a candidate to book or inspect their storefront
                        </span>
                      </div>

                      {loadingApplicants ? (
                        <div className="py-8 text-center text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>Loading applicants…</div>
                      ) : applicants.length === 0 ? (
                        <div className="py-8 text-center text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>No applicants yet for this project.</div>
                      ) : (
                        <div className="space-y-4">
                          {applicants.map((app) => (
                            <div key={app.applicationId} className="p-4 rounded-[var(--radius-lg)] border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10 text-sm" background="var(--color-accent-glow)" color="var(--color-accent)">
                                    {app.creator.avatar}
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{app.creator.name}</span>
                                      {app.creator.verified && <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />}
                                    </div>
                                    <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{app.creator.role} · {app.creator.location}</div>
                                  </div>
                                </div>
                                <Badge tone={app.status === "SELECTED" ? "success" : app.status === "SHORTLISTED" ? "accent" : "neutral"} size="sm">
                                  {APPLICANT_STATUS_LABEL[app.status] ?? app.status}
                                </Badge>
                              </div>

                              {app.pitch && (
                                <p className="text-xs font-body italic my-2 p-2.5 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}>
                                  "{app.pitch}"
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                                <button
                                  onClick={() => window.open("/elias-thorne", "_blank")}
                                  className="text-xs font-semibold font-body hover:underline flex items-center gap-1"
                                  style={{ color: "var(--color-accent)" }}
                                >
                                  View Storefront / Profile →
                                </button>
                                <div className="flex gap-2">
                                  {app.status === "APPLIED" && (
                                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => handleShortlist(app.applicationId)}>
                                      Shortlist
                                    </Button>
                                  )}
                                  {app.status !== "REJECTED" && app.status !== "SELECTED" && (
                                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => handleRejectApplicant(app.applicationId)}>
                                      Reject
                                    </Button>
                                  )}
                                  {app.status !== "SELECTED" && (
                                    <Button className="h-8 px-3 text-xs" onClick={() => openSelectFlow(app)}>
                                      Select / Hire
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Projects List */
                  <div>
                    <div className="flex items-center justify-between mb-4 lg:hidden">
                      <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>My Projects</h2>
                      <Button className="h-9 px-3 text-sm gap-2" onClick={() => navigate("/brief")}>
                        <Plus className="w-4 h-4" /> Post
                      </Button>
                    </div>

                    {effectiveProjects.length === 0 ? (
                      <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                          <Briefcase className="w-8 h-8" />
                        </div>
                        <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Projects Created Yet</h3>
                        <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                          Post a project brief with your role requirements, budget, and timeline to start receiving pitches from verified talent.
                        </p>
                        <Button onClick={() => navigate("/brief")} className="gap-2">
                          <Plus className="w-4 h-4" /> Post Your First Project Brief
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {effectiveProjects.map(project => (
                        <div key={project.id} className="p-5 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="text-xs font-mono mb-1" style={{ color: "var(--color-text-tertiary)" }}>{project.id}</div>
                              <h3 className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{project.name}</h3>
                              <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>{project.niche} · Posted {project.posted}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-display text-lg tnum" style={{ color: "var(--color-accent)" }}>{project.budget}</div>
                              <Badge tone={project.status === "active" ? "success" : project.status === "draft" ? "neutral" : "accent"} size="md">
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                              <span className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                                {project.applicants}{project.applicantCap ? `/${project.applicantCap}` : ""} applicants
                                {!project.applicationsOpen && project.status === "active" && " · closed"}
                              </span>
                            </div>
                            <Button className="h-9 px-4 text-xs font-semibold" onClick={() => openProjectDetail(project)}>
                              View Project →
                            </Button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => navigate("/brief")}
                        className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium font-body"
                        style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-tertiary)" }}
                      >
                        <Plus className="w-4 h-4" /> Post a new project
                      </button>
                    </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Active Orders</h2>
                {effectiveOrders.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Active Collaborations</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      You don't have any active bookings or talent hires right now. Search the talent marketplace or review project applications to start an order.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => setActiveTab("discover")} className="gap-2">
                        <Search className="w-4 h-4" /> Discover Talent
                      </Button>
                      <Button variant="secondary" onClick={() => navigate("/brief")} className="gap-2">
                        <Plus className="w-4 h-4" /> Post Project Brief
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {effectiveOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-5 rounded-[var(--radius-lg)] cursor-pointer hover:scale-[1.01] transition-transform"
                      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-xs font-mono mb-1" style={{ color: "var(--color-text-tertiary)" }}>{order.id}</div>
                          <h3 className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{order.project}</h3>
                          <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Talent: {order.counterpart}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg tnum" style={{ color: "var(--color-accent)" }}>{order.amount}</div>
                          <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Due {order.due}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {["Briefing", "Deliverables", "Review", "Complete"].map((phase, i) => {
                          const current = ["Briefing", "Deliverables", "Review", "Complete"].indexOf(order.phase);
                          const isDone = i < current;
                          const isActive = i === current;
                          return (
                            <React.Fragment key={phase}>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono" style={{
                                background: isDone ? "var(--color-success-bg)" : isActive ? "var(--color-accent-glow)" : "var(--color-bg-elevated)",
                                color: isDone ? "var(--color-success)" : isActive ? "var(--color-accent)" : "var(--color-text-tertiary)",
                                border: `1px solid ${isDone ? "var(--color-success)" : isActive ? "var(--color-accent)" : "var(--color-border-default)"}`,
                              }}>
                                {isDone ? "✓" : i + 1}
                              </div>
                              {i < 3 && <div className="flex-1 h-px" style={{ background: isDone ? "var(--color-success)" : "var(--color-border-default)" }} />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      <div className="text-xs font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>
                        Current phase: <strong>{order.phase}</strong>
                      </div>
                      <Button className="w-full h-10 text-sm gap-2">
                        Enter Order Room <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                )}
              </motion.div>
            )}

            {/* ── Shortlist Tab ── */}
            {activeTab === "shortlist" && (
              <motion.div key="shortlist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Shortlisted Talent</h2>
                {effectiveShortlist.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Your Shortlist is Empty</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      Bookmark creators while searching the talent directory so you can easily compare their rate cards and hire them for upcoming projects.
                    </p>
                    <Button onClick={() => setActiveTab("discover")} className="gap-2">
                      <Search className="w-4 h-4" /> Explore Talent Directory
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talents.filter(t => effectiveShortlist.includes(t.id)).map(talent => (
                      <div key={talent.id} className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-12 h-12 text-base" background="var(--color-accent-glow)" color="var(--color-accent)">
                            {talent.avatar}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{talent.name}</span>
                              {talent.verified && <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />}
                            </div>
                            <div className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{talent.role}</div>
                          </div>
                          <button onClick={() => toggleShortlist(talent.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-accent-glow)" }}>
                            <X className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" className="flex-1 h-9 text-sm" onClick={() => setSelectedTalent(talent)}>View Profile</Button>
                          <Button className="flex-1 h-9 text-sm" onClick={() => navigate("/checkout", { state: { creatorId: talent.id, creatorName: talent.name } })}>Book Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Analytics Tab ── */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Hiring &amp; Budget Analytics</h2>
                    <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                      Overview of campaign spending, talent acquisition funnel, and escrow release metrics for {clientProfile.orgName || clientProfile.name}.
                    </p>
                  </div>
                  <Badge tone={isNewUser ? "neutral" : "success"} size="md">{isNewUser ? "Pending Data" : "Live Sync Active"}</Badge>
                </div>

                {isNewUser ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Hiring Analytics Pending</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      Metrics on talent engagement, application response rates, and total booking spend will be tracked here once you initiate hiring campaigns.
                    </p>
                    <Button onClick={() => setActiveTab("discover")} className="gap-2">
                      <Search className="w-4 h-4" /> Discover Talent
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Total Escrow Allocated</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>₦850,000</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>Across 4 active briefs</div>
                  </div>
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Avg Cost Per Hire</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-accent)" }}>₦70,833</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>Optimal ROI benchmark</div>
                  </div>
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Applicants Received</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>32</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>12 shortlisted · 4 hired</div>
                  </div>
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Repeat Talent Rate</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>25%</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>High talent satisfaction</div>
                  </div>
                </div>

                {/* Detailed Charts & Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Applicant Conversion Funnel */}
                  <div className="p-5 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <h3 className="font-display text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Talent Acquisition Funnel</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Applications Received</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>32 (100%)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "100%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Shortlisted Candidates</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>12 (37.5%)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "37.5%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Hired &amp; Escrow Locked</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-success)" }}>4 (12.5%)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "12.5%", background: "var(--color-success)" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Spend Distribution */}
                  <div className="p-5 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <h3 className="font-display text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Category Budget Allocation</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Actor / Screen Lead</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-accent)" }}>40% (₦340,000)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "40%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Voice-Over &amp; Commercials</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-accent)" }}>35% (₦297,500)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "35%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Event Compere &amp; Speaker</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-accent)" }}>25% (₦212,500)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "25%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Applicant Management Modal (features.md Phase 14, PWA-17) */}
          <AnimatePresence>
            {applicantsProject && (
              <Modal onClose={() => { setApplicantsProject(null); setSelectingApplicationId(null); }} align="end">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  className="w-full max-w-lg rounded-[var(--radius-lg)] overflow-hidden max-h-[90vh] overflow-y-auto"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-5 flex items-start justify-between sticky top-0 z-10" style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-hairline)" }}>
                    <div>
                      <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{applicantsProject.name}</h3>
                      <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                        {applicantsProject.applicants}{applicantsProject.applicantCap ? `/${applicantsProject.applicantCap}` : ""} applicants
                      </p>
                    </div>
                    <button onClick={() => { setApplicantsProject(null); setSelectingApplicationId(null); }} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    {applicantActionError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
                        <AlertCircle className="w-4 h-4 shrink-0" /> {applicantActionError}
                      </div>
                    )}

                    {loadingApplicants ? (
                      <p className="text-sm font-body text-center py-10" style={{ color: "var(--color-text-tertiary)" }}>Loading applicants…</p>
                    ) : applicants.length === 0 ? (
                      <p className="text-sm font-body text-center py-10" style={{ color: "var(--color-text-tertiary)" }}>No applicants yet.</p>
                    ) : (
                      applicants.map((applicant) => (
                        <div key={applicant.applicationId} className="p-4 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="w-11 h-11 text-sm shrink-0" background="var(--color-accent-glow)" color="var(--color-accent)">
                              {applicant.creator.avatar}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold font-body truncate" style={{ color: "var(--color-text-primary)" }}>{applicant.creator.name}</span>
                                {applicant.creator.verified && <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-success)" }} />}
                              </div>
                              <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{applicant.creator.role} · {applicant.creator.location}</div>
                            </div>
                            <Badge tone={applicant.status === "SELECTED" ? "success" : applicant.status === "REJECTED" ? "error" : "accent"} size="sm">
                              {APPLICANT_STATUS_LABEL[applicant.status]}
                            </Badge>
                          </div>
                          {applicant.pitch && (
                            <p className="text-xs font-body mb-3 italic" style={{ color: "var(--color-text-secondary)" }}>"{applicant.pitch}"</p>
                          )}

                          {(applicant.status === "APPLIED" || applicant.status === "SHORTLISTED") && (
                            <div className="flex gap-2 mb-2">
                              {applicant.status === "APPLIED" && (
                                <Button variant="secondary" className="flex-1 h-9 text-xs" onClick={() => handleShortlist(applicant.applicationId)}>Shortlist</Button>
                              )}
                              <Button variant="secondary" className="flex-1 h-9 text-xs" onClick={() => handleRejectApplicant(applicant.applicationId)}>Reject</Button>
                              <Button className="flex-1 h-9 text-xs" onClick={() => openSelectFlow(applicant)}>Select</Button>
                            </div>
                          )}

                          {selectingApplicationId === applicant.applicationId && (
                            <div className="mt-3 p-3 rounded-[var(--radius-md)] space-y-3" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-body mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>Service</label>
                                <select
                                  value={selectRateCardId}
                                  onChange={(e) => setSelectRateCardId(e.target.value)}
                                  className="w-full h-10 px-3 rounded-[var(--radius-md)] text-xs font-body"
                                  style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                                >
                                  <option value="">Choose a service…</option>
                                  {selectRateCards.map((card) => (
                                    <option key={card.id} value={card.id}>{card.title} · {card.price}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-body mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>Date</label>
                                <input
                                  type="date"
                                  value={selectDate}
                                  min={new Date().toISOString().slice(0, 10)}
                                  onChange={(e) => e.target.value && setSelectDate(e.target.value)}
                                  className="w-full h-10 px-3 rounded-[var(--radius-md)] text-xs font-body"
                                  style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-body mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>Time</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {CANDIDATE_SLOT_HOURS.map((h) => {
                                    const start = toTimeStr(h * 60);
                                    const fits = selectSlotFits(start);
                                    const isSelected = selectSlotStart === start;
                                    return (
                                      <button
                                        key={start}
                                        disabled={!fits}
                                        onClick={() => setSelectSlotStart(start)}
                                        className="py-1.5 rounded-lg text-[11px] font-mono tnum disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{
                                          background: isSelected ? "var(--color-accent)" : "var(--color-bg-elevated)",
                                          color: isSelected ? "var(--color-accent-on)" : "var(--color-text-primary)",
                                          border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border-default)"}`,
                                        }}
                                      >
                                        {start}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="secondary" className="flex-1 h-9 text-xs" onClick={() => setSelectingApplicationId(null)}>Cancel</Button>
                                <Button
                                  className="flex-1 h-9 text-xs gap-1.5"
                                  disabled={!selectRateCardId || !selectSlotStart || selecting}
                                  onClick={handleConfirmSelect}
                                >
                                  <Check className="w-3.5 h-3.5" /> {selecting ? "Booking…" : "Confirm Selection"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>
          {/* Notifications Modal */}
          <AnimatePresence>
            {showNotifications && (
              <Modal onClose={() => setShowNotifications(false)} align="right">
                <motion.div
                  initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                  className="w-full max-w-sm h-full p-6 flex flex-col"
                  style={{ background: "var(--color-bg-surface)", borderLeft: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {notifications.length === 0 && (
                      <p className="text-sm text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
                        No notifications yet.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          appStateSync.markNotificationRead(n.id);
                          setNotifications(appStateSync.getNotifications());
                          setShowNotifications(false);
                          setActiveTab("activity");
                        }}
                        className="w-full text-left p-4 rounded-[var(--radius-md)] border relative"
                        style={{
                          background: "var(--color-bg-elevated)",
                          borderColor: !n.readAt ? "var(--color-accent)" : "var(--color-border-default)",
                        }}
                      >
                        <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-accent)" }}>
                          {n.kind.replace(/_/g, " ")}
                        </div>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{n.payload.clientName ?? n.payload.creatorName ?? "Update available"}</p>
                        <div className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* More Filters Modal (Physical Features & Attributes) */}
          <AnimatePresence>
            {showMoreFiltersModal && (
              <Modal onClose={() => setShowMoreFiltersModal(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-md rounded-[var(--radius-xl)] p-6 max-h-[85vh] overflow-y-auto"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5 border-b pb-3" style={{ borderColor: "var(--color-hairline)" }}>
                    <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>Filter Talent by Physical Features</h3>
                    <button onClick={() => setShowMoreFiltersModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {ATTRIBUTE_FILTER_FIELDS.map((field) => (
                      <div key={field.key as string}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>{field.label}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {field.options.map((opt) => {
                            const active = attributeFilters[field.key] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => toggleAttributeFilter(field.key, opt)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium font-body transition-all"
                                style={{
                                  background: active ? "var(--color-accent)" : "var(--color-bg-elevated)",
                                  color: active ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                                  border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-default)"}`,
                                }}
                              >
                                {opt.replace(/_/g, " ")}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                    <Button variant="secondary" className="flex-1 h-11 text-xs" onClick={() => setAttributeFilters({})}>Reset Filters</Button>
                    <Button className="flex-1 h-11 text-xs" onClick={() => setShowMoreFiltersModal(false)}>Apply Filters</Button>
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav navItems={CLIENT_BOTTOM_NAV_ITEMS} activeTab={activeTab} onTab={setActiveTab} indicatorId="client-tab-indicator" />
    </div>
  );
}
