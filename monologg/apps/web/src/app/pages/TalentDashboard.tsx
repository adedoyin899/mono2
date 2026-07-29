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
import { apiClient } from "../../lib/api-client";
import type { ActivityItem, AvailabilityWeek, Order, ServiceRateCard, StatMetric } from "@monologg/types";
import {
  Home, Calendar, Bell, User, Share2, Shield, Play, TrendingUp,
  Plus, Edit2, Trash2, ChevronRight,
  MessageSquare, DollarSign, CheckCircle2, X,
  BarChart2, Award
} from "lucide-react";

type Tab = "home" | "storefront" | "rates" | "calendar" | "orders" | "earnings";

// UI configuration, not domain data — stays local (see api-client.ts).
const CALENDAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["9am–12pm", "12pm–3pm", "3pm–6pm", "6pm–9pm"];
const VIBE_TAGS = ["Dramatic", "Deep Texture", "British Accent", "Authoritative", "Warm"];

const TALENT_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "storefront", label: "My Storefront", icon: User },
  { id: "rates", label: "Rate Cards", icon: DollarSign },
  { id: "calendar", label: "Availability", icon: Calendar },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "earnings", label: "Earnings", icon: BarChart2 },
];

const TALENT_BOTTOM_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "rates", label: "Rates", icon: DollarSign },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "storefront", label: "Profile", icon: User },
];

export function TalentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [calendarEditing, setCalendarEditing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{day: string, slot: number} | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [calendarData, setCalendarData] = useState<AvailabilityWeek>({});
  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [stats, setStats] = useState<StatMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [services, setServices] = useState<ServiceRateCard[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    apiClient.getTalentStats().then(setStats);
    apiClient.listTalentActivity().then(setActivity);
    apiClient.listServices().then(setServices);
    apiClient.listTalentOrders().then(setOrders);
    apiClient.getAvailability().then(setCalendarData);
  }, []);

  const screenTitle =
    activeTab === "home" ? "Dashboard"
    : activeTab === "storefront" ? "My Storefront"
    : activeTab === "rates" ? "Rate Cards"
    : activeTab === "calendar" ? "Availability"
    : activeTab === "orders" ? "Active Orders"
    : "Earnings";

  return (
    <div className="role-talent min-h-screen" style={{ background: "var(--color-bg-canvas)" }}>
      <Sidebar
        portalLabel="Talent Portal"
        navItems={TALENT_NAV_ITEMS}
        activeTab={activeTab}
        onTab={setActiveTab}
        onNavigate={navigate}
        identity={{
          initials: "ET",
          name: "Elias Thorne",
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
          <div className="text-[11px] font-body uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Good morning, Elias</div>
          <div className="font-display text-lg leading-tight truncate" style={{ color: "var(--color-text-primary)" }}>{screenTitle}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button aria-label="View notifications" onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-full flex items-center justify-center relative hover:opacity-80 transition-opacity" style={{ background: "var(--color-bg-elevated)" }}>
            <Bell className="w-[18px] h-[18px]" style={{ color: "var(--color-text-secondary)" }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2" style={{ background: "var(--color-accent)", "--tw-ring-color": "var(--color-bg-surface)" } as React.CSSProperties}></span>
          </button>
          <button
            aria-label="Go to settings"
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm font-body hover:opacity-80 transition-opacity"
            style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}
            onClick={() => navigate("/settings")}
          >
            ET
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-60 pb-28 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">

          {/* Desktop page header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {activeTab === "home" && "Good morning, Elias 👋"}
                {activeTab === "storefront" && "My Storefront"}
                {activeTab === "rates" && "Rate Cards"}
                {activeTab === "calendar" && "Availability"}
                {activeTab === "orders" && "Active Orders"}
                {activeTab === "earnings" && "Earnings & Analytics"}
              </h1>
              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {activeTab === "home" && "Here's what's happening with your career today."}
                {activeTab === "storefront" && "Your public booking page — share this with clients."}
                {activeTab === "rates" && "Define your services and pricing."}
                {activeTab === "calendar" && "Set your availability for bookings."}
                {activeTab === "orders" && "Manage your active collaborations."}
                {activeTab === "earnings" && "Track your income and performance."}
              </p>
            </div>
            <div className="flex items-center gap-3">
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
              <button aria-label="View notifications" onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity relative" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                <Bell className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-accent)" }}></span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Home Tab ── */}
            {activeTab === "home" && (
              <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

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
                    <div className="font-display tnum leading-none mt-2" style={{ fontSize: "clamp(2.5rem, 9vw, 3.5rem)" }}>₦148,000</div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm font-body" style={{ opacity: 0.9 }}>
                      <TrendingUp className="w-4 h-4" /> +18% vs last month
                    </div>
                    <div className="flex gap-2.5 mt-5">
                      <button onClick={() => setActiveTab("earnings")} className="h-10 px-4 rounded-full text-sm font-semibold font-body transition-transform active:scale-95" style={{ background: "var(--color-bg-surface)", color: "var(--color-accent)" }}>Withdraw</button>
                      <button onClick={() => setActiveTab("earnings")} className="h-10 px-4 rounded-full text-sm font-semibold font-body transition-transform active:scale-95" style={{ background: "rgba(255,255,255,0.18)", color: "var(--color-accent-on)" }}>View earnings</button>
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
                  {stats.slice(1).map((stat, i) => (
                    <div key={i} className="text-center px-2" style={{ borderLeft: i > 0 ? "1px solid var(--color-hairline)" : undefined }}>
                      <div className="font-display text-2xl tnum" style={{ color: "var(--color-text-primary)" }}>{stat.value}</div>
                      <div className="text-[11px] font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>Recent Activity</span>
                  <button className="text-xs font-body" style={{ color: "var(--color-accent)" }} onClick={() => setActiveTab("orders")}>
                    View all →
                  </button>
                </div>
                <div className="space-y-2.5">
                  {activity.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)]"
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
                        <Badge tone="success" className="border border-[var(--color-success)]">
                          <Shield className="w-3 h-3" /> Thespian Verified
                        </Badge>
                      </div>
                    </div>

                    <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Elias Thorne</h2>
                    <p className="text-sm font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>Actor & Voice Artist · Lagos, Nigeria</p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} />
                      <span className="text-sm font-body" style={{ color: "var(--color-text-primary)" }}>Available for bookings</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {VIBE_TAGS.map(tag => (
                        <Badge key={tag} tone="neutral" size="lg">{tag}</Badge>
                      ))}
                    </div>

                    <p className="text-sm font-body leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
                      Specializing in intense dramatic monologues and authoritative voice-overs. 10+ years of stage experience across Nollywood productions, corporate events, and studio sessions.
                    </p>

                    {/* Featured Reel */}
                    <h3 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>Featured Reel</h3>
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

                    {/* Rate Cards */}
                    <h3 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>Booking Services</h3>
                    <div className="space-y-3">
                      {services.map(service => (
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
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Rate Cards Tab ── */}
            {activeTab === "rates" && (
              <motion.div key="rates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Rate Cards</h2>
                  <Button className="h-9 px-3 text-sm gap-2" onClick={() => setShowAddService(true)}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>

                <div className="space-y-4">
                  {services.map(service => (
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
                              onClick={() => setEditServiceId(service.id)}
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button variant="destructive" className="h-8 px-3 text-xs gap-1.5">
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowAddService(true)}
                    className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium font-body transition-all hover:border-[var(--color-gold-primary)]"
                    style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-secondary)" }}
                  >
                    <Plus className="w-4 h-4" /> Add another service
                  </button>
                </div>

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
                            className="w-8 h-8 rounded-full flex items-center justify-center"
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
                              defaultValue={editServiceId ? services.find(s => s.id === editServiceId)?.title : ""}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Base Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm" style={{ color: "var(--color-text-secondary)" }}>₦</span>
                              <Input className="pl-8" placeholder="45,000" defaultValue={editServiceId ? services.find(s => s.id === editServiceId)?.price.replace("₦", "").replace(",", "") : ""} />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 font-body uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                              Delivery Timeline
                            </label>
                            <select
                              className="w-full h-12 rounded-[var(--radius-md)] px-4 text-sm font-body appearance-none border"
                              style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
                            >
                              <option>Same Day</option>
                              <option>24 Hours</option>
                              <option>2–3 Days</option>
                              <option>1 Week</option>
                              <option>Custom</option>
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
                            <Button className="flex-1 h-11 text-sm" onClick={() => { setShowAddService(false); setEditServiceId(null); }}>
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

            {/* ── Availability Calendar Tab ── */}
            {activeTab === "calendar" && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Availability</h2>
                  <Button
                    variant={calendarEditing ? "primary" : "secondary"}
                    className="h-9 px-3 text-sm"
                    onClick={() => setCalendarEditing(!calendarEditing)}
                  >
                    {calendarEditing ? <><CheckCircle2 className="w-4 h-4 mr-1.5" />Save</> : <><Edit2 className="w-4 h-4 mr-1.5" />Edit</>}
                  </Button>
                </div>

                <div className="hidden lg:flex justify-end mb-4">
                  <Button
                    variant={calendarEditing ? "primary" : "secondary"}
                    className="h-10 px-4 text-sm"
                    onClick={() => setCalendarEditing(!calendarEditing)}
                  >
                    {calendarEditing ? <><CheckCircle2 className="w-4 h-4 mr-2" />Save Schedule</> : <><Edit2 className="w-4 h-4 mr-2" />Edit Schedule</>}
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  {[
                    { label: "Available", color: "var(--color-success)" },
                    { label: "Booked", color: "var(--color-accent)" },
                    { label: "Off", color: "var(--color-border-default)" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                      <span className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-[var(--radius-lg)] overflow-hidden"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                >
                  {/* Days header */}
                  <div className="grid grid-cols-8 divide-x" style={{ borderBottom: "1px solid var(--color-border-default)", borderColor: "var(--color-border-default)" }}>
                    <div className="p-3" />
                    {CALENDAR_DAYS.map(day => (
                      <div key={day} className="p-3 text-center text-xs font-semibold font-body" style={{ color: "var(--color-text-secondary)" }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {TIME_SLOTS.map((slot, si) => (
                    <div key={slot} className="grid grid-cols-8 divide-x" style={{ borderBottom: si < TIME_SLOTS.length - 1 ? "1px solid var(--color-border-default)" : undefined, borderColor: "var(--color-border-default)" }}>
                      <div className="p-3 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{slot}</div>
                      {CALENDAR_DAYS.map(day => {
                        const status = calendarData[day]?.[si] || "off";
                        const toggleStatus = () => {
                          if(!calendarEditing) return;
                          const next = status === "available" ? "booked" : status === "booked" ? "off" : "available";
                          setCalendarData(prev => ({...prev, [day]: prev[day].map((s, idx) => idx === si ? next : s)}));
                        };
                        return (
                          <div
                            key={day}
                            className={`p-2 flex items-center justify-center cursor-pointer hover:opacity-80`}
                            onClick={() => {
                              if(calendarEditing) {
                                toggleStatus();
                              } else {
                                setSelectedDay({day, slot: si});
                              }
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              if(calendarEditing) return;
                              setCalendarEditing(true);
                              toggleStatus();
                            }}
                          >
                            <div
                              className="w-full h-8 rounded-[var(--radius-sm)]"
                              style={{
                                background: status === "available" ? "var(--color-success-bg)" : status === "booked" ? "var(--color-accent-glow)" : "var(--color-bg-elevated)",
                                border: `1px solid ${status === "available" ? "var(--color-success)" : status === "booked" ? "var(--color-accent)" : "var(--color-border-default)"}`,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

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

            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Active Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-tertiary)" }} />
                    <h3 className="font-body text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No active orders</h3>
                    <p className="text-sm font-body mb-6" style={{ color: "var(--color-text-secondary)" }}>Complete your storefront to start receiving bookings.</p>
                    <Button onClick={() => setActiveTab("storefront")}>Set Up Storefront</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
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

            {/* ── Earnings Tab ── */}
            {activeTab === "earnings" && (
              <motion.div key="earnings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-6 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Earnings</h2>

                {/* Available Balance */}
                <div className="mb-6 p-6 rounded-[var(--radius-lg)] flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}>
                  <div>
                    <div className="text-xs font-body uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Available for Withdrawal</div>
                    <div className="font-display text-4xl tnum" style={{ color: "var(--color-text-primary)" }}>₦148,000</div>
                  </div>
                  <Button className="h-11 px-6 whitespace-nowrap" onClick={() => setShowWithdraw(true)}>Withdraw Funds</Button>
                </div>
                
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "This Month", value: "₦148,000", sub: "Dec 2024" },
                    { label: "Last Month", value: "₦125,000", sub: "Nov 2024" },
                    { label: "All Time", value: "₦1,240,000", sub: "Since joining" },
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
                      { month: "Dec", val: 1 },
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
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                    <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Recent Payouts</span>
                  </div>
                  {[
                    { from: "FilmCraft Lagos", amount: "₦120,000", date: "Dec 14", status: "Paid" },
                    { from: "EventPro Abuja", amount: "₦80,000", date: "Dec 10", status: "Paid" },
                    { from: "Brand Agency NG", amount: "₦45,000", date: "Dec 6", status: "Pending" },
                  ].map((payout, i, arr) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-4"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-default)" : undefined }}
                    >
                      <div>
                        <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{payout.from}</div>
                        <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{payout.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{payout.amount}</div>
                        <div
                          className="text-xs font-body"
                          style={{ color: payout.status === "Paid" ? "var(--color-success)" : "var(--color-gold)" }}
                        >
                          {payout.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                          <Input type="number" placeholder="Enter amount..." value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                          <div className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>Available: ₦148,000</div>
                        </div>
                        <div className="mb-6">
                          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>Destination Account</label>
                          <div className="p-3 rounded-[var(--radius-md)] flex items-center justify-between border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                            <div>
                              <div className="text-sm font-semibold">GTBank ···· 4512</div>
                              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Elias Thorne</div>
                            </div>
                            <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-success)" }} />
                          </div>
                        </div>
                        <Button className="w-full h-11" onClick={() => {
                          alert("Withdrawal initiated!");
                          setShowWithdraw(false);
                          setWithdrawAmount("");
                        }}>
                          Confirm Withdrawal
                        </Button>
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
                    <div className="text-sm font-mono truncate flex-1 pl-2">monologg.app/elias-thorne</div>
                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => {
                      console.log("https://monologg.app/elias-thorne");
                      alert("Copied to clipboard!");
                    }}>Copy</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" className="h-10 text-xs">WhatsApp</Button>
                    <Button variant="secondary" className="h-10 text-xs">Twitter</Button>
                    <Button variant="secondary" className="h-10 text-xs">LinkedIn</Button>
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
                    <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-accent)" }}>New Booking Request</div>
                      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Brand Agency NG requested a Commercial Voice-Over.</p>
                      <div className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>2h ago</div>
                    </div>
                    <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-success)" }}>Payment Received</div>
                      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>₦120,000 released from escrow for FilmCraft Lagos.</p>
                      <div className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>1d ago</div>
                    </div>
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

          {/* Day Detail Modal */}
          <AnimatePresence>
            {selectedDay && (
              <Modal onClose={() => setSelectedDay(null)}>
                <motion.div
                  initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                  className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                  style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl">{selectedDay.day} - {TIME_SLOTS[selectedDay.slot]}</h3>
                    <button onClick={() => setSelectedDay(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {calendarData[selectedDay.day]?.[selectedDay.slot] === "booked" ? (
                    <div className="p-4 rounded-[var(--radius-md)] border" style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
                      <div className="text-sm font-semibold mb-1">Commercial Voice-Over</div>
                      <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Brand Agency NG</div>
                      <Button className="w-full mt-4 h-9 text-xs" onClick={() => {
                        setSelectedDay(null);
                        setActiveTab("orders");
                      }}>View Order</Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {calendarData[selectedDay.day]?.[selectedDay.slot] === "available" ? "You are available during this time." : "You have marked this time as off."}
                    </div>
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
