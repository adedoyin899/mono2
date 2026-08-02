import React, { useEffect, useState } from "react";
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
import type { ActivityItem, CalendarEvent, DayDetail, MyApplication, Order, Project, ServiceRateCard, Slot, SlotState, StatMetric } from "@monologg/types";
import {
  Home, Calendar, Bell, User, Share2, Shield, Play, TrendingUp,
  Plus, Edit2, Trash2, ChevronRight,
  MessageSquare, DollarSign, CheckCircle2, X, ExternalLink,
  BarChart2, Award, Repeat, Briefcase, Search, Send
} from "lucide-react";

type Tab = "home" | "storefront" | "rates" | "calendar" | "orders" | "earnings" | "projects" | "activity" | "analytics";

const VIBE_TAGS = ["Dramatic", "Deep Texture", "British Accent", "Authoritative", "Warm"];

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
  { id: "storefront", label: "My Storefront", icon: User },
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
    const priceAmount = Number(newServicePrice.replace(/[^0-9]/g, ""));
    const formattedPrice = `₦${priceAmount.toLocaleString()}`;

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
    apiClient.listServices().then(setServices);
    setNewServiceTitle("");
    setNewServicePrice("45000");
    setNewServiceDelivery("24 Hours");
  };

  const handleDeleteService = async (id: string) => {
    await apiClient.deleteService(id);
    apiClient.listServices().then(setServices);
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
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pitchText, setPitchText] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const currentUser = appStateSync.getLoggedInUser();
  const [isNewUser, setIsNewUser] = useState(() => currentUser?.isNewUser ?? false);

  const effectiveServices = isNewUser ? [] : services;
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

  useEffect(() => {
    const sync = () => {
      setTalentProfile(appStateSync.getTalentProfile());
      apiClient.listProjects().then(setProjects);
    };
    const unsub = appStateSync.subscribe(sync);

    apiClient.getTalentStats().then(setStats);
    apiClient.listTalentActivity().then(setActivity);
    apiClient.listServices().then(setServices);
    apiClient.listTalentOrders().then(setOrders);
    apiClient.listNotifications().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    return unsub;
  }, []);

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
    setApplying(true);
    setApplyError(null);
    try {
      await apiClient.applyToProject(selectedProject.id, pitchText.trim() || undefined);
      setSelectedProject(null);
      setPitchText("");
      loadProjects();
    } catch {
      setApplyError("That project just closed to new applications — please try another.");
    } finally {
      setApplying(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    await apiClient.withdrawMyApplication(applicationId);
    setMyApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "WITHDRAWN" } : a)));
  };

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.trim().toLowerCase();
    const matchesSearch = !q || p.projectName.toLowerCase().includes(q) || p.projectType.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
    const matchesRole = projectRoleFilter === "all" || p.projectType.toLowerCase().includes(projectRoleFilter.toLowerCase());
    const budgetNum = Number(p.budget.replace(/[^0-9]/g, "")) || 0;
    const matchesBudget = projectBudgetFilter === "all"
      || (projectBudgetFilter === "under100" && budgetNum < 100000)
      || (projectBudgetFilter === "100to300" && budgetNum >= 100000 && budgetNum <= 300000)
      || (projectBudgetFilter === "over300" && budgetNum > 300000);
    const matchesStatus = projectStatusFilter === "all"
      || (projectStatusFilter === "open" && p.applicationsOpen && !p.myApplication)
      || (projectStatusFilter === "applied" && Boolean(p.myApplication));

    return matchesSearch && matchesRole && matchesBudget && matchesStatus;
  });

  const loadDay = (date: string) => {
    setLoadingDay(true);
    apiClient.getAvailabilityDay(date).then((detail) => {
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
    setShowAddEvent(false);
    setNewEventTitle("");
  };

  const handleDeleteEvent = async (id: string) => {
    await apiClient.deleteCalendarEvent(id);
    setDayDetail((prev) => (prev ? { ...prev, events: prev.events.filter((e) => e.id !== id) } : prev));
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
    : activeTab === "storefront" ? "My Storefront"
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
        portalLabel="Talent Portal"
        navItems={TALENT_NAV_ITEMS}
        activeTab={activeTab}
        onTab={setActiveTab}
        onNavigate={navigate}
        identity={{
          initials: talentInitials,
          name: talentName,
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
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {activeTab === "home" && `Good morning, ${firstName} 👋`}
                {activeTab === "storefront" && "My Storefront"}
                {activeTab === "rates" && "Rate Cards"}
                {activeTab === "calendar" && "Availability"}
                {activeTab === "projects" && "Projects"}
                {activeTab === "orders" && "Active Orders"}
                {activeTab === "earnings" && "Earnings & Analytics"}
              </h1>
              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {activeTab === "home" && "Here's what's happening with your career today."}
                {activeTab === "storefront" && "Your public booking page — share this with clients."}
                {activeTab === "rates" && "Define your services and pricing."}
                {activeTab === "calendar" && "Set your availability for bookings."}
                {activeTab === "projects" && "Find and apply to client projects."}
                {activeTab === "orders" && "Manage your active collaborations."}
                {activeTab === "earnings" && "Track your income and performance."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNewUser(!isNewUser)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-secondary)] flex items-center gap-1.5 font-body"
                title="Toggle between New User empty state and Active Demo state"
              >
                <span className={`w-2 h-2 rounded-full ${isNewUser ? "bg-amber-500" : "bg-emerald-500"}`} />
                {isNewUser ? "Mode: New User" : "Mode: Active Demo"}
              </button>
              {activeTab === "storefront" && (
                <Button variant="secondary" className="h-10 px-4 text-sm gap-2" onClick={() => setShowShare(true)}>
                  <Share2 className="w-4 h-4" /> Share Profile
                </Button>
              )}
              {activeTab === "rates" && (
                <Button className="h-10 px-4 text-sm gap-2" onClick={() => setShowAddService(true)}>
                  <Plus className="w-4 h-4" /> Add Service
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
                          {isNewUser ? "Welcome! Complete your Talent Setup" : "Career Checklist & Action Nudges"}
                        </h3>
                        <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                          {isNewUser ? "Follow these steps to unlock client bookings and start earning." : "Key steps to maximize your visibility and client booking conversion."}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isNewUser ? "accent" : "success"}>{isNewUser ? "Onboarding" : "Active Profile"}</Badge>
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
                          Storefront <ChevronRight className="w-3.5 h-3.5 opacity-60" />
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
                    <div className="text-xs font-body uppercase tracking-wider" style={{ opacity: 0.85 }}>Available balance</div>
                    <div className="font-display tnum leading-none mt-2" style={{ fontSize: "clamp(2.5rem, 9vw, 3.5rem)" }}>
                      {isNewUser ? "₦0" : "₦148,000"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm font-body" style={{ opacity: 0.9 }}>
                      <TrendingUp className="w-4 h-4" /> {isNewUser ? "Ready to earn your first payout" : "+18% vs last month"}
                    </div>
                    <div className="flex gap-2.5 mt-5">
                      <button onClick={() => setActiveTab("earnings")} className="h-10 px-4 rounded-full text-sm font-semibold font-body transition-transform active:scale-95" style={{ background: "var(--color-bg-surface)", color: "var(--color-accent)" }}>
                        {isNewUser ? "Setup Payouts" : "Withdraw"}
                      </button>
                      <button onClick={() => setActiveTab("earnings")} className="h-10 px-4 rounded-full text-sm font-semibold font-body transition-transform active:scale-95" style={{ background: "rgba(255,255,255,0.18)", color: "var(--color-accent-on)" }}>
                        View earnings
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Quick-action ghost-circle row */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { label: "Storefront", icon: User, action: () => setActiveTab("storefront") },
                    { label: "Availability", icon: Calendar, action: () => setActiveTab("calendar") },
                    { label: "Rates", icon: DollarSign, action: () => setActiveTab("rates") },
                    { label: "Earnings", icon: BarChart2, action: () => setActiveTab("earnings") },
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
                  {effectiveStats.slice(1).map((stat, i) => (
                    <div key={i} className="text-center px-2" style={{ borderLeft: i > 0 ? "1px solid var(--color-hairline)" : undefined }}>
                      <div className="font-display text-2xl tnum" style={{ color: "var(--color-text-primary)" }}>{stat.value}</div>
                      <div className="text-[11px] font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>{stat.label}</div>
                    </div>
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

            {/* ── Storefront Tab ── */}
            {activeTab === "storefront" && (
              <motion.div key="storefront" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex justify-end mb-4 lg:hidden">
                  <Button variant="secondary" className="h-9 px-3 text-sm gap-2" onClick={() => setShowShare(true)}>
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
                <div
                  className="rounded-[var(--radius-lg)] overflow-hidden"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                >
                  {/* Profile header */}
                  <div
                    className="h-24 w-full"
                    style={{ background: "linear-gradient(135deg, var(--color-accent-glow), var(--color-bg-elevated))" }}
                  />
                  <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10 mb-4">
                      <div
                        className="w-20 h-20 rounded-full border-4 overflow-hidden shrink-0"
                        style={{ borderColor: "var(--color-bg-surface)", background: "var(--color-bg-elevated)" }}
                      >
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="pb-1">
                        {isNewUser ? (
                          <Badge tone="accent" className="border border-[var(--color-accent)]">
                            <Shield className="w-3 h-3" /> Draft Profile (Unverified)
                          </Badge>
                        ) : (
                          <Badge tone="success" className="border border-[var(--color-success)]">
                            <Shield className="w-3 h-3" /> Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>
                      {isNewUser ? (currentUser?.name || "New Creative Talent") : talentName}
                    </h2>
                    <p className="text-sm font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>
                      {isNewUser ? "Voice-Over & Screen Talent · Lagos, Nigeria" : "Actor & Voice Artist · Lagos, Nigeria"}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} />
                      <span className="text-sm font-body" style={{ color: "var(--color-text-primary)" }}>Available for bookings</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {VIBE_TAGS.map(tag => (
                        <Badge key={tag} tone="neutral" size="lg">{tag}</Badge>
                      ))}
                    </div>

                    {isNewUser ? (
                      <div className="p-4 rounded-[var(--radius-lg)] mb-6 border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">No Bio Added Yet</p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Write a compelling summary of your performance background and specialized talent niches.</p>
                        </div>
                        <Button variant="secondary" className="h-8 text-xs shrink-0" onClick={() => navigate("/settings")}>
                          Add Bio
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm font-body leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
                        Specializing in intense dramatic monologues and authoritative voice-overs. 10+ years of stage experience across Nollywood productions, corporate events, and studio sessions.
                      </p>
                    )}

                    {/* Featured Reel */}
                    <h3 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>Featured Reel</h3>
                    {isNewUser ? (
                      <div className="p-6 rounded-[var(--radius-lg)] mb-6 border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-3 text-[var(--color-accent)]">
                          <Play className="w-6 h-6 ml-0.5" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No Featured Monologue Video Uploaded</p>
                        <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mb-4">Upload a high-quality video or audio clip showcasing your dramatic monologues or voice reels.</p>
                        <Button variant="secondary" className="h-9 px-4 text-xs gap-2" onClick={() => navigate("/verification")}>
                          <Play className="w-3.5 h-3.5" /> Upload Performance Reel
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="relative aspect-video rounded-[var(--radius-md)] overflow-hidden mb-6 group cursor-pointer"
                        style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                      >
                        <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&fit=crop" alt="Reel" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center pl-1 shadow-lg"
                            style={{ background: "var(--color-accent)", boxShadow: "var(--shadow-modal)" }}
                          >
                            <Play className="w-6 h-6" style={{ color: "var(--color-text-inverse)" }} />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded font-mono text-xs text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
                          02:45
                        </div>
                      </div>
                    )}

                    {/* Rate Cards */}
                    <h3 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>Booking Services</h3>
                    {effectiveServices.length === 0 ? (
                      <div className="p-6 rounded-[var(--radius-lg)] mb-6 border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-3 text-[var(--color-accent)]">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No Rate Cards Published</p>
                        <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mb-4">Create fixed-price service rate cards so clients can instantly book your services.</p>
                        <Button className="h-9 px-4 text-xs gap-2" onClick={() => setActiveTab("rates")}>
                          <Plus className="w-3.5 h-3.5" /> Create Rate Card
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {effectiveServices.map(service => (
                          <div
                            key={service.id}
                            className="p-4 rounded-[var(--radius-md)]"
                            style={{
                              background: "var(--color-bg-elevated)",
                              border: "1px solid var(--color-border-default)",
                              borderLeft: "3px solid var(--color-accent)",
                            }}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{service.title}</span>
                              <span className="font-display text-lg" style={{ color: "var(--color-accent)" }}>{service.price}</span>
                            </div>
                            <div className="text-xs font-body mb-3" style={{ color: "var(--color-text-tertiary)" }}>Delivery: {service.delivery}</div>
                            <Button className="w-full h-10 text-sm">Book Now</Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Media Kit — features.md Phase 12A.1: PWA-07 storefront section
                        (download + share), management lives at /media-kit (PWA-20). */}
                    <h3 className="text-sm font-semibold font-body mb-3 mt-6" style={{ color: "var(--color-text-primary)" }}>Media Kit</h3>
                    <div
                      className="p-4 rounded-[var(--radius-md)] flex items-center justify-between gap-3"
                      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                    >
                      <div className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                        A one-page PDF profile — auto-generated, or upload your own.
                      </div>
                      <Button
                        variant="secondary"
                        className="h-9 px-3 text-sm gap-2 shrink-0"
                        onClick={() => navigate("/media-kit")}
                      >
                        <Share2 className="w-4 h-4" /> Manage
                      </Button>
                    </div>

                    {/* Verification video — features.md Phase 12A.2. X3: entirely
                        separate from the Verified badge above (identity KYC). */}
                    <h3 className="text-sm font-semibold font-body mb-3 mt-6" style={{ color: "var(--color-text-primary)" }}>Verification Video</h3>
                    <div
                      className="p-4 rounded-[var(--radius-md)] flex items-center justify-between gap-3"
                      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                    >
                      <div className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                        A short waist-up clip clients see on your profile.
                      </div>
                      <Button
                        variant="secondary"
                        className="h-9 px-3 text-sm gap-2 shrink-0"
                        onClick={() => navigate("/verification")}
                      >
                        <Play className="w-4 h-4" /> Manage
                      </Button>
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
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>

                {effectiveServices.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Rate Cards Created Yet</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      Create fixed-price service rate cards so clients can instantly book your voice-over, acting, or compere services.
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
                                setNewServicePrice(service.price.replace("₦", "").replace(/,/g, ""));
                                setNewServiceDelivery(service.delivery);
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

                  <button
                    onClick={() => {
                      setEditServiceId(null);
                      setNewServiceTitle("");
                      setNewServicePrice("45000");
                      setNewServiceDelivery("24 Hours");
                      setShowAddService(true);
                    }}
                    className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium font-body transition-all hover:border-[var(--color-gold-primary)]"
                    style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                  >
                    <Plus className="w-4 h-4" /> Add another service
                  </button>
                </div>
                )}

                {/* Add/Edit Service Modal */}
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
                            {editServiceId ? "Edit Service" : "New Service"}
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
                              Base Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm" style={{ color: "var(--color-text-secondary)" }}>₦</span>
                              <Input
                                className="pl-8"
                                placeholder="45,000"
                                value={newServicePrice}
                                onChange={e => setNewServicePrice(e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Delivery Timeline
                            </label>
                            <select
                              className="w-full h-12 rounded-[var(--radius-md)] px-4 text-sm font-body appearance-none border"
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
                              {editServiceId ? "Save Changes" : "Add Service"}
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
              <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {isNewUser && (
                  <div className="mb-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] font-body">Default Working Hours Active (9:00 AM – 5:00 PM)</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-body">Your availability automatically defaults to standard bookable slots. Select any date below to add custom time slots or mark specific days unavailable.</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-display text-2xl lg:hidden" style={{ color: "var(--color-text-primary)" }}>Availability</h2>
                    <p className="hidden lg:block text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                      Click a day to see and edit everything scheduled — an unconfigured day is open across normal hours by default.
                    </p>
                  </div>
                  {/* 3-View Switcher: Month | Week | Day */}
                  <div className="flex p-1 rounded-xl self-start sm:self-auto" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                    {(["month", "week", "day"] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setCalendarView(view)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold font-body capitalize transition-all"
                        style={{
                          background: calendarView === view ? "var(--color-accent)" : "transparent",
                          color: calendarView === view ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                        }}
                      >
                        {view} View
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    aria-label="Jump to today"
                    onClick={() => setSelectedDate(todayISO())}
                    className="w-9 h-9 shrink-0 rounded-[var(--radius-full)] flex items-center justify-center"
                    style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                  </button>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
                    {Array.from({ length: 14 }, (_, i) => addDaysISO(todayISO(), i)).map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className="shrink-0 px-3 py-2 rounded-[var(--radius-md)] text-xs font-body whitespace-nowrap"
                        style={{
                          background: date === selectedDate ? "var(--color-accent)" : "var(--color-bg-elevated)",
                          color: date === selectedDate ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                          border: `1px solid ${date === selectedDate ? "var(--color-accent)" : "var(--color-border-default)"}`,
                        }}
                      >
                        {formatDayLabel(date)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="h-9 px-2 rounded-[var(--radius-md)] text-xs font-body shrink-0"
                    style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
                  />
                </div>

                {/* Month View Grid */}
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
                    <div className="p-4 rounded-[var(--radius-lg)] mb-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>{monthName}</h3>
                        <span className="text-xs font-body text-tertiary" style={{ color: "var(--color-text-tertiary)" }}>Select a date to view scheduled slots</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="py-1">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {daysArray.map((dateStr, idx) => {
                          if (!dateStr) return <div key={`empty-${idx}`} className="h-10" />;
                          const isSelected = dateStr === selectedDate;
                          const isToday = dateStr === todayISO();
                          const dayNum = parseInt(dateStr.slice(8), 10);
                          return (
                            <button
                              key={dateStr}
                              onClick={() => setSelectedDate(dateStr)}
                              className="h-10 rounded-[var(--radius-md)] flex flex-col items-center justify-center relative transition-all active:scale-95 text-xs font-body font-medium"
                              style={{
                                background: isSelected ? "var(--color-accent)" : isToday ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                                color: isSelected ? "var(--color-accent-on)" : isToday ? "var(--color-accent)" : "var(--color-text-primary)",
                                border: `1px solid ${isSelected ? "var(--color-accent)" : isToday ? "var(--color-accent)" : "var(--color-hairline)"}`,
                              }}
                            >
                              <span>{dayNum}</span>
                              {isToday && !isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: "var(--color-accent)" }} />
                              )}
                            </button>
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
                    {/* Open slots — server-authoritative (getOpenSlots), what a client would actually see. */}
                    <div className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
                      <div className="text-sm font-semibold font-body mb-2" style={{ color: "var(--color-text-primary)" }}>
                        Open for booking on {formatDayLabel(selectedDate)}
                      </div>
                      {dayDetail.openSlots.length === 0 ? (
                        <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>No open time — fully unavailable or booked.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {dayDetail.openSlots.map((s, i) => (
                            <Badge key={i} tone="success" size="md">{s.start}–{s.end}</Badge>
                          ))}
                        </div>
                      )}
                      {!dayDetail.block && (
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

                    {/* Events for this day — informational, never subtracted from openSlots. */}
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
                          {dayDetail.events.map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                              <div>
                                <div className="text-xs font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{event.title}</div>
                                <div className="text-xs font-mono tnum" style={{ color: "var(--color-text-tertiary)" }}>{event.start}–{event.end} · {event.kind}</div>
                              </div>
                              <button onClick={() => handleDeleteEvent(event.id)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "var(--color-text-tertiary)" }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
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
                    <div className="relative mb-3">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                      <Input placeholder="Search projects by title, client, or role…" value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} className="pl-11" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold font-body tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Role / Category</label>
                        <select
                          value={projectRoleFilter}
                          onChange={(e) => setProjectRoleFilter(e.target.value)}
                          className="w-full h-9 px-3 rounded-[var(--radius-md)] text-xs font-body border"
                          style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                        >
                          <option value="all">All Roles & Categories</option>
                          <option value="voice-over">Voice-Over</option>
                          <option value="actor">Actor</option>
                          <option value="model">Model</option>
                          <option value="presenter">Presenter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold font-body tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Budget Range</label>
                        <select
                          value={projectBudgetFilter}
                          onChange={(e) => setProjectBudgetFilter(e.target.value)}
                          className="w-full h-9 px-3 rounded-[var(--radius-md)] text-xs font-body border"
                          style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                        >
                          <option value="all">All Budgets</option>
                          <option value="under100">Under ₦100,000</option>
                          <option value="100to300">₦100,000 – ₦300,000</option>
                          <option value="over300">Over ₦300,000</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold font-body tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Status</label>
                        <select
                          value={projectStatusFilter}
                          onChange={(e) => setProjectStatusFilter(e.target.value)}
                          className="w-full h-9 px-3 rounded-[var(--radius-md)] text-xs font-body border"
                          style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                        >
                          <option value="all">All Project Statuses</option>
                          <option value="open">Open for Application</option>
                          <option value="applied">Already Applied</option>
                        </select>
                      </div>
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
                            onClick={() => { setSelectedProject(project); setPitchText(project.myApplication?.pitch ?? ""); setApplyError(null); }}
                            className="w-full text-left p-4 rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity"
                            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <div className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{project.projectName}</div>
                                <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{project.clientName} · {project.projectType}</div>
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
                        <div key={application.id} className="p-4 rounded-[var(--radius-lg)]" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}>
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
                            <p className="text-xs font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>"{application.pitch}"</p>
                          )}
                          {(application.status === "APPLIED" || application.status === "SHORTLISTED") && (
                            <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => handleWithdrawApplication(application.id)}>
                              Withdraw
                            </Button>
                          )}
                        </div>
                      ))
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
                  <div className="text-center py-16 px-6 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Active Orders</h3>
                    <p className="text-sm font-body text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                      You don't have any bookings in progress right now. Share your storefront link or pitch to open projects to land client orders.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => { setActiveTab("projects"); setProjectsSubTab("browse"); }} className="gap-2">
                        <Briefcase className="w-4 h-4" /> Apply to Projects
                      </Button>
                      <Button variant="secondary" onClick={() => setShowShare(true)} className="gap-2">
                        <Share2 className="w-4 h-4" /> Share Storefront Link
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                    <Input
                      placeholder="Search activity..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="pl-11"
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
                    <div className="font-display text-4xl tnum" style={{ color: "var(--color-text-primary)" }}>₦{appStateSync.getBalance().available.toLocaleString()}</div>
                  </div>
                  <Button className="h-11 px-6 whitespace-nowrap" onClick={() => setShowWithdraw(true)}>Withdraw Funds</Button>
                </div>
                
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "This Month", value: `₦${appStateSync.getBalance().available.toLocaleString()}`, sub: "Dec 2024" },
                    { label: "Last Month", value: "₦125,000", sub: "Nov 2024" },
                    { label: "All Time", value: `₦${(1240000 + appStateSync.getBalance().withdrawnTotal).toLocaleString()}`, sub: "Since joining" },
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
                      { month: "Jul", val: 0.55 },
                      { month: "Aug", val: 0.7 },
                      { month: "Sep", val: 0.45 },
                      { month: "Oct", val: 0.8 },
                      { month: "Nov", val: 0.65 },
                      { month: "Dec", val: Math.min(1, Math.max(0.6, payouts.length / 5)) },
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
                    <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Talent Performance &amp; Analytics</h2>
                    <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                      Track storefront impressions, booking conversion, and earnings velocity for {talentProfile.name}.
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
                      Storefront views, conversion metrics, and monthly booking trends will automatically track as clients view your profile and send booking requests.
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
                    <div className="text-xs font-body font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Storefront Views</div>
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
          {/* Withdraw Modal */}
          <AnimatePresence>
            {showWithdraw && (
              <Modal onClose={() => setShowWithdraw(false)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl">Withdraw Funds</h3>
                    <button onClick={() => setShowWithdraw(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Amount (₦)</label>
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
                  <div className="mb-6">
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Destination Bank Account</label>
                    <div className="p-3 rounded-[var(--radius-md)] flex items-center justify-between border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                      <div>
                        <div className="text-sm font-semibold">{appStateSync.getBankDetails().bankName} ···· {appStateSync.getBankDetails().accountNumber.slice(-4)}</div>
                        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{appStateSync.getBankDetails().accountName}</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-success)" }} />
                    </div>
                  </div>
                  <Button className="w-full h-11" onClick={async () => {
                    const amt = Number(withdrawAmount.replace(/[^0-9]/g, ""));
                    const available = appStateSync.getBalance().available;
                    if (!amt || amt <= 0) return;
                    if (amt > available) {
                      alert("Withdrawal amount exceeds available balance.");
                      return;
                    }
                    const ok = await apiClient.withdrawFunds(amt);
                    if (ok) {
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
                      alert(`Successfully transferred ₦${amt.toLocaleString()} to ${bank.bankName}!`);
                      setShowWithdraw(false);
                      setWithdrawAmount("");
                      apiClient.getTalentStats().then(setStats);
                    } else {
                      alert("Withdrawal amount exceeds available balance.");
                    }
                  }}>
                    Confirm Withdrawal
                  </Button>
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

          {/* Payout Receipt Modal */}
          <AnimatePresence>
            {selectedPayout && (
              <Modal onClose={() => setSelectedPayout(null)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-md rounded-[var(--radius-xl)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-elevated)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--color-border-default)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-success-bg)" }}>
                        <CheckCircle2 className="w-5 h-5" style={{ color: "var(--color-success)" }} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>Payout Receipt</h3>
                        <div className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>{selectedPayout.ref}</div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedPayout(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center py-4 mb-4 rounded-xl" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                    <div className="text-xs font-body uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Transferred Amount</div>
                    <div className="font-display text-3xl tnum font-semibold" style={{ color: "var(--color-accent)" }}>{selectedPayout.amount}</div>
                    <Badge tone={selectedPayout.status === "Paid" ? "success" : "accent"} size="sm" className="mt-2">
                      {selectedPayout.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6 text-xs font-body">
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                      <span style={{ color: "var(--color-text-tertiary)" }}>Source / Client</span>
                      <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{selectedPayout.from}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                      <span style={{ color: "var(--color-text-tertiary)" }}>Service Description</span>
                      <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>{selectedPayout.service}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                      <span style={{ color: "var(--color-text-tertiary)" }}>Destination Account</span>
                      <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>{selectedPayout.bankAccount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                      <span style={{ color: "var(--color-text-tertiary)" }}>Date & Time</span>
                      <span style={{ color: "var(--color-text-secondary)" }}>{selectedPayout.date} {selectedPayout.time}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span style={{ color: "var(--color-text-tertiary)" }}>Platform Transfer Fee</span>
                      <span className="font-mono" style={{ color: "var(--color-success)" }}>₦0 (Free)</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1 h-10 text-xs" onClick={() => window.print()}>
                      Save / Print Receipt
                    </Button>
                    <Button className="flex-1 h-10 text-xs" onClick={() => setSelectedPayout(null)}>
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
                      Open Public Storefront <ExternalLink className="w-3.5 h-3.5" />
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
                      className="w-full h-11 px-3 rounded-[var(--radius-md)] text-sm font-body"
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

          {/* Project Detail + Apply Modal (features.md Phase 14, PWA-15) */}
          <AnimatePresence>
            {selectedProject && (
              <Modal onClose={() => setSelectedProject(null)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-lg rounded-[var(--radius-xl)] p-6 max-h-[85vh] overflow-y-auto"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-elevated)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold font-body" style={{ color: "var(--color-accent)" }}>{selectedProject.clientName}</span>
                        <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                      </div>
                      <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>{selectedProject.projectName}</h3>
                      <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>Category: {selectedProject.projectType} · Location: Lagos, NG (Remote)</p>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Overview & Description */}
                  <div className="mb-4 p-4 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Project Overview</div>
                    <p className="text-xs font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      Client is seeking professional talent for a high-profile production campaign. Selected talent will work directly with the creative direction team for studio recording and revisions.
                    </p>
                  </div>

                  {/* Requirements & Deliverables */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>Deliverables & Niche Requirements</div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {selectedProject.nicheReq.map((n) => <Badge key={n} tone="neutral" size="sm">{n.replace(/_/g, " ")}</Badge>)}
                    </div>
                    <ul className="text-xs font-body space-y-1 pl-4 list-disc" style={{ color: "var(--color-text-secondary)" }}>
                      <li>Studio quality audio/video recording files</li>
                      <li>2 round of revisions included within project timeframe</li>
                      <li>Commercial distribution rights for social & digital media</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)" }}>
                      <div className="text-[10px] uppercase tracking-wider font-body mb-1" style={{ color: "var(--color-text-tertiary)" }}>Budget Rate</div>
                      <div className="font-display text-lg tnum" style={{ color: "var(--color-accent)" }}>{selectedProject.budget}</div>
                    </div>
                    <div className="p-3 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)" }}>
                      <div className="text-[10px] uppercase tracking-wider font-body mb-1" style={{ color: "var(--color-text-tertiary)" }}>Applicant Cap</div>
                      <div className="font-display text-lg tnum" style={{ color: "var(--color-text-primary)" }}>
                        {selectedProject.applicantCount}{selectedProject.applicantCap ? `/${selectedProject.applicantCap}` : ""}
                      </div>
                    </div>
                  </div>

                  {applyError && (
                    <div className="p-3 rounded-xl mb-4 text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>{applyError}</div>
                  )}

                  {selectedProject.myApplication ? (
                    <div className="p-4 rounded-[var(--radius-md)] text-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <Badge tone={selectedProject.myApplication.status === "SELECTED" ? "success" : "accent"} size="md">
                        {APPLICATION_STATUS_LABEL[selectedProject.myApplication.status]}
                      </Badge>
                      <p className="text-xs font-body mt-2" style={{ color: "var(--color-text-tertiary)" }}>You've already applied to this project.</p>
                    </div>
                  ) : !selectedProject.applicationsOpen ? (
                    <div className="p-4 rounded-[var(--radius-md)] text-center text-sm font-body" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                      Applications closed — this project reached its applicant cap.
                    </div>
                  ) : (
                    <>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Pitch (optional)</label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl text-sm font-body border resize-none mb-4"
                        rows={3}
                        placeholder="Tell the client why you're a great fit…"
                        value={pitchText}
                        onChange={(e) => setPitchText(e.target.value)}
                        style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                      />
                      <Button className="w-full h-11" disabled={applying} onClick={handleApply}>
                        {applying ? "Applying…" : "Apply"} <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}
                </motion.div>
              </Modal>
            )}
          </AnimatePresence>

      </main>

      <BottomNav navItems={TALENT_BOTTOM_NAV_ITEMS} activeTab={activeTab} onTab={setActiveTab} indicatorId="tab-indicator" />
    </div>
  );
}
