import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EASE_OUT } from "../../lib/motionTokens";
import { Sidebar, type SidebarNavItem } from "../components/ui/Sidebar";
import { BottomNav } from "../components/ui/BottomNav";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { apiClient, type AppNotification } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import { formatRelativeTime } from "../../lib/utils";
import { convertCurrency } from "../../lib/currency";
import type { ActivityItem, CalendarEvent, DayDetail, MyApplication, Order, Project, ServiceRateCard, Slot, SlotState, StatMetric } from "@monologg/types";
import {
  Home, Calendar, Bell, User, Share2, Shield, Play, TrendingUp,
  Plus, Edit2, Trash2, ChevronRight, ChevronLeft, ArrowLeft, Clock, MapPin, Info,
  MessageSquare, DollarSign, CheckCircle2, X, ExternalLink, ChevronDown,
  BarChart2, Award, Repeat, Briefcase, Search, Send, KeyRound,
  Camera, Instagram, Youtube, Twitter, Linkedin, Globe, Music, AlertCircle, Check, Image,
  SlidersHorizontal, Star, FileText, Layers, Lock, ShieldCheck, Users, Copy, Mic
} from "lucide-react";
import { UploadPerformanceReelModal } from "../components/UploadPerformanceReelModal";
import { WatchPerformanceReelModal } from "../components/WatchPerformanceReelModal";
import { LogoMark } from "../components/ui/Logo";

type Tab = "home" | "storefront" | "rates" | "calendar" | "orders" | "earnings" | "projects" | "activity" | "analytics";

const VIBE_TAGS = ["Dramatic", "Deep Texture", "British Accent", "Authoritative", "Warm"];

export const ADDED_BANK_ACCOUNTS = [
  { bankName: "Access Bank Plc", accountNumber: "9876543210", accountName: "EMEKA JOHNSON" },
  { bankName: "GTBank (Guaranty Trust Bank)", accountNumber: "0123456789", accountName: "EMEKA JOHNSON" },
  { bankName: "Zenith Bank Plc", accountNumber: "5544332211", accountName: "EMEKA JOHNSON" },
];

const RECUR_RULE_OPTIONS = [
  { value: "WEEKDAYS", label: "Every weekday (Mon–Fri)" },
  { value: "WEEKLY:MON", label: "Every Monday" },
  { value: "WEEKLY:TUE", label: "Every Tuesday" },
  { value: "WEEKLY:WED", label: "Every Wednesday" },
  { value: "WEEKLY:THU", label: "Every Thursday" },
  { value: "WEEKLY:FRI", label: "Every Friday" },
  { value: "WEEKLY:SAT", label: "Every Saturday" },
  { value: "WEEKLY:SUN", label: "Every Sunday" },
];

function recurRuleLabel(rule: string): string {
  return RECUR_RULE_OPTIONS.find((r) => r.value === rule)?.label ?? rule;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getWeekDaysISO(dateStr: string): string[] {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  const day = d.getUTCDay(); // 0 is Sun, 1 is Mon
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() + diffToMon);
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    const curr = new Date(mon);
    curr.setUTCDate(mon.getUTCDate() + i);
    result.push(curr.toISOString().slice(0, 10));
  }
  return result;
}

function navigatePeriodISO(dateStr: string, view: "month" | "week" | "day", direction: "prev" | "next"): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  const step = direction === "next" ? 1 : -1;
  if (view === "month") {
    d.setUTCMonth(d.getUTCMonth() + step);
  } else if (view === "week") {
    d.setUTCDate(d.getUTCDate() + (step * 7));
  } else {
    d.setUTCDate(d.getUTCDate() + step);
  }
  return d.toISOString().slice(0, 10);
}

const SLOT_STATE_META: Record<SlotState, { label: string; color: string }> = {
  free: { label: "Free", color: "var(--color-success)" },
  unavailable: { label: "Unavailable", color: "var(--color-text-tertiary)" },
  booked: { label: "Booked", color: "var(--color-accent)" },
};

const NOTIFICATION_META: Record<string, { title: string; tone: "accent" | "success" }> = {
  booking_created: { title: "New Booking Request", tone: "accent" },
  payment_escrow_locked: { title: "Booking Confirmed", tone: "success" },
  deliverables_provided: { title: "Deliverables Submitted", tone: "accent" },
  payment_released: { title: "Payment Received", tone: "success" },
  payment_refunded: { title: "Payment Refunded", tone: "accent" },
  kyc_verified: { title: "Identity Verified", tone: "success" },
  kyc_failed: { title: "Verification Unsuccessful", tone: "accent" },
  new_message: { title: "New Message", tone: "accent" },
  tagging_done: { title: "Style Tags Generated", tone: "success" },
  calendar_disconnected: { title: "Calendar Disconnected", tone: "accent" },
  application_shortlisted: { title: "You've Been Shortlisted", tone: "accent" },
  application_selected: { title: "You've Been Selected!", tone: "success" },
  application_not_selected: { title: "Application Update", tone: "accent" },
  application_rejected: { title: "Application Update", tone: "accent" },
};

function describeNotification(n: { kind: string; payload: Record<string, unknown> }): string {
  if (typeof n.payload.message === "string") return n.payload.message;
  if (typeof n.payload.projectName === "string") return `"${n.payload.projectName}"`;
  if (typeof n.payload.bookingId === "string") return `Booking ${n.payload.bookingId}`;
  return "Tap to view details.";
}

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  SELECTED: "Selected",
  REJECTED: "Not selected",
  WITHDRAWN: "Withdrawn",
};

const TALENT_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "storefront", label: "My Profile", icon: User },
  { id: "rates", label: "Rate Cards", icon: DollarSign },
  { id: "calendar", label: "Availability", icon: Calendar },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "earnings", label: "Earnings", icon: BarChart2 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

const TALENT_BOTTOM_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "rates", label: "Rates", icon: DollarSign },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "storefront", label: "Profile", icon: User },
];

export function TalentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [talentProfile, setTalentProfile] = useState(() => appStateSync.getTalentProfile());
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("45000");
  const [newServiceDelivery, setNewServiceDelivery] = useState("24 Hours");

  const handleSaveService = async () => {
    if (!newServiceTitle.trim()) return;
    if (!editServiceId && effectiveServices.length >= 2) {
      alert("You can only create up to 2 rate cards.");
      return;
    }
    const num = Number(newServicePrice.replace(/[^0-9]/g, "")) || 0;
    const formattedPrice = `${rateCardCurrency}${num.toLocaleString("en-US")}`;

    if (editServiceId) {
      await apiClient.updateService(editServiceId, {
        title: newServiceTitle,
        price: formattedPrice,
        delivery: newServiceDelivery,
      });
      setEditServiceId(null);
    } else {
      await apiClient.createService({
        title: newServiceTitle,
        price: formattedPrice,
        delivery: newServiceDelivery,
        bookings: 0,
      });
      setShowAddService(false);
    }
    const updated = await apiClient.listServices();
    setServices(updated.slice(0, 2));
    setNewServiceTitle("");
    setNewServicePrice("45,000");
    setNewServiceDelivery("24 Hours");
  };

  const handleDeleteService = async (id: string) => {
    await apiClient.deleteService(id);
    const updated = await apiClient.listServices();
    setServices(updated.slice(0, 2));
  };

  // features.md Phase 13 — day-detail + slot editor (PWA-08). getOpenSlots on
  // dayDetail is server-authoritative; everything the UI renders as "open" or
  // "blocked" comes from there, never a client-side recomputation.
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState("09:00");
  const [newSlotEnd, setNewSlotEnd] = useState("17:00");
  const [newSlotState, setNewSlotState] = useState<Exclude<SlotState, "booked">>("unavailable");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventKind, setNewEventKind] = useState<"personal" | "hold">("personal");
  const [newEventStart, setNewEventStart] = useState("09:00");
  const [newEventEnd, setNewEventEnd] = useState("10:00");
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [recurRule, setRecurRule] = useState("WEEKDAYS");
  const [recurSlotStart, setRecurSlotStart] = useState("09:00");
  const [recurSlotEnd, setRecurSlotEnd] = useState("17:00");
  const [recurSlotState, setRecurSlotState] = useState<Exclude<SlotState, "booked">>("free");
  const [selectedEventModal, setSelectedEventModal] = useState<{
    id: string;
    title: string;
    date: string;
    start: string;
    end: string;
    kind?: string;
    venue?: string;
    description?: string;
    isSlot?: boolean;
    slotIndex?: number;
  } | null>(null);
  const [actionPopover, setActionPopover] = useState<{
    date: string;
    time?: string;
  } | null>(null);

  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("monologg_unavailable_dates");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(["2026-10-18", "2026-10-25"]);
  });

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: string } | null>(null);

  const [allEvents, setAllEvents] = useState<Record<string, CalendarEvent[]>>(() => {
    try {
      const saved = localStorage.getItem("monologg_calendar_events");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      "2026-10-08": [
        { id: "evt-mono-1", date: "2026-10-08", start: "14:00", end: "16:00", title: "Commercial Voice-Over Booking", kind: "booking", bookingId: "bk-101" },
      ],
      "2026-10-14": [
        { id: "evt-gcal-1", date: "2026-10-14", start: "10:00", end: "11:30", title: "Personal Rehearsal & Prep", kind: "personal", bookingId: null },
      ],
      "2026-10-21": [
        { id: "evt-mono-2", date: "2026-10-21", start: "13:00", end: "15:00", title: "Feature Film Audition Session", kind: "booking", bookingId: "bk-102" },
      ],
      "2026-08-05": [
        { id: "mock-event-1", date: "2026-08-05", start: "14:00", end: "15:00", title: "Table read", kind: "personal", bookingId: null },
      ],
    };
  });

  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("click", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payouts, setPayouts] = useState<Array<{ id: string; from: string; service: string; amount: string; numericAmount: number; date: string; time: string; status: "Paid" | "Pending" | "Processing"; ref: string; bankAccount: string }>>([
    { id: "p1", from: "FilmCraft Lagos", service: "Commercial Voice-Over", amount: "₦120,000", numericAmount: 120000, date: "Dec 14, 2024", time: "14:30", status: "Paid", ref: "PAY-2024-88412", bankAccount: `${appStateSync.getBankDetails().bankName} ···· ${appStateSync.getBankDetails().accountNumber.slice(-4)}` },
    { id: "p2", from: "EventPro Abuja", service: "Feature Film Audition", amount: "₦80,000", numericAmount: 80000, date: "Dec 10, 2024", time: "09:15", status: "Paid", ref: "PAY-2024-77301", bankAccount: `${appStateSync.getBankDetails().bankName} ···· ${appStateSync.getBankDetails().accountNumber.slice(-4)}` },
    { id: "p3", from: "Brand Agency NG", service: "Compere Booking", amount: "₦45,000", numericAmount: 45000, date: "Dec 6, 2024", time: "16:45", status: "Pending", ref: "PAY-2024-65129", bankAccount: `${appStateSync.getBankDetails().bankName} ···· ${appStateSync.getBankDetails().accountNumber.slice(-4)}` },
  ]);
  const [selectedPayout, setSelectedPayout] = useState<typeof payouts[0] | null>(null);

  const [stats, setStats] = useState<StatMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<"all" | "booking" | "payment" | "message">("all");
  const [services, setServices] = useState<ServiceRateCard[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // features.md Phase 14 (PWA-14/15/16) — project discovery & applications.
  const [projectsSubTab, setProjectsSubTab] = useState<"browse" | "applications">("browse");
  const [projects, setProjects] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectRoleFilter, setProjectRoleFilter] = useState("all");
  const [projectBudgetFilter, setProjectBudgetFilter] = useState("all");
  const [projectBudgetSlider, setProjectBudgetSlider] = useState(0);
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [projectLocationFilter, setProjectLocationFilter] = useState("all");
  const [projectRatingFilter, setProjectRatingFilter] = useState("all");
  const [projectRatingSlider, setProjectRatingSlider] = useState(0);
  const [showProjectFilterModal, setShowProjectFilterModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pitchText, setPitchText] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [withdrawPasscode, setWithdrawPasscode] = useState("");
  const [withdrawPasscodeError, setWithdrawPasscodeError] = useState<string | null>(null);
  const [rateCardCurrency, setRateCardCurrency] = useState("₦");
  // Phase 12C: Withdrawal OTP state
  const [withdrawStep, setWithdrawStep] = useState<"input" | "passcode">("input");
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [activeWithdrawalRequestId, setActiveWithdrawalRequestId] = useState<string | null>(null);
  const [withdrawOtpCode, setWithdrawOtpCode] = useState("");
  const [withdrawOtpCooldown, setWithdrawOtpCooldown] = useState(0);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const currentUser = appStateSync.getLoggedInUser();
  const [isNewUser, setIsNewUser] = useState(() => {
    const stored = localStorage.getItem("monologg_is_new_user");
    if (stored !== null) return stored === "true";
    return currentUser ? (currentUser.isNewUser ?? false) : false;
  });

  const effectiveServices = services;
  const effectiveOrders = isNewUser ? [] : orders;
  const effectiveApplications = isNewUser ? [] : myApplications;
  const effectivePayouts = isNewUser ? [] : payouts;
  const effectiveActivity = isNewUser ? [] : activity;
  const effectiveStats = isNewUser
    ? [
        { label: "Available Balance", value: "₦0" },
        { label: "Completed Bookings", value: "0" },
        { label: "Active Orders", value: "0" },
        { label: "Profile Views", value: "0" },
      ]
    : stats;

  // In-Page Profile Editing State (Airbnb / Upwork / Linktree inspired)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(talentProfile.name || "Emeka Johnson");
  const [editStageTitle, setEditStageTitle] = useState(talentProfile.stageTitle || "Actor & Voice Artist");
  const [editLocation, setEditLocation] = useState(talentProfile.location || "Lagos, Nigeria");
  const [editBio, setEditBio] = useState(talentProfile.bio || "");
  const [editIsAvailable, setEditIsAvailable] = useState(talentProfile.isAvailable ?? true);
  const [editTags, setEditTags] = useState<string[]>(talentProfile.tags || VIBE_TAGS);
  const [newTagInput, setNewTagInput] = useState("");
  const [editSocials, setEditSocials] = useState(
    talentProfile.socialLinks || {
      instagram: "emekajohnson",
      youtube: "emekaofficial",
      twitter: "emekaj",
      tiktok: "emekaacts",
      spotify: "",
      linkedin: "emeka-johnson",
    }
  );
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(talentProfile.coverUrl || null);
  const [editCoverPreset, setEditCoverPreset] = useState<string>(talentProfile.coverPreset || "crimson-studio");
  const [profileSaveToast, setProfileSaveToast] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadReelModal, setShowUploadReelModal] = useState(false);
  const [showWatchReelModal, setShowWatchReelModal] = useState(false);

  // Profile Completeness Gate Formula
  const hasBio = Boolean(
    talentProfile.bio &&
    talentProfile.bio.trim().length > 10 &&
    !talentProfile.bio.toLowerCase().includes("no bio")
  );
  const hasLocation = Boolean(talentProfile.location && talentProfile.location.trim().length > 0);
  const hasRateCard = effectiveServices.length > 0;
  const hasReel = Boolean(talentProfile.hasReel || talentProfile.performanceReelUrl || !isNewUser);
  const isProfileComplete = Boolean(hasBio && hasLocation && hasRateCard && hasReel);

  // Sync edit form with talentProfile
  useEffect(() => {
    if (!isEditingProfile) {
      setEditName(talentProfile.name || (currentUser?.name || "New Creative Performer"));
      setEditStageTitle(talentProfile.stageTitle || "Actor & Voice Artist");
      setEditLocation(talentProfile.location || "Lagos, Nigeria");
      setEditBio(talentProfile.bio || "");
      setEditIsAvailable(talentProfile.isAvailable ?? true);
      setEditTags(talentProfile.tags || VIBE_TAGS);
      setEditSocials(
        talentProfile.socialLinks || {
          instagram: "emekajohnson",
          youtube: "emekaofficial",
          twitter: "emekaj",
          tiktok: "emekaacts",
          spotify: "",
          linkedin: "emeka-johnson",
        }
      );
      setEditCoverUrl(talentProfile.coverUrl || null);
      setEditCoverPreset(talentProfile.coverPreset || "crimson-studio");
    }
  }, [talentProfile, isEditingProfile, currentUser]);

  const handleSaveProfile = async () => {
    const updates = {
      name: editName.trim() || talentProfile.name,
      stageTitle: editStageTitle.trim() || "Actor & Voice Artist",
      location: editLocation.trim() || "Lagos, Nigeria",
      bio: editBio.trim(),
      isAvailable: editIsAvailable,
      tags: editTags,
      socialLinks: editSocials,
      coverUrl: editCoverUrl,
      coverPreset: editCoverPreset,
    };

    appStateSync.updateTalentProfile(updates);
    try {
      await apiClient.updateCreatorProfile({
        name: updates.name,
        bio: updates.bio,
        location: updates.location,
      });
    } catch {}

    setTalentProfile(appStateSync.getTalentProfile());
    setIsEditingProfile(false);
    setProfileSaveToast(true);
    setTimeout(() => setProfileSaveToast(false), 3000);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      setEditCoverUrl(url);
      setEditCoverPreset("custom");
      appStateSync.updateTalentProfile({ coverUrl: url, coverPreset: "custom" });
      setTalentProfile(appStateSync.getTalentProfile());
    };
    reader.readAsDataURL(file);
  };

  const getBannerBackground = () => {
    if (talentProfile.coverUrl) {
      return `url(${talentProfile.coverUrl}) center / cover no-repeat`;
    }
    switch (talentProfile.coverPreset) {
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

  useEffect(() => {
    const sync = () => {
      setTalentProfile(appStateSync.getTalentProfile());
      apiClient.listProjects().then(setProjects);
      apiClient.listServices().then(setServices);
    };
    const unsub = appStateSync.subscribe(sync);

    apiClient.getTalentStats().then(setStats);
    apiClient.listTalentActivity().then(setActivity);
    apiClient.listServices().then((srvs) => {
      const storedServices = appStateSync.getServices();
      if (isNewUser && (!storedServices || storedServices.length === 0)) {
        setServices([]);
      } else {
        setServices(srvs.slice(0, 2));
      }
    });
    apiClient.listTalentOrders().then(setOrders);
    apiClient.listNotifications().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    return unsub;
  }, [isNewUser]);

  const loadProjects = () => {
    apiClient.listProjects().then(setProjects);
  };
  const loadMyApplications = () => {
    apiClient.listMyApplications().then(setMyApplications);
  };

  useEffect(() => {
    if (activeTab !== "projects") return;
    if (projectsSubTab === "browse") loadProjects();
    else loadMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, projectsSubTab]);

  const handleApply = async () => {
    if (!selectedProject) return;
    if (!isProfileComplete) {
      setApplyError("You must complete your profile (bio, rate card, and performance reel) before applying to projects.");
      return;
    }
    setApplying(true);
    setApplyError(null);
    try {
      await apiClient.applyToProject(selectedProject.id, pitchText.trim() || undefined);
      loadProjects();
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              applicantCount: prev.applicantCount + 1,
              myApplication: { id: `app-${Date.now()}`, status: "APPLIED", pitch: pitchText.trim() || null },
            }
          : null
      );
      setPitchText("");
    } catch {
      setApplyError("That project just closed to new applications — please try another.");
    } finally {
      setApplying(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    await apiClient.withdrawMyApplication(applicationId);
    setMyApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "WITHDRAWN" } : a)));
    setSelectedProject((prev) =>
      prev && prev.myApplication?.id === applicationId
        ? { ...prev, myApplication: { ...prev.myApplication, status: "WITHDRAWN" } }
        : prev
    );
  };

  const activeProjectFilterCount =
    (projectRoleFilter !== "all" ? 1 : 0) +
    (projectBudgetSlider > 0 || projectBudgetFilter !== "all" ? 1 : 0) +
    (projectRatingSlider > 0 || projectRatingFilter !== "all" ? 1 : 0) +
    (projectStatusFilter !== "all" ? 1 : 0) +
    (projectLocationFilter !== "all" ? 1 : 0);

  const resetProjectFilters = () => {
    setProjectRoleFilter("all");
    setProjectBudgetSlider(0);
    setProjectBudgetFilter("all");
    setProjectRatingSlider(0);
    setProjectRatingFilter("all");
    setProjectStatusFilter("all");
    setProjectLocationFilter("all");
  };

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.trim().toLowerCase();
    const matchesSearch = !q || p.projectName.toLowerCase().includes(q) || p.projectType.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
    const roleTarget = projectRoleFilter.toLowerCase();
    const matchesRole =
      projectRoleFilter === "all" ||
      p.projectType.toLowerCase().includes(roleTarget) ||
      p.nicheReq.some((n) => n.toLowerCase().includes(roleTarget) || (roleTarget === "voice-over" && n.toLowerCase().includes("vo")));
    const budgetNum = Number(p.budget.replace(/[^0-9]/g, "")) || 0;
    const matchesBudget =
      (projectBudgetSlider === 0 || budgetNum >= projectBudgetSlider) &&
      (projectBudgetFilter === "all"
        || (projectBudgetFilter === "under100" && budgetNum < 100000)
        || (projectBudgetFilter === "100to300" && budgetNum >= 100000 && budgetNum <= 300000)
        || (projectBudgetFilter === "over300" && budgetNum > 300000));
    const matchesStatus = projectStatusFilter === "all"
      || (projectStatusFilter === "open" && p.applicationsOpen && !p.myApplication)
      || (projectStatusFilter === "applied" && Boolean(p.myApplication))
      || (projectStatusFilter === "closed" && !p.applicationsOpen);
    const loc = (p.location || "Lagos, NG (Hybrid/Remote)").toLowerCase();
    const matchesLocation = projectLocationFilter === "all"
      || (projectLocationFilter === "lagos" && loc.includes("lagos"))
      || (projectLocationFilter === "abuja" && loc.includes("abuja"))
      || (projectLocationFilter === "remote" && (loc.includes("remote") || loc.includes("online")));
    const clientRating = p.clientRating ?? 4.8;
    const matchesRating =
      (projectRatingSlider === 0 || clientRating >= projectRatingSlider) &&
      (projectRatingFilter === "all"
        || (projectRatingFilter === "4.8" && clientRating >= 4.8)
        || (projectRatingFilter === "4.5" && clientRating >= 4.5)
        || (projectRatingFilter === "4.0" && clientRating >= 4.0));

    return matchesSearch && matchesRole && matchesBudget && matchesStatus && matchesLocation && matchesRating;
  });

  const handleToggleUnavailable = (date: string, isUnavailable: boolean) => {
    setUnavailableDates((prev) => {
      const next = new Set(prev);
      if (isUnavailable) next.add(date);
      else next.delete(date);
      try {
        localStorage.setItem("monologg_unavailable_dates", JSON.stringify([...next]));
      } catch {}
      return next;
    });

    if (dayDetail && dayDetail.date === date) {
      if (isUnavailable) {
        setDayDetail({
          ...dayDetail,
          openSlots: [],
          block: {
            id: dayDetail.block?.id ?? "unavail-block",
            slots: [{ start: "00:00", end: "23:59", state: "unavailable" }],
            isRecurring: false,
            recurRule: null,
          },
        });
      } else {
        setDayDetail({
          ...dayDetail,
          openSlots: [{ start: "00:00", end: "23:59" }],
          block: null,
        });
      }
    }
  };

  const loadDay = (date: string) => {
    setLoadingDay(true);
    apiClient.getAvailabilityDay(date).then((detail) => {
      const storedEvents = allEvents[date] || [];
      const mergedEvents = [...storedEvents];
      detail.events.forEach((de) => {
        if (!mergedEvents.some((me) => me.id === de.id)) {
          mergedEvents.push(de);
        }
      });
      detail.events = mergedEvents;
      if (unavailableDates.has(date)) {
        detail.openSlots = [];
      }
      setDayDetail(detail);
      setLoadingDay(false);
    });
  };

  useEffect(() => {
    if (activeTab === "calendar") loadDay(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate]);

  // Mock mode's api-client writes are no-ops (see api-client.ts's own doc
  // comments) — these handlers update dayDetail optimistically themselves
  // rather than re-fetching afterward, the same "mock mode simulates locally"
  // pattern Settings.tsx/ProjectBrief.tsx already use, so a demo session's
  // edits stay visible instead of reverting to the static fixture.
  const handleAddSlot = async () => {
    const slot: Slot = { start: newSlotStart, end: newSlotEnd, state: newSlotState };
    if (dayDetail?.block) {
      const slots = [...dayDetail.block.slots, slot];
      await apiClient.updateAvailabilityBlock(dayDetail.block.id, { slots });
      setDayDetail({ ...dayDetail, block: { ...dayDetail.block, slots } });
    } else {
      const created = await apiClient.createAvailabilityBlock({ date: selectedDate, slots: [slot] });
      setDayDetail((prev) =>
        prev ? { ...prev, block: { id: created?.id ?? "local-block", slots: [slot], isRecurring: false, recurRule: null } } : prev,
      );
    }
    setShowAddSlot(false);
    setNewSlotStart("09:00");
    setNewSlotEnd("17:00");
  };

  const handleRemoveSlot = async (index: number) => {
    if (!dayDetail?.block) return;
    const slots = dayDetail.block.slots.filter((_, i) => i !== index);
    await apiClient.updateAvailabilityBlock(dayDetail.block.id, { slots });
    setDayDetail({ ...dayDetail, block: { ...dayDetail.block, slots } });
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) return;
    const created = await apiClient.createCalendarEvent({
      date: selectedDate,
      start: newEventStart,
      end: newEventEnd,
      title: newEventTitle,
      kind: newEventKind,
    });
    const event: CalendarEvent = created ?? {
      id: `local-event-${Date.now()}`,
      date: selectedDate,
      start: newEventStart,
      end: newEventEnd,
      title: newEventTitle,
      kind: newEventKind,
      bookingId: null,
    };
    setDayDetail((prev) => (prev ? { ...prev, events: [...prev.events, event].sort((a, b) => a.start.localeCompare(b.start)) } : prev));
    setAllEvents((prev) => {
      const existing = prev[selectedDate] || [];
      const next = { ...prev, [selectedDate]: [...existing, event] };
      try {
        localStorage.setItem("monologg_calendar_events", JSON.stringify(next));
      } catch {}
      return next;
    });
    setShowAddEvent(false);
    setNewEventTitle("");
  };

  const handleDeleteEvent = async (id: string) => {
    await apiClient.deleteCalendarEvent(id);
    setDayDetail((prev) => (prev ? { ...prev, events: prev.events.filter((e) => e.id !== id) } : prev));
    setAllEvents((prev) => {
      const existing = prev[selectedDate] || [];
      const next = { ...prev, [selectedDate]: existing.filter((e) => e.id !== id) };
      try {
        localStorage.setItem("monologg_calendar_events", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddRecurring = async () => {
    const slot: Slot = { start: recurSlotStart, end: recurSlotEnd, state: recurSlotState };
    const created = await apiClient.createAvailabilityBlock({ date: selectedDate, slots: [slot], isRecurring: true, recurRule });
    setDayDetail((prev) =>
      prev
        ? { ...prev, recurringTemplates: [...prev.recurringTemplates, { id: created?.id ?? "local-recurring", slots: [slot], recurRule }] }
        : prev,
    );
    setShowRecurringForm(false);
  };

  // Refetch on open so the badge/count reflect anything that arrived since
  // the initial load — real per-user data, not a static fixture.
  const openNotifications = () => {
    setShowNotifications(true);
    apiClient.listNotifications().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    apiClient.markNotificationRead(id);
  };

  const screenTitle =
    activeTab === "home" ? "Dashboard"
    : activeTab === "storefront" ? "My Profile"
    : activeTab === "rates" ? "Rate Cards"
    : activeTab === "calendar" ? "Availability"
    : activeTab === "projects" ? "Projects"
    : activeTab === "orders" ? "Active Orders"
    : "Earnings";

  const talentName = talentProfile.name || "Emeka Johnson";
  const talentInitials = talentName.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]!.toUpperCase()).join("") || "EJ";
  const firstName = talentName.split(/\s+/)[0] || "Emeka";

  return (
    <div className="role-talent min-h-screen" style={{ background: "var(--color-bg-canvas)" }}>
      <Sidebar
        portalLabel="Performer Portal"
        navItems={TALENT_NAV_ITEMS}
        activeTab={activeTab}
        onTab={setActiveTab}
        onNavigate={navigate}
        onSignOut={async () => { await apiClient.logout(); navigate("/"); }}
        identity={{
          initials: talentInitials,
          name: talentName,
          avatarUrl: talentProfile.avatarUrl ?? undefined,
          subtitle: (
            <span className="flex items-center gap-1" style={{ color: "var(--color-success)" }}>
              <Shield className="w-3 h-3" /> Verified
            </span>
          ),
        }}
      />

      {/* Mobile top bar */}
      <div
        className="lg:hidden flex items-center justify-between px-5 py-2.5 sticky top-0 z-40 glass-panel"
        style={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-body uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Good morning, {firstName}</div>
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
          <button aria-label="View notifications" onClick={openNotifications} className="w-10 h-10 rounded-full flex items-center justify-center relative hover:opacity-80 transition-opacity" style={{ background: "var(--color-bg-elevated)" }}>
            <Bell className="w-[18px] h-[18px]" style={{ color: "var(--color-text-secondary)" }} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2" style={{ background: "var(--color-accent)", "--tw-ring-color": "var(--color-bg-surface)" } as React.CSSProperties}></span>
            )}
          </button>
          <button
            aria-label="Go to settings"
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm font-body hover:opacity-80 transition-opacity"
            style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}
            onClick={() => navigate("/settings")}
          >
            {talentInitials}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main id="main-content" className="lg:pl-60 pb-28 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">

          {/* Desktop page header */}
          <div className={`hidden ${activeTab === "projects" && selectedProject ? "lg:hidden" : "lg:flex"} items-center justify-between mb-8`}>
            <div>
              <h1 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {activeTab === "home" && `Good morning, ${firstName} 👋`}
                {activeTab === "storefront" && "My Profile"}
                {activeTab === "rates" && "Rate Cards"}
                {activeTab === "calendar" && "Availability"}
                {activeTab === "projects" && "Projects"}
                {activeTab === "orders" && "Active Orders"}
                {activeTab === "earnings" && "Earnings & Analytics"}
              </h1>
              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {activeTab === "home" && "Here's what's happening with your career today."}
                {activeTab === "storefront" && "Your public profile — share this with clients."}
                {activeTab === "rates" && "Define your services and pricing."}
                {activeTab === "calendar" && "Set your availability for bookings."}
                {activeTab === "projects" && "Find and apply to client projects."}
                {activeTab === "orders" && "Manage your active collaborations."}
                {activeTab === "earnings" && "Track your income and performance."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === "storefront" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={isEditingProfile ? "primary" : "secondary"}
                    className="h-10 px-4 text-sm gap-2"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Edit2 className="w-4 h-4" /> {isEditingProfile ? "Preview Profile" : "Edit Profile"}
                  </Button>
                  <Button variant="secondary" className="h-10 px-4 text-sm gap-2" onClick={() => setShowShare(true)}>
                    <Share2 className="w-4 h-4" /> Share Profile
                  </Button>
                </div>
              )}
              {activeTab === "rates" && effectiveServices.length === 1 && (
                <Button
                  className="h-10 px-4 text-sm gap-2"
                  onClick={() => {
                    setEditServiceId(null);
                    setNewServiceTitle("");
                    setNewServicePrice("45000");
                    setNewServiceDelivery("24 Hours");
                    setShowAddService(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Rate Card
                </Button>
              )}
              <button aria-label="View notifications" onClick={openNotifications} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity relative" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                <Bell className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-accent)" }}></span>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Home Tab ── */}
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
                        {isNewUser ? "1/5" : "4/5"}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {isNewUser ? "Welcome! Complete your Performer Setup" : "Career Checklist & Action Nudges"}
                        </h3>
                        <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                          {isNewUser ? "Follow these steps to unlock client bookings and start earning." : "Key steps to maximize your visibility and client booking conversion."}
                        </p>
                      </div>
                    </div>
                    <Badge tone={isNewUser ? "accent" : "success"}>{isNewUser ? "Onboarding" : "Active Profile"}</Badge>
                  </div>

                  <div className="w-full h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500" style={{ width: isNewUser ? "20%" : "80%" }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => setActiveTab("storefront")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Profile <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Bio & headshots</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("rates")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Rate Cards <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Add services & price</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("calendar")}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Availability <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Set working slots</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab("projects"); setProjectsSubTab("browse"); }}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:border-[var(--color-accent)] text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold font-body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] flex items-center justify-between">
                          Apply to Briefs <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                        <div className="text-[11px] font-body text-[var(--color-text-tertiary)] truncate">Browse open roles</div>
                      </div>
                    </button>
                  </div>
                </motion.div>

                {/* HERO — earnings moment */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="relative overflow-hidden mb-6 p-6 lg:p-7 rounded-[28px] bg-gradient-to-br from-[#F13030] to-[#D31F20] text-white shadow-xl"
                >
                  <div className="absolute -top-16 -right-10 w-52 h-52 rounded-full bg-white/10" />
                  <div className="relative space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#FFECEC] font-semibold">Available balance</div>
                    <div className="font-display font-black text-white tnum leading-none text-4xl sm:text-5xl">
                      {isNewUser ? "₦0" : "₦148,000"}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-xs font-body text-[#FFECEC]/90">
                      <TrendingUp className="w-4 h-4 text-[#FFECEC]" /> {isNewUser ? "Ready to earn your first payout" : "+18% vs last month"}
                    </div>
                    <div className="flex gap-2.5 pt-3">
                      <button onClick={() => setActiveTab("earnings")} className="h-10 px-5 rounded-full text-xs font-bold font-body transition-all active:scale-95 bg-white text-[#F13030] shadow-md hover:bg-white/90">
                        {isNewUser ? "Setup Payouts" : "Withdraw"}
                      </button>
                      <button onClick={() => setActiveTab("earnings")} className="h-10 px-5 rounded-full text-xs font-bold font-body transition-all active:scale-95 bg-white/20 text-white hover:bg-white/30 border border-white/20">
                        View earnings
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Quick-action ghost-circle row */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { label: "Profile", icon: User, action: () => setActiveTab("storefront") },
                    { label: "Availability", icon: Calendar, action: () => setActiveTab("calendar") },
                    { label: "Rates", icon: DollarSign, action: () => setActiveTab("rates") },
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
                  <button className="text-xs font-body font-semibold" style={{ color: "var(--color-accent)" }} onClick={() => setActiveTab("activity")}>
                    View all →
                  </button>
                </div>

                {effectiveActivity.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mx-auto mb-3 text-[var(--color-accent)]">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>No activity logged yet</p>
                    <p className="text-xs font-body mt-1 mb-4 text-[var(--color-text-secondary)]">Complete your profile and apply to open projects to get client bookings.</p>
                    <Button onClick={() => { setActiveTab("projects"); setProjectsSubTab("browse"); }} className="h-9 px-4 text-xs">
                      Browse Open Projects
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {effectiveActivity.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                        onClick={() => {
                          if (item.type === "booking") navigate("/order/ORD-001");
                          else if (item.type === "payment") setActiveTab("earnings");
                          else if (item.type === "message") setActiveTab("orders");
                        }}
                        className="flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)] cursor-pointer hover:border-[var(--color-accent)] transition-all active:scale-[0.99]"
                        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)", minHeight: 68 }}
                      >
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: item.type === "payment" ? "var(--color-success-bg)" : "var(--color-accent-glow)" }}
                        >
                          {item.type === "booking" && <Calendar className="w-5 h-5" style={{ color: "var(--color-accent)" }} />}
                          {item.type === "payment" && <DollarSign className="w-5 h-5" style={{ color: "var(--color-success)" }} />}
                          {item.type === "message" && <MessageSquare className="w-5 h-5" style={{ color: "var(--color-accent)" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold font-body truncate" style={{ color: "var(--color-text-primary)" }}>{item.client}</div>
                          <div className="text-xs font-body truncate" style={{ color: "var(--color-text-tertiary)" }}>{item.service}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{item.amount}</div>
                          <div className="text-[11px] font-body" style={{ color: "var(--color-text-tertiary)" }}>{item.time}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Profile completion prompt */}
                <div
                  className="mt-5 p-4 rounded-[var(--radius-lg)] flex items-center gap-4"
                  style={{ background: "var(--color-accent-soft)", border: "1px solid var(--color-hairline)" }}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-glow)" }}>
                    <Award className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Profile 85% complete</div>
                    <div className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>Add a bio to attract more clients</div>
                  </div>
                  <Button variant="secondary" className="h-9 px-3 text-xs shrink-0" onClick={() => setActiveTab("storefront")}>
                    Complete
                  </Button>
                </div>

              </motion.div>
            )}

            {/* ── Storefront Tab (Airbnb / Upwork / Linktree inspired) ── */}
            {activeTab === "storefront" && (
              <motion.div key="storefront" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Hidden Cover file input */}
                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Mobile action bar */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <Button
                    variant={isEditingProfile ? "primary" : "secondary"}
                    className="h-9 px-3 text-sm gap-2"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Edit2 className="w-4 h-4" /> {isEditingProfile ? "Preview" : "Edit Profile"}
                  </Button>
                  <Button variant="secondary" className="h-9 px-3 text-sm gap-2" onClick={() => setShowShare(true)}>
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>

                {/* Save Feedback Banner */}
                {profileSaveToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/30 text-xs font-semibold font-body flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Profile saved and synced across settings!</span>
                  </motion.div>
                )}

                <div
                  className="rounded-[28px] overflow-hidden border shadow-sm transition-all"
                  style={{
                    background: "var(--color-bg-surface)",
                    borderColor: "var(--color-border-default)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  {/* Hero Cover Banner (Airbnb / Linktree style) */}
                  <div
                    className="h-44 sm:h-52 w-full relative transition-all group overflow-hidden"
                    style={{
                      background: getBannerBackground(),
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/15 transition-opacity group-hover:bg-black/25" />
                    
                    {/* Change Cover Pill Button */}
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
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 overflow-hidden shrink-0 shadow-lg relative group"
                          style={{
                            borderColor: "var(--color-bg-surface)",
                            background: "var(--color-bg-elevated)",
                          }}
                        >
                          <img
                            src={talentProfile.avatarUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80&fit=crop"}
                            alt={talentProfile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="pb-1">
                          {isNewUser ? (
                            <Badge tone="accent" className="border border-[var(--color-accent)] gap-1">
                              <Shield className="w-3 h-3" /> Draft Profile (Unverified)
                            </Badge>
                          ) : (
                            <Badge tone="success" className="border border-[var(--color-success)] gap-1">
                              <Shield className="w-3 h-3" /> Verified Performer
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="hidden lg:flex items-center gap-2">
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
                        {talentProfile.name || (currentUser?.name || "Emeka Johnson")}
                      </h2>
                      <p className="text-sm font-body flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                        <span>{talentProfile.stageTitle || (isNewUser ? "Voice-Over & Screen Performer" : "Actor & Voice Artist")}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 opacity-60" /> {talentProfile.location || "Lagos, Nigeria"}
                        </span>
                      </p>
                    </div>

                    {/* Availability Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      {talentProfile.isAvailable !== false ? (
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

                    {/* Social Media Row (Linktree / Upwork style) */}
                    <div className="flex flex-wrap items-center gap-2 mb-6 pt-1">
                      {talentProfile.socialLinks?.instagram && (
                        <a
                          href={`https://instagram.com/${talentProfile.socialLinks.instagram.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#E1306C] hover:text-[#E1306C]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>@{talentProfile.socialLinks.instagram.replace(/^@/, "")}</span>
                        </a>
                      )}
                      {talentProfile.socialLinks?.youtube && (
                        <a
                          href={`https://youtube.com/@${talentProfile.socialLinks.youtube.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#FF0000] hover:text-[#FF0000]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>@{talentProfile.socialLinks.youtube.replace(/^@/, "")}</span>
                        </a>
                      )}
                      {talentProfile.socialLinks?.tiktok && (
                        <a
                          href={`https://tiktok.com/@${talentProfile.socialLinks.tiktok.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-black dark:hover:border-white"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 10.79 4.54V11.8a8.3 8.3 0 0 0 5.66 2.19V10.5a4.88 4.88 0 0 1-3.03-3.81z"/>
                          </svg>
                          <span>@{talentProfile.socialLinks.tiktok.replace(/^@/, "")}</span>
                        </a>
                      )}
                      {talentProfile.socialLinks?.twitter && (
                        <a
                          href={`https://x.com/${talentProfile.socialLinks.twitter.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Twitter className="w-3.5 h-3.5" />
                          <span>@{talentProfile.socialLinks.twitter.replace(/^@/, "")}</span>
                        </a>
                      )}
                      {talentProfile.socialLinks?.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${talentProfile.socialLinks.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] hover:border-[#0A66C2] hover:text-[#0A66C2]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {talentProfile.socialLinks?.spotify && (
                        <a
                          href={talentProfile.socialLinks.spotify}
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
                    {isEditingProfile ? (
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
                            <Button variant="secondary" size="sm" onClick={() => setIsEditingProfile(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveProfile} className="gap-1.5">
                              <Check className="w-3.5 h-3.5" /> Save Changes
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
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Stage Name or Full Name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Stage Title / Primary Craft
                            </label>
                            <Input
                              value={editStageTitle}
                              onChange={(e) => setEditStageTitle(e.target.value)}
                              placeholder="e.g. Actor & Voice Artist"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Location
                            </label>
                            <Input
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
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
                                onClick={() => setEditIsAvailable(true)}
                                className={`flex-1 h-11 rounded-[var(--radius-md)] border text-xs font-semibold font-body flex items-center justify-center gap-1.5 transition-all ${
                                  editIsAvailable
                                    ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                                    : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditIsAvailable(false)}
                                className={`flex-1 h-11 rounded-[var(--radius-md)] border text-xs font-semibold font-body flex items-center justify-center gap-1.5 transition-all ${
                                  !editIsAvailable
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
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
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
                            {editTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-[var(--color-bg-surface)] border-[var(--color-border-default)]"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => setEditTags(editTags.filter((_, i) => i !== idx))}
                                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2 max-w-sm">
                            <Input
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              placeholder="Add a new tag (e.g. Igbo Accent, Improvisation)"
                              className="h-9 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && newTagInput.trim()) {
                                  e.preventDefault();
                                  if (!editTags.includes(newTagInput.trim())) {
                                    setEditTags([...editTags, newTagInput.trim()]);
                                  }
                                  setNewTagInput("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-9 text-xs"
                              onClick={() => {
                                if (newTagInput.trim() && !editTags.includes(newTagInput.trim())) {
                                  setEditTags([...editTags, newTagInput.trim()]);
                                  setNewTagInput("");
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
                                value={editSocials.instagram || ""}
                                onChange={(e) => setEditSocials({ ...editSocials, instagram: e.target.value })}
                                placeholder="Instagram handle (e.g. emeka_acts)"
                                className="pl-10 text-xs"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF0000]">YT</span>
                              <Input
                                value={editSocials.youtube || ""}
                                onChange={(e) => setEditSocials({ ...editSocials, youtube: e.target.value })}
                                placeholder="YouTube channel handle"
                                className="pl-10 text-xs"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-primary)]">TT</span>
                              <Input
                                value={editSocials.tiktok || ""}
                                onChange={(e) => setEditSocials({ ...editSocials, tiktok: e.target.value })}
                                placeholder="TikTok handle"
                                className="pl-10 text-xs"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1DA1F2]">X</span>
                              <Input
                                value={editSocials.twitter || ""}
                                onChange={(e) => setEditSocials({ ...editSocials, twitter: e.target.value })}
                                placeholder="X (Twitter) handle"
                                className="pl-10 text-xs"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0A66C2]">IN</span>
                              <Input
                                value={editSocials.linkedin || ""}
                                onChange={(e) => setEditSocials({ ...editSocials, linkedin: e.target.value })}
                                placeholder="LinkedIn profile slug"
                                className="pl-10 text-xs"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1DB954]">SP</span>
                              <Input
                                value={editSocials.spotify || ""}
                                onChange={(e) => setEditSocials({ ...editSocials, spotify: e.target.value })}
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
                                  setEditCoverPreset(preset.id);
                                  setEditCoverUrl(null);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
                                  editCoverPreset === preset.id && !editCoverUrl
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
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile} className="gap-2">
                            <Check className="w-4 h-4" /> Save Profile
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(talentProfile.tags || VIBE_TAGS).map((tag) => (
                        <Badge key={tag} tone="neutral" size="lg">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Bio Section */}
                    {talentProfile.bio && talentProfile.bio.trim() && !talentProfile.bio.toLowerCase().includes("no bio") ? (
                      <div className="mb-8">
                        <h3 className="text-sm font-semibold font-body mb-2" style={{ color: "var(--color-text-primary)" }}>
                          About the Performer
                        </h3>
                        <p className="text-sm font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          {talentProfile.bio}
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

                    {/* Featured Performance Reel (Airbnb / Upwork Portfolio style) */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                          Featured Performance Reel
                        </h3>
                        {(talentProfile.hasReel || talentProfile.performanceReelUrl || !isNewUser) && (
                          <button
                            onClick={() => setShowUploadReelModal(true)}
                            className="text-xs font-semibold hover:underline flex items-center gap-1"
                            style={{ color: "var(--color-accent)" }}
                          >
                            <Play className="w-3 h-3" /> Replace Reel
                          </button>
                        )}
                      </div>

                      {talentProfile.hasReel || talentProfile.performanceReelUrl || !isNewUser ? (
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
                            {talentProfile.performanceReelTitle || "Featured Audition Reel"}
                          </div>
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded font-mono text-xs text-white bg-black/60 backdrop-blur-md">
                            01:30
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-3 text-[var(--color-accent)]">
                            <Play className="w-6 h-6 ml-0.5" />
                          </div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                            No Performance Reel Uploaded
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mb-4">
                            Upload a high-quality video clip (max 90 seconds) showcasing your acting, monologue, or voice reel.
                          </p>
                          <Button
                            variant="secondary"
                            className="h-9 px-4 text-xs gap-2"
                            onClick={() => setShowUploadReelModal(true)}
                          >
                            <Play className="w-3.5 h-3.5" /> Upload Performance Reel
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Rate Cards (Upwork Catalog style) */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                          Rate Cards
                        </h3>
                        {effectiveServices.length > 0 && effectiveServices.length < 2 && (
                          <button
                            onClick={() => {
                              setEditServiceId(null);
                              setNewServiceTitle("");
                              setNewServicePrice("45000");
                              setNewServiceDelivery("24 Hours");
                              setShowAddService(true);
                            }}
                            className="text-xs font-semibold hover:underline flex items-center gap-1"
                            style={{ color: "var(--color-accent)" }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Second Rate Card (1/2)
                          </button>
                        )}
                      </div>

                      {effectiveServices.length === 0 ? (
                        <div className="p-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-3 text-[var(--color-accent)]">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                            No Rate Cards Created
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mb-4">
                            You can create up to 2 service rate cards so clients can instantly book your services.
                          </p>
                          <Button
                            className="h-9 px-4 text-xs gap-2"
                            onClick={() => {
                              setEditServiceId(null);
                              setNewServiceTitle("");
                              setNewServicePrice("45000");
                              setNewServiceDelivery("24 Hours");
                              setShowAddService(true);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Create Rate Card
                          </Button>
                        </div>
                      ) : (
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
                                  <button
                                    onClick={() => {
                                      setEditServiceId(service.id);
                                      setNewServiceTitle(service.title);
                                      const match = service.price.match(/^([^0-9,]*)(.*)$/);
                                      if (match) {
                                        setRateCardCurrency(match[1] || "₦");
                                        setNewServicePrice((match[2] || "").replace(/,/g, ""));
                                      } else {
                                        setNewServicePrice(service.price.replace(/[^0-9]/g, ""));
                                      }
                                      setNewServiceDelivery(service.delivery);
                                      setShowAddService(true);
                                    }}
                                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors shrink-0 -mr-1 -mt-1"
                                    title="Edit rate card"
                                    aria-label="Edit rate card"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
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
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Rate Cards Tab ── */}
            {activeTab === "rates" && (
              <motion.div key="rates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Rate Cards</h2>
                  {effectiveServices.length > 0 && effectiveServices.length < 2 && (
                    <Button
                      className="h-9 px-3 text-sm gap-2"
                      onClick={() => {
                        setEditServiceId(null);
                        setNewServiceTitle("");
                        setNewServicePrice("45000");
                        setNewServiceDelivery("24 Hours");
                        setShowAddService(true);
                      }}
                    >
                      <Plus className="w-4 h-4" /> Add Rate Card
                    </Button>
                  )}
                </div>

                {effectiveServices.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Rate Cards Created Yet</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      Create fixed-price service rate cards so clients can instantly book your voice-over, acting, or compere services. You can create up to 2 rate cards.
                    </p>
                    <Button onClick={() => setShowAddService(true)} className="gap-2">
                      <Plus className="w-4 h-4" /> Create Your First Rate Card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {effectiveServices.map(service => (
                    <div
                      key={service.id}
                      className="p-5 rounded-[var(--radius-lg)]"
                      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                          style={{ background: "var(--color-accent-glow)" }}
                        >
                          <DollarSign className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{service.title}</h3>
                            <span className="font-display text-xl shrink-0" style={{ color: "var(--color-accent)" }}>{service.price}</span>
                          </div>
                          <p className="text-sm font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>
                            Delivery: {service.delivery} · {service.bookings} bookings
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="h-8 px-3 text-xs gap-1.5"
                              onClick={() => {
                                setEditServiceId(service.id);
                                setNewServiceTitle(service.title);
                                const match = service.price.match(/^([^0-9,]*)(.*)$/);
                                if (match) {
                                  const symbol = match[1] || "₦";
                                  const amountStr = match[2] || "";
                                  setRateCardCurrency(symbol);
                                  setNewServicePrice(amountStr.replace(/,/g, ""));
                                } else {
                                  setNewServicePrice(service.price.replace(/[^0-9]/g, ""));
                                }
                                setNewServiceDelivery(service.delivery);
                                setShowAddService(true);
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              className="h-8 px-3 text-xs gap-1.5"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {effectiveServices.length < 2 ? (
                    <button
                      onClick={() => {
                        setEditServiceId(null);
                        setNewServiceTitle("");
                        setNewServicePrice("45000");
                        setNewServiceDelivery("24 Hours");
                        setShowAddService(true);
                      }}
                      className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium font-body transition-all hover:border-[var(--color-accent)]"
                      style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                    >
                      <Plus className="w-4 h-4" /> Add second rate card ({effectiveServices.length}/2)
                    </button>
                  ) : (
                    <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-center text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                      You can only create up to 2 rate cards (2/2 created).
                    </div>
                  )}
                </div>
                )}

                {/* Add/Edit Rate Card Modal */}
                <AnimatePresence>
                  {(showAddService || editServiceId !== null) && (
                    <Modal onClose={() => { setShowAddService(false); setEditServiceId(null); }} align="end">
                      <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        className="w-full max-w-md rounded-[var(--radius-lg)] p-6"
                        style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>
                            {editServiceId ? "Edit Rate Card" : "New Rate Card"}
                          </h3>
                          <button
                            onClick={() => { setShowAddService(false); setEditServiceId(null); }}
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
                            style={{ background: "var(--color-bg-elevated)" }}
                          >
                            <X className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Service Title
                            </label>
                            <Input
                              placeholder="e.g., Voice-Over Recording"
                              value={newServiceTitle}
                              onChange={e => setNewServiceTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Base Price &amp; Currency
                            </label>
                            <div className="relative flex items-center">
                               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-semibold text-sm pointer-events-none z-10" style={{ color: "var(--color-text-secondary)" }}>
                                 {rateCardCurrency}
                               </span>
                               <Input
                                 className="pl-8 pr-28 font-mono tnum w-full"
                                 placeholder="45,000"
                                 value={newServicePrice}
                                 onChange={(e) => {
                                   const digits = e.target.value.replace(/\D/g, "");
                                   setNewServicePrice(digits ? parseInt(digits, 10).toLocaleString("en-US") : "");
                                 }}
                               />
                               <select
                                 value={rateCardCurrency}
                                 onChange={(e) => {
                                   const newCurr = e.target.value;
                                   const currentVal = Number(newServicePrice.replace(/[^0-9]/g, "")) || 0;
                                   const converted = convertCurrency(currentVal, rateCardCurrency, newCurr);
                                   const newVal = Math.round(converted);
                                   setNewServicePrice(newVal > 0 ? newVal.toLocaleString("en-US") : "");
                                   setRateCardCurrency(newCurr);
                                 }}
                                 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-8 rounded-[var(--radius-md)] pl-2.5 pr-8 text-xs font-mono font-semibold border-0 outline-none cursor-pointer"
                                 style={{ background: "var(--color-bg-elevated)", color: "var(--color-accent)" }}
                               >
                                 <option value="₦">₦ NGN</option>
                                 <option value="$">$ USD</option>
                                 <option value="£">£ GBP</option>
                                 <option value="€">€ EUR</option>
                               </select>
                             </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Delivery Timeline
                            </label>
                            <select
                              className="w-full h-[54px] rounded-[var(--radius-lg)] px-4 text-base font-body appearance-none border"
                              style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                              value={newServiceDelivery}
                              onChange={e => setNewServiceDelivery(e.target.value)}
                            >
                              <option value="Same Day">Same Day</option>
                              <option value="24 Hours">24 Hours</option>
                              <option value="2–3 Days">2–3 Days</option>
                              <option value="1 Week">1 Week</option>
                              <option value="Custom">Custom</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Description (optional)
                            </label>
                            <textarea
                              className="w-full rounded-[var(--radius-md)] px-4 py-3 text-sm font-body border resize-none"
                              rows={3}
                              placeholder="What's included in this service..."
                              style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => { setShowAddService(false); setEditServiceId(null); }}>
                              Cancel
                            </Button>
                            <Button className="flex-1 h-11 text-sm" onClick={handleSaveService}>
                              {editServiceId ? "Save Changes" : "Add Rate Card"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </Modal>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Availability Calendar Tab (features.md Phase 13, PWA-08) ── */}
            {activeTab === "calendar" && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative">
                {isNewUser && (
                  <div className="mb-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] font-body">Default Working Hours Active (9:00 AM – 5:00 PM)</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-body">Your availability automatically defaults to standard bookable slots. Click any date below to view details, or right-click to mark availability.</p>
                    </div>
                  </div>
                )}

                {/* Calendar Toolbar & Period Navigation */}
                <div
                  className="p-3.5 rounded-[var(--radius-lg)] mb-4 flex flex-col sm:flex-row items-center justify-between gap-3"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        aria-label="Jump to today"
                        title="Jump to today"
                        onClick={() => setSelectedDate(todayISO())}
                        className="p-2 rounded-xl transition-all hover:bg-[var(--color-bg-elevated)]"
                        style={{ border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                      >
                        <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                      </button>
                      <button
                        aria-label="Previous period"
                        onClick={() => setSelectedDate(navigatePeriodISO(selectedDate, calendarView, "prev"))}
                        className="p-2 rounded-xl transition-all hover:bg-[var(--color-bg-elevated)]"
                        style={{ border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDate(todayISO())}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold font-body transition-all hover:bg-[var(--color-bg-elevated)]"
                        style={{ border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                      >
                        Today
                      </button>
                      <button
                        aria-label="Next period"
                        onClick={() => setSelectedDate(navigatePeriodISO(selectedDate, calendarView, "next"))}
                        className="p-2 rounded-xl transition-all hover:bg-[var(--color-bg-elevated)]"
                        style={{ border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="font-display text-base font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                      {new Date(`${selectedDate}T00:00:00.000Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
                    </span>
                  </div>

                  {/* 3-View Switcher: Month | Week | Day */}
                  <div className="flex p-1 rounded-xl shrink-0 w-full sm:w-auto justify-center" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                    {(["month", "week", "day"] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setCalendarView(view)}
                        className="flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold font-body capitalize transition-all"
                        style={{
                          background: calendarView === view ? "var(--color-accent)" : "transparent",
                          color: calendarView === view ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                          boxShadow: calendarView === view ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                        }}
                      >
                        {view === "month" ? "Month" : view === "week" ? "Week" : "Day"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating Right-Click Context Menu */}
                {contextMenu && (
                  <div
                    className="fixed z-50 min-w-[210px] rounded-2xl p-1.5 shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                    style={{
                      left: Math.min(contextMenu.x, window.innerWidth - 230),
                      top: Math.min(contextMenu.y, window.innerHeight - 250),
                      background: "var(--color-bg-surface)",
                      borderColor: "var(--color-border-default)",
                      boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 text-[11px] font-bold font-body uppercase tracking-wider border-b mb-1" style={{ color: "var(--color-text-tertiary)", borderColor: "var(--color-hairline)" }}>
                      {formatDayLabel(contextMenu.date)}
                    </div>

                    {unavailableDates.has(contextMenu.date) ? (
                      <button
                        onClick={() => {
                          handleToggleUnavailable(contextMenu.date, false);
                          setNewSlotState("free");
                          setShowAddSlot(true);
                          setContextMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                        style={{ color: "var(--color-success)" }}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark as Available
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleToggleUnavailable(contextMenu.date, true);
                          setContextMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <X className="w-4 h-4" /> Mark as Unavailable
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDate(contextMenu.date);
                        setContextMenu(null);
                        setShowAddSlot(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      <Clock className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} /> Add Custom Slot
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDate(contextMenu.date);
                        setContextMenu(null);
                        setShowAddEvent(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      <Plus className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} /> Add Event / Booking
                    </button>
                  </div>
                )}

                {/* MONTH VIEW GRID */}
                {calendarView === "month" && (() => {
                  const selectedObj = new Date(`${selectedDate}T00:00:00.000Z`);
                  const year = selectedObj.getUTCFullYear();
                  const month = selectedObj.getUTCMonth();
                  const firstDayIndex = new Date(Date.UTC(year, month, 1)).getUTCDay();
                  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
                  const monthName = selectedObj.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

                  const daysArray = [];
                  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
                  for (let d = 1; d <= daysInMonth; d++) {
                    const padD = String(d).padStart(2, "0");
                    const padM = String(month + 1).padStart(2, "0");
                    daysArray.push(`${year}-${padM}-${padD}`);
                  }

                  return (
                    <div className="p-5 rounded-[var(--radius-lg)] mb-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{monthName}</h3>
                        <span className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Select a date to view scheduled slots & events</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold mb-3 font-body uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="py-1">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {daysArray.map((dateStr, idx) => {
                          if (!dateStr) return <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-[var(--color-bg-canvas)]/30" />;
                          const isSelected = dateStr === selectedDate;
                          const isToday = dateStr === todayISO();
                          const dayNum = parseInt(dateStr.slice(8), 10);
                          const isUnavailable = unavailableDates.has(dateStr);
                          const dayEvts = allEvents[dateStr] || (dateStr === selectedDate && dayDetail?.events ? dayDetail.events : []);
                          const hasMonologg = dayEvts.some(e => e.kind === "booking" || Boolean(e.bookingId) || e.title.toLowerCase().includes("monolog"));
                          const hasExternal = dayEvts.length > 0 && !hasMonologg;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setContextMenu(null);
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setSelectedDate(dateStr);
                                setContextMenu({ x: e.clientX, y: e.clientY, date: dateStr });
                              }}
                              className={`h-16 sm:h-20 p-2 rounded-xl flex flex-col justify-between relative transition-all active:scale-98 text-xs font-body text-left group ${
                                isUnavailable
                                  ? "bg-neutral-100/80 dark:bg-neutral-900/40 border border-dashed border-neutral-300 dark:border-neutral-700/80 text-neutral-400 dark:text-neutral-500"
                                  : isSelected
                                  ? "border-2 border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-sm"
                                  : "hover:border-[var(--color-border-hover)]"
                              }`}
                              style={{
                                background: isUnavailable
                                  ? undefined
                                  : isSelected
                                  ? "var(--color-bg-elevated)"
                                  : isToday
                                  ? "var(--color-accent-soft)"
                                  : "var(--color-bg-elevated)",
                                borderColor: isUnavailable
                                  ? undefined
                                  : isSelected
                                  ? "var(--color-accent)"
                                  : isToday
                                  ? "var(--color-accent)"
                                  : "var(--color-border-default)",
                                color: isUnavailable
                                  ? undefined
                                  : isToday && !isSelected
                                  ? "var(--color-accent)"
                                  : "var(--color-text-primary)",
                              }}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-sm font-semibold ${isUnavailable ? "text-neutral-400 dark:text-neutral-500" : isSelected ? "font-bold text-[var(--color-accent)]" : ""}`}>
                                  {dayNum}
                                </span>
                                {isToday && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" title="Today" />
                                )}
                              </div>

                              {/* Visual recognition: Unavailable vs Events vs Clean Open */}
                              <div className="w-full min-h-[18px] flex items-center">
                                {isUnavailable ? (
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 bg-neutral-200/60 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded">
                                    Unavailable
                                  </span>
                                ) : hasMonologg ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/25 truncate max-w-full">
                                    <LogoMark className="w-2.5 h-2.5 shrink-0" /> Monologg
                                  </span>
                                ) : hasExternal ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 truncate max-w-full">
                                    <Calendar className="w-2.5 h-2.5 shrink-0" /> Event
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* WEEK VIEW GRID */}
                {calendarView === "week" && (() => {
                  const weekDays = getWeekDaysISO(selectedDate);
                  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
                  return (
                    <div className="p-4 rounded-[var(--radius-lg)] mb-4 overflow-x-auto" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                      <div className="min-w-[650px]">
                        <div className="grid grid-cols-8 gap-1 mb-2 text-center text-xs font-body border-b pb-2" style={{ borderColor: "var(--color-border-default)" }}>
                          <div className="text-left font-semibold uppercase text-tertiary px-2" style={{ color: "var(--color-text-tertiary)" }}>Time</div>
                          {weekDays.map((dStr) => {
                            const dObj = new Date(`${dStr}T00:00:00.000Z`);
                            const dayName = dObj.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
                            const dayNum = dObj.getUTCDate();
                            const isSel = dStr === selectedDate;
                            const isToday = dStr === todayISO();
                            return (
                              <button
                                key={dStr}
                                onClick={() => setSelectedDate(dStr)}
                                className={`py-1.5 rounded-lg text-center transition-all ${isSel ? "font-bold text-white bg-[var(--color-accent)] shadow-md" : isToday ? "text-[var(--color-accent)] font-semibold bg-[var(--color-accent-soft)]" : "text-[var(--color-text-primary)]"}`}
                              >
                                <div>{dayName}</div>
                                <div className="text-sm font-semibold">{dayNum}</div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="relative space-y-1">
                          <div className="absolute left-0 right-0 top-[28%] z-10 pointer-events-none flex items-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-accent)] text-white shadow-sm">11:30</span>
                            <div className="h-[2px] flex-1 bg-[var(--color-accent)] opacity-80" />
                          </div>

                          {hours.map((hr) => (
                            <div key={hr} className="grid grid-cols-8 gap-1 items-center min-h-[44px] border-b" style={{ borderColor: "var(--color-border-default)" }}>
                              <div className="text-xs font-mono font-medium text-tertiary px-2" style={{ color: "var(--color-text-tertiary)" }}>
                                {String(hr).padStart(2, "0")}:00
                              </div>
                              {weekDays.map((dStr) => {
                                const isSelDay = dStr === selectedDate;
                                const hasEvent = dayDetail?.events.find(e => parseInt(e.start.slice(0, 2), 10) === hr);
                                const isMono = hasEvent ? (hasEvent.kind === "booking" || Boolean(hasEvent.bookingId) || hasEvent.title.toLowerCase().includes("monolog")) : false;
                                return (
                                  <div
                                    key={dStr}
                                    onClick={() => setActionPopover({ date: dStr, time: `${String(hr).padStart(2, "0")}:00` })}
                                    className={`h-full min-h-[40px] rounded-md p-1 cursor-pointer transition-all hover:bg-[var(--color-bg-elevated)] ${isSelDay ? "bg-[var(--color-accent-soft)]/20" : ""}`}
                                  >
                                    {hasEvent && (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedEventModal({
                                            id: hasEvent.id,
                                            title: hasEvent.title,
                                            date: hasEvent.date,
                                            start: hasEvent.start,
                                            end: hasEvent.end,
                                            kind: hasEvent.kind,
                                            venue: "Studio 4B, Lagos",
                                            description: "Scheduled performance hold/session.",
                                          });
                                        }}
                                        className={`p-1.5 rounded-md text-[11px] font-body font-semibold truncate flex items-center gap-1 ${
                                          isMono
                                            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                                            : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                                        }`}
                                      >
                                        {isMono ? <LogoMark className="w-3 h-3 shrink-0" /> : <Calendar className="w-3 h-3 shrink-0" />}
                                        <span className="truncate">{hasEvent.title} ({hasEvent.start})</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* DAY VIEW GRID */}
                {calendarView === "day" && (() => {
                  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
                  const dayNameLong = new Date(`${selectedDate}T00:00:00.000Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
                  return (
                    <div className="p-5 rounded-[var(--radius-lg)] mb-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: "var(--color-border-default)" }}>
                        <h3 className="font-display text-lg font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>{dayNameLong}</h3>
                        <Button variant="secondary" className="h-8 px-3 text-xs gap-1" onClick={() => setShowAddSlot(true)}>
                          <Plus className="w-3.5 h-3.5" /> Add slot
                        </Button>
                      </div>

                      <div className="relative space-y-2">
                        <div className="absolute left-0 right-0 top-[35%] z-10 pointer-events-none flex items-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--color-accent)] text-white shadow-sm">11:30</span>
                          <div className="h-[2px] flex-1 bg-[var(--color-accent)] opacity-80" />
                        </div>

                        {hours.map((hr) => {
                          const timeStr = `${String(hr).padStart(2, "0")}:00`;
                          const matchedEvents = dayDetail?.events.filter(e => parseInt(e.start.slice(0, 2), 10) === hr) ?? [];
                          return (
                            <div key={hr} className="flex gap-3 min-h-[52px] border-b pb-1" style={{ borderColor: "var(--color-border-default)" }}>
                              <div className="w-16 shrink-0 text-xs font-mono font-medium text-tertiary pt-1" style={{ color: "var(--color-text-tertiary)" }}>
                                {timeStr}
                              </div>
                              <div
                                onClick={() => setActionPopover({ date: selectedDate, time: timeStr })}
                                className="flex-1 rounded-lg p-1.5 cursor-pointer transition-all hover:bg-[var(--color-bg-elevated)] min-h-[44px] flex flex-col justify-center"
                              >
                                {matchedEvents.length === 0 ? (
                                  <div className="text-[11px] font-body text-tertiary opacity-0 hover:opacity-100 transition-opacity">Click to add event or slot</div>
                                ) : (
                                  matchedEvents.map((evt) => {
                                    const isMono = evt.kind === "booking" || Boolean(evt.bookingId) || evt.title.toLowerCase().includes("monolog");
                                    return (
                                      <div
                                        key={evt.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedEventModal({
                                            id: evt.id,
                                            title: evt.title,
                                            date: evt.date,
                                            start: evt.start,
                                            end: evt.end,
                                            kind: evt.kind,
                                            venue: "Main Studio / Remote",
                                            description: "Scheduled event details for this time slot.",
                                          });
                                        }}
                                        className={`p-2 rounded-lg mb-1 flex items-center justify-between text-xs font-body font-semibold ${
                                          isMono
                                            ? "bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 text-[var(--color-accent)]"
                                            : "bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {isMono ? <LogoMark className="w-3.5 h-3.5 shrink-0" /> : <Calendar className="w-3.5 h-3.5 shrink-0" />}
                                          <span>{evt.title} ({evt.start} – {evt.end})</span>
                                        </div>
                                        <Badge tone="neutral" size="sm">{isMono ? "Monologg" : evt.kind}</Badge>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {loadingDay || !dayDetail ? (
                  <div className="py-16 text-center text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>Loading…</div>
                ) : (
                  <div className="space-y-4">
                    {/* Open slots — server-authoritative (getOpenSlots) */}
                    <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                        <div>
                          <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                            Schedule for {formatDayLabel(selectedDate)}
                          </div>
                          <p className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                            {unavailableDates.has(selectedDate) ? "Marked as unavailable for bookings." : "Standard bookable slots active."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 text-xs gap-1.5"
                            onClick={() => {
                              handleToggleUnavailable(selectedDate, false);
                              setNewSlotState("free");
                              setShowAddSlot(true);
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" /> Mark as Available
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 text-xs gap-1.5"
                            onClick={() => handleToggleUnavailable(selectedDate, true)}
                          >
                            <X className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Mark as Unavailable
                          </Button>
                        </div>
                      </div>

                      {unavailableDates.has(selectedDate) ? (
                        <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-body text-neutral-500 flex items-center gap-2">
                          <X className="w-4 h-4 text-neutral-400" />
                          <span>This date is currently marked as unavailable. Clients cannot book time slots on this day.</span>
                        </div>
                      ) : dayDetail.openSlots.length === 0 ? (
                        <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>No open time — fully unavailable or booked.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {dayDetail.openSlots.map((s, i) => (
                            <Badge key={i} tone="success" size="md">{s.start}–{s.end}</Badge>
                          ))}
                        </div>
                      )}
                      {!dayDetail.block && !unavailableDates.has(selectedDate) && (
                        <p className="text-xs font-body mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                          No overrides set — this day follows the default-free rule{dayDetail.recurringTemplates.length > 0 ? " and your recurring templates" : ""}.
                        </p>
                      )}
                    </div>

                    {/* Explicit slots for this exact day. */}
                    <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Slots for this day</div>
                        <Button variant="secondary" className="h-8 px-3 text-xs gap-1" onClick={() => setShowAddSlot(true)}>
                          <Plus className="w-3.5 h-3.5" /> Add slot
                        </Button>
                      </div>
                      {!dayDetail.block || dayDetail.block.slots.length === 0 ? (
                        <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>No explicit slots — add one to mark part of this day free or unavailable.</p>
                      ) : (
                        <div className="space-y-2">
                          {dayDetail.block.slots.map((slot, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: SLOT_STATE_META[slot.state].color }} />
                                <span className="text-xs font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{slot.start}–{slot.end}</span>
                                <Badge tone="neutral" size="sm">{SLOT_STATE_META[slot.state].label}</Badge>
                              </div>
                              {slot.state !== "booked" && (
                                <button onClick={() => handleRemoveSlot(i)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "var(--color-text-tertiary)" }}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Events for this day — informational */}
                    <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Events</div>
                        <Button variant="secondary" className="h-8 px-3 text-xs gap-1" onClick={() => setShowAddEvent(true)}>
                          <Plus className="w-3.5 h-3.5" /> Add event
                        </Button>
                      </div>
                      {dayDetail.events.length === 0 ? (
                        <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Nothing added for this day.</p>
                      ) : (
                        <div className="space-y-2">
                          {dayDetail.events.map((event) => {
                            const isMono = event.kind === "booking" || Boolean(event.bookingId) || event.title.toLowerCase().includes("monolog");
                            return (
                              <div key={event.id} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: isMono ? "var(--color-accent-soft)" : "var(--color-bg-canvas)" }}>
                                    {isMono ? (
                                      <LogoMark className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                                    ) : (
                                      <Calendar className="w-4 h-4 text-sky-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{event.title}</span>
                                      {isMono ? (
                                        <Badge tone="accent" size="sm" className="gap-1">
                                          <LogoMark className="w-2.5 h-2.5" /> Monologg Booking
                                        </Badge>
                                      ) : (
                                        <Badge tone="neutral" size="sm">Google Calendar</Badge>
                                      )}
                                    </div>
                                    <div className="text-xs font-mono tnum mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                                      {event.start}–{event.end}
                                    </div>
                                  </div>
                                </div>
                                <button onClick={() => handleDeleteEvent(event.id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ color: "var(--color-text-tertiary)" }}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Recurring templates. */}
                    <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold font-body flex items-center gap-1.5" style={{ color: "var(--color-text-primary)" }}>
                          <Repeat className="w-4 h-4" /> Recurring availability
                        </div>
                        <Button variant="secondary" className="h-8 px-3 text-xs gap-1" onClick={() => setShowRecurringForm(true)}>
                          <Plus className="w-3.5 h-3.5" /> Add
                        </Button>
                      </div>
                      {dayDetail.recurringTemplates.length === 0 ? (
                        <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>No recurring pattern set (e.g. "every weekday 9–5").</p>
                      ) : (
                        <div className="space-y-2">
                          {dayDetail.recurringTemplates.map((t) => (
                            <div key={t.id} className="p-2.5 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                              <div className="text-xs font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{recurRuleLabel(t.recurRule ?? "")}</div>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {t.slots.map((s, i) => (
                                  <Badge key={i} tone="neutral" size="sm">{s.start}–{s.end} · {SLOT_STATE_META[s.state].label}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="mt-4 p-4 rounded-[var(--radius-md)] flex items-center gap-3"
                  style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                >
                  <Calendar className="w-5 h-5 shrink-0" style={{ color: "var(--color-accent)" }} />
                  <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                    Sync your availability with Google Calendar to avoid double-bookings.
                  </p>
                  <Button variant="secondary" className="h-8 px-3 text-xs shrink-0" onClick={() => setShowSyncModal(true)}>Connect</Button>
                </div>
              </motion.div>
            )}

            {/* ── Projects Tab (features.md Phase 14, PWA-14/15/16) ── */}
            {activeTab === "projects" && (
              selectedProject ? (
                /* ── Fresh Project Details Page View ── */
                <motion.div
                  key={`project-detail-${selectedProject.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Top Bar: Back link & Status */}
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold font-body py-1.5 px-3 -ml-2 rounded-xl transition-all hover:bg-[var(--color-bg-elevated)]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Projects</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {selectedProject.myApplication ? (
                        <Badge
                          tone={
                            selectedProject.myApplication.status === "SELECTED"
                              ? "success"
                              : selectedProject.myApplication.status === "REJECTED" || selectedProject.myApplication.status === "WITHDRAWN"
                              ? "error"
                              : "accent"
                          }
                          size="md"
                        >
                          {APPLICATION_STATUS_LABEL[selectedProject.myApplication.status]}
                        </Badge>
                      ) : selectedProject.applicationsOpen ? (
                        <Badge tone="success" size="md">Accepting Pitches</Badge>
                      ) : (
                        <Badge tone="neutral" size="md">Applications Closed</Badge>
                      )}
                    </div>
                  </div>

                  {/* Project Header Banner (Clean editorial style, no gradients) */}
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
                        <span className="font-semibold text-sm font-body text-[var(--color-accent)]">
                          {selectedProject.clientName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified Client
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {selectedProject.clientRating ?? 4.9} ({selectedProject.clientReviews ?? 18} reviews)
                        </span>
                      </div>

                      <div>
                        <Badge tone="accent" size="md">{selectedProject.projectType}</Badge>
                      </div>
                    </div>

                    <h1
                      className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {selectedProject.projectName}
                    </h1>

                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                        <span>{selectedProject.location || "Lagos, NG (Hybrid/Remote)"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                        <span>{selectedProject.timeline || "Auditions close Oct 24 · Production: Nov 2026"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>100% Escrow Funded</span>
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Breakdown: Left Brief details, Right Sticky Compensation & Action */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Column (8 cols): Clean Breakdown & Readable Hierarchy */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                      {/* 1. Project Synopsis & Brief */}
                      <div
                        className="p-6 sm:p-7 rounded-3xl border space-y-4"
                        style={{
                          background: "var(--color-bg-surface)",
                          borderColor: "var(--color-border-default)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                          <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                            Creative Brief &amp; Synopsis
                          </h2>
                        </div>
                        <p className="text-sm sm:text-base font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          {selectedProject.description ||
                            "Client is seeking professional performers for a high-profile production campaign. Selected performer will work directly with the creative direction team for studio recording, rehearsals, and post-production revisions."}
                        </p>
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
                            {selectedProject.nicheReq.map((n) => (
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
                            {selectedProject.additionalNotes ||
                              "Auditions must be recorded in studio acoustics with minimal room reflection. Professional vocal delivery and prompt turnaround are expected."}
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
                              const textToCopy =
                                selectedProject.scriptSample ||
                                "Sides / Script Excerpt:\n'Every morning starts with a decision. You don't wait for greatness—you chase it down. When the whistle blows, the world listens. Just Do It.'";
                              navigator.clipboard.writeText(textToCopy);
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
                          Use this excerpt for your audition take or pitch video recording:
                        </p>

                        <div
                          className="p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text"
                          style={{
                            background: "var(--color-bg-elevated)",
                            borderColor: "var(--color-hairline)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {selectedProject.scriptSample ||
                            "Sides / Script Excerpt:\n'Every morning starts with a decision. You don't wait for greatness—you chase it down. When the whistle blows, the world listens. Just Do It.'"}
                        </div>
                      </div>

                      {/* 4. Deliverables & Production Timeline */}
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
                            Deliverables &amp; Licensing
                          </h2>
                        </div>

                        <div className="space-y-2.5">
                          {(
                            selectedProject.deliverables || [
                              "2x 30s broadcast WAV master audio files (24-bit / 48kHz)",
                              "1x 15s social media cutdown variation",
                              "Raw vocal tracks and room-tone stems",
                              "Full commercial usage rights for digital and broadcast media",
                            ]
                          ).map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Client & Escrow Security */}
                      <div
                        className="p-6 sm:p-7 rounded-3xl border space-y-4"
                        style={{
                          background: "var(--color-bg-surface)",
                          borderColor: "var(--color-border-default)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                          <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                            Casting Client &amp; Escrow
                          </h2>
                        </div>

                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-display text-lg font-bold text-white shrink-0 shadow-sm"
                            style={{ background: "var(--color-accent)" }}
                          >
                            {selectedProject.clientName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-sm sm:text-base font-body" style={{ color: "var(--color-text-primary)" }}>
                              <span>{selectedProject.clientName}</span>
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                            <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Verified Client · {selectedProject.clientReviews ?? 18} projects completed · {selectedProject.clientRating ?? 4.9} rating
                            </p>
                          </div>
                        </div>

                        <div
                          className="p-4 rounded-2xl border text-xs sm:text-sm font-body leading-relaxed"
                          style={{
                            background: "var(--color-bg-elevated)",
                            borderColor: "var(--color-hairline)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                            <Lock className="w-4 h-4" />
                            <span>100% Monologg Escrow Guarantee</span>
                          </div>
                          When selected, 100% of the project budget is held securely in Monologg Escrow before you record. Payment is disbursed directly to your bank account upon client milestone approval. Zero talent deductions.
                        </div>
                      </div>
                    </div>

                    {/* Right Column (4 cols): Sticky Compensation & Action Card */}
                    <div className="lg:col-span-5 xl:col-span-4">
                      <div
                        className="p-6 rounded-3xl border sticky top-6 space-y-5"
                        style={{
                          background: "var(--color-bg-surface)",
                          borderColor: "var(--color-border-default)",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        {/* Budget */}
                        <div>
                          <div className="text-xs uppercase font-semibold font-body tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                            Project Compensation
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-display text-3xl font-bold font-mono text-[var(--color-accent)]">
                              {selectedProject.budget}
                            </span>
                            <span className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                              Fixed Escrow Rate
                            </span>
                          </div>
                          <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                            0% platform fee for talent · 100% guaranteed payout
                          </p>
                        </div>

                        {/* Applicant spots */}
                        <div
                          className="p-4 rounded-2xl border space-y-2"
                          style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)" }}
                        >
                          <div className="flex items-center justify-between text-xs font-body">
                            <span style={{ color: "var(--color-text-secondary)" }}>Applicant Spots</span>
                            <span className="font-semibold font-mono" style={{ color: "var(--color-text-primary)" }}>
                              {selectedProject.applicantCount} / {selectedProject.applicantCap || 10} filled
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (selectedProject.applicantCount / (selectedProject.applicantCap || 10)) * 100)}%`,
                                background: selectedProject.applicationsOpen ? "var(--color-accent)" : "var(--color-text-tertiary)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Action Center */}
                        {applyError && (
                          <div
                            className="p-3 rounded-xl text-xs font-body"
                            style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
                          >
                            {applyError}
                          </div>
                        )}

                        {/* State 1: Already Applied */}
                        {selectedProject.myApplication ? (
                          <div
                            className="p-4 rounded-2xl border space-y-3"
                            style={{
                              background:
                                selectedProject.myApplication.status === "SELECTED"
                                  ? "rgba(16, 185, 129, 0.08)"
                                  : "var(--color-bg-elevated)",
                              borderColor:
                                selectedProject.myApplication.status === "SELECTED"
                                  ? "rgba(16, 185, 129, 0.3)"
                                  : "var(--color-hairline)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                                Application Status
                              </span>
                              <Badge
                                tone={
                                  selectedProject.myApplication.status === "SELECTED"
                                    ? "success"
                                    : selectedProject.myApplication.status === "REJECTED" || selectedProject.myApplication.status === "WITHDRAWN"
                                    ? "error"
                                    : "accent"
                                }
                                size="sm"
                              >
                                {APPLICATION_STATUS_LABEL[selectedProject.myApplication.status]}
                              </Badge>
                            </div>

                            {selectedProject.myApplication.pitch && (
                              <div
                                className="p-3 rounded-xl border text-xs font-body italic"
                                style={{
                                  background: "var(--color-bg-surface)",
                                  borderColor: "var(--color-hairline)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                "{selectedProject.myApplication.pitch}"
                              </div>
                            )}

                            {selectedProject.myApplication.status === "SELECTED" ? (
                              <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-body flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>
                                    Congratulations! {selectedProject.clientName} selected you. Escrow deposit is funded and your Order Room is active.
                                  </span>
                                </div>
                                <Button
                                  className="w-full h-11 text-xs font-semibold"
                                  onClick={() => {
                                    setSelectedProject(null);
                                    navigate("/order/ORD-001");
                                  }}
                                >
                                  Open Order Room <ChevronRight className="w-4 h-4 ml-1.5" />
                                </Button>
                              </div>
                            ) : selectedProject.myApplication.status === "SHORTLISTED" ? (
                              <div className="space-y-3">
                                <p className="text-xs font-body text-amber-600 dark:text-amber-400">
                                  ⭐ You're on the shortlist! The casting team is reviewing your profile and performance reel.
                                </p>
                                <Button
                                  variant="secondary"
                                  className="w-full h-10 text-xs font-semibold"
                                  onClick={() => handleWithdrawApplication(selectedProject.myApplication!.id)}
                                >
                                  Withdraw Application
                                </Button>
                              </div>
                            ) : selectedProject.myApplication.status === "APPLIED" ? (
                              <div className="space-y-3">
                                <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                                  Submitted to {selectedProject.clientName}. You'll be notified when the client reviews your pitch.
                                </p>
                                <Button
                                  variant="secondary"
                                  className="w-full h-10 text-xs font-semibold"
                                  onClick={() => handleWithdrawApplication(selectedProject.myApplication!.id)}
                                >
                                  Withdraw Application
                                </Button>
                              </div>
                            ) : selectedProject.myApplication.status === "REJECTED" ? (
                              <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                The client chose another performer for this campaign. Keep pitching for upcoming roles!
                              </p>
                            ) : (
                              <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                You withdrew your application for this project.
                              </p>
                            )}
                          </div>
                        ) : !selectedProject.applicationsOpen ? (
                          /* State 2: Closed */
                          <div
                            className="p-4 rounded-2xl text-center text-xs font-body border"
                            style={{
                              background: "var(--color-bg-elevated)",
                              borderColor: "var(--color-hairline)",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Applications closed — this project has reached its maximum applicant cap.
                          </div>
                        ) : !isProfileComplete ? (
                          /* State 3: Incomplete Profile */
                          <div
                            className="p-4 rounded-2xl border space-y-3"
                            style={{ background: "rgba(224, 77, 44, 0.05)", borderColor: "rgba(224, 77, 44, 0.3)" }}
                          >
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                              <span className="text-xs font-bold font-body text-[var(--color-accent)] uppercase tracking-wider">
                                Complete Profile to Apply
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs font-body">
                              <div className="flex items-center gap-2">
                                {hasBio ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />}
                                <span style={{ color: hasBio ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>Bio written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasLocation ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />}
                                <span style={{ color: hasLocation ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>Location specified</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasRateCard ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />}
                                <span style={{ color: hasRateCard ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>At least 1 Rate Card created</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasReel ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />}
                                <span style={{ color: hasReel ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>Featured Performance Reel</span>
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => {
                                setSelectedProject(null);
                                setActiveTab("storefront");
                              }}
                            >
                              Complete Profile
                            </Button>
                          </div>
                        ) : (
                          /* State 4: Ready to Pitch */
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                                Audition Pitch (optional)
                              </label>
                              <textarea
                                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-body border resize-none focus:outline-none focus:border-[var(--color-accent)]"
                                rows={3}
                                placeholder="Highlight relevant brand work, availability, or turnaround time…"
                                value={pitchText}
                                onChange={(e) => setPitchText(e.target.value)}
                                style={{
                                  background: "var(--color-bg-elevated)",
                                  borderColor: "var(--color-hairline)",
                                  color: "var(--color-text-primary)",
                                }}
                              />
                            </div>
                            <Button
                              className="w-full h-11 rounded-xl text-sm font-semibold"
                              disabled={applying}
                              onClick={handleApply}
                            >
                              {applying ? "Submitting Pitch…" : "Submit Application"}
                              <Send className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        )}

                        {/* Escrow Guarantee Footnote */}
                        <div className="pt-3 border-t flex items-center gap-2 text-xs font-body" style={{ borderColor: "var(--color-hairline)", color: "var(--color-text-tertiary)" }}>
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>100% Escrow Protected · Direct Bank Payout</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="projects" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Projects</h2>

                <div className="flex p-1 rounded-xl mb-5 w-full max-w-xs" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                  {(["browse", "applications"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setProjectsSubTab(tab)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold font-body transition-all"
                      style={{
                        background: projectsSubTab === tab ? "var(--color-accent)" : "transparent",
                        color: projectsSubTab === tab ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                      }}
                    >
                      {tab === "browse" ? "Browse" : "My Applications"}
                    </button>
                  ))}
                </div>

                {projectsSubTab === "browse" ? (
                  <>
                    {!isProfileComplete && (
                      <div className="mb-5 p-4 rounded-[20px] bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold font-body text-[var(--color-text-primary)]">
                              Complete Your Profile to Apply
                            </h4>
                            <p className="text-xs font-body text-[var(--color-text-secondary)] mt-0.5">
                              Clients require a completed bio, at least 1 rate card, and a performance reel before accepting pitches.
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="shrink-0" onClick={() => setActiveTab("storefront")}>
                          Complete Profile
                        </Button>
                      </div>
                    )}

                    {/* Search bar with Filters button beside it */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-text-tertiary)" }} />
                          <Input
                            placeholder="Search projects by title, client, or role…"
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="!h-10 text-xs sm:text-sm pl-10 pr-9 rounded-xl !bg-[var(--color-bg-surface)] border-[var(--color-border-default)] focus:!border-[var(--color-accent)]"
                          />
                          {projectSearch && (
                            <button
                              type="button"
                              aria-label="Clear project search"
                              onClick={() => setProjectSearch("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowProjectFilterModal(true)}
                          aria-label="Filter projects"
                          className={`h-10 px-3.5 rounded-xl border text-xs font-semibold font-body inline-flex items-center gap-2 shrink-0 transition-all ${
                            activeProjectFilterCount > 0
                              ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                              : "hover:border-[var(--color-border-strong)]"
                          }`}
                          style={{
                            background: activeProjectFilterCount > 0 ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                            borderColor: activeProjectFilterCount > 0 ? "var(--color-accent)" : "var(--color-border-default)",
                            color: activeProjectFilterCount > 0 ? "var(--color-accent)" : "var(--color-text-primary)",
                          }}
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          <span>Filters</span>
                          {activeProjectFilterCount > 0 && (
                            <span
                              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center font-mono tnum"
                              style={{ background: "var(--color-accent)", color: "var(--color-accent-on)" }}
                            >
                              {activeProjectFilterCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Active Filter Chips */}
                      {activeProjectFilterCount > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-3">
                          {projectRoleFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]">
                              Category: {projectRoleFilter}
                              <button onClick={() => setProjectRoleFilter("all")} className="hover:opacity-75"><X className="w-3 h-3" /></button>
                            </span>
                          )}
                          {projectBudgetSlider > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]">
                              Min Budget: ₦{projectBudgetSlider.toLocaleString()}
                              <button onClick={() => setProjectBudgetSlider(0)} className="hover:opacity-75"><X className="w-3 h-3" /></button>
                            </span>
                          )}
                          {projectRatingSlider > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]">
                              Rating: {projectRatingSlider.toFixed(1)}+ ★
                              <button onClick={() => setProjectRatingSlider(0)} className="hover:opacity-75"><X className="w-3 h-3" /></button>
                            </span>
                          )}
                          {projectLocationFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]">
                              Location: {projectLocationFilter}
                              <button onClick={() => setProjectLocationFilter("all")} className="hover:opacity-75"><X className="w-3 h-3" /></button>
                            </span>
                          )}
                          {projectStatusFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]">
                              Status: {projectStatusFilter}
                              <button onClick={() => setProjectStatusFilter("all")} className="hover:opacity-75"><X className="w-3 h-3" /></button>
                            </span>
                          )}
                          <button onClick={resetProjectFilters} className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline ml-1">
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>

                    {filteredProjects.length === 0 ? (
                      <div className="text-center py-16">
                        <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-tertiary)" }} />
                        <h3 className="font-body text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No open projects right now</h3>
                        <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Check back soon — new briefs post regularly.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSelectedProject(project);
                              setPitchText(project.myApplication?.pitch ?? "");
                              setApplyError(null);
                            }}
                            className="w-full text-left p-4 rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity"
                            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <div className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{project.projectName}</div>
                                <div className="text-xs font-body flex items-center gap-1.5 mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                                  <span>{project.clientName}</span>
                                  <span>·</span>
                                  <span>{project.projectType}</span>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {project.clientRating ?? 4.8}
                                  </span>
                                </div>
                              </div>
                              <div className="font-display text-lg tnum shrink-0" style={{ color: "var(--color-accent)" }}>{project.budget}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {project.myApplication ? (
                                <Badge tone={project.myApplication.status === "SELECTED" ? "success" : project.myApplication.status === "REJECTED" ? "error" : "accent"} size="sm">
                                  {APPLICATION_STATUS_LABEL[project.myApplication.status]}
                                </Badge>
                              ) : !project.applicationsOpen ? (
                                <Badge tone="neutral" size="sm">Applications closed</Badge>
                              ) : (
                                <Badge tone="success" size="sm">Open</Badge>
                              )}
                              <span className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                                {project.applicantCount}{project.applicantCap ? `/${project.applicantCap}` : ""} applicants
                              </span>
                              <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
                              <span className="text-xs font-body flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
                                <MapPin className="w-3 h-3 opacity-60" /> {project.location || "Lagos, NG (Hybrid/Remote)"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    {effectiveApplications.length === 0 ? (
                      <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                          <Briefcase className="w-8 h-8" />
                        </div>
                        <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Applications Submitted Yet</h3>
                        <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6">
                          You haven't submitted pitches to any active project briefs. Browse open roles in commercial, film, and voiceover to submit your profile.
                        </p>
                        <Button onClick={() => setProjectsSubTab("browse")} className="gap-2">
                          <Search className="w-4 h-4" /> Browse Open Projects
                        </Button>
                      </div>
                    ) : (
                      effectiveApplications.map((application) => (
                        <div
                          key={application.id}
                          onClick={() => {
                            const base = projects.find((p) => p.id === application.brief.id);
                            const found = (base
                              ? { ...base, myApplication: application }
                              : {
                                  id: application.brief.id,
                                  projectName: application.brief.projectName,
                                  clientName: application.brief.clientName,
                                  projectType: application.brief.projectType || "Voice-Over",
                                  budget: application.brief.budget,
                                  applicantCount: 1,
                                  applicantCap: 10,
                                  applicationsOpen: true,
                                  nicheReq: ["VOICE_OVER"],
                                  location: "Lagos, NG (Hybrid/Remote)",
                                  clientRating: 4.9,
                                  clientReviews: 14,
                                  description: "Client is seeking professional performers for a high-profile production campaign. Selected performer will work directly with the creative direction team for studio recording and revisions.",
                                  timeline: "Production schedule agreed upon booking confirmation.",
                                  deliverables: ["Raw audio/video master files", "Revisions included", "Commercial digital rights"],
                                  scriptSample: "Audition sides and project copy will be provided directly in the Order Room.",
                                  additionalNotes: "Review project details and submitted pitch below.",
                                  escrowProtected: true,
                                  myApplication: application,
                                }) as any;
                            setSelectedProject(found);
                            setPitchText(application.pitch ?? "");
                            setApplyError(null);
                          }}
                          className="p-4 rounded-[var(--radius-lg)] cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{application.brief.projectName}</div>
                              <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{application.brief.clientName} · {application.brief.budget}</div>
                            </div>
                            <Badge tone={application.status === "SELECTED" ? "success" : application.status === "REJECTED" || application.status === "WITHDRAWN" ? "error" : "accent"} size="sm">
                              {APPLICATION_STATUS_LABEL[application.status]}
                            </Badge>
                          </div>
                          {application.pitch && (
                            <p className="text-xs font-body mb-3 italic" style={{ color: "var(--color-text-secondary)" }}>"{application.pitch}"</p>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "var(--color-hairline)" }}>
                            <span className="text-[11px] font-body" style={{ color: "var(--color-text-tertiary)" }}>Tap to view project details &amp; pitch</span>
                            {(application.status === "APPLIED" || application.status === "SHORTLISTED") && (
                              <Button
                                variant="secondary"
                                className="h-7 px-2.5 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWithdrawApplication(application.id);
                                }}
                              >
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
              )
            )}

            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Active Orders</h2>
                {effectiveOrders.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Active Orders</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      You don't have any bookings in progress right now. Share your profile link or pitch to open projects to land client orders.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => { setActiveTab("projects"); setProjectsSubTab("browse"); }} className="gap-2">
                        <Briefcase className="w-4 h-4" /> Apply to Projects
                      </Button>
                      <Button variant="secondary" onClick={() => setShowShare(true)} className="gap-2">
                        <Share2 className="w-4 h-4" /> Share Profile Link
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
                            <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>{order.counterpart}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-lg" style={{ color: "var(--color-accent)" }}>{order.amount}</div>
                            <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Due {order.due}</div>
                          </div>
                        </div>

                        {/* Phase progress */}
                        <div className="flex items-center gap-2 mb-4">
                          {["Briefing", "Deliverables", "Review", "Complete"].map((phase, i) => {
                            const current = ["Briefing", "Deliverables", "Review", "Complete"].indexOf(order.phase);
                            const isDone = i < current;
                            const isActive = i === current;
                            return (
                              <React.Fragment key={phase}>
                                <div className="flex flex-col items-center">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono"
                                    style={{
                                      background: isDone ? "var(--color-success-bg)" : isActive ? "var(--color-accent-glow)" : "var(--color-bg-elevated)",
                                      color: isDone ? "var(--color-success)" : isActive ? "var(--color-accent)" : "var(--color-text-tertiary)",
                                      border: `1px solid ${isDone ? "var(--color-success)" : isActive ? "var(--color-accent)" : "var(--color-border-default)"}`,
                                    }}
                                  >
                                    {isDone ? "✓" : i + 1}
                                  </div>
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

            {/* ── Activity History Tab ── */}
            {activeTab === "activity" && (
              <motion.div key="activity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Activity History</h2>
                    <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                      View all recent transactions, bookings, and messaging updates.
                    </p>
                  </div>
                  <Button variant="secondary" className="h-9 px-3 text-xs" onClick={() => setActiveTab("home")}>
                    ← Back to Home
                  </Button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-text-tertiary)" }} />
                    <Input
                      placeholder="Search activity..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="!h-10 text-xs sm:text-sm pl-10 rounded-xl !bg-[var(--color-bg-surface)] border-[var(--color-border-default)] focus:!border-[var(--color-accent)]"
                    />
                  </div>
                  <div className="flex p-1 rounded-xl w-full sm:w-auto" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                    {(["all", "booking", "payment", "message"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActivityFilter(filter)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold font-body capitalize transition-all"
                        style={{
                          background: activityFilter === filter ? "var(--color-accent)" : "transparent",
                          color: activityFilter === filter ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                        }}
                      >
                        {filter}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity List */}
                <div className="space-y-3">
                  {effectiveActivity.filter(item => {
                    const matchesSearch = !activitySearch || item.client.toLowerCase().includes(activitySearch.toLowerCase()) || item.service.toLowerCase().includes(activitySearch.toLowerCase());
                    const matchesFilter = activityFilter === "all" || item.type === activityFilter;
                    return matchesSearch && matchesFilter;
                  }).length === 0 ? (
                    <div className="text-center py-12 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-3 text-[var(--color-accent)]">
                        <Bell className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>No Activity Records Found</h3>
                      <p className="text-xs font-body text-[var(--color-text-secondary)] max-w-md mb-4">
                        Activity logs will populate as you send messages, submit project pitches, and complete client bookings.
                      </p>
                      <Button onClick={() => setActiveTab("projects")} className="text-xs gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Explore Projects
                      </Button>
                    </div>
                  ) : (
                    effectiveActivity
                      .filter(item => {
                        const matchesSearch = !activitySearch || item.client.toLowerCase().includes(activitySearch.toLowerCase()) || item.service.toLowerCase().includes(activitySearch.toLowerCase());
                        const matchesFilter = activityFilter === "all" || item.type === activityFilter;
                        return matchesSearch && matchesFilter;
                      })
                      .map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          onClick={() => {
                            if (item.type === "booking") navigate("/order/ORD-001");
                            else if (item.type === "payment") setActiveTab("earnings");
                            else if (item.type === "message") setActiveTab("orders");
                          }}
                          className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] cursor-pointer hover:border-[var(--color-accent)] transition-all active:scale-[0.99]"
                          style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: item.type === "payment" ? "var(--color-success-bg)" : "var(--color-accent-glow)" }}
                          >
                            {item.type === "booking" && <Calendar className="w-5 h-5" style={{ color: "var(--color-accent)" }} />}
                            {item.type === "payment" && <DollarSign className="w-5 h-5" style={{ color: "var(--color-success)" }} />}
                            {item.type === "message" && <MessageSquare className="w-5 h-5" style={{ color: "var(--color-accent)" }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{item.client}</div>
                            <div className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{item.service}</div>
                            <div className="text-[11px] font-body mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>Click to view details →</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-semibold font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{item.amount}</div>
                            <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{item.time}</div>
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Earnings Tab ── */}
            {activeTab === "earnings" && (
              <motion.div key="earnings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-6 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Earnings</h2>

                {/* Available Balance */}
                <div className="mb-6 p-6 rounded-[var(--radius-lg)] flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}>
                  <div>
                    <div className="text-xs font-body uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Available for Withdrawal</div>
                    <div className="font-display text-4xl tnum" style={{ color: "var(--color-text-primary)" }}>₦{isNewUser ? "0" : appStateSync.getBalance().available.toLocaleString()}</div>
                  </div>
                  <Button className="h-11 px-6 whitespace-nowrap" onClick={() => setShowWithdraw(true)}>Withdraw Funds</Button>
                </div>
                
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "This Month", value: isNewUser ? "₦0" : `₦${appStateSync.getBalance().available.toLocaleString()}`, sub: "Current month" },
                    { label: "Last Month", value: isNewUser ? "₦0" : "₦125,000", sub: "Previous month" },
                    { label: "All Time", value: isNewUser ? "₦0" : `₦${(1240000 + appStateSync.getBalance().withdrawnTotal).toLocaleString()}`, sub: "Since joining" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-[var(--radius-lg)]"
                      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                    >
                      <div className="text-xs font-body mb-1" style={{ color: "var(--color-text-tertiary)" }}>{stat.label}</div>
                      <div className="font-display text-2xl tnum mb-0.5" style={{ color: "var(--color-text-primary)" }}>{stat.value}</div>
                      <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{stat.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Monthly bar chart (simplified visual) */}
                <div
                  className="p-5 rounded-[var(--radius-lg)] mb-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Monthly Earnings</span>
                    <span className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Last 6 months</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[
                      { month: "Jul", val: isNewUser ? 0 : 0.55 },
                      { month: "Aug", val: isNewUser ? 0 : 0.7 },
                      { month: "Sep", val: isNewUser ? 0 : 0.45 },
                      { month: "Oct", val: isNewUser ? 0 : 0.8 },
                      { month: "Nov", val: isNewUser ? 0 : 0.65 },
                      { month: "Dec", val: isNewUser ? 0 : Math.min(1, Math.max(0.6, payouts.length / 5)) },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${bar.val * 100}%`,
                            background: bar.month === "Dec" ? "var(--color-accent)" : "var(--color-accent-glow)",
                            border: `1px solid ${bar.month === "Dec" ? "var(--color-accent)" : "var(--color-border-default)"}`,
                          }}
                        />
                        <span className="text-[10px] font-mono" style={{ color: "var(--color-text-tertiary)" }}>{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent payouts */}
                <div
                  className="rounded-[var(--radius-lg)] overflow-hidden"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                >
                  <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                    <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Recent Payouts</span>
                    <span className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Click any row for receipt</span>
                  </div>
                  {effectivePayouts.length === 0 ? (
                    <div className="py-10 px-4 text-center">
                      <BarChart2 className="w-10 h-10 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-60" />
                      <p className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>No payouts recorded yet</p>
                      <p className="text-xs font-body text-[var(--color-text-secondary)] mt-1 mb-3">Completed order earnings will be transferred directly to your bank account.</p>
                      <Button variant="secondary" onClick={() => navigate("/settings")} className="h-8 px-3 text-xs">
                        Configure Bank Account
                      </Button>
                    </div>
                  ) : (
                    effectivePayouts.map((payout, i, arr) => (
                      <div
                        key={payout.id}
                        onClick={() => setSelectedPayout(payout)}
                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[var(--color-bg-elevated)] transition-colors"
                        style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-default)" : undefined }}
                      >
                        <div>
                          <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{payout.from}</div>
                          <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{payout.date} · {payout.ref}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{payout.amount}</div>
                          <div
                            className="text-xs font-body font-medium"
                            style={{ color: payout.status === "Paid" ? "var(--color-success)" : "var(--color-gold)" }}
                          >
                            {payout.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Analytics Tab ── */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Performer Performance &amp; Analytics</h2>
                    <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                      Track profile impressions, booking conversion, and earnings velocity for {talentProfile.name}.
                    </p>
                  </div>
                  <Badge tone={isNewUser ? "neutral" : "success"} size="md">{isNewUser ? "Pending Data" : "Live Sync Active"}</Badge>
                </div>

                {isNewUser ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Analytics Will Unlock Soon</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      Profile views, conversion metrics, and monthly booking trends will automatically track as clients view your profile and send booking requests.
                    </p>
                    <Button variant="secondary" onClick={() => setShowShare(true)} className="gap-2">
                      <Share2 className="w-4 h-4" /> Share Profile to Drive Views
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Profile Views</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>1,420</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>↑ +18% this month</div>
                  </div>
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Booking Conversion</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-accent)" }}>8.4%</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>12 bookings from 142 clicks</div>
                  </div>
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Average Rating</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>4.9 ★</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>Based on 24 client reviews</div>
                  </div>
                  <div className="p-4 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Avg Response Time</div>
                    <div className="font-display text-2xl font-bold tnum" style={{ color: "var(--color-text-primary)" }}>15 mins</div>
                    <div className="text-xs font-body mt-1" style={{ color: "var(--color-success)" }}>Fast responder badge</div>
                  </div>
                </div>

                {/* Detailed Analytics Charts & Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Niche & Rate Card Revenue Breakdown */}
                  <div className="p-5 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <h3 className="font-display text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Revenue by Service Niche</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Voice-Over &amp; Commercial Ads</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-accent)" }}>65% (₦292,500)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "65%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Dramatic Screen &amp; Stage</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-accent)" }}>25% (₦112,500)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "25%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-body mb-1">
                          <span style={{ color: "var(--color-text-primary)" }}>Live Host &amp; Compere</span>
                          <span className="font-mono font-semibold" style={{ color: "var(--color-accent)" }}>10% (₦45,000)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: "10%", background: "var(--color-accent)" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Growth Velocity */}
                  <div className="p-5 rounded-[var(--radius-xl)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                    <h3 className="font-display text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Monthly Booking Growth</h3>
                    <div className="flex items-end justify-between h-36 gap-3 pt-4 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                      {[
                        { month: "Mar", height: "40%", amount: "₦180k" },
                        { month: "Apr", height: "55%", amount: "₦250k" },
                        { month: "May", height: "70%", amount: "₦320k" },
                        { month: "Jun", height: "60%", amount: "₦290k" },
                        { month: "Jul", height: "85%", amount: "₦410k" },
                        { month: "Aug", height: "100%", amount: "₦450k" },
                      ].map((bar) => (
                        <div key={bar.month} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-text-secondary)" }}>{bar.amount}</span>
                          <div className="w-full rounded-t-md transition-all group-hover:brightness-110" style={{ height: bar.height, background: "var(--color-accent)" }} />
                          <span className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>{bar.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </>
                )}
              </motion.div>
            )}

            </AnimatePresence>
          {/* Withdraw Funds Modal (features.md Phase 12C — Email OTP Gate) */}
          <AnimatePresence>
            {showWithdraw && (
              <Modal onClose={() => {
                setShowWithdraw(false);
                setWithdrawStep("input");
                setShowAccountPicker(false);
                setActiveWithdrawalRequestId(null);
                setWithdrawOtpCode("");
                setWithdrawPasscodeError(null);
              }}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-elevated)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {withdrawStep === "input" ? "Withdraw Funds" : "Enter your passcode"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowWithdraw(false);
                        setWithdrawStep("input");
                        setShowAccountPicker(false);
                        setActiveWithdrawalRequestId(null);
                        setWithdrawOtpCode("");
                        setWithdrawPasscodeError(null);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-bg-elevated)" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {withdrawPasscodeError && (
                    <div className="p-3 rounded-xl mb-4 text-xs font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
                      {withdrawPasscodeError}
                    </div>
                  )}

                  {withdrawStep === "input" ? (
                    <>
                      {/* Input 1: Amount */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider font-body" style={{ color: "var(--color-text-secondary)" }}>Amount (₦)</label>
                        <Input
                          type="text"
                          placeholder="e.g. 100,000"
                          value={withdrawAmount}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, "");
                            if (!raw) {
                              setWithdrawAmount("");
                              return;
                            }
                            setWithdrawAmount(Number(raw).toLocaleString());
                          }}
                        />
                        <div className="text-xs mt-2 font-body" style={{ color: "var(--color-text-secondary)" }}>
                          Available for withdrawal: <strong>₦{appStateSync.getBalance().available.toLocaleString()}</strong>
                        </div>
                      </div>

                      {/* Input 2: Destination Bank Account Selector (Select from added accounts) */}
                      <div className="mb-6 relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wider font-body" style={{ color: "var(--color-text-secondary)" }}>
                            Destination Bank Account
                          </label>
                          <span className="text-[11px] font-medium text-zinc-400">
                            Select from added accounts
                          </span>
                        </div>

                        {/* Selected Account Input Trigger: Bank name primary, subtext with account details & number, plus check */}
                        <button
                          type="button"
                          onClick={() => setShowAccountPicker(prev => !prev)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                            showAccountPicker
                              ? "bg-white border-red-500 ring-2 ring-red-100 shadow-sm"
                              : "bg-zinc-50 hover:bg-zinc-100/80 border-zinc-200 shadow-2xs"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-sm font-semibold text-zinc-900 font-body truncate">
                              {appStateSync.getBankDetails().bankName}
                            </div>
                            <div className="text-xs text-zinc-500 font-mono mt-0.5 truncate">
                              •••• {appStateSync.getBankDetails().accountNumber.slice(-4)} · {appStateSync.getBankDetails().accountName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showAccountPicker ? "rotate-180 text-red-500" : ""}`} />
                          </div>
                        </button>

                        {/* Dropdown list of added accounts */}
                        {showAccountPicker && (
                          <div className="mt-2 space-y-1.5 p-2 rounded-xl bg-white border border-zinc-200 shadow-lg max-h-56 overflow-y-auto">
                            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                              Added Accounts
                            </div>
                            {ADDED_BANK_ACCOUNTS.map((acc, idx) => {
                              const isSelected =
                                appStateSync.getBankDetails().bankName === acc.bankName &&
                                appStateSync.getBankDetails().accountNumber === acc.accountNumber;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    appStateSync.updateBankDetails(acc);
                                    setShowAccountPicker(false);
                                  }}
                                  className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all ${
                                    isSelected
                                      ? "bg-red-50/70 border border-red-200"
                                      : "hover:bg-zinc-50 border border-transparent"
                                  }`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="text-xs font-semibold text-zinc-900 font-body truncate">{acc.bankName}</div>
                                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                                      •••• {acc.accountNumber.slice(-4)} · {acc.accountName}
                                    </div>
                                  </div>
                                  {isSelected ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <span className="text-[11px] font-medium text-zinc-400 hover:text-zinc-600">Select</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-11"
                        disabled={withdrawSubmitting}
                        onClick={() => {
                          const amt = Number(withdrawAmount.replace(/[^0-9]/g, ""));
                          const available = appStateSync.getBalance().available;

                          if (!amt || amt <= 0) {
                            setWithdrawPasscodeError("Please enter a valid withdrawal amount.");
                            return;
                          }
                          if (amt > available) {
                            setWithdrawPasscodeError(`Withdrawal amount (₦${amt.toLocaleString()}) exceeds available balance (₦${available.toLocaleString()}).`);
                            return;
                          }

                          setWithdrawPasscodeError(null);
                          setWithdrawStep("passcode");
                        }}
                      >
                        Continue to Security Passcode
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Clean copy without shield icon or "Authorize Payout" header */}
                      <p className="text-xs text-zinc-500 mb-5 leading-relaxed text-center font-body">
                        Enter your 4-digit passcode to withdraw <strong className="text-zinc-900">₦{withdrawAmount}</strong> to <strong className="text-zinc-900">{appStateSync.getBankDetails().bankName}</strong>.
                      </p>

                      <div className="mb-6">
                        <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider font-body text-center" style={{ color: "var(--color-text-secondary)" }}>
                          4-Digit Security Passcode
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="••••"
                          value={withdrawPasscode}
                          onChange={(e) => {
                            setWithdrawPasscodeError(null);
                            setWithdrawPasscode(e.target.value.replace(/\D/g, "").slice(0, 4));
                          }}
                          className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-center font-mono font-bold text-xl tracking-[0.4em] focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                          autoFocus
                        />
                        <div className="text-[11px] font-body mt-2 text-center text-[var(--color-text-tertiary)]">
                          Set or update your 4-digit passcode in Settings anytime.
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <Button variant="secondary" className="flex-1 h-11 text-xs font-semibold" onClick={() => setWithdrawStep("input")}>
                          Back
                        </Button>
                        <Button
                          className="flex-[2] h-11 text-sm font-semibold"
                          disabled={withdrawPasscode.length !== 4 || withdrawSubmitting}
                          onClick={() => {
                            const savedPasscode = localStorage.getItem("monologg_withdrawal_passcode") || "1234";
                            if (withdrawPasscode !== savedPasscode) {
                              setWithdrawPasscodeError("Incorrect security passcode. Default passcode is 1234 or update in Settings.");
                              return;
                            }

                            setWithdrawSubmitting(true);
                            setWithdrawPasscodeError(null);

                            const amt = Number(withdrawAmount.replace(/[^0-9]/g, ""));
                            appStateSync.withdrawFunds(amt);

                            const bank = appStateSync.getBankDetails();
                            const newPayoutItem = {
                              id: `pay-${Date.now()}`,
                              from: "Direct Withdrawal",
                              service: `Payout to ${bank.bankName}`,
                              amount: `₦${amt.toLocaleString()}`,
                              numericAmount: amt,
                              date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                              time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                              status: "Paid" as const,
                              ref: `PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                              bankAccount: `${bank.bankName} ···· ${bank.accountNumber.slice(-4)}`,
                            };
                            setPayouts(prev => [newPayoutItem, ...prev]);
                            setActivity(prev => [
                              {
                                type: "payment",
                                status: "Completed",
                                client: "Monologg Payout",
                                service: `Withdrawal to ${bank.bankName}`,
                                amount: `₦${amt.toLocaleString()}`,
                                time: "Just now",
                              },
                              ...prev,
                            ]);

                            setSelectedPayout(newPayoutItem);
                            setShowWithdraw(false);
                            setWithdrawStep("input");
                            setShowAccountPicker(false);
                            setWithdrawAmount("");
                            setWithdrawPasscode("");
                            setWithdrawSubmitting(false);
                          }}
                        >
                          {withdrawSubmitting ? "Withdrawing…" : "Withdraw Funds"}
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Payout Receipt Modal with Monologg Branding & Watermark */}
          <AnimatePresence>
            {selectedPayout && (
              <Modal onClose={() => setSelectedPayout(null)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden bg-white border border-zinc-200 shadow-xl"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Subtle Monologg Watermark Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none text-zinc-900 print:opacity-15">
                    <LogoMark className="w-64 h-64" />
                  </div>

                  {/* Header with Monologg branding */}
                  <div className="flex items-center justify-between mb-4 border-b pb-3 border-zinc-100 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <LogoMark className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold tracking-tight text-zinc-900">MONOLOGG</span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold bg-zinc-100 text-zinc-600">
                            Payout Receipt
                          </span>
                        </div>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">{selectedPayout.ref}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPayout(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hero Transferred Amount Card with Inner Watermark */}
                  <div className="relative overflow-hidden text-center py-5 mb-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-2xs z-10">
                    <div className="absolute right-2 -bottom-3 w-28 h-28 opacity-[0.05] pointer-events-none text-red-600">
                      <LogoMark className="w-full h-full" />
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Transferred Amount</div>
                    <div className="font-display text-3xl font-bold font-mono text-red-600 tracking-tight">{selectedPayout.amount}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedPayout.status}</span>
                    </div>
                  </div>

                  {/* Details Breakdown */}
                  <div className="space-y-3 mb-5 text-xs font-body relative z-10">
                    <div className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400">Source / Client</span>
                      <span className="font-semibold text-zinc-900">{selectedPayout.from}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400">Service Description</span>
                      <span className="font-medium text-zinc-700">{selectedPayout.service}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400">Destination Account</span>
                      <span className="font-mono font-medium text-zinc-900">{selectedPayout.bankAccount}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400">Date & Time</span>
                      <span className="text-zinc-600">{selectedPayout.date} · {selectedPayout.time}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-zinc-400">Platform Transfer Fee</span>
                      <span className="font-mono font-medium text-emerald-600">₦0 (Free)</span>
                    </div>
                  </div>

                  {/* Official Protocol Stamp */}
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 mb-5 flex items-center justify-between text-[11px] text-zinc-500 relative z-10">
                    <div className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Monologg Escrow Protocol Guarantee</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">#ESC-9082 · Verified</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 relative z-10">
                    <Button variant="secondary" className="flex-1 h-10 text-xs font-semibold" onClick={() => window.print()}>
                      Save / Print Receipt
                    </Button>
                    <Button className="flex-1 h-10 text-xs font-semibold" onClick={() => setSelectedPayout(null)}>
                      Close
                    </Button>
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Share Modal */}
          <AnimatePresence>
            {showShare && (
              <Modal onClose={() => setShowShare(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl">Share Profile</h3>
                    <button onClick={() => setShowShare(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-[var(--radius-md)] mb-4 border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                    <div className="text-sm font-mono truncate flex-1 pl-2">{window.location.host}/elias-thorne</div>
                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => {
                      const url = `${window.location.origin}/elias-thorne`;
                      navigator.clipboard?.writeText(url);
                      alert(`Copied link to clipboard: ${url}`);
                    }}>Copy</Button>
                  </div>
                  <div className="mb-4">
                    <a
                      href="/elias-thorne"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-[var(--radius-md)] text-xs font-semibold"
                      style={{ background: "var(--color-accent)", color: "var(--color-accent-on)" }}
                    >
                      Open Public Profile <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" className="h-10 text-xs" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.origin + "/elias-thorne")}`)}>WhatsApp</Button>
                    <Button variant="secondary" className="h-10 text-xs" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + "/elias-thorne")}`)}>Twitter</Button>
                    <Button variant="secondary" className="h-10 text-xs" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/elias-thorne")}`)}>LinkedIn</Button>
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>
        </div>
      
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
                    {notifications.map((n) => {
                      const meta = NOTIFICATION_META[n.kind] ?? { title: n.kind, tone: "accent" as const };
                      const unread = !n.readAt;
                      return (
                        <button
                          key={n.id}
                          onClick={() => unread && handleMarkNotificationRead(n.id)}
                          className="w-full text-left p-4 rounded-[var(--radius-md)] border relative"
                          style={{
                            background: "var(--color-bg-elevated)",
                            borderColor: unread ? "var(--color-accent)" : "var(--color-border-default)",
                          }}
                        >
                          <div
                            className="text-xs font-semibold mb-1"
                            style={{ color: meta.tone === "success" ? "var(--color-success)" : "var(--color-accent)" }}
                          >
                            {meta.title}
                          </div>
                          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{describeNotification(n)}</p>
                          <div className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                            {formatRelativeTime(n.createdAt)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Sync Calendar Modal */}
          <AnimatePresence>
            {showSyncModal && (
              <Modal onClose={() => setShowSyncModal(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6 text-center"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
                  <h3 className="font-display text-xl mb-2">Sync with Google Calendar</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>Connect your Google account to automatically block out times when you're busy and prevent double-bookings.</p>
                  <Button className="w-full h-11 mb-3" onClick={() => {
                    alert("Redirecting to Google OAuth...");
                    setShowSyncModal(false);
                  }}>
                    Connect Google Account
                  </Button>
                  <Button variant="ghost" className="w-full text-xs" onClick={() => setShowSyncModal(false)}>Maybe Later</Button>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Add Slot Modal (features.md Phase 13) */}
          <AnimatePresence>
            {showAddSlot && (
              <Modal onClose={() => setShowAddSlot(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-xl">Add slot — {formatDayLabel(selectedDate)}</h3>
                    <button onClick={() => setShowAddSlot(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Start</label>
                      <Input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>End</label>
                      <Input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-5">
                    {(["free", "unavailable"] as const).map(state => (
                      <button
                        key={state}
                        onClick={() => setNewSlotState(state)}
                        className="flex-1 py-2 rounded-[var(--radius-md)] text-xs font-semibold"
                        style={{
                          background: newSlotState === state ? SLOT_STATE_META[state].color : "var(--color-bg-elevated)",
                          color: newSlotState === state ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                          border: `1px solid ${newSlotState === state ? SLOT_STATE_META[state].color : "var(--color-border-default)"}`,
                        }}
                      >
                        {SLOT_STATE_META[state].label}
                      </button>
                    ))}
                  </div>
                  <Button className="w-full h-11" onClick={handleAddSlot} disabled={!newSlotStart || !newSlotEnd || newSlotStart >= newSlotEnd}>
                    Save Slot
                  </Button>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Add Event Modal (features.md Phase 13) */}
          <AnimatePresence>
            {showAddEvent && (
              <Modal onClose={() => setShowAddEvent(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-xl">Add event — {formatDayLabel(selectedDate)}</h3>
                    <button onClick={() => setShowAddEvent(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Title</label>
                    <Input placeholder="e.g. Table read" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Start</label>
                      <Input type="time" value={newEventStart} onChange={e => setNewEventStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>End</label>
                      <Input type="time" value={newEventEnd} onChange={e => setNewEventEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-5">
                    {(["personal", "hold"] as const).map(kind => (
                      <button
                        key={kind}
                        onClick={() => setNewEventKind(kind)}
                        className="flex-1 py-2 rounded-[var(--radius-md)] text-xs font-semibold capitalize"
                        style={{
                          background: newEventKind === kind ? "var(--color-accent)" : "var(--color-bg-elevated)",
                          color: newEventKind === kind ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                          border: `1px solid ${newEventKind === kind ? "var(--color-accent)" : "var(--color-border-default)"}`,
                        }}
                      >
                        {kind}
                      </button>
                    ))}
                  </div>
                  <Button className="w-full h-11" onClick={handleAddEvent} disabled={!newEventTitle.trim() || newEventStart >= newEventEnd}>
                    Save Event
                  </Button>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Add Recurring Template Modal (features.md Phase 13) */}
          <AnimatePresence>
            {showRecurringForm && (
              <Modal onClose={() => setShowRecurringForm(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-xl">Recurring availability</h3>
                    <button onClick={() => setShowRecurringForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Repeats</label>
                    <select
                      value={recurRule}
                      onChange={e => setRecurRule(e.target.value)}
                      className="w-full h-[54px] px-4 rounded-[var(--radius-lg)] text-base font-body"
                      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                    >
                      {RECUR_RULE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Start</label>
                      <Input type="time" value={recurSlotStart} onChange={e => setRecurSlotStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>End</label>
                      <Input type="time" value={recurSlotEnd} onChange={e => setRecurSlotEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-5">
                    {(["free", "unavailable"] as const).map(state => (
                      <button
                        key={state}
                        onClick={() => setRecurSlotState(state)}
                        className="flex-1 py-2 rounded-[var(--radius-md)] text-xs font-semibold"
                        style={{
                          background: recurSlotState === state ? SLOT_STATE_META[state].color : "var(--color-bg-elevated)",
                          color: recurSlotState === state ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                          border: `1px solid ${recurSlotState === state ? SLOT_STATE_META[state].color : "var(--color-border-default)"}`,
                        }}
                      >
                        {SLOT_STATE_META[state].label}
                      </button>
                    ))}
                  </div>
                  <Button className="w-full h-11" onClick={handleAddRecurring} disabled={recurSlotStart >= recurSlotEnd}>
                    Save Recurring Template
                  </Button>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Project Filter Modal */}
          <AnimatePresence>
            {showProjectFilterModal && (
              <Modal onClose={() => setShowProjectFilterModal(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.96, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 20, scale: 0.96, opacity: 0 }}
                  className="w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5"
                  style={{
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-default)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal className="w-5 h-5 text-[var(--color-accent)]" />
                      <h3 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Filter Projects
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowProjectFilterModal(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-elevated)] transition-colors"
                      style={{ color: "var(--color-text-tertiary)" }}
                      aria-label="Close filters"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Category Clickable Tags */}
                  <div>
                    <label className="block text-xs uppercase font-semibold font-body tracking-wider mb-2" style={{ color: "var(--color-text-secondary)" }}>
                      Category / Craft Role
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "all", label: "All Roles" },
                        { id: "voice-over", label: "Voice-Over" },
                        { id: "actor", label: "Actor" },
                        { id: "model", label: "Model" },
                        { id: "presenter", label: "Presenter / Host" },
                        { id: "comedian", label: "Comedian" },
                        { id: "musician", label: "Musician" },
                      ].map((cat) => {
                        const isSelected = projectRoleFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setProjectRoleFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body transition-all ${
                              isSelected ? "shadow-sm" : "hover:border-[var(--color-border-strong)]"
                            }`}
                            style={{
                              background: isSelected ? "var(--color-accent)" : "var(--color-bg-elevated)",
                              color: isSelected ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                              border: isSelected ? "1px solid var(--color-accent)" : "1px solid var(--color-border-default)",
                            }}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Budget Range Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase font-semibold font-body tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                        Minimum Budget
                      </label>
                      <span className="font-mono text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                        {projectBudgetSlider === 0 ? "Any Budget" : `₦${projectBudgetSlider.toLocaleString()}+`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={600000}
                      step={25000}
                      value={projectBudgetSlider}
                      onChange={(e) => setProjectBudgetSlider(Number(e.target.value))}
                      className="w-full accent-[var(--color-accent)] cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                      <span>₦0 (Any)</span>
                      <span>₦300k</span>
                      <span>₦600k+</span>
                    </div>
                  </div>

                  {/* 3. Rating Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase font-semibold font-body tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                        Minimum Client Rating
                      </label>
                      <span className="text-xs font-bold font-body text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {projectRatingSlider === 0 ? "Any Rating" : `${projectRatingSlider.toFixed(1)}+ ★`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.1}
                      value={projectRatingSlider}
                      onChange={(e) => setProjectRatingSlider(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                      <span>Any (0.0★)</span>
                      <span>4.0★</span>
                      <span>4.5★</span>
                      <span>5.0★</span>
                    </div>
                  </div>

                  {/* 4. Location & Application Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs uppercase font-semibold font-body tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                        Location
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "all", label: "All" },
                          { id: "lagos", label: "Lagos" },
                          { id: "abuja", label: "Abuja" },
                          { id: "remote", label: "Remote" },
                        ].map((loc) => {
                          const isSelected = projectLocationFilter === loc.id;
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => setProjectLocationFilter(loc.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium font-body transition-all"
                              style={{
                                background: isSelected ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                                color: isSelected ? "var(--color-accent)" : "var(--color-text-secondary)",
                                border: isSelected ? "1px solid var(--color-accent)" : "1px solid var(--color-border-default)",
                              }}
                            >
                              {loc.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-semibold font-body tracking-wider mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                        Status
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "all", label: "All" },
                          { id: "open", label: "Open" },
                          { id: "applied", label: "Applied" },
                        ].map((st) => {
                          const isSelected = projectStatusFilter === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setProjectStatusFilter(st.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium font-body transition-all"
                              style={{
                                background: isSelected ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                                color: isSelected ? "var(--color-accent)" : "var(--color-text-secondary)",
                                border: isSelected ? "1px solid var(--color-accent)" : "1px solid var(--color-border-default)",
                              }}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t flex items-center justify-between gap-3" style={{ borderColor: "var(--color-hairline)" }}>
                    <button
                      type="button"
                      onClick={resetProjectFilters}
                      className="text-xs font-semibold font-body hover:underline"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Reset All
                    </button>
                    <Button
                      onClick={() => setShowProjectFilterModal(false)}
                      className="h-10 px-5 text-xs font-semibold"
                    >
                      Show {filteredProjects.length} Projects
                    </Button>
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>
          
          {/* Quick Action Popover (Images 2, 3, 4 Inspiration) */}
          <AnimatePresence>
            {actionPopover && (
              <Modal onClose={() => setActionPopover(null)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-xs rounded-[var(--radius-lg)] p-5"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-elevated)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: "var(--color-border-default)" }}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                      <h4 className="font-display text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                        Action — {formatDayLabel(actionPopover.date)} {actionPopover.time ? `(${actionPopover.time})` : ""}
                      </h4>
                    </div>
                    <button onClick={() => setActionPopover(null)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-3.5 h-3.5" style={{ color: "var(--color-text-tertiary)" }} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs h-10 gap-2"
                      onClick={() => {
                        const targetDate = actionPopover.date;
                        setActionPopover(null);
                        setSelectedDate(targetDate);
                        setNewSlotState("free");
                        setShowAddSlot(true);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" /> Mark as Available
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-xs h-10 gap-2"
                      onClick={() => {
                        const targetDate = actionPopover.date;
                        setActionPopover(null);
                        setSelectedDate(targetDate);
                        setNewSlotState("unavailable");
                        setShowAddSlot(true);
                      }}
                    >
                      <X className="w-4 h-4 text-[var(--color-accent)]" /> Mark as Unavailable
                    </Button>
                    <Button
                      className="w-full justify-start text-xs h-10 gap-2"
                      onClick={() => {
                        const targetDate = actionPopover.date;
                        setActionPopover(null);
                        setSelectedDate(targetDate);
                        setShowAddEvent(true);
                      }}
                    >
                      <Plus className="w-4 h-4" /> Add Event / Hold
                    </Button>
                  </div>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Selected Event Details Modal (Images 2 & 4 Inspiration) */}
          <AnimatePresence>
            {selectedEventModal && (
              <Modal onClose={() => setSelectedEventModal(null)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-xl)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-elevated)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--color-border-default)" }}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider font-body text-[var(--color-accent)]">
                        {formatDayLabel(selectedEventModal.date)}
                      </span>
                      <h3 className="font-display text-lg font-bold mt-0.5" style={{ color: "var(--color-text-primary)" }}>
                        {selectedEventModal.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          const evtId = selectedEventModal.id;
                          setSelectedEventModal(null);
                          await handleDeleteEvent(evtId);
                        }}
                        aria-label="Delete event"
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedEventModal(null)}
                        aria-label="Close"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3.5 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold font-body text-tertiary" style={{ color: "var(--color-text-tertiary)" }}>Date & Time</div>
                        <div className="text-xs font-mono font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {formatDayLabel(selectedEventModal.date)} · {selectedEventModal.start} – {selectedEventModal.end}
                        </div>
                      </div>
                    </div>

                    {selectedEventModal.venue && (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-semibold font-body text-tertiary" style={{ color: "var(--color-text-tertiary)" }}>Venue / Location</div>
                          <div className="text-xs font-body" style={{ color: "var(--color-text-primary)" }}>
                            {selectedEventModal.venue}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedEventModal.description && (
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-semibold font-body text-tertiary" style={{ color: "var(--color-text-tertiary)" }}>Description</div>
                          <div className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                            {selectedEventModal.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button className="w-full h-10 text-xs" onClick={() => setSelectedEventModal(null)}>
                    Done
                  </Button>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          <UploadPerformanceReelModal
            isOpen={showUploadReelModal}
            onClose={() => setShowUploadReelModal(false)}
            currentReelUrl={talentProfile.performanceReelUrl}
            onUploadSuccess={(url, title) => {
              setTalentProfile((prev) => ({
                ...prev,
                hasReel: true,
                performanceReelUrl: url,
                performanceReelTitle: title,
              }));
            }}
          />

          <WatchPerformanceReelModal
            isOpen={showWatchReelModal}
            onClose={() => setShowWatchReelModal(false)}
            videoUrl={talentProfile.performanceReelUrl}
            title={talentProfile.performanceReelTitle || "Featured Audition Reel"}
            canUpload={true}
            onOpenUpload={() => setShowUploadReelModal(true)}
          />

      </main>

      <BottomNav navItems={TALENT_BOTTOM_NAV_ITEMS} activeTab={activeTab} onTab={setActiveTab} indicatorId="tab-indicator" />
    </div>
  );
}
