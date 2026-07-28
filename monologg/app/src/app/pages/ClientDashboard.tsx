import React, { useState } from "react";
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
import {
  Home, Search, Briefcase, MessageSquare, Bell,
  Plus, Star, Shield, Filter, DollarSign, Users,
  ChevronRight, Play, X
} from "lucide-react";

type Tab = "home" | "discover" | "projects" | "orders" | "shortlist";

const CLIENT_STATS = [
  { label: "Active Projects", value: "4", delta: "2 in review", icon: Briefcase, color: "var(--color-accent)" },
  { label: "Talents Hired", value: "12", delta: "+3 this month", icon: Users, color: "var(--color-success)" },
  { label: "Total Spent", value: "₦850K", delta: "Dec budget: ₦200K", icon: DollarSign, color: "var(--color-accent)" },
  { label: "Avg. Rating Given", value: "4.8", delta: "Excellent", icon: Star, color: "var(--color-gold)" },
];

const TALENTS = [
  {
    id: 1,
    name: "Adaeze Obi",
    role: "Voice-Over Artist",
    location: "Lagos",
    price: "₦28,000",
    tags: ["Warm", "Multilingual", "Corporate"],
    verified: true,
    rating: 4.9,
    reviews: 48,
    available: true,
    avatar: "AO",
  },
  {
    id: 2,
    name: "Chidi Okeke",
    role: "Actor",
    location: "Abuja",
    price: "₦120,000",
    tags: ["Dramatic", "Deep Voice", "Nollywood"],
    verified: true,
    rating: 4.8,
    reviews: 32,
    available: true,
    avatar: "CO",
  },
  {
    id: 3,
    name: "Kofi Mensah",
    role: "Comedian · Compere",
    location: "Accra",
    price: "₦60,000",
    tags: ["Corporate", "Witty", "Energetic"],
    verified: true,
    rating: 5.0,
    reviews: 24,
    available: false,
    avatar: "KM",
  },
  {
    id: 4,
    name: "Amara Diallo",
    role: "Voice-Over Artist",
    location: "Accra",
    price: "₦35,000",
    tags: ["Storytelling", "Animated", "French"],
    verified: true,
    rating: 4.7,
    reviews: 61,
    available: true,
    avatar: "AD",
  },
  {
    id: 5,
    name: "Temi Adeleke",
    role: "Content Creator",
    location: "Lagos",
    price: "₦50,000",
    tags: ["Lifestyle", "Charismatic", "Storyteller"],
    verified: false,
    rating: 4.5,
    reviews: 18,
    available: true,
    avatar: "TA",
  },
  {
    id: 6,
    name: "Ibrahim Bello",
    role: "Actor · Model",
    location: "Kano",
    price: "₦90,000",
    tags: ["Commercial", "Bilingual", "Athletic"],
    verified: true,
    rating: 4.9,
    reviews: 27,
    available: true,
    avatar: "IB",
  },
];

const PROJECTS = [
  { id: "P-001", name: "Nike Q1 Campaign", niche: "Voice-Over", budget: "₦200,000", status: "active", applicants: 8, posted: "Dec 14" },
  { id: "P-002", name: "Tech Summit Compere", niche: "Compere", budget: "₦120,000", status: "in_review", applicants: 3, posted: "Dec 10" },
  { id: "P-003", name: "Fintech Radio Ads", niche: "Voice-Over", budget: "₦80,000", status: "draft", applicants: 0, posted: "Dec 8" },
  { id: "P-004", name: "Film Auditions Jan 2025", niche: "Actor", budget: "₦500,000", status: "active", applicants: 21, posted: "Dec 5" },
];

const ORDERS = [
  { id: "ORD-001", talent: "Adaeze Obi", project: "Nike Commercial VO", amount: "₦45,000", phase: "Deliverables", status: "active", due: "Dec 18" },
  { id: "ORD-002", talent: "Kofi Mensah", project: "Tech Summit Compere", amount: "₦80,000", phase: "Review", status: "review", due: "Dec 22" },
  { id: "ORD-003", talent: "Chidi Okeke", project: "Film Auditions Jan 25", amount: "₦120,000", phase: "Briefing", status: "new", due: "Dec 28" },
];

const SHORTLIST = [1, 3, 5];

const NICHES = ["All", "Actor", "Voice-Over", "Comedian", "Compere", "Speaker", "Content Creator"];

const CLIENT_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "discover", label: "Find Talent", icon: Search },
  { id: "projects", label: "My Projects", icon: Briefcase },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "shortlist", label: "Shortlist", icon: Star },
];

const CLIENT_BOTTOM_NAV_ITEMS: SidebarNavItem<Tab>[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Find", icon: Search },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "orders", label: "Orders", icon: MessageSquare },
  { id: "shortlist", label: "Saved", icon: Star },
];

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [shortlist, setShortlist] = useState<number[]>(SHORTLIST);
  const [selectedTalent, setSelectedTalent] = useState<typeof TALENTS[0] | null>(null);
  const navigate = useNavigate();

  const toggleShortlist = (id: number) => {
    setShortlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredTalents = TALENTS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = selectedNiche === "All" || t.role.toLowerCase().includes(selectedNiche.toLowerCase());
    return matchesSearch && matchesNiche;
  });

  const screenTitle =
    activeTab === "home" ? "Dashboard"
    : activeTab === "discover" ? "Find Talent"
    : activeTab === "projects" ? "My Projects"
    : activeTab === "orders" ? "Active Orders"
    : "Shortlist";

  return (
    <div className="role-client min-h-screen" style={{ background: "var(--color-bg-canvas)" }}>
      <Sidebar
        portalLabel="Client Portal"
        navItems={CLIENT_NAV_ITEMS}
        activeTab={activeTab}
        onTab={setActiveTab}
        onNavigate={navigate}
        identity={{ initials: "BN", name: "Brand Agency NG", subtitle: "Client Account" }}
      />

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-2.5 sticky top-0 z-40 glass-panel" style={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <div className="min-w-0">
          <div className="text-[11px] font-body uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Brand Agency NG</div>
          <div className="font-display text-lg leading-tight truncate" style={{ color: "var(--color-text-primary)" }}>{screenTitle}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button aria-label="View notifications" className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: "var(--color-bg-elevated)" }}>
            <Bell className="w-[18px] h-[18px]" style={{ color: "var(--color-text-secondary)" }} />
          </button>
          <button aria-label="Account" className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm font-body" style={{ background: "var(--color-accent-glow)", color: "var(--color-accent)" }}>
            BN
          </button>
        </div>
      </div>

      <main className="lg:pl-60 pb-28 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">

          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl" style={{ color: "var(--color-text-primary)" }}>
                {activeTab === "home" && "Good morning, Brand Agency 🎬"}
                {activeTab === "discover" && "Find Talent"}
                {activeTab === "projects" && "My Projects"}
                {activeTab === "orders" && "Active Orders"}
                {activeTab === "shortlist" && "Shortlisted Talent"}
              </h1>
              <p className="text-sm font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {activeTab === "home" && "Your next project is just a few clicks away."}
                {activeTab === "discover" && "Browse AI-verified talent across all niches."}
                {activeTab === "projects" && "Manage your project briefs and applications."}
                {activeTab === "orders" && "Track your active collaborations."}
                {activeTab === "shortlist" && "Talent you've saved for future bookings."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="h-10 px-4 text-sm gap-2" onClick={() => navigate("/brief")}>
                <Plus className="w-4 h-4" /> Post Project
              </Button>
              <button aria-label="View notifications" className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
                <Bell className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Home ── */}
            {activeTab === "home" && (
              <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

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
                    <div className="font-display tnum leading-none mt-2" style={{ fontSize: "clamp(2.5rem, 9vw, 3.5rem)" }}>₦850,000</div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm font-body" style={{ opacity: 0.9 }}>
                      <Briefcase className="w-4 h-4" /> 4 active projects · 12 talents hired
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
                  {CLIENT_STATS.filter((_, i) => i !== 2).map((stat, i) => (
                    <div key={i} className="text-center px-2" style={{ borderLeft: i > 0 ? "1px solid var(--color-hairline)" : undefined }}>
                      <div className="font-display text-2xl tnum" style={{ color: "var(--color-text-primary)" }}>{stat.value}</div>
                      <div className="text-[11px] font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent projects */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-display text-lg" style={{ color: "var(--color-text-primary)" }}>Recent Projects</span>
                  <button className="text-xs font-body" style={{ color: "var(--color-accent)" }} onClick={() => setActiveTab("projects")}>View all →</button>
                </div>
                <div className="space-y-2.5">
                  {PROJECTS.slice(0, 3).map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)] cursor-pointer transition-transform active:scale-[0.98]"
                      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)", minHeight: 68 }}
                      onClick={() => setActiveTab("projects")}
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-glow)" }}>
                        <Briefcase className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold font-body truncate" style={{ color: "var(--color-text-primary)" }}>{project.name}</div>
                        <div className="text-xs font-body truncate" style={{ color: "var(--color-text-tertiary)" }}>{project.niche} · {project.applicants} applicants</div>
                      </div>
                      <Badge
                        tone={project.status === "active" ? "success" : project.status === "draft" ? "neutral" : "accent"}
                        size="sm"
                        className="text-[11px] shrink-0"
                      >
                        {project.status}
                      </Badge>
                    </motion.div>
                  ))}
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
                    className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center border hover:border-[var(--color-accent)] transition-colors"
                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border-default)" }}
                  >
                    <Filter className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
                  </button>
                </div>

                {/* Niche pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
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
                            <button className="ml-auto w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }} onClick={() => setSelectedTalent(null)}>
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
                            <Button className="flex-1 h-11 text-sm" onClick={() => { setSelectedTalent(null); navigate("/checkout"); }}>
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
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>My Projects</h2>
                  <Button className="h-9 px-3 text-sm gap-2" onClick={() => navigate("/brief")}>
                    <Plus className="w-4 h-4" /> Post
                  </Button>
                </div>

                <div className="space-y-4">
                  {PROJECTS.map(project => (
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
                          <span className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>{project.applicants} applicants</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" className="h-8 px-3 text-xs">Edit</Button>
                          {project.applicants > 0 && (
                            <Button className="h-8 px-3 text-xs gap-1.5" onClick={() => setActiveTab("discover")}>
                              <Users className="w-3.5 h-3.5" /> View Applicants
                            </Button>
                          )}
                        </div>
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
              </motion.div>
            )}

            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Active Orders</h2>
                <div className="space-y-4">
                  {ORDERS.map(order => (
                    <div
                      key={order.id}
                      className="p-5 rounded-[var(--radius-lg)] cursor-pointer hover:scale-[1.01] transition-transform"
                      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
                      onClick={() => navigate("/order/1")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-xs font-mono mb-1" style={{ color: "var(--color-text-tertiary)" }}>{order.id}</div>
                          <h3 className="text-base font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{order.project}</h3>
                          <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Talent: {order.talent}</p>
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
              </motion.div>
            )}

            {/* ── Shortlist Tab ── */}
            {activeTab === "shortlist" && (
              <motion.div key="shortlist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-2xl mb-4 lg:hidden" style={{ color: "var(--color-text-primary)" }}>Shortlisted Talent</h2>
                {shortlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Star className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-text-tertiary)" }} />
                    <h3 className="font-body text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No saved talent yet</h3>
                    <p className="text-sm font-body mb-6" style={{ color: "var(--color-text-secondary)" }}>Browse talent and click the star icon to save them here.</p>
                    <Button onClick={() => setActiveTab("discover")}>Browse Talent</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TALENTS.filter(t => shortlist.includes(t.id)).map(talent => (
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
                          <Button className="flex-1 h-9 text-sm" onClick={() => navigate("/checkout")}>Book Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <BottomNav navItems={CLIENT_BOTTOM_NAV_ITEMS} activeTab={activeTab} onTab={setActiveTab} indicatorId="client-tab-indicator" />
    </div>
  );
}
