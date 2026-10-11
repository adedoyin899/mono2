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

export function getSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

export function getAreaPath(points: { x: number; y: number }[], baselineY: number): string {
  if (points.length === 0) return "";
  const spline = getSplinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${spline} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
}

export type ClientAnalyticsRange = "30d" | "90d" | "year" | "all";

export const CLIENT_ANALYTICS_DATA: Record<
  ClientAnalyticsRange,
  {
    rangeLabel: string;
    totalSpend: string;
    spendSubtext: string;
    successfulProjects: string;
    projectsSubtext: string;
    avgRating: string;
    ratingSubtext: string;
    repeatRate: string;
    repeatSubtext: string;
    graphPeriodSubtitle: string;
    graphPoints: { label: string; amount: number }[];
    yTicks: { label: string; val: number }[];
    maxVal: number;
  }
> = {
  "30d": {
    rangeLabel: "Last 30 days",
    totalSpend: "₦285,000",
    spendSubtext: "+18% vs previous month",
    successfulProjects: "2",
    projectsSubtext: "100% on-time milestone delivery",
    avgRating: "5.0 ★",
    ratingSubtext: "Across 2 verified performer reviews",
    repeatRate: "33%",
    repeatSubtext: "High talent retention rate",
    graphPeriodSubtitle: "Campaign spend across 4 weekly payout milestones",
    graphPoints: [
      { label: "Wk 1", amount: 45000 },
      { label: "Wk 2", amount: 80000 },
      { label: "Wk 3", amount: 60000 },
      { label: "Wk 4", amount: 100000 },
    ],
    yTicks: [
      { label: "₦100k", val: 100000 },
      { label: "₦75k", val: 75000 },
      { label: "₦50k", val: 50000 },
      { label: "₦25k", val: 25000 },
      { label: "₦0", val: 0 },
    ],
    maxVal: 100000,
  },
  "90d": {
    rangeLabel: "Last 90 days",
    totalSpend: "₦590,000",
    spendSubtext: "+24% quarterly growth",
    successfulProjects: "3",
    projectsSubtext: "3 productions wrapped & released",
    avgRating: "4.9 ★",
    ratingSubtext: "Across 3 verified performer reviews",
    repeatRate: "28%",
    repeatSubtext: "Optimal roster re-hire benchmark",
    graphPeriodSubtitle: "Quarterly escrow commitment and disbursements",
    graphPoints: [
      { label: "Month 1", amount: 150000 },
      { label: "Month 2", amount: 220000 },
      { label: "Month 3", amount: 220000 },
    ],
    yTicks: [
      { label: "₦250k", val: 250000 },
      { label: "₦200k", val: 200000 },
      { label: "₦150k", val: 150000 },
      { label: "₦100k", val: 100000 },
      { label: "₦0", val: 0 },
    ],
    maxVal: 250000,
  },
  "year": {
    rangeLabel: "This Year",
    totalSpend: "₦850,000",
    spendSubtext: "Across 4 active & completed briefs",
    successfulProjects: "4",
    projectsSubtext: "100% dispute-free completions",
    avgRating: "4.9 ★",
    ratingSubtext: "Top 5% client rating on Monologg",
    repeatRate: "25%",
    repeatSubtext: "High performer satisfaction",
    graphPeriodSubtitle: "Year-to-date production budgets locked in escrow",
    graphPoints: [
      { label: "Q1", amount: 180000 },
      { label: "Q2", amount: 240000 },
      { label: "Q3", amount: 280000 },
      { label: "Q4", amount: 150000 },
    ],
    yTicks: [
      { label: "₦300k", val: 300000 },
      { label: "₦200k", val: 200000 },
      { label: "₦100k", val: 100000 },
      { label: "₦0", val: 0 },
    ],
    maxVal: 300000,
  },
  "all": {
    rangeLabel: "All time",
    totalSpend: "₦1,420,000",
    spendSubtext: "Cumulative verified platform spend",
    successfulProjects: "6",
    projectsSubtext: "All escrow funds settled",
    avgRating: "4.9 ★",
    ratingSubtext: "Consistent 5-star reputation",
    repeatRate: "30%",
    repeatSubtext: "Trusted client partner tier",
    graphPeriodSubtitle: "Historical platform spend across all completed cycles",
    graphPoints: [
      { label: "H1 2025", amount: 250000 },
      { label: "H2 2025", amount: 320000 },
      { label: "H1 2026", amount: 450000 },
      { label: "H2 2026", amount: 400000 },
    ],
    yTicks: [
      { label: "₦500k", val: 500000 },
      { label: "₦375k", val: 375000 },
      { label: "₦250k", val: 250000 },
      { label: "₦125k", val: 125000 },
      { label: "₦0", val: 0 },
    ],
    maxVal: 500000,
  },
};

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
  const [analyticsDateRange, setAnalyticsDateRange] = useState<ClientAnalyticsRange>("year");
  const [hoveredSpendIndex, setHoveredSpendIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [selectedApplicantForProfile, setSelectedApplicantForProfile] = useState<Applicant | null>(null);
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
  const [editingSection, setEditingSection] = useState<"overview" | "roles" | "sides" | "deliverables" | "assets" | null>(null);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [editedProjectBudget, setEditedProjectBudget] = useState("");
  const [editedProjectNiche, setEditedProjectNiche] = useState("");
  const [editedProjectLocation, setEditedProjectLocation] = useState("");
  const [editedProjectTimeline, setEditedProjectTimeline] = useState("");
  const [editedProjectSynopsis, setEditedProjectSynopsis] = useState("");
  const [editedProjectScript, setEditedProjectScript] = useState("");
  const [editedRoleNiches, setEditedRoleNiches] = useState<string[]>([]);
  const [editedRoleGuidelines, setEditedRoleGuidelines] = useState("");
  const [editedDeliverables, setEditedDeliverables] = useState<string[]>([]);
  const [newDeliverableInput, setNewDeliverableInput] = useState("");
  const [editedAssets, setEditedAssets] = useState<{ name: string; size: string; type: string }[]>([]);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState("Brief PDF");
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
    setEditedProjectNiche(project.niche);
    const details = { ...getProjectDetails(project), ...(projectOverridesInfo[project.id] || {}) };
    setEditedProjectSynopsis(details.description);
    setEditedProjectScript(details.scriptSample);
    setEditedProjectLocation(details.location);
    setEditedProjectTimeline(details.timeline);
    setEditedRoleNiches(details.nicheReq || []);
    setEditedRoleGuidelines(details.additionalNotes || "");
    setEditedDeliverables(details.deliverables || []);
    setEditedAssets(details.assets || []);
    setIsEditingProjectInfo(false);
    setEditingSynopsisInline(false);
    setEditingSection(null);
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

  const viewTalentProfile = (creator: Applicant["creator"], applicant?: Applicant) => {
    setSelectedApplicantForProfile(applicant || null);
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
    setSelectedApplicantForProfile((prev) => prev && prev.applicationId === applicationId ? { ...prev, status: "SHORTLISTED" } : prev);
    await apiClient.shortlistApplicant(applicationId);
    refreshApplicants();
  };

  const handleRejectApplicant = async (applicationId: string) => {
    setApplicantActionError(null);
    setApplicants((prev) => prev.map((a) => a.applicationId === applicationId ? { ...a, status: "REJECTED" } : a));
    setSelectedApplicantForProfile((prev) => prev && prev.applicationId === applicationId ? { ...prev, status: "REJECTED" } : prev);
    await apiClient.rejectApplicant(applicationId);
    refreshApplicants();
  };

  const handleSelectAndHireApplicant = (applicant: Applicant) => {
    setApplicants((prev) => prev.map((a) => a.applicationId === applicant.applicationId ? { ...a, status: "SELECTED" } : a));
    setSelectedApplicantForProfile((prev) => prev && prev.applicationId === applicant.applicationId ? { ...prev, status: "SELECTED" } : prev);
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
                          Profile <ChevronRight className="w-3.5 h-3.5 opacity-60" />
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
                        onClick={() => { setSelectedApplicantForProfile(null); setSelectedTalent(talent); }}
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
                  const applicantCountNumber = currentStatus === "draft" ? 0 : (applicants.length || selectedProjectDetail.applicants || 0);
                  const capPercentage = currentStatus === "draft" ? 0 : currentStatus === "in_progress" || currentStatus === "review" || currentStatus === "completed" ? 100 : Math.min(100, Math.round((applicantCountNumber / applicantCapNumber) * 100));

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
                      {/* Top Bar: Back link & State Switcher Preview */}
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
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                                  currentStatus === st.id
                                    ? st.id === "draft"
                                      ? "bg-zinc-700 text-white shadow-sm"
                                      : st.id === "active"
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : st.id === "in_progress"
                                      ? "bg-[#7C3AED] text-white shadow-sm"
                                      : st.id === "review"
                                      ? "bg-amber-600 text-white shadow-sm"
                                      : st.id === "completed"
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-zinc-600 text-white shadow-sm"
                                    : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
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
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                currentStatus === "draft"
                                  ? "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                                  : currentStatus === "in_progress"
                                  ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                                  : currentStatus === "review"
                                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                  : currentStatus === "completed"
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                  : currentStatus === "closed"
                                  ? "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              }`}
                            >
                              {currentStatus === "draft" ? (
                                <>
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Draft Brief · Unfunded</span>
                                </>
                              ) : currentStatus === "in_progress" ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Escrow Locked · In Production</span>
                                </>
                              ) : currentStatus === "review" ? (
                                <>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>48h Inspection Timer Active</span>
                                </>
                              ) : currentStatus === "completed" ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Escrow Disbursed · Completed</span>
                                </>
                              ) : currentStatus === "closed" ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Applications Paused · Closed</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>100% Escrow Funded · Live Casting</span>
                                </>
                              )}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingSection(editingSection === "overview" ? null : "overview")}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold font-body py-1.5 px-3 rounded-xl border transition-all hover:bg-[var(--color-bg-elevated)] w-fit whitespace-nowrap shrink-0"
                            style={{ borderColor: "var(--color-border-default)", color: "var(--color-accent)" }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{editingSection === "overview" ? "Close Section Editor" : "Edit Brief Info"}</span>
                          </button>
                        </div>

                        <h1
                          className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {selectedProjectDetail.name}
                        </h1>

                        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>{projectDetails.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>
                              {currentStatus === "draft"
                                ? "Opens upon publishing"
                                : currentStatus === "in_progress"
                                ? "Delivery due in 4 days"
                                : currentStatus === "review"
                                ? "48h review countdown"
                                : currentStatus === "completed"
                                ? "Delivery completed"
                                : currentStatus === "closed"
                                ? "Applications closed"
                                : projectDetails.timeline}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>
                              {currentStatus === "draft"
                                ? `Target: ${applicantCapNumber} performers`
                                : currentStatus === "in_progress"
                                ? "1 performer contracted"
                                : currentStatus === "review"
                                ? "1 performer submitted"
                                : currentStatus === "completed"
                                ? "1 performer completed"
                                : `${applicantCountNumber} / ${applicantCapNumber} applicants filled`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>
                              {currentStatus === "draft"
                                ? `Draft saved ${selectedProjectDetail.posted}`
                                : `Posted ${selectedProjectDetail.posted}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Guided Draft Stepper (Prominent in Draft Mode) ── */}
                      {currentStatus === "draft" && (
                        <div
                          className="p-5 sm:p-6 rounded-3xl border space-y-4"
                          style={{
                            background: "var(--color-bg-surface)",
                            borderColor: "var(--color-border-default)",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] font-body">
                                  Draft Setup Stepper
                                </span>
                              </div>
                              <h2 className="text-base sm:text-lg font-bold font-display mt-0.5" style={{ color: "var(--color-text-primary)" }}>
                                Complete project brief sections before publishing to performers
                              </h2>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-semibold px-3 py-1 rounded-full font-mono border whitespace-nowrap"
                                style={{
                                  background: "var(--color-bg-elevated)",
                                  borderColor: "var(--color-hairline)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                5/5 Sections Ready
                              </span>
                              <Button
                                size="sm"
                                className="h-8 px-3.5 text-xs font-semibold whitespace-nowrap shadow-sm"
                                onClick={() => {
                                  setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                  setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                  setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                  if (applicants.length === 0 && DEFAULT_FALLBACK_APPLICANTS[selectedProjectDetail.id]) {
                                    setApplicants(DEFAULT_FALLBACK_APPLICANTS[selectedProjectDetail.id]);
                                  }
                                }}
                              >
                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                <span>Publish &amp; Fund Escrow</span>
                              </Button>
                            </div>
                          </div>

                          {/* 5 Stepper Step Tiles */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            {[
                              { id: "overview", num: "01", title: "Overview", desc: "Title & Synopsis", targetId: "section-overview" },
                              { id: "roles", num: "02", title: "Roles", desc: "Craft Niches", targetId: "section-roles" },
                              { id: "sides", num: "03", title: "Sides", desc: "Audition Script", targetId: "section-sides" },
                              { id: "deliverables", num: "04", title: "Milestones", desc: "Deliverables", targetId: "section-deliverables" },
                              { id: "assets", num: "05", title: "Assets", desc: "Reference Files", targetId: "section-assets" },
                            ].map((step) => {
                              const isEditing = editingSection === step.id;
                              return (
                                <button
                                  key={step.id}
                                  type="button"
                                  onClick={() => {
                                    setEditingSection(isEditing ? null : (step.id as any));
                                    const el = document.getElementById(step.targetId);
                                    el?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className={`p-3 rounded-2xl border text-left transition-all ${
                                    isEditing
                                      ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-sm"
                                      : "border-[var(--color-hairline)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg-elevated)]"
                                  }`}
                                  style={{
                                    background: isEditing ? "var(--color-bg-elevated)" : "var(--color-bg-surface)",
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[11px] font-bold text-[var(--color-accent)]">
                                      {step.num}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                      {isEditing ? "Editing" : "Ready"}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold font-body truncate" style={{ color: "var(--color-text-primary)" }}>
                                    {step.title}
                                  </div>
                                  <div className="text-[11px] font-body truncate" style={{ color: "var(--color-text-tertiary)" }}>
                                    {step.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Two-Column Grid: Left (8 cols) Information & Applicants, Right (4 cols) Sticky Actions */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* ── Left Column: Information & Applicants ── */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                          {/* 1. Creative Brief & Synopsis (Inline Editable) */}
                          <div
                            id="section-overview"
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
                                onClick={() => setEditingSection(editingSection === "overview" ? null : "overview")}
                                className="text-xs font-semibold text-[var(--color-accent)] hover:underline whitespace-nowrap"
                              >
                                {editingSection === "overview" ? "Done" : "Edit Overview"}
                              </button>
                            </div>

                            {editingSection === "overview" ? (
                              <div className="space-y-4 p-4 rounded-2xl border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                                <div className="text-xs uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Edit Overview &amp; Synopsis Details
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                      Project Title
                                    </label>
                                    <Input
                                      value={editedProjectName}
                                      onChange={(e) => setEditedProjectName(e.target.value)}
                                      placeholder="Project Title"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                      Fixed Budget (Escrow)
                                    </label>
                                    <Input
                                      value={editedProjectBudget}
                                      onChange={(e) => setEditedProjectBudget(e.target.value)}
                                      placeholder="Budget (e.g. ₦200,000)"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                      Location / Venue
                                    </label>
                                    <Input
                                      value={editedProjectLocation}
                                      onChange={(e) => setEditedProjectLocation(e.target.value)}
                                      placeholder="e.g. Lagos, NG (Hybrid/Remote)"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                      Project Timeline
                                    </label>
                                    <Input
                                      value={editedProjectTimeline}
                                      onChange={(e) => setEditedProjectTimeline(e.target.value)}
                                      placeholder="e.g. 7 Days Delivery"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                    Creative Brief &amp; Synopsis
                                  </label>
                                  <textarea
                                    value={editedProjectSynopsis}
                                    onChange={(e) => setEditedProjectSynopsis(e.target.value)}
                                    rows={4}
                                    className="w-full p-3.5 rounded-2xl border text-sm font-body resize-y outline-none"
                                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    className="h-8 text-xs px-3 whitespace-nowrap"
                                    onClick={() => {
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, name: editedProjectName, budget: editedProjectBudget, niche: editedProjectNiche || prev.niche } : null);
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, name: editedProjectName, budget: editedProjectBudget, niche: editedProjectNiche || p.niche } : p));
                                      setProjectOverridesInfo((prev) => ({
                                        ...prev,
                                        [selectedProjectDetail.id]: {
                                          ...(prev[selectedProjectDetail.id] || {}),
                                          description: editedProjectSynopsis,
                                          location: editedProjectLocation,
                                          timeline: editedProjectTimeline,
                                        },
                                      }));
                                      setEditingSection(null);
                                    }}
                                  >
                                    Save Overview
                                  </Button>
                                  <Button variant="secondary" className="h-8 text-xs px-2.5 whitespace-nowrap" onClick={() => setEditingSection(null)}>
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

                          {/* 2. Role Requirements (Inline Editable) */}
                          <div
                            id="section-roles"
                            className="p-6 sm:p-7 rounded-3xl border space-y-5"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[var(--color-accent)]" />
                                <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                  Role &amp; Craft Requirements
                                </h2>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingSection(editingSection === "roles" ? null : "roles")}
                                className="text-xs font-semibold text-[var(--color-accent)] hover:underline whitespace-nowrap"
                              >
                                {editingSection === "roles" ? "Done" : "Edit Requirements"}
                              </button>
                            </div>

                            {editingSection === "roles" ? (
                              <div className="space-y-4 p-4 rounded-2xl border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                                <div className="text-xs uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Select Target Craft Niches
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {["VO_ARTIST", "ACTOR", "COMPERE", "COMEDIAN", "SPEAKER_PASTOR", "CREATOR"].map((nicheOption) => {
                                    const active = editedRoleNiches.includes(nicheOption);
                                    return (
                                      <button
                                        key={nicheOption}
                                        type="button"
                                        onClick={() => {
                                          setEditedRoleNiches((prev) =>
                                            active ? prev.filter((n) => n !== nicheOption) : [...prev, nicheOption]
                                          );
                                        }}
                                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                          active
                                            ? "bg-[#7C3AED] text-white shadow-sm"
                                            : "border text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]"
                                        }`}
                                        style={{ borderColor: active ? "transparent" : "var(--color-hairline)" }}
                                      >
                                        {nicheOption.replace(/_/g, " ")}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                    Performer Guidelines &amp; Quality Standards
                                  </label>
                                  <textarea
                                    value={editedRoleGuidelines}
                                    onChange={(e) => setEditedRoleGuidelines(e.target.value)}
                                    rows={3}
                                    className="w-full p-3.5 rounded-2xl border text-sm font-body resize-y outline-none"
                                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                    placeholder="Specify acoustic requirements, prior experience, or casting criteria..."
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    className="h-8 text-xs px-3 whitespace-nowrap"
                                    onClick={() => {
                                      setProjectOverridesInfo((prev) => ({
                                        ...prev,
                                        [selectedProjectDetail.id]: {
                                          ...(prev[selectedProjectDetail.id] || {}),
                                          nicheReq: editedRoleNiches,
                                          additionalNotes: editedRoleGuidelines,
                                        },
                                      }));
                                      setEditingSection(null);
                                    }}
                                  >
                                    Save Requirements
                                  </Button>
                                  <Button variant="secondary" className="h-8 text-xs px-2.5 whitespace-nowrap" onClick={() => setEditingSection(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>

                          {/* 3. Audition Sides & Script Excerpt (Inline Editable) */}
                          <div
                            id="section-sides"
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

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(effectiveScript);
                                    setCopiedScript(true);
                                    setTimeout(() => setCopiedScript(false), 2000);
                                  }}
                                  className="h-8 px-3 rounded-xl border text-xs font-semibold font-body flex items-center gap-1.5 transition-all hover:bg-[var(--color-bg-elevated)] whitespace-nowrap"
                                  style={{
                                    borderColor: "var(--color-border-default)",
                                    color: copiedScript ? "var(--color-success)" : "var(--color-text-secondary)",
                                  }}
                                >
                                  {copiedScript ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span className="text-emerald-500 whitespace-nowrap">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 shrink-0" />
                                      <span className="whitespace-nowrap">Copy Script</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSection(editingSection === "sides" ? null : "sides")}
                                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline whitespace-nowrap"
                                >
                                  {editingSection === "sides" ? "Done" : "Edit Script"}
                                </button>
                              </div>
                            </div>

                            {editingSection === "sides" ? (
                              <div className="space-y-4 p-4 rounded-2xl border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                                <div className="text-xs uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Audition Copy / Sides
                                </div>
                                <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Performers auditioning will read and record this sides excerpt for their audition pitch:
                                </p>
                                <textarea
                                  value={editedProjectScript}
                                  onChange={(e) => setEditedProjectScript(e.target.value)}
                                  rows={4}
                                  className="w-full p-3.5 rounded-2xl border font-mono text-xs sm:text-sm resize-y outline-none"
                                  style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                  placeholder="Sides / Script Excerpt..."
                                />
                                <div className="flex gap-2">
                                  <Button
                                    className="h-8 text-xs px-3 whitespace-nowrap"
                                    onClick={() => {
                                      setProjectOverridesInfo((prev) => ({
                                        ...prev,
                                        [selectedProjectDetail.id]: {
                                          ...(prev[selectedProjectDetail.id] || {}),
                                          scriptSample: editedProjectScript,
                                        },
                                      }));
                                      setEditingSection(null);
                                    }}
                                  >
                                    Save Audition Sides
                                  </Button>
                                  <Button variant="secondary" className="h-8 text-xs px-2.5 whitespace-nowrap" onClick={() => setEditingSection(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>

                          {/* 4. Deliverables & Licensing Milestones (Inline Editable) */}
                          <div
                            id="section-deliverables"
                            className="p-6 sm:p-7 rounded-3xl border space-y-4"
                            style={{
                              background: "var(--color-bg-surface)",
                              borderColor: "var(--color-border-default)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                                <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                                  Deliverables &amp; Licensing Milestones
                                </h2>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingSection(editingSection === "deliverables" ? null : "deliverables")}
                                className="text-xs font-semibold text-[var(--color-accent)] hover:underline whitespace-nowrap"
                              >
                                {editingSection === "deliverables" ? "Done" : "Edit Deliverables"}
                              </button>
                            </div>

                            {editingSection === "deliverables" ? (
                              <div className="space-y-4 p-4 rounded-2xl border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                                <div className="text-xs uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Manage Milestone Deliverables
                                </div>
                                <div className="space-y-2">
                                  {editedDeliverables.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditedDeliverables((prev) => prev.map((d, i) => i === idx ? val : d));
                                        }}
                                        className="flex-1 p-2.5 rounded-xl border text-xs font-body outline-none"
                                        style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setEditedDeliverables((prev) => prev.filter((_, i) => i !== idx))}
                                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all shrink-0"
                                        title="Remove deliverable"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                                  <input
                                    type="text"
                                    value={newDeliverableInput}
                                    onChange={(e) => setNewDeliverableInput(e.target.value)}
                                    placeholder="Add deliverable milestone (e.g. 1x 30s broadcast master WAV)..."
                                    className="flex-1 p-2.5 rounded-xl border text-xs font-body outline-none"
                                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                  />
                                  <Button
                                    size="sm"
                                    className="h-9 px-3 text-xs whitespace-nowrap"
                                    onClick={() => {
                                      if (newDeliverableInput.trim()) {
                                        setEditedDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                                        setNewDeliverableInput("");
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    className="h-8 text-xs px-3 whitespace-nowrap"
                                    onClick={() => {
                                      setProjectOverridesInfo((prev) => ({
                                        ...prev,
                                        [selectedProjectDetail.id]: {
                                          ...(prev[selectedProjectDetail.id] || {}),
                                          deliverables: editedDeliverables,
                                        },
                                      }));
                                      setEditingSection(null);
                                    }}
                                  >
                                    Save Deliverables
                                  </Button>
                                  <Button variant="secondary" className="h-8 text-xs px-2.5 whitespace-nowrap" onClick={() => setEditingSection(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {effectiveDeliverables.map((item, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 5. Project Assets & Reference Files (Inline Editable) */}
                          <div
                            id="section-assets"
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
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-tertiary)" }}>
                                  {effectiveAssets.length} files attached
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingSection(editingSection === "assets" ? null : "assets")}
                                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline whitespace-nowrap"
                                >
                                  {editingSection === "assets" ? "Done" : "Manage Assets"}
                                </button>
                              </div>
                            </div>

                            {editingSection === "assets" ? (
                              <div className="space-y-4 p-4 rounded-2xl border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                                <div className="text-xs uppercase tracking-wider font-semibold font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                  Attached Project Files
                                </div>
                                <div className="space-y-2">
                                  {editedAssets.map((asset, idx) => (
                                    <div
                                      key={idx}
                                      className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-body"
                                      style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)" }}
                                    >
                                      <div className="flex items-center gap-2.5 truncate">
                                        <FileText className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                                        <span className="font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{asset.name}</span>
                                        <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">({asset.type} · {asset.size})</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setEditedAssets((prev) => prev.filter((_, i) => i !== idx))}
                                        className="text-rose-500 hover:text-rose-600 p-1 shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="p-3 rounded-xl border space-y-2.5" style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)" }}>
                                  <div className="text-[11px] font-semibold uppercase tracking-wider font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                    Attach New Reference File
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={newAssetName}
                                      onChange={(e) => setNewAssetName(e.target.value)}
                                      placeholder="File Name (e.g. Campaign_Moodboard.pdf)"
                                      className="p-2 rounded-xl border text-xs font-body outline-none"
                                      style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                    />
                                    <input
                                      type="text"
                                      value={newAssetType}
                                      onChange={(e) => setNewAssetType(e.target.value)}
                                      placeholder="File Type (e.g. Style Guide)"
                                      className="p-2 rounded-xl border text-xs font-body outline-none"
                                      style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs whitespace-nowrap"
                                    onClick={() => {
                                      if (newAssetName.trim()) {
                                        setEditedAssets((prev) => [
                                          ...prev,
                                          { name: newAssetName.trim(), type: newAssetType.trim() || "Brief Document", size: "1.8 MB" },
                                        ]);
                                        setNewAssetName("");
                                      }
                                    }}
                                  >
                                    Attach File
                                  </Button>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    className="h-8 text-xs px-3 whitespace-nowrap"
                                    onClick={() => {
                                      setProjectOverridesInfo((prev) => ({
                                        ...prev,
                                        [selectedProjectDetail.id]: {
                                          ...(prev[selectedProjectDetail.id] || {}),
                                          assets: editedAssets,
                                        },
                                      }));
                                      setEditingSection(null);
                                    }}
                                  >
                                    Save Assets
                                  </Button>
                                  <Button variant="secondary" className="h-8 text-xs px-2.5 whitespace-nowrap" onClick={() => setEditingSection(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
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
                                        className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-[var(--color-bg-surface)] transition-colors whitespace-nowrap"
                                        style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                                      >
                                        Preview
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => alert(`Downloading ${asset.name} (${asset.size})`)}
                                        className="p-1.5 rounded-lg border hover:bg-[var(--color-bg-surface)] transition-colors whitespace-nowrap"
                                        style={{ borderColor: "var(--color-border-default)", color: "var(--color-accent)" }}
                                        title="Download asset"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
                                  Applicant Pipeline &amp; Casting {currentStatus !== "draft" ? `(${applicants.length})` : ""}
                                </h2>
                                <p className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                                  {currentStatus === "draft"
                                    ? "Casting submissions will appear here once this brief is published to performers."
                                    : "Review submissions, shortlist favorites, and hire performers with escrow protection."}
                                </p>
                              </div>

                              {currentStatus !== "draft" && (
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
                              )}
                            </div>

                            {/* State Specific Spotlight Banner or Inactive Draft Mode */}
                            {currentStatus === "draft" ? (
                              <div className="text-center py-12 px-6 rounded-2xl border border-dashed" style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-elevated)" }}>
                                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-sm" style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}>
                                  <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold font-display" style={{ color: "var(--color-text-primary)" }}>
                                  Casting Pipeline Inactive
                                </h3>
                                <p className="text-xs sm:text-sm font-body text-[var(--color-text-secondary)] max-w-md mx-auto mt-1.5 mb-5 leading-relaxed">
                                  This project brief is saved as a private draft and is not visible in performer discovery. Publish and fund escrow to start receiving audition pitches.
                                </p>
                                <Button
                                  className="h-10 px-5 text-xs font-semibold gap-2 whitespace-nowrap shadow-sm mx-auto"
                                  onClick={() => {
                                    setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                    setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                    setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                    if (applicants.length === 0 && DEFAULT_FALLBACK_APPLICANTS[selectedProjectDetail.id]) {
                                      setApplicants(DEFAULT_FALLBACK_APPLICANTS[selectedProjectDetail.id]);
                                    }
                                  }}
                                >
                                  <Sparkles className="w-4 h-4 shrink-0" />
                                  <span>Publish &amp; Fund Escrow</span>
                                </Button>
                              </div>
                            ) : (
                              <>
                                {currentStatus === "in_progress" && selectedHiredPerformer && (
                                  <div
                                    className="p-4 sm:p-5 rounded-2xl border space-y-3"
                                    style={{ background: "rgba(124, 58, 237, 0.06)", borderColor: "rgba(124, 58, 237, 0.25)" }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                                        <Sparkles className="w-3.5 h-3.5 shrink-0" /> Hired Performer in Production
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
                                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                          </div>
                                          <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                            {selectedHiredPerformer.creator.role} · {selectedHiredPerformer.creator.location}
                                          </div>
                                        </div>
                                      </div>

                                      <Button
                                        className="h-9 px-4 text-xs font-semibold gap-1.5 whitespace-nowrap"
                                        onClick={() => navigate("/order/ORD-001")}
                                      >
                                        <span>Open Order Room</span>
                                        <ChevronRight className="w-4 h-4 ml-0.5 shrink-0" />
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
                                        <AlertCircle className="w-4 h-4 shrink-0" /> Deliverables Ready for Inspection
                                      </span>
                                      <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300">
                                        ⏱️ 41h : 22m auto-release
                                      </span>
                                    </div>
                                    <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                                      Final broadcast audio master WAV files were uploaded by the performer. Inspect files in the Order Room to release payment.
                                    </p>
                                    <Button
                                      className="h-8 px-3 text-xs font-semibold gap-1.5 mt-1 whitespace-nowrap"
                                      onClick={() => navigate("/order/ORD-001")}
                                    >
                                      <span>Inspect in Order Room</span>
                                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
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
                                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Collaboration Completed
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
                                {loadingApplicants ? (
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
                                                {app.creator.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
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
                                            onClick={() => viewTalentProfile(app.creator, app)}
                                            className="text-xs font-semibold font-body hover:underline flex items-center gap-1 text-[var(--color-accent)] whitespace-nowrap"
                                          >
                                            <span>View Profile &amp; Reels</span>
                                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                          </button>

                                          <div className="flex items-center gap-2">
                                            {currentStatus === "active" ? (
                                              <>
                                                {app.status === "APPLIED" && (
                                                  <Button
                                                    variant="secondary"
                                                    className="h-8 px-3 text-xs whitespace-nowrap"
                                                    onClick={() => handleShortlist(app.applicationId)}
                                                  >
                                                    Shortlist
                                                  </Button>
                                                )}
                                                {app.status === "REJECTED" ? (
                                                  <Button
                                                    variant="secondary"
                                                    className="h-8 px-3 text-xs whitespace-nowrap"
                                                    onClick={() => handleShortlist(app.applicationId)}
                                                  >
                                                    Move to Shortlist
                                                  </Button>
                                                ) : (
                                                  app.status !== "SELECTED" && (
                                                    <Button
                                                      variant="secondary"
                                                      className="h-8 px-3 text-xs text-rose-500 border-rose-500/20 hover:bg-rose-500/10 whitespace-nowrap"
                                                      onClick={() => handleRejectApplicant(app.applicationId)}
                                                    >
                                                      Reject
                                                    </Button>
                                                  )
                                                )}
                                                {app.status === "SELECTED" ? (
                                                  <Button
                                                    className="h-8 px-3 text-xs font-semibold gap-1 whitespace-nowrap"
                                                    onClick={() => navigate("/order/ORD-001")}
                                                  >
                                                    <span>Open Order Room</span>
                                                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    className="h-8 px-3 text-xs font-semibold whitespace-nowrap"
                                                    onClick={() => handleSelectAndHireApplicant(app)}
                                                  >
                                                    Select / Hire
                                                  </Button>
                                                )}
                                              </>
                                            ) : (
                                              app.status === "SELECTED" ? (
                                                <Button
                                                  className="h-8 px-3 text-xs font-semibold gap-1 whitespace-nowrap"
                                                  onClick={() => navigate("/order/ORD-001")}
                                                >
                                                  <span>Open Order Room</span>
                                                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                                </Button>
                                              ) : (
                                                <span
                                                  className="text-xs px-2.5 py-1 rounded-lg font-body"
                                                  style={{ background: "var(--color-bg-surface)", color: "var(--color-text-tertiary)" }}
                                                >
                                                  Casting Concluded
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
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
                                  {currentStatus === "draft"
                                    ? `Target: ${applicantCapNumber}`
                                    : currentStatus === "in_progress" || currentStatus === "review" || currentStatus === "completed"
                                    ? "1 / 1 filled"
                                    : `${applicantCountNumber} / ${applicantCapNumber} filled`}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${capPercentage}%`,
                                    background: currentStatus === "active" || currentStatus === "in_progress" || currentStatus === "completed" ? "var(--color-accent)" : "var(--color-text-tertiary)",
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1 text-[11px] font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                <span>
                                  {currentStatus === "draft"
                                    ? "Submissions inactive (Draft)"
                                    : currentStatus === "closed"
                                    ? "Submissions paused"
                                    : currentStatus === "in_progress"
                                    ? "Contract active · In production"
                                    : currentStatus === "review"
                                    ? "Inspection countdown active"
                                    : currentStatus === "completed"
                                    ? "Project completed"
                                    : "Accepting pitches"}
                                </span>
                                {currentStatus === "active" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "closed" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "closed", applicationsOpen: false } : p));
                                    }}
                                    className="font-semibold text-rose-500 hover:underline whitespace-nowrap"
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
                                    className="font-semibold text-emerald-500 hover:underline whitespace-nowrap"
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
                                    className="w-full h-11 text-xs font-semibold gap-1.5 whitespace-nowrap"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                      if (applicants.length === 0 && DEFAULT_FALLBACK_APPLICANTS[selectedProjectDetail.id]) {
                                        setApplicants(DEFAULT_FALLBACK_APPLICANTS[selectedProjectDetail.id]);
                                      }
                                      appStateSync.addNotification({
                                        id: `notif-${Date.now()}`,
                                        kind: "PROJECT_APPLICATION",
                                        createdAt: new Date().toISOString(),
                                        payload: { clientName: `Casting Call Live: ${selectedProjectDetail.name}` },
                                      });
                                    }}
                                  >
                                    <Sparkles className="w-4 h-4 shrink-0" />
                                    <span className="whitespace-nowrap">Publish &amp; Fund Escrow</span>
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs whitespace-nowrap"
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
                                    className="w-full text-center text-xs text-rose-500 hover:underline pt-1 font-body whitespace-nowrap"
                                  >
                                    Delete Draft
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
                                    className="w-full h-10 text-xs font-semibold gap-1 whitespace-nowrap"
                                    onClick={() => {
                                      const el = document.getElementById("applicant-pipeline-section");
                                      el?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                  >
                                    Review Applicants ({applicants.length})
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs whitespace-nowrap"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "closed" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "closed", applicationsOpen: false } : p));
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "closed", applicationsOpen: false } : null);
                                    }}
                                  >
                                    Pause Applications
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/brief/${selectedProjectDetail.id}`);
                                      setCopiedShareLink(true);
                                      setTimeout(() => setCopiedShareLink(false), 2000);
                                    }}
                                    className="w-full text-center text-xs text-[var(--color-accent)] hover:underline pt-1 font-body flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  >
                                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{copiedShareLink ? "Link Copied!" : "Copy Casting Link"}</span>
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
                                    className="w-full h-11 text-xs font-semibold gap-1.5 whitespace-nowrap"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    <span>Open Order Room</span>
                                    <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs whitespace-nowrap"
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
                                    className="w-full h-11 text-xs font-semibold gap-1.5 whitespace-nowrap"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    <span>Inspect in Order Room</span>
                                    <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs whitespace-nowrap"
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
                                    className="w-full h-10 text-xs font-semibold gap-1.5 whitespace-nowrap"
                                    onClick={() => navigate("/order/ORD-001")}
                                  >
                                    View Order Room
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs whitespace-nowrap"
                                    onClick={() => navigate("/brief")}
                                  >
                                    Post Similar Brief
                                  </Button>
                                </div>
                              )}

                              {/* State 6: CLOSED */}
                              {currentStatus === "closed" && (
                                <div className="space-y-3">
                                  <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    Applications for this project are currently paused. You can reopen submissions at any time to receive further pitches.
                                  </p>
                                  <Button
                                    className="w-full h-10 text-xs font-semibold gap-1.5 whitespace-nowrap"
                                    onClick={() => {
                                      setProjectStateOverrides((prev) => ({ ...prev, [selectedProjectDetail.id]: "active" }));
                                      setProjects((prev) => prev.map((p) => p.id === selectedProjectDetail.id ? { ...p, status: "active", applicationsOpen: true } : p));
                                      setSelectedProjectDetail((prev) => prev ? { ...prev, status: "active", applicationsOpen: true } : null);
                                    }}
                                  >
                                    Reopen Applications
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="w-full h-9 text-xs whitespace-nowrap"
                                    onClick={() => navigate("/brief")}
                                  >
                                    Post Similar Brief
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
                              <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                                {project.niche} · {project.status === "draft" ? `Draft saved ${project.posted}` : `Posted ${project.posted}`}
                              </p>
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
                                {project.status === "draft"
                                  ? `Target: ${project.applicantCap || 10} performers · Inactive draft`
                                  : `${project.applicants}${project.applicantCap ? `/${project.applicantCap}` : ""} applicants${!project.applicationsOpen && project.status === "active" ? " · closed" : ""}`}
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
            {activeTab === "analytics" && (() => {
              const currentData = CLIENT_ANALYTICS_DATA[analyticsDateRange];
              const plotWidth = 660;
              const plotHeight = 170;
              const paddingLeft = 70;
              const paddingTop = 24;
              const baselineY = paddingTop + plotHeight;

              const splinePoints = currentData.graphPoints.map((pt, i, arr) => {
                const x = paddingLeft + (arr.length > 1 ? (i / (arr.length - 1)) * plotWidth : plotWidth / 2);
                const y = baselineY - (pt.amount / currentData.maxVal) * plotHeight;
                return { x, y, ...pt };
              });

              const spline = getSplinePath(splinePoints);
              const area = getAreaPath(splinePoints, baselineY);

              return (
                <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Hiring &amp; Budget Analytics</h2>
                      <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                        Overview of campaign spending, successful projects, and talent retention metrics for {clientProfile.orgName || clientProfile.name}.
                      </p>
                    </div>

                    {/* Date Range Dropdown (Replaces Live Sync Active chip) */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] border text-xs font-body shadow-sm"
                        style={{
                          background: "var(--color-bg-surface)",
                          borderColor: "var(--color-border-default)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                        <span className="text-[var(--color-text-secondary)] font-medium">Period:</span>
                        <select
                          aria-label="Analytics date range"
                          value={analyticsDateRange}
                          onChange={(e) => setAnalyticsDateRange(e.target.value as ClientAnalyticsRange)}
                          className="bg-transparent font-semibold cursor-pointer outline-none text-xs"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          <option value="30d">Last 30 days</option>
                          <option value="90d">Last 90 days</option>
                          <option value="year">This Year</option>
                          <option value="all">All time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {isNewUser ? (
                    <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Hiring Analytics Pending</h3>
                      <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                        Metrics on campaign spending, successful projects, and talent retention will be tracked here once you initiate hiring campaigns.
                      </p>
                      <Button onClick={() => setActiveTab("discover")} className="gap-2">
                        <Search className="w-4 h-4" /> Discover Performers
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* 4 Metric Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                          <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Total Spend Till date</div>
                          <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>{currentData.totalSpend}</div>
                          <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>{currentData.spendSubtext}</div>
                        </div>
                        <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                          <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Total successful projects</div>
                          <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-accent)" }}>{currentData.successfulProjects}</div>
                          <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>{currentData.projectsSubtext}</div>
                        </div>
                        <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                          <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>average rating</div>
                          <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>{currentData.avgRating}</div>
                          <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>{currentData.ratingSubtext}</div>
                        </div>
                        <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                          <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>repeat talent rate</div>
                          <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>{currentData.repeatRate}</div>
                          <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>{currentData.repeatSubtext}</div>
                        </div>
                      </div>

                      {/* Spend Graph (Replaces Category Budget Allocation & Performer Acquisition Funnel) */}
                      <div
                        className="p-5 sm:p-6 rounded-[var(--radius-xl)]"
                        style={{
                          background: "var(--color-bg-surface)",
                          border: "1px solid var(--color-border-default)",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                          <div>
                            <h3 className="font-display text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                              Spend Over Time
                            </h3>
                            <p className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                              {currentData.graphPeriodSubtitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs font-body">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-accent)" }} />
                              <span style={{ color: "var(--color-text-secondary)" }}>Escrow Spend (₦)</span>
                            </div>
                            <div
                              className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold"
                              style={{
                                background: "var(--color-accent-soft)",
                                color: "var(--color-accent)",
                              }}
                            >
                              {currentData.totalSpend}
                            </div>
                          </div>
                        </div>

                        {/* Spline Area Chart */}
                        <div className="w-full overflow-x-auto">
                          <div className="min-w-[560px]">
                            <svg
                              viewBox="0 0 760 230"
                              className="w-full h-auto overflow-visible select-none"
                              onMouseLeave={() => setHoveredSpendIndex(null)}
                            >
                              <defs>
                                <linearGradient id="clientSpendGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.01" />
                                </linearGradient>
                              </defs>

                              {/* Y-Axis Label Rotated */}
                              <text
                                transform="rotate(-90)"
                                x={-((paddingTop + baselineY) / 2)}
                                y="18"
                                textAnchor="middle"
                                className="text-[11px] font-body fill-zinc-400 font-medium"
                              >
                                Spend (₦)
                              </text>

                              {/* Horizontal Dashed Grid Lines & Y Ticks */}
                              {currentData.yTicks.map((tick) => {
                                const tickY = baselineY - (tick.val / currentData.maxVal) * plotHeight;
                                return (
                                  <g key={tick.label}>
                                    <line
                                      x1={paddingLeft}
                                      y1={tickY}
                                      x2={paddingLeft + plotWidth}
                                      y2={tickY}
                                      stroke="currentColor"
                                      strokeDasharray="4 4"
                                      className="text-zinc-200 dark:text-zinc-800"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x={paddingLeft - 10}
                                      y={tickY + 4}
                                      textAnchor="end"
                                      className="text-[11px] font-mono fill-zinc-400 dark:fill-zinc-500"
                                    >
                                      {tick.label}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Area Fill */}
                              <path d={area} fill="url(#clientSpendGradient)" />

                              {/* Spline Line */}
                              <path
                                d={spline}
                                fill="none"
                                stroke="#7C3AED"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {/* Data Points & Interactive Hover Area */}
                              {splinePoints.map((pt, i) => (
                                <g
                                  key={pt.label}
                                  onMouseEnter={() => setHoveredSpendIndex(i)}
                                  className="cursor-pointer"
                                >
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={hoveredSpendIndex === i ? 6 : 4}
                                    fill="#7C3AED"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    className="transition-all duration-150"
                                  />
                                  {hoveredSpendIndex === i && (
                                    <g>
                                      <rect
                                        x={pt.x - 48}
                                        y={pt.y - 36}
                                        width="96"
                                        height="26"
                                        rx="6"
                                        fill="#18181B"
                                        className="shadow-lg"
                                      />
                                      <text
                                        x={pt.x}
                                        y={pt.y - 19}
                                        textAnchor="middle"
                                        className="text-[11px] font-mono font-bold fill-white"
                                      >
                                        ₦{pt.amount.toLocaleString()}
                                      </text>
                                    </g>
                                  )}
                                  {/* X-Axis Tick Label */}
                                  <text
                                    x={pt.x}
                                    y={baselineY + 20}
                                    textAnchor="middle"
                                    className="text-[11px] font-body font-medium fill-zinc-500 dark:fill-zinc-400"
                                  >
                                    {pt.label}
                                  </text>
                                </g>
                              ))}
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })()}

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

            {/* ── Performer Storefront Profile & Casting Modal ── */}
            {selectedTalent && (() => {
              const isProjectActive = selectedProjectDetail
                ? (projectStateOverrides[selectedProjectDetail.id] || selectedProjectDetail.status).toLowerCase() === "active"
                : false;

              return (
                <Modal onClose={() => { setSelectedTalent(null); setSelectedApplicantForProfile(null); }}>
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 16 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-modal)" }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Header Banner */}
                    <div className="h-28 relative" style={{ background: "linear-gradient(135deg, var(--color-accent-soft), var(--color-bg-elevated))" }}>
                      <button
                        onClick={() => { setSelectedTalent(null); setSelectedApplicantForProfile(null); }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity z-10"
                        style={{ background: "var(--color-bg-surface)", color: "var(--color-text-secondary)" }}
                        aria-label="Close talent profile"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="px-6 pb-6">
                      {/* Creator Identity Bar */}
                      <div className="flex items-end justify-between -mt-10 mb-4">
                        <Avatar
                          className="w-20 h-20 text-2xl border-4 border-[var(--color-bg-surface)] shadow-sm"
                          background="var(--color-accent-glow)"
                          color="var(--color-accent)"
                        >
                          {selectedTalent.avatar}
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            className="h-9 px-3 text-xs gap-1.5 whitespace-nowrap"
                            onClick={() => {
                              setSelectedTalent(null);
                              setSelectedApplicantForProfile(null);
                              navigate(`/${selectedTalent.id}`);
                            }}
                          >
                            <span>Open Public Storefront</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                            {selectedTalent.name}
                          </h3>
                          {selectedTalent.verified && (
                            <span title="Verified Monologg Performer" className="text-emerald-500 flex items-center">
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          )}
                          <span className="text-xs font-mono font-medium flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{selectedTalent.rating || 4.9}</span>
                            <span className="text-[10px] text-[var(--color-text-tertiary)]">({selectedTalent.reviews || 18})</span>
                          </span>
                        </div>
                        <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                          @{selectedTalent.id} · {selectedTalent.role} · {selectedTalent.location}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {selectedTalent.tags?.map(tag => (
                          <Badge key={tag} tone="neutral" size="sm">{tag}</Badge>
                        ))}
                      </div>

                      {/* If viewing as an applicant for a project brief: Pitch & proposal callout */}
                      {selectedApplicantForProfile && (
                        <div
                          className="p-4 rounded-xl border mb-5 space-y-2.5"
                          style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold uppercase tracking-wider font-body flex items-center gap-1.5" style={{ color: "var(--color-accent)" }}>
                              <Sparkles className="w-3.5 h-3.5" />
                              Audition Pitch &amp; Proposal
                            </span>
                            <Badge tone={selectedApplicantForProfile.status === "SELECTED" ? "success" : selectedApplicantForProfile.status === "SHORTLISTED" ? "accent" : selectedApplicantForProfile.status === "REJECTED" ? "neutral" : "warning"} size="sm">
                              {APPLICANT_STATUS_LABEL[selectedApplicantForProfile.status] || selectedApplicantForProfile.status}
                            </Badge>
                          </div>
                          <p className="text-xs font-body italic leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                            "{selectedApplicantForProfile.pitch || "Experienced talent ready to bring full dynamic vocal range to your brief."}"
                          </p>
                          <div className="text-[11px] font-mono text-[var(--color-text-tertiary)] flex items-center gap-1 pt-1 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                            <Clock className="w-3 h-3" />
                            <span>Applied {selectedApplicantForProfile.appliedAt ? new Date(selectedApplicantForProfile.appliedAt).toLocaleDateString() : "recently"}</span>
                          </div>
                        </div>
                      )}

                      {/* Reel Preview Player */}
                      <div className="mb-5">
                        <label className="text-xs font-semibold uppercase tracking-wider block mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                          Featured Audio / Video Reel
                        </label>
                        <div
                          className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border flex items-center justify-center"
                          style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}
                        >
                          <div className="w-12 h-12 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform shadow-lg" style={{ background: "var(--color-accent)", color: "var(--color-text-inverse)" }}>
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded font-mono text-xs text-white" style={{ background: "rgba(0,0,0,0.7)" }}>
                            02:30 · 48kHz HD
                          </div>
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-medium text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
                            Commercial &amp; Narration Showreel
                          </div>
                        </div>
                      </div>

                      {/* Storefront Rate Cards */}
                      <div className="space-y-2 mb-6">
                        <label className="text-xs font-semibold uppercase tracking-wider block font-body" style={{ color: "var(--color-text-tertiary)" }}>
                          Standard Storefront Rates
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl border flex flex-col justify-between" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}>
                            <span className="text-xs font-body font-medium" style={{ color: "var(--color-text-primary)" }}>Standard Master</span>
                            <span className="font-display text-sm font-bold mt-1" style={{ color: "var(--color-accent)" }}>
                              {selectedTalent.price || "₦50,000"}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl border flex flex-col justify-between" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}>
                            <span className="text-xs font-body font-medium" style={{ color: "var(--color-text-primary)" }}>Rush 24h Turnaround</span>
                            <span className="font-display text-sm font-bold mt-1" style={{ color: "var(--color-accent)" }}>
                              ₦{((parseInt((selectedTalent.price || "50000").replace(/\D/g, ""), 10) || 50000) * 1.5).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Modal CTAs */}
                      <div className="pt-3 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                        {selectedApplicantForProfile ? (
                          <div className="flex items-center gap-2">
                            {isProjectActive ? (
                              <>
                                {selectedApplicantForProfile.status === "REJECTED" ? (
                                  <Button
                                    variant="secondary"
                                    className="flex-1 h-11 text-xs whitespace-nowrap"
                                    onClick={() => handleShortlist(selectedApplicantForProfile.applicationId)}
                                  >
                                    Move to Shortlist
                                  </Button>
                                ) : (
                                  selectedApplicantForProfile.status !== "SELECTED" && (
                                    <Button
                                      variant="secondary"
                                      className="flex-1 h-11 text-xs text-rose-500 border-rose-500/20 hover:bg-rose-500/10 whitespace-nowrap"
                                      onClick={() => handleRejectApplicant(selectedApplicantForProfile.applicationId)}
                                    >
                                      Reject
                                    </Button>
                                  )
                                )}

                                {selectedApplicantForProfile.status === "APPLIED" && (
                                  <Button
                                    variant="secondary"
                                    className="flex-1 h-11 text-xs whitespace-nowrap"
                                    onClick={() => handleShortlist(selectedApplicantForProfile.applicationId)}
                                  >
                                    Shortlist
                                  </Button>
                                )}

                                {selectedApplicantForProfile.status === "SELECTED" ? (
                                  <Button
                                    className="flex-1 h-11 text-xs font-bold gap-1 whitespace-nowrap"
                                    onClick={() => {
                                      setSelectedTalent(null);
                                      setSelectedApplicantForProfile(null);
                                      navigate("/order/ORD-001");
                                    }}
                                  >
                                    <span>Open Order Room</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Button>
                                ) : (
                                  <Button
                                    className="flex-1 h-11 text-xs font-bold whitespace-nowrap"
                                    onClick={() => {
                                      handleSelectAndHireApplicant(selectedApplicantForProfile);
                                    }}
                                  >
                                    Accept / Hire Performer
                                  </Button>
                                )}
                              </>
                            ) : (
                              selectedApplicantForProfile.status === "SELECTED" ? (
                                <Button
                                  className="w-full h-11 text-xs font-bold gap-1.5 whitespace-nowrap"
                                  onClick={() => {
                                    setSelectedTalent(null);
                                    setSelectedApplicantForProfile(null);
                                    navigate("/order/ORD-001");
                                  }}
                                >
                                  <span>Open Order Room</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                <div
                                  className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-body border"
                                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-secondary)" }}
                                >
                                  Casting Concluded for this project brief
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="flex-1 h-11 text-xs gap-1.5 whitespace-nowrap"
                              onClick={() => toggleShortlist(selectedTalent.id)}
                            >
                              <Star className={`w-3.5 h-3.5 ${shortlist.includes(selectedTalent.id) ? "fill-current" : ""}`} />
                              {shortlist.includes(selectedTalent.id) ? "Shortlisted" : "Save to Shortlist"}
                            </Button>
                            <Button
                              className="flex-1 h-11 text-xs font-bold whitespace-nowrap"
                              onClick={() => {
                                const talentId = selectedTalent.id;
                                const talentName = selectedTalent.name;
                                setSelectedTalent(null);
                                setSelectedApplicantForProfile(null);
                                navigate("/checkout", { state: { creatorId: talentId, creatorName: talentName } });
                              }}
                            >
                              Book Now →
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Modal>
              );
            })()}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav navItems={CLIENT_BOTTOM_NAV_ITEMS} activeTab={activeTab} onTab={setActiveTab} indicatorId="client-tab-indicator" />
    </div>
  );
}
