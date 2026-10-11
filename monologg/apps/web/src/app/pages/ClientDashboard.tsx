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
  ChevronRight, Play, X, Check, AlertCircle, TrendingUp,
  CreditCard, ArrowLeft, Clock, MapPin, Lock, FileText,
  Layers, Copy, FileDown, Folder, Calendar, Share2,
  CheckCircle2, PlayCircle, Eye, HelpCircle, Edit3,
  Trash2, Sparkles, ShieldCheck, Download, ExternalLink,
  Upload, FileCheck
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

interface ProjectDetailedInfo {
  description: string;
  timeline: string;
  location: string;
  nicheReq: string[];
  deliverables: string[];
  scriptSample: string;
  additionalNotes: string;
  assets: { name: string; size: string; type: string }[];
}

const DEFAULT_PROJECT_DETAILS: Record<string, ProjectDetailedInfo> = {
  "P-001": {
    description:
      "Seeking a commanding, resonant voiceover artist for Nike's Q1 regional multimedia campaign. The project involves recording two 30-second commercial spots celebrating Nigerian grassroots athletics across digital, broadcast, and social channels.",
    timeline: "Auditions close Oct 24 · Studio Recording: Nov 4–6 · Final Deliverables: Nov 12",
    location: "Lagos, NG (Hybrid/Remote)",
    nicheReq: ["VO_ARTIST"],
    deliverables: [
      "2x 30s broadcast WAV master audio files (24-bit / 48kHz)",
      "1x 15s social media cutdown variation",
      "Raw uncompressed vocal stems with room-tone tracks",
      "Full digital & broadcast commercial usage rights for 1 year",
    ],
    scriptSample:
      "Sides / Script Excerpt:\n'They told you impossible is a standard. We tell you it's a starting line. When the whistle blows in Surulere, the world listens. Nike: Just Do It.'",
    additionalNotes:
      "Audition must be recorded with a professional condenser microphone. No reverberant acoustics or background hiss. Authoritative, inspiring, and grounded Nigerian/West African cadence desired.",
    assets: [
      { name: "Nike_Q1_Campaign_Creative_Brief.pdf", size: "2.4 MB", type: "PDF Document" },
      { name: "Brand_Audio_Identity_Guidelines.pdf", size: "1.2 MB", type: "Style Guide" },
      { name: "Reference_Tone_Scratch_Track.wav", size: "14.8 MB", type: "Audio Reference" },
    ],
  },
  "P-002": {
    description:
      "Seeking an engaging, polished keynote compere / master of ceremonies for a high-profile 2-day technological innovation summit holding at the International Conference Centre, Abuja.",
    timeline: "Event Dates: Nov 18–19 · Rehearsal / Briefing: Nov 17",
    location: "Abuja, NG (On-site)",
    nicheReq: ["COMPERE", "SPEAKER_PASTOR"],
    deliverables: [
      "Live stage moderation for 12 panel sessions across 2 days",
      "Speaker introductions and audience engagement activities",
      "Strict adherence to event run-of-show schedule",
    ],
    scriptSample:
      "Opening Keynote Excerpt:\n'Distinguished guests, founders, and innovators from across the continent: welcome to the Nexus 2026 Summit. Today we don't just discuss the future—we build it.'",
    additionalNotes:
      "Sharp stage presence, fluent English diction (bilingual French is an added advantage), and executive corporate composure required.",
    assets: [
      { name: "Nexus_Summit_Run_of_Show.pdf", size: "3.1 MB", type: "Schedule & Brief" },
      { name: "Speaker_Bios_and_Protocols.pdf", size: "1.8 MB", type: "Reference" },
    ],
  },
  "P-003": {
    description:
      "Production of an audio commercial spot introducing an instant multi-currency diaspora remittance wallet for West Africa. Looking for a warm, trustworthy narrator.",
    timeline: "Draft Brief · Audition window opens immediately upon publishing",
    location: "Remote (Online)",
    nicheReq: ["VO_ARTIST"],
    deliverables: [
      "1x 45s radio broadcast commercial (master WAV)",
      "2x 15s digital bumper cuts for social advertising",
      "Full radio & broadcast buyout rights for 12 months",
    ],
    scriptSample:
      "Sides / Script Excerpt:\n'Sending money back home should feel like love, not a headache. Fast. Zero hidden fees. Direct to any bank in seconds.'",
    additionalNotes:
      "Warm, conversational, modern Nigerian vocal cadence. Broadcast acoustics required.",
    assets: [
      { name: "Fintech_Radio_Ad_Copy.pdf", size: "950 KB", type: "Script Document" },
    ],
  },
  "P-004": {
    description:
      "Casting for lead dramatic and supporting ensemble roles in an upcoming feature film produced by General Casting Co. Actors must be capable of intense emotional range.",
    timeline: "Auditions closed · Callbacks: Feb 2–5 · Principal Photography: March 2025",
    location: "Lagos, NG (On-set)",
    nicheReq: ["ACTOR"],
    deliverables: [
      "Full table reads and rehearsal attendance in Lagos",
      "12 shoot days on-set in Lagos",
      "Post-production ADR vocal dubbing if required",
    ],
    scriptSample:
      "Sides / Script Excerpt:\n'You think this town forgot what happened? I didn't forget. Every shadow on Marina road remembers your name, Femi. Look at me and say it was worth it.'",
    additionalNotes:
      "Prior Nollywood or stage drama experience preferred. Monologue sides will be provided to shortlisted applicants.",
    assets: [
      { name: "Scene_3_Monologue_Sides.pdf", size: "1.4 MB", type: "Sides" },
      { name: "Character_Breakdown_Marina_Road.pdf", size: "2.8 MB", type: "Character Guide" },
    ],
  },
};

function getProjectDetails(project: ClientProject): ProjectDetailedInfo {
  if (DEFAULT_PROJECT_DETAILS[project.id]) {
    return DEFAULT_PROJECT_DETAILS[project.id];
  }
  return {
    description: `Looking for professional ${project.niche || "performing arts"} performers for ${project.name}. Requires high quality deliverables and prompt communication.`,
    timeline: "Auditions open · Production timeline agreed upon hire",
    location: "Lagos, NG (Hybrid/Remote)",
    nicheReq: [project.niche.toUpperCase().replace(/\s+/g, "_") || "ACTOR"],
    deliverables: [
      "Master deliverables in broadcast quality",
      "1 round of minor revisions or pickups",
      "Full commercial usage rights for agreed production term",
    ],
    scriptSample: `Sides / Audition Sample for ${project.name}:\n'Welcome to the audition. Please deliver your performance take with energy, clarity, and authentic stage or vocal presence.'`,
    additionalNotes: "Verified Monologg profile required. Must submit audition reel or tape with application pitch.",
    assets: [
      { name: `${project.name.replace(/\s+/g, "_")}_Brief.pdf`, size: "1.5 MB", type: "Brief Document" },
    ],
  };
}

const DEFAULT_FALLBACK_APPLICANTS: Record<string, Applicant[]> = {
  "P-001": [
    {
      applicationId: "myapp-1",
      status: "APPLIED",
      pitch: "I've voiced three prior Nike regional spots — happy to share reels and turnaround takes within 24 hours.",
      appliedAt: "2026-07-15T00:00:00.000Z",
      creator: { id: "seed-creator-adaeze", name: "Adaeze Obi", role: "Voice-Over Artist", location: "Lagos", avatar: "AO", verified: true, tags: ["Warm", "Multilingual", "Corporate"], price: "₦28,000" },
    },
    {
      applicationId: "myapp-4",
      status: "SHORTLISTED",
      pitch: "Bilingual EN/FR delivery available if the campaign runs across West Africa. Professional home booth setup.",
      appliedAt: "2026-07-16T00:00:00.000Z",
      creator: { id: "seed-creator-amara", name: "Amara Diallo", role: "Voice-Over Artist", location: "Accra", avatar: "AD", verified: true, tags: ["Storytelling", "Animated", "French"], price: "₦35,000" },
    },
  ],
  "P-002": [
    {
      applicationId: "myapp-2",
      status: "SHORTLISTED",
      pitch: "Experienced bilingual master of ceremonies for pan-African conferences. High-energy audience engagement.",
      appliedAt: "2026-07-10T00:00:00.000Z",
      creator: { id: "seed-creator-funke", name: "Funke Davies", role: "Keynote Compere", location: "Abuja", avatar: "FD", verified: true, tags: ["Corporate", "Executive", "Stage Presence"], price: "₦50,000" },
    },
  ],
  "P-004": [
    {
      applicationId: "myapp-5",
      status: "APPLIED",
      pitch: "Nollywood feature experience, ready for on-set shoot schedule in Lagos. Monologue reel attached.",
      appliedAt: "2026-07-18T00:00:00.000Z",
      creator: { id: "seed-creator-chidi", name: "Chidi Okon", role: "Actor", location: "Lagos", avatar: "CO", verified: true, tags: ["Dramatic", "Method Acting", "Nollywood"], price: "₦45,000" },
    },
  ],
};

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
  { id: "discover", label: "Find Performers", icon: Search },
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
  const [editedProjectSynopsis, setEditedProjectSynopsis] = useState("");
  const [editedProjectScript, setEditedProjectScript] = useState("");
  const [projectStateOverrides, setProjectStateOverrides] = useState<Record<string, string>>({});
  const [projectOverridesInfo, setProjectOverridesInfo] = useState<Record<string, Partial<ProjectDetailedInfo>>>({});
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [applicantFilterTab, setApplicantFilterTab] = useState<"all" | "shortlisted" | "selected" | "applied" | "rejected">("all");
  const [applicantSearchQuery, setApplicantSearchQuery] = useState("");
  const [editingSynopsisInline, setEditingSynopsisInline] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<"all" | "project" | "application" | "payment" | "message">("all");
  const [activity] = useState([
    { id: "act-1", type: "project", title: "Project Posted", desc: "Nike Q1 Campaign brief created", time: "10m ago", refId: "P-001" },
    { id: "act-2", type: "application", title: "New Application", desc: "Adaeze Obi applied to Tech Summit Compere", time: "1h ago", refId: "P-002" },
    { id: "act-3", type: "payment", title: "Escrow Locked", desc: "₦120,000 locked securely for Nike Campaign VO", time: "2d ago", refId: "ORD-001" },
    { id: "act-4", type: "message", title: "New Message", desc: "Emeka Johnson uploaded script audio file", time: "3d ago", refId: "ORD-001" },
  ]);
  const currentUser = appStateSync.getLoggedInUser();
  const [isNewUser, setIsNewUser] = useState(() => {
    const stored = localStorage.getItem("monologg_is_new_user");
    if (stored !== null) return stored === "true";
    return currentUser ? (currentUser.isNewUser ?? false) : false;
  });
  const [walletBalance, setWalletBalance] = useState(() => {
    const bal = appStateSync.getBalance().available;
    return bal > 0 ? bal : 850000;
  });
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const [fundAmountInput, setFundAmountInput] = useState("50,000");
  const [isFunding, setIsFunding] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  const effectiveProjects = isNewUser ? [] : projects;
  const effectiveOrders = isNewUser ? [] : orders;
  const effectiveShortlist = isNewUser ? [] : shortlist;
  const effectiveActivity = isNewUser ? [] : activity;
  const effectiveStats = isNewUser
    ? [
        { label: "Total Spent", value: "₦0" },
        { label: "Active Projects", value: "0" },
        { label: "Performers Hired", value: "0" },
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
    const details = { ...getProjectDetails(project), ...(projectOverridesInfo[project.id] || {}) };
    setEditedProjectSynopsis(details.description);
    setEditedProjectScript(details.scriptSample);
    setIsEditingProjectInfo(false);
    setEditingSynopsisInline(false);
    setApplicantsProject(project);
    setApplicantActionError(null);
    setLoadingApplicants(true);
    apiClient.listApplicants(project.id).then((list) => {
      if (list && list.length > 0) {
        setApplicants(list);
      } else if (DEFAULT_FALLBACK_APPLICANTS[project.id]) {
        setApplicants(DEFAULT_FALLBACK_APPLICANTS[project.id]);
      } else {
        setApplicants([]);
      }
      setLoadingApplicants(false);
    });
  };

  const viewTalentProfile = (creator: Applicant["creator"]) => {
    const match = talents.find((t) => t.id === creator.id || t.name === creator.name);
    if (match) {
      setSelectedTalent(match);
    } else {
      setSelectedTalent({
        id: creator.id,
        name: creator.name,
        role: creator.role,
        location: creator.location,
        price: creator.price || "₦28,000",
        avatar: creator.avatar,
        verified: creator.verified,
        available: true,
        tags: creator.tags || ["Warm", "Multilingual", "Corporate"],
        rating: 4.9,
        reviews: 18,
      });
    }
  };

  const refreshApplicants = () => {
    if (!applicantsProject) return;
    apiClient.listApplicants(applicantsProject.id).then((list) => {
      if (list && list.length > 0) setApplicants(list);
    });
    apiClient.listClientProjects().then(setProjects);
  };

  const handleShortlist = async (applicationId: string) => {
    setApplicantActionError(null);
    setApplicants((prev) => prev.map((a) => a.applicationId === applicationId ? { ...a, status: "SHORTLISTED" } : a));
    await apiClient.shortlistApplicant(applicationId);
    refreshApplicants();
  };

  const handleRejectApplicant = async (applicationId: string) => {
    setApplicantActionError(null);
    setApplicants((prev) => prev.map((a) => a.applicationId === applicationId ? { ...a, status: "REJECTED" } : a));
    await apiClient.rejectApplicant(applicationId);
    refreshApplicants();
  };

  const handleSelectAndHireApplicant = (applicant: Applicant) => {
    setApplicants((prev) => prev.map((a) => a.applicationId === applicant.applicationId ? { ...a, status: "SELECTED" } : a));
    if (selectedProjectDetail) {
      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "in_progress" }));
      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "in_progress" } : p));
      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "in_progress" } : null);
      appStateSync.addNotification({
        id: `notif-${Date.now()}`,
        kind: "ORDER_CREATED",
        createdAt: new Date().toISOString(),
        payload: { clientName: `Hired ${applicant.creator.name} for ${selectedProjectDetail.name}. Order Room created.` },
      });
    }
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
      setApplicants((prev) => prev.map((a) => a.applicationId === selectingApplicationId ? { ...a, status: "SELECTED" } : a));
      if (selectedProjectDetail) {
        setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "in_progress" }));
        setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "in_progress" } : p));
        setSelectedProjectDetail((prev) => prev ? { ...prev, status: "in_progress" } : null);
        appStateSync.addNotification({
          id: `notif-${Date.now()}`,
          kind: "ORDER_CREATED",
          createdAt: new Date().toISOString(),
          payload: { clientName: `Performer selected for ${selectedProjectDetail.name}. Order Room created.` },
        });
      }
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
    : activeTab === "discover" ? "Find Performers"
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
        onSignOut={async () => { await apiClient.logout(); navigate("/"); }}
        identity={{ initials: clientInitials, name: orgName, avatarUrl: clientProfile.avatarUrl ?? undefined, subtitle: "Client Account" }}
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
          <div className={`hidden ${activeTab === "projects" && selectedProjectDetail ? "lg:hidden" : "lg:flex"} items-center justify-between mb-8`}>
            <div>
              <h1 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {activeTab === "home" && `Good morning, ${orgName} 🎬`}
                {activeTab === "discover" && "Find Performers"}
                {activeTab === "projects" && "My Projects"}
                {activeTab === "orders" && "Active Orders"}
                {activeTab === "shortlist" && "Shortlisted Performers"}
                {activeTab === "activity" && "Activity History"}
              </h1>
              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {activeTab === "home" && "Your next project is just a few clicks away."}
                {activeTab === "discover" && "Browse verified performers, style-tagged by AI, across all niches."}
                {activeTab === "projects" && "Manage your project briefs and applications."}
                {activeTab === "orders" && "Track your active collaborations."}
                {activeTab === "shortlist" && "Performers you've saved for future bookings."}
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
                          {isNewUser ? "Follow these steps to discover, shortlist, and hire top performers for your productions." : "Actions to streamline performer acquisition for your current projects."}
                        </p>
                      </div>
                    </div>
                    <Badge tone={isNewUser ? "accent" : "success"}>{isNewUser ? "Onboarding" : "Active Client"}</Badge>
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
                          Find Performers <ChevronRight className="w-3.5 h-3.5 opacity-60" />
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
                  className="relative overflow-hidden mb-6 p-6 lg:p-7 rounded-[28px] bg-gradient-to-br from-[#7B00FE] to-[#6400D1] text-white shadow-xl"
                >
                  <div className="absolute -top-16 -right-10 w-52 h-52 rounded-full bg-white/10" />
                  <div className="relative space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#F1E9FF] font-semibold">Wallet Balance</div>
                    <div className="font-display font-black text-white tnum leading-none text-4xl sm:text-5xl">
                      {isNewUser ? "₦0" : `₦${walletBalance.toLocaleString()}`}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-xs font-body text-[#F1E9FF]/90">
                      <Briefcase className="w-4 h-4 text-[#F1E9FF]" /> {isNewUser ? "0 active projects · 0 performers hired" : "4 active projects · 12 performers hired"}
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={() => setShowFundWalletModal(true)}
                        className="h-10 px-5 rounded-full text-xs font-bold font-body transition-all active:scale-95 bg-white text-[#7B00FE] shadow-md hover:bg-white/90 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Fund Wallet
                      </button>
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
                    <p className="text-xs font-body mt-1 mb-4 text-[var(--color-text-secondary)]">Post a project brief or discover performers to start building your activity log.</p>
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
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Find Performers</h2>

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
                    aria-label="Filter performers"
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
                      We couldn't find any performers matching your current search or filter criteria. Try clearing your filters or posting a project brief to receive direct pitches.
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
                {selectedProjectDetail ? (() => {
                  const currentStatus = (projectStateOverrides[selectedProjectDetail.id] || selectedProjectDetail.status).toLowerCase();
                  const projectDetails = { ...getProjectDetails(selectedProjectDetail), ...(projectOverridesInfo[selectedProjectDetail.id] || {}) };
                  const effectiveSynopsis = projectDetails.description;
                  const effectiveScript = projectDetails.scriptSample;
                  const effectiveDeliverables = projectDetails.deliverables;
                  const effectiveAssets = projectDetails.assets;
                  const applicantCapNumber = selectedProjectDetail.applicantCap || 10;
                  const applicantCountNumber = applicants.length || selectedProjectDetail.applicants || 0;
                  const capPercentage = Math.min(100, Math.round((applicantCountNumber / applicantCapNumber) * 100));

                  const filteredApplicants = applicants.filter((app) => {
                    if (applicantFilterTab === "shortlisted") return app.status === "SHORTLISTED";
                    if (applicantFilterTab === "selected") return app.status === "SELECTED";
                    if (applicantFilterTab === "applied") return app.status === "APPLIED";
                    if (applicantFilterTab === "rejected") return app.status === "REJECTED";
                    return true;
                  }).filter((app) => {
                    if (!applicantSearchQuery.trim()) return true;
                    const q = applicantSearchQuery.toLowerCase();
                    return (
                      app.creator.name.toLowerCase().includes(q) ||
                      app.creator.role.toLowerCase().includes(q) ||
                      app.creator.location.toLowerCase().includes(q) ||
                      (app.pitch && app.pitch.toLowerCase().includes(q))
                    );
                  });

                  const selectedHiredPerformer = applicants.find((a) => a.status === "SELECTED") || (currentStatus === "in_progress" || currentStatus === "review" || currentStatus === "completed" ? applicants[0] : null);

                  const statusTone =
                    currentStatus === "active"
                      ? "success"
                      : currentStatus === "in_progress"
                      ? "accent"
                      : currentStatus === "review" || currentStatus === "in_review"
                      ? "warning"
                      : currentStatus === "completed"
                      ? "success"
                      : "neutral";

                  const statusLabel =
                    currentStatus === "active"
                      ? "Active · Accepting Pitches"
                      : currentStatus === "in_progress"
                      ? "In Progress · Hired"
                      : currentStatus === "review" || currentStatus === "in_review"
                      ? "Under Review · Files Submitted"
                      : currentStatus === "completed"
                      ? "Completed & Settled"
                      : currentStatus === "closed"
                      ? "Applications Closed"
                      : "Draft";

                  return (
                    /* ── Dedicated Project Management & Details Page (Client POV) ── */
                    <div className="space-y-6">
                      {/* Top Bar: Back link, State Switcher Preview, and Live Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedProjectDetail(null)}
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold font-body py-1.5 px-3 -ml-2 rounded-xl transition-all hover:bg-[var(--color-bg-elevated)] w-fit"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to My Projects</span>
                        </button>

                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Interactive State Previewer */}
                          <div
                            className="inline-flex items-center gap-1 p-1 rounded-xl border text-[11px] font-body"
                            style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)" }}
                          >
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                              State:
                            </span>
                            {[
                              { id: "draft", label: "Draft" },
                              { id: "active", label: "Active" },
                              { id: "in_progress", label: "In Progress" },
                              { id: "review", label: "Review" },
                              { id: "completed", label: "Completed" },
                              { id: "closed", label: "Closed" },
                            ].map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: st.id }));
                                  if (st.id === "in_progress" || st.id === "review" || st.id === "completed") {
                                    setApplicants((prev) => {
                                      if (prev.some((a) => a.status === "SELECTED")) return prev;
                                      if (prev.length > 0) return [{ ...prev[0], status: "SELECTED" }, ...prev.slice(1)];
                                      return prev;
                                    });
                                  }
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                                  currentStatus === st.id
                                    ? "bg-[#7C3AED] text-white shadow-sm"
                                    : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>

                          <Badge tone={statusTone} size="md">
                            {statusLabel}
                          </Badge>
                        </div>
                      </div>

                      {/* Project Header Banner (Clean editorial style) */}
                      <div
                        className="p-6 sm:p-8 rounded-3xl border"
                        style={{
                          background: "var(--color-bg-surface)",
                          borderColor: "var(--color-border-default)",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-tertiary)" }}>
                              {selectedProjectDetail.id}
                            </span>
                            <Badge tone="accent" size="sm">
                              {selectedProjectDetail.niche}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {currentStatus === "draft"
                                ? "Draft Brief · Unfunded"
                                : currentStatus === "in_progress"
                                ? "Escrow Locked · In Production"
                                : currentStatus === "review"
                                ? "48h Inspection Timer Active"
                                : currentStatus === "completed"
                                ? "Escrow Disbursed · Completed"
                                : "100% Escrow Funded"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditingProjectInfo(!isEditingProjectInfo)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold font-body py-1 px-2.5 rounded-xl border transition-all hover:bg-[var(--color-bg-elevated)] w-fit"
                            style={{ borderColor: "var(--color-border-default)", color: "var(--color-accent)" }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEditingProjectInfo ? "Close Editor" : "Edit Brief Info"}</span>
                          </button>
                        </div>

                        {/* Title & Edit view */}
                        {isEditingProjectInfo ? (
                          <div className="p-4 sm:p-5 rounded-2xl border my-4 space-y-4" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                Edit Project Brief Details
                              </span>
                              <button onClick={() => setIsEditingProjectInfo(false)} className="text-xs text-[var(--color-text-tertiary)] hover:underline">
                                Cancel
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Project Title</label>
                                <Input value={editedProjectName} onChange={(e) => setEditedProjectName(e.target.value)} placeholder="Project Title" />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Budget</label>
                                <Input value={editedProjectBudget} onChange={(e) => setEditedProjectBudget(e.target.value)} placeholder="Budget (e.g. ₦200,000)" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Creative Synopsis</label>
                              <textarea
                                value={editedProjectSynopsis}
                                onChange={(e) => setEditedProjectSynopsis(e.target.value)}
                                rows={3}
                                className="w-full p-3 rounded-xl border text-xs sm:text-sm font-body resize-y outline-none"
                                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                                placeholder="Describe the creative project goals..."
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Audition Sides / Script Excerpt</label>
                              <textarea
                                value={editedProjectScript}
                                onChange={(e) => setEditedProjectScript(e.target.value)}
                                rows={2}
                                className="w-full p-3 rounded-xl border text-xs font-mono resize-y outline-none"
                                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                                placeholder="Script excerpt for performers..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="h-9 text-xs font-semibold px-4"
                                onClick={() => {
                                  setSelectedProjectDetail((prev) => prev ? { ...prev, name: editedProjectName, budget: editedProjectBudget } : null);
                                  setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, name: editedProjectName, budget: editedProjectBudget } : p));
                                  setProjectOverridesInfo((prev) => ({
                                    ...prev,
                                    [selectedProjectDetail.id]: {
                                      description: editedProjectSynopsis,
                                      scriptSample: editedProjectScript,
                                    },
                                  }));
                                  setIsEditingProjectInfo(false);
                                }}
                              >
                                Save Changes
                              </Button>
                              <Button variant="secondary" className="h-9 text-xs px-3" onClick={() => setIsEditingProjectInfo(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <h1
                            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {selectedProjectDetail.name}
                          </h1>
                        )}

                        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>{projectDetails.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>{projectDetails.timeline}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>{applicantCountNumber} / {applicantCapNumber} applicants filled</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>Posted {selectedProjectDetail.posted}</span>
                          </div>
                        </div>
                      </div>

                      {/* Two-Column Grid: Left (8 cols) Information & Applicants, Right (4 cols) Sticky Actions */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* ── Left Column: Information & Applicants ── */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                          {/* 1. Creative Brief & Synopsis */}
                          <div
                            className="p-6 sm:p-7 rounded-3xl border space-y-4"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                                <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                  Creative Brief &amp; Synopsis
                                </h2>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingSynopsisInline(!editingSynopsisInline)}
                                className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                              >
                                {editingSynopsisInline ? "Done" : "Edit Synopsis"}
                              </button>
                            </div>

                            {editingSynopsisInline ? (
                              <div className="space-y-3">
                                <textarea
                                  value={editedProjectSynopsis}
                                  onChange={(e) => setEditedProjectSynopsis(e.target.value)}
                                  rows={4}
                                  className="w-full p-3.5 rounded-2xl border text-sm font-body resize-y outline-none"
                                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    className="h-8 text-xs px-3"
                                    onClick={() => {
                                      setProjectOverridesInfo((prev) => ({
                                        ...prev,
                                        [selectedProjectDetail.id]: {
                                          ...(prev[selectedProjectDetail.id] || {}),
                                          description: editedProjectSynopsis,
                                        },
                                      }));
                                      setEditingSynopsisInline(false);
                                    }}
                                  >
                                    Save Synopsis
                                  </Button>
                                  <Button variant="secondary" className="h-8 text-xs px-2.5" onClick={() => setEditingSynopsisInline(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm sm:text-base font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                {effectiveSynopsis}
                              </p>
                            )}
                          </div>

                          {/* 2. Role Requirements */}
                          <div
                            className="p-6 sm:p-7 rounded-3xl border space-y-5"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[var(--color-accent)]" />
                              <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                Role &amp; Craft Requirements
                              </h2>
                            </div>

                            <div>
                              <div className="text-xs uppercase font-semibold font-body tracking-wider mb-2.5" style={{ color: "var(--color-text-tertiary)" }}>
                                Target Craft Niches
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {projectDetails.nicheReq.map((n) => (
                                  <Badge key={n} tone="neutral" size="md" className="capitalize">
                                    {n.replace(/_/g, " ")}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                              <div className="text-xs uppercase font-semibold font-body tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                                Performer Guidelines &amp; Quality Standards
                              </div>
                              <p className="text-sm font-body leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>
                                {projectDetails.additionalNotes}
                              </p>
                              <ul className="text-xs sm:text-sm font-body space-y-2 pl-4 list-disc" style={{ color: "var(--color-text-secondary)" }}>
                                <li>Must have verified profile and demo samples matching requested crafts.</li>
                                <li>Access to professional recording acoustics or studio space.</li>
                                <li>Prompt communication and adherence to production delivery milestones.</li>
                              </ul>
                            </div>
                          </div>

                          {/* 3. Audition Sides & Script Excerpt */}
                          <div
                            className="p-6 sm:p-7 rounded-3xl border space-y-4"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                                <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                  Audition Sides &amp; Script Excerpt
                                </h2>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(effectiveScript);
                                  setCopiedScript(true);
                                  setTimeout(() => setCopiedScript(false), 2000);
                                }}
                                className="h-8 px-3 rounded-xl border text-xs font-semibold font-body flex items-center gap-1.5 transition-all hover:bg-[var(--color-bg-elevated)]"
                                style={{
                                  borderColor: "var(--color-border-default)",
                                  color: copiedScript ? "var(--color-success)" : "var(--color-text-secondary)",
                                }}
                              >
                                {copiedScript ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Script</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                              This excerpt is presented to auditioning performers for their sample take or pitch video:
                            </p>

                            <div
                              className="p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text"
                              style={{
                                background: "var(--color-bg-elevated)",
                                borderColor: "var(--color-hairline)",
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {effectiveScript}
                            </div>
                          </div>

                          {/* 4. Deliverables & Licensing Milestones */}
                          <div
                            className="p-6 sm:p-7 rounded-3xl border space-y-4"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                              <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                Deliverables &amp; Licensing Milestones
                              </h2>
                            </div>

                            <div className="space-y-2.5">
                              {effectiveDeliverables.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 5. Project Assets & Reference Files */}
                          <div
                            className="p-6 sm:p-7 rounded-3xl border space-y-4"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-[var(--color-accent)]" />
                                <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                  Project Assets &amp; Reference Files
                                </h2>
                              </div>
                              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-tertiary)" }}>
                                {effectiveAssets.length} files attached
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {effectiveAssets.map((asset, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-body"
                                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-bg-surface)", color: "var(--color-accent)" }}>
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                      <div className="font-semibold text-xs truncate" style={{ color: "var(--color-text-primary)" }}>
                                        {asset.name}
                                      </div>
                                      <div className="text-[11px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>
                                        {asset.type} · {asset.size}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => alert(`Previewing ${asset.name}`)}
                                      className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-[var(--color-bg-surface)] transition-colors"
                                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                                    >
                                      Preview
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => alert(`Downloading ${asset.name} (${asset.size})`)}
                                      className="p-1.5 rounded-lg border hover:bg-[var(--color-bg-surface)] transition-colors"
                                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-accent)" }}
                                      title="Download asset"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 6. Applicant Pipeline & Casting Management */}
                          <div
                            id="applicant-pipeline-section"
                            className="p-6 sm:p-7 rounded-3xl border space-y-5"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                  Applicant Pipeline &amp; Casting ({applicants.length})
                                </h2>
                                <p className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                                  Review submissions, shortlist favorites, and hire performers with escrow protection.
                                </p>
                              </div>

                              {/* Search */}
                              <div className="relative w-full sm:w-56">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                                <input
                                  type="text"
                                  value={applicantSearchQuery}
                                  onChange={(e) => setApplicantSearchQuery(e.target.value)}
                                  placeholder="Search applicants..."
                                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs font-body outline-none"
                                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                                />
                              </div>
                            </div>

                            {/* State Specific Spotlight Banner */}
                            {currentStatus === "in_progress" && selectedHiredPerformer && (
                              <div
                                className="p-4 sm:p-5 rounded-2xl border space-y-3"
                                style={{ background: "rgba(124, 58, 237, 0.06)", borderColor: "rgba(124, 58, 237, 0.25)" }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                                    <Sparkles className="w-3.5 h-3.5" /> Hired Performer in Production
                                  </span>
                                  <Badge tone="accent" size="sm">Active Contract</Badge>
                                </div>
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 text-sm" background="var(--color-accent-glow)" color="var(--color-accent)">
                                      {selectedHiredPerformer.creator.avatar}
                                    </Avatar>
                                    <div>
                                      <div className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                                        <span>{selectedHiredPerformer.creator.name}</span>
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                      </div>
                                      <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                        {selectedHiredPerformer.creator.role} · {selectedHiredPerformer.creator.location}
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    className="h-9 px-4 text-xs font-semibold gap-1.5"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    Open Order Room <ChevronRight className="w-4 h-4 ml-0.5" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {currentStatus === "review" && (
                              <div
                                className="p-4 sm:p-5 rounded-2xl border space-y-2"
                                style={{ background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.3)" }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="w-4 h-4" /> Deliverables Ready for Inspection
                                  </span>
                                  <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300">
                                    ⏱️ 41h : 22m auto-release
                                  </span>
                                </div>
                                <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                                  Final broadcast audio master WAV files were uploaded by the performer. Inspect files in the Order Room to release payment.
                                </p>
                                <Button
                                  className="h-8 px-3 text-xs font-semibold gap-1.5 mt-1"
                                  onClick={() => navigate("/order/ORD-001")}
                                >
                                  Inspect Files in Order Room <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}

                            {currentStatus === "completed" && (
                              <div
                                className="p-4 sm:p-5 rounded-2xl border space-y-2"
                                style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.3)" }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" /> Collaboration Completed
                                  </span>
                                  <span className="text-xs font-semibold text-amber-500">★ 5.0 Rating</span>
                                </div>
                                <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                                  All milestones approved and escrow of {selectedProjectDetail.budget} disbursed. Order closed successfully.
                                </p>
                              </div>
                            )}

                            {/* Filter Chips Bar */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                              {[
                                { id: "all", label: `All (${applicants.length})` },
                                { id: "shortlisted", label: `Shortlisted (${applicants.filter((a) => a.status === "SHORTLISTED").length})` },
                                { id: "selected", label: `Selected (${applicants.filter((a) => a.status === "SELECTED").length})` },
                                { id: "applied", label: `Applied (${applicants.filter((a) => a.status === "APPLIED").length})` },
                                { id: "rejected", label: `Rejected (${applicants.filter((a) => a.status === "REJECTED").length})` },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setApplicantFilterTab(tab.id as any)}
                                  className={`px-3 py-1 rounded-xl text-xs font-semibold font-body whitespace-nowrap transition-all ${
                                    applicantFilterTab === tab.id
                                      ? "bg-[#7C3AED] text-white shadow-sm"
                                      : "border text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
                                  }`}
                                  style={{
                                    borderColor: applicantFilterTab === tab.id ? "transparent" : "var(--color-hairline)",
                                  }}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            {/* Applicants Feed */}
                            {currentStatus === "draft" && applicants.length === 0 ? (
                              <div className="text-center py-10 px-4 rounded-2xl border border-dashed" style={{ borderColor: "var(--color-border-default)" }}>
                                <FileText className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)]" />
                                <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                                  Project Brief in Draft Mode
                                </div>
                                <p className="text-xs font-body text-[var(--color-text-secondary)] max-w-sm mx-auto mt-1 mb-4">
                                  This brief is private and not yet visible in performer discovery. Publish and fund escrow to start receiving audition pitches.
                                </p>
                                <Button
                                  className="h-9 px-4 text-xs font-semibold gap-1.5"
                                  onClick={() => {
                                    setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                    setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                    setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                  }}
                                >
                                  Publish Brief &amp; Fund Escrow
                                </Button>
                              </div>
                            ) : loadingApplicants ? (
                              <div className="py-8 text-center text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                Loading applicants…
                              </div>
                            ) : filteredApplicants.length === 0 ? (
                              <div className="py-8 text-center text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                No candidates match the current filter.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {filteredApplicants.map((app) => (
                                  <div
                                    key={app.applicationId}
                                    className="p-4 sm:p-5 rounded-2xl border transition-all"
                                    style={{
                                      background: "var(--color-bg-elevated)",
                                      borderColor: app.status === "SELECTED" ? "rgba(124, 58, 237, 0.4)" : "var(--color-hairline)",
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2.5">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-11 h-11 text-sm shrink-0" background="var(--color-accent-glow)" color="var(--color-accent)">
                                          {app.creator.avatar}
                                        </Avatar>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                                              {app.creator.name}
                                            </span>
                                            {app.creator.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                          </div>
                                          <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                            {app.creator.role} · {app.creator.location}
                                            {app.creator.price && ` · ${app.creator.price}`}
                                          </div>
                                        </div>
                                      </div>

                                      <Badge
                                        tone={app.status === "SELECTED" ? "success" : app.status === "SHORTLISTED" ? "accent" : app.status === "REJECTED" ? "error" : "neutral"}
                                        size="sm"
                                      >
                                        {APPLICANT_STATUS_LABEL[app.status] ?? app.status}
                                      </Badge>
                                    </div>

                                    {app.pitch && (
                                      <div
                                        className="text-xs font-body italic my-3 p-3 rounded-xl border leading-relaxed"
                                        style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-secondary)" }}
                                      >
                                        "{app.pitch}"
                                      </div>
                                    )}

                                    {/* Action Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                                      <button
                                        type="button"
                                        onClick={() => viewTalentProfile(app.creator)}
                                        className="text-xs font-semibold font-body hover:underline flex items-center gap-1 text-[var(--color-accent)]"
                                      >
                                        View Profile &amp; Reels →
                                      </button>

                                      <div className="flex items-center gap-2">
                                        {app.status === "APPLIED" && (
                                          <Button
                                            variant="secondary"
                                            className="h-8 px-3 text-xs"
                                            onClick={() => handleShortlist(app.applicationId)}
                                          >
                                            Shortlist
                                          </Button>
                                        )}
                                        {app.status === "REJECTED" ? (
                                          <Button
                                            variant="secondary"
                                            className="h-8 px-3 text-xs"
                                            onClick={() => handleShortlist(app.applicationId)}
                                          >
                                            Move to Shortlist
                                          </Button>
                                        ) : (
                                          app.status !== "SELECTED" && (
                                            <Button
                                              variant="secondary"
                                              className="h-8 px-3 text-xs"
                                              onClick={() => handleRejectApplicant(app.applicationId)}
                                            >
                                              Reject
                                            </Button>
                                          )
                                        )}
                                        {app.status === "SELECTED" ? (
                                          <Button
                                            className="h-8 px-3 text-xs font-semibold gap-1"
                                            onClick={() => navigate("/order/ORD-001")}
                                          >
                                            Open Order Room <ChevronRight className="w-3.5 h-3.5" />
                                          </Button>
                                        ) : (
                                          <Button
                                            className="h-8 px-3 text-xs font-semibold"
                                            onClick={() => handleSelectAndHireApplicant(app)}
                                          >
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

                        {/* ── Right Column: Sticky Compensation, Status & Action Sidebar ── */}
                        <div className="lg:col-span-5 xl:col-span-4">
                          <div
                            className="p-6 rounded-3xl border sticky top-6 space-y-5"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                              boxShadow: "var(--shadow-card)",
                            }}
                          >
                            {/* Budget & Escrow Rate */}
                            <div>
                              <div className="text-xs uppercase font-semibold font-body tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                                Project Budget &amp; Escrow
                              </div>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-display text-3xl font-bold font-mono text-[var(--color-accent)]">
                                  {selectedProjectDetail.budget}
                                </span>
                                <span className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                                  Fixed Escrow
                                </span>
                              </div>
                              <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                                {currentStatus === "draft"
                                  ? "Escrow deposit reserved upon publishing"
                                  : "100% Escrow Funded · Zero talent deduction"}
                              </p>
                            </div>

                            {/* Applicant Capacity Tracker */}
                            <div
                              className="p-4 rounded-2xl border space-y-2.5"
                              style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}
                            >
                              <div className="flex items-center justify-between text-xs font-body">
                                <span style={{ color: "var(--color-text-secondary)" }}>Casting Capacity</span>
                                <span className="font-semibold font-mono" style={{ color: "var(--color-text-primary)" }}>
                                  {applicantCountNumber} / {applicantCapNumber} filled
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${capPercentage}%`,
                                    background: currentStatus === "active" ? "var(--color-accent)" : "var(--color-text-tertiary)",
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1 text-[11px] font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                <span>{currentStatus === "closed" ? "Submissions paused" : "Accepting pitches"}</span>
                                {currentStatus === "active" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "closed" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "closed", applicationsOpen: false } : p));
                                    }}
                                    className="font-semibold text-rose-500 hover:underline"
                                  >
                                    Pause Applications
                                  </button>
                                ) : currentStatus === "closed" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                    }}
                                    className="font-semibold text-emerald-500 hover:underline"
                                  >
                                    Reopen
                                  </button>
                                ) : null}
                              </div>
                            </div>

                            {/* Dynamic State Action Center */}
                            <div
                              className="p-4 sm:p-5 rounded-2xl border space-y-3.5"
                              style={{
                                background:
                                  currentStatus === "in_progress"
                                    ? "rgba(124, 58, 237, 0.06)"
                                    : currentStatus === "review"
                                    ? "rgba(245, 158, 11, 0.08)"
                                    : currentStatus === "completed"
                                    ? "rgba(16, 185, 129, 0.08)"
                                    : "var(--color-bg-elevated)",
                                borderColor:
                                  currentStatus === "in_progress"
                                    ? "rgba(124, 58, 237, 0.25)"
                                    : currentStatus === "review"
                                    ? "rgba(245, 158, 11, 0.3)"
                                    : currentStatus === "completed"
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : "var(--color-hairline)",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider font-body" style={{ color: "var(--color-text-primary)" }}>
                                  Project Action Center
                                </span>
                                <Badge tone={statusTone} size="sm">
                                  {statusLabel}
                                </Badge>
                              </div>

                              {/* State 1: DRAFT */}
                              {currentStatus === "draft" && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    This brief is saved as a private draft. Publish it to Monologg discovery to notify verified performers.
                                  </p>
                                  <Button
                                    className="w-full h-11 text-xs font-semibold gap-1.5"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                      appStateSync.addNotification({
                                        id: `notif-${Date.now()}`,
                                        kind: "PROJECT_APPLICATION",
                                        createdAt: new Date().toISOString(),
                                        payload: { clientName: `Casting Call Live: ${selectedProjectDetail.name}` },
                                      });
                                    }}
                                  >
                                    <Sparkles className="w-4 h-4" /> Publish Brief &amp; Fund Escrow
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs"
                                    onClick={() => setIsEditingProjectInfo(true)}
                                  >
                                    Edit Brief Info
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProjects((prev) => prev.filter((p) => p.id !== selectedProjectDetail.id));
                                      setSelectedProjectDetail(null);
                                    }}
                                    className="w-full text-center text-xs text-rose-500 hover:underline pt-1 font-body"
                                  >
                                    Delete Draft Brief
                                  </button>
                                </div>
                              )}

                              {/* State 2: ACTIVE */}
                              {currentStatus === "active" && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    Casting call is live! Review audition takes and pitches in the applicant pipeline to select your performer.
                                  </p>
                                  <Button
                                    className="w-full h-10 text-xs font-semibold gap-1"
                                    onClick={() => {
                                      const el = document.getElementById("applicant-pipeline-section");
                                      el?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                  >
                                    Review Applicants ({applicants.length})
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "closed" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "closed", applicationsOpen: false } : p));
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "closed", applicationsOpen: false } : null);
                                    }}
                                  >
                                    Pause / Close Applications
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/brief/${selectedProjectDetail.id}`);
                                      setCopiedShareLink(true);
                                      setTimeout(() => setCopiedShareLink(false), 2000);
                                    }}
                                    className="w-full text-center text-xs text-[var(--color-accent)] hover:underline pt-1 font-body flex items-center justify-center gap-1.5"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>{copiedShareLink ? "Link Copied!" : "Copy Shareable Casting Link"}</span>
                                  </button>
                                </div>
                              )}

                              {/* State 3: IN PROGRESS */}
                              {currentStatus === "in_progress" && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    Performer contracted and production is underway. Chat in real-time, inspect files, and approve milestones in the Order Room.
                                  </p>
                                  <Button
                                    className="w-full h-11 text-xs font-semibold gap-1.5"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    Open Order Room <ChevronRight className="w-4 h-4 ml-1" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    Message Performer
                                  </Button>
                                </div>
                              )}

                              {/* State 4: REVIEW */}
                              {(currentStatus === "review" || currentStatus === "in_review") && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    The performer has submitted the final project assets. Review the deliverables before the 48-hour inspection countdown expires.
                                  </p>
                                  <Button
                                    className="w-full h-11 text-xs font-semibold gap-1.5"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    Inspect in Order Room <ChevronRight className="w-4 h-4 ml-1" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    Request Revision
                                  </Button>
                                </div>
                              )}

                              {/* State 5: COMPLETED */}
                              {currentStatus === "completed" && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    All milestones approved and escrow of {selectedProjectDetail.budget} disbursed. Project concluded with 5.0 ★ rating.
                                  </p>
                                  <Button
                                    className="w-full h-10 text-xs font-semibold gap-1.5"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    View Completed Order Room
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs"
                                    onClick={() => navigate("/brief")}
                                  >
                                    Post Similar Project Brief
                                  </Button>
                                </div>
                              )}

                              {/* State 6: CLOSED */}
                              {currentStatus === "closed" && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    Applications are paused. No new candidate pitches can be submitted.
                                  </p>
                                  <Button
                                    className="w-full h-10 text-xs font-semibold gap-1.5"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                    }}
                                  >
                                    Reopen Applications
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Escrow Guarantee Footer Note */}
                            <div
                              className="p-3.5 rounded-2xl border text-xs font-body leading-relaxed space-y-1"
                              style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-secondary)" }}
                            >
                              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Monologg Escrow Protection</span>
                              </div>
                              <p className="text-[11px] leading-normal" style={{ color: "var(--color-text-tertiary)" }}>
                                Funds are held securely in Nigerian banking escrow until you approve final deliverables. 24/7 Casting Concierge support available.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
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
                          Post a project brief with your role requirements, budget, and timeline to start receiving pitches from verified performers.
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
                      You don't have any active bookings or performer hires right now. Search the performer marketplace or review project applications to start an order.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => setActiveTab("discover")} className="gap-2">
                        <Search className="w-4 h-4" /> Discover Performers
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
                          <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Performer: {order.counterpart}</p>
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
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Shortlisted Performers</h2>
                {effectiveShortlist.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Your Shortlist is Empty</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      Bookmark creators while searching the performer directory so you can easily compare their rate cards and hire them for upcoming projects.
                    </p>
                    <Button onClick={() => setActiveTab("discover")} className="gap-2">
                      <Search className="w-4 h-4" /> Explore Performer Directory
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
                      Overview of campaign spending, performer acquisition funnel, and escrow release metrics for {clientProfile.orgName || clientProfile.name}.
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
                      Metrics on performer engagement, application response rates, and total booking spend will be tracked here once you initiate hiring campaigns.
                    </p>
                    <Button onClick={() => setActiveTab("discover")} className="gap-2">
                      <Search className="w-4 h-4" /> Discover Performers
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
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Repeat Performer Rate</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>25%</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>High performer satisfaction</div>
                  </div>
                </div>

                {/* Detailed Charts & Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Applicant Conversion Funnel */}
                  <div className="p-5 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <h3 className="font-display text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Performer Acquisition Funnel</h3>
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
            {applicantsProject && !selectedProjectDetail && (
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
                                  className="w-full h-[54px] px-4 rounded-[var(--radius-lg)] text-base font-body"
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
                    <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>Filter Performers by Physical Features</h3>
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

            {/* ── Fund Wallet Modal ── */}
            {showFundWalletModal && (
              <Modal onClose={() => { setShowFundWalletModal(false); setFundingSuccess(false); }}>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                    <div>
                      <h3 className="font-display text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Fund Client Wallet</h3>
                      <p className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        Add funds via Paystack instant escrow deposit for booking performers
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowFundWalletModal(false); setFundingSuccess(false); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                      style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {fundingSuccess ? (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-6 text-center space-y-3">
                      <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Check className="w-7 h-7" />
                      </div>
                      <h4 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Wallet Funded Successfully!</h4>
                      <p className="text-xs font-body max-w-xs mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                        Your balance has been updated. You can now fund escrow and hire performers immediately.
                      </p>
                      <Button
                        className="mt-2 w-full h-11"
                        onClick={() => { setShowFundWalletModal(false); setFundingSuccess(false); }}
                      >
                        Done
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider block mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                          Quick Amount Presets
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[50000, 100000, 250000, 500000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setFundAmountInput(amt.toLocaleString())}
                              className="py-2 px-1 text-xs font-mono font-medium rounded-xl border transition-all text-center"
                              style={{
                                background: fundAmountInput.replace(/\D/g, "") === amt.toString() ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                                borderColor: fundAmountInput.replace(/\D/g, "") === amt.toString() ? "var(--color-accent)" : "var(--color-hairline)",
                                color: fundAmountInput.replace(/\D/g, "") === amt.toString() ? "var(--color-accent)" : "var(--color-text-secondary)",
                              }}
                            >
                              ₦{(amt / 1000)}k
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider block mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                          Amount to Fund (NGN)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm pointer-events-none" style={{ color: "var(--color-text-secondary)" }}>
                            ₦
                          </span>
                          <Input
                            className="pl-8 text-base font-mono font-bold h-12"
                            value={fundAmountInput}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, "");
                              const num = parseInt(raw, 10);
                              setFundAmountInput(isNaN(num) ? "" : num.toLocaleString());
                            }}
                            placeholder="e.g. 100,000"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                          <span className="text-xs font-body font-medium" style={{ color: "var(--color-text-primary)" }}>Paystack Instant Escrow</span>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-emerald-500">Secured 256-bit</span>
                      </div>

                      <div className="pt-2">
                        <Button
                          className="w-full h-12 text-sm font-bold shadow-md"
                          disabled={isFunding || !fundAmountInput || parseInt(fundAmountInput.replace(/\D/g, ""), 10) <= 0}
                          onClick={() => {
                            const amt = parseInt(fundAmountInput.replace(/\D/g, ""), 10) || 0;
                            if (amt <= 0) return;
                            setIsFunding(true);
                            setTimeout(() => {
                              appStateSync.fundWallet(amt);
                              setWalletBalance(prev => prev + amt);
                              setIsFunding(false);
                              setFundingSuccess(true);
                            }, 500);
                          }}
                        >
                          {isFunding ? "Processing Payment..." : `Fund Wallet ₦${fundAmountInput || "0"}`}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Modal>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav navItems={CLIENT_BOTTOM_NAV_ITEMS} activeTab={activeTab} onTab={setActiveTab} indicatorId="client-tab-indicator" />
    </div>
  );
}
