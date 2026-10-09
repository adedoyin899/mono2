import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Avatar } from "../components/ui/Avatar";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import { apiClient } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import type { OrderMessage } from "@monologg/types";
import {
  ChevronLeft, Shield, Send, Paperclip, CheckCircle2,
  Lock, FileText, Download, AlertTriangle,
  UploadCloud, X, MapPin,
  RefreshCw, FastForward, Check,
  Copy, KeyRound
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type Phase = "briefing" | "deliverables" | "review" | "complete";
type UserRole = "talent" | "client";
type GigType = "remote" | "onsite";

export type OnsiteEvidence = {
  venue: string;
  coords: string;
  arrivalTime: string;
  pinCode: string;
  notes?: string;
};

export type ExtendedOrderMessage = OrderMessage & {
  onsiteEvidence?: OnsiteEvidence;
};

/* ─── Constants ─────────────────────────────────────────────── */
const PHASES: { id: Phase; label: string; description: string }[] = [
  { id: "briefing", label: "Briefing", description: "Script, requirements & expectations confirmed." },
  { id: "deliverables", label: "Deliverables", description: "Digital assets or verified live event performance." },
  { id: "review", label: "Review & Inspection", description: "48-hour client review window with auto-release protection." },
  { id: "complete", label: "Complete & Payout", description: "Escrow released to performer and order finalized." },
];

// Client-provided arrival PIN for onsite performance verification (only visible to client)
const CLIENT_GENERATED_PIN = "4821";

/* ─── Component ─────────────────────────────────────────────── */
export function OrderRoom() {
  const [phase, setPhase] = useState<Phase>("deliverables");
  const [role, setRole] = useState<UserRole>("talent");
  const [gigType, setGigType] = useState<GigType>("remote");
  const [messages, setMessages] = useState<ExtendedOrderMessage[]>([]);
  const [inputText, setInputText] = useState("");

  // Modal visibility
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);
  const [paymentReleased, setPaymentReleased] = useState(false);

  // Submit modal — file deliverable
  const [deliverableTab, setDeliverableTab] = useState<"online" | "onsite">("online");
  const [stagedFile, setStagedFile] = useState<{ name: string; size: string; type: "file" | "image" } | null>(null);
  const [onlineNotes, setOnlineNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit modal — onsite PIN verification
  const [onsiteNotes, setOnsiteNotes] = useState("");
  const [pinEntry, setPinEntry] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);

  // Review phase 48-hour countdown timer
  const [timerSeconds, setTimerSeconds] = useState(48 * 3600);
  const [revisionNotes, setRevisionNotes] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  /* ── Data loading ── */
  useEffect(() => {
    apiClient.getOrderMessages(orderId ?? "unknown").then(msgs => {
      setMessages(msgs as ExtendedOrderMessage[]);
    });
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── 48h countdown ── */
  useEffect(() => {
    if (phase !== "review" || paymentReleased) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) { handleAutoRelease(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, paymentReleased]);

  /* ── Helpers ── */
  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  };

  const phaseIndex = PHASES.findIndex(p => p.id === phase);
  const talentName = appStateSync.getTalentProfile().name;
  const clientOrg = appStateSync.getClientProfile().orgName || "FilmCraft Studios";
  const talentInitials = talentName.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("");

  const orderTitle = gigType === "onsite" ? "Comedy Night, Eko Hotel" : "Nike Campaign VO";
  const isOnsite = gigType === "onsite";

  /* ── Actions ── */
  const handleCopyPin = () => {
    navigator.clipboard.writeText(CLIENT_GENERATED_PIN);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    const sent = orderId ? await apiClient.sendOrderMessage(orderId, text) : null;
    const newMsg: ExtendedOrderMessage = sent ?? {
      id: `local-${messages.length + 1}`,
      from: role,
      text,
      time: "Just now",
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const advancePhase = (target?: Phase) => {
    const next = target ?? (phaseIndex + 1 < PHASES.length ? PHASES[phaseIndex + 1].id : phase);
    setPhase(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / 1048576).toFixed(1);
      const isImg = file.type.startsWith("image/");
      setStagedFile({ name: file.name, size: `${sizeMb} MB`, type: isImg ? "image" : "file" });
    }
  };

  const handleSubmitOnlineDeliverable = () => {
    const finalFile = stagedFile ?? { name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" as const };
    setShowSubmitModal(false);
    advancePhase("review");
    setTimerSeconds(48 * 3600);
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "talent" as const,
        text: onlineNotes.trim() || "Deliverable submitted. Ready for your review.",
        time: "Just now",
        attachment: finalFile,
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system" as const,
        text: "48-hour inspection window started. Escrow auto-releases if uncontested.",
        time: "Just now",
      },
    ]);
    setStagedFile(null);
    setOnlineNotes("");
  };

  const handleSubmitOnsiteEvidence = () => {
    setShowSubmitModal(false);
    advancePhase("review");
    setTimerSeconds(48 * 3600);
    const evidence: OnsiteEvidence = {
      venue: "Comedy Night, Eko Hotel",
      coords: "6.5244° N, 3.3792° E · Lagos",
      arrivalTime: "7:52 PM",
      pinCode: CLIENT_GENERATED_PIN,
      notes: onsiteNotes.trim() || "Live performance completed as scheduled.",
    };
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "talent" as const,
        text: onsiteNotes.trim() || "Live performance completed. Onsite presence verified.",
        time: "Just now",
        onsiteEvidence: evidence,
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system" as const,
        text: "Onsite presence verified. 48-hour inspection window started.",
        time: "Just now",
      },
    ]);
    setOnsiteNotes("");
    setPinEntry("");
  };

  const handleAutoRelease = () => {
    setShowReleaseModal(false);
    setPaymentReleased(true);
    setPhase("complete");
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "system" as const,
        text: `₦120,000 released from escrow to ${talentName}. Order complete.`,
        time: "Just now",
      },
    ]);
  };

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) return;
    setShowRevisionModal(false);
    setPhase("deliverables");
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "client" as const,
        text: `Revision requested: ${revisionNotes.trim()}`,
        time: "Just now",
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system" as const,
        text: "Revision requested. Inspection timer paused. Phase returned to Deliverables.",
        time: "Just now",
      },
    ]);
    setRevisionNotes("");
  };

  /* ─── Context-Aware Action Dock ─── */
  const renderActionDock = () => {
    if (paymentReleased) return null;

    // Briefing Phase — Client
    if (phase === "briefing" && role === "client") {
      return (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => advancePhase("deliverables")}
            className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm hover:opacity-95 text-white"
            style={{ background: "var(--color-purple)" }}
          >
            <Check className="w-4 h-4" />
            Confirm Brief & Advance to Deliverables
          </button>
        </div>
      );
    }

    // Deliverables Phase — Client view for Onsite Gig: Display arrival code
    if (phase === "deliverables" && role === "client" && isOnsite) {
      return (
        <div className="px-4 pb-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-950">
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                Onsite Arrival Code
              </div>
              <button
                onClick={handleCopyPin}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-purple-200 shadow-2xs hover:bg-purple-50 transition-colors"
              >
                {copiedPin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedPin ? "Copied" : "Copy Code"}
              </button>
            </div>
            <p className="text-xs text-purple-900/80 mb-2.5 leading-relaxed">
              Share this 4-digit code with <strong>{talentName}</strong> when they arrive at <strong>Comedy Night, Eko Hotel</strong> to confirm their live attendance:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {CLIENT_GENERATED_PIN.split("").map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center font-mono font-bold text-lg text-purple-950 shadow-2xs"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-purple-700 font-medium ml-1">
                Performer will ask for this upon arrival
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Deliverables Phase — Performer view for Onsite Gig: Ask client for code prompt
    if (phase === "deliverables" && role === "talent" && isOnsite) {
      return (
        <div className="px-4 pb-3 pt-1 space-y-2">
          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Arrived at venue? Ask client for their <strong>4-digit arrival code</strong>.</span>
            </div>
          </div>
          <button
            onClick={() => {
              setDeliverableTab("onsite");
              setShowSubmitModal(true);
            }}
            className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm hover:opacity-95 text-white"
            style={{ background: "var(--color-red)" }}
          >
            <KeyRound className="w-4 h-4" />
            Enter Code & Verify
          </button>
        </div>
      );
    }

    // Deliverables Phase — Performer view for Remote Gig
    if (phase === "deliverables" && role === "talent" && !isOnsite) {
      return (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => {
              setDeliverableTab("online");
              setShowSubmitModal(true);
            }}
            className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm hover:opacity-95 text-white"
            style={{ background: "var(--color-red)" }}
          >
            <UploadCloud className="w-4 h-4" />
            Submit Deliverable
          </button>
        </div>
      );
    }

    // Review Phase
    if (phase === "review") {
      return (
        <div className="px-4 pb-3 pt-1 space-y-2">
          {/* 48h Inspection Timer Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-xs text-amber-800 font-medium">
                {role === "client" ? "Inspection window active" : "Escrow secured · 48h auto-release"}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900">
              {formatCountdown(timerSeconds)} remaining
            </span>
          </div>

          {role === "client" ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowRevisionModal(true)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-all"
              >
                Request Revision
              </button>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="h-10 px-3.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 text-zinc-500 border border-zinc-200 transition-all"
              >
                Dispute
              </button>
              <button
                onClick={() => setShowReleaseModal(true)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.98] shadow-sm hover:opacity-95"
                style={{ background: "var(--color-success)" }}
              >
                Release ₦120,000
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-zinc-500">Funds auto-release to your wallet on timer expiry</span>
              <button
                onClick={handleAutoRelease}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors"
                title="Simulate timer expiry (demo)"
              >
                <FastForward className="w-3 h-3" />
                Test Release
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  /* ─── JSX ─────────────────────────────────────────────────── */
  return (
    <div className={`${role === "client" ? "role-client" : "role-talent"} min-h-screen flex flex-col`} style={{ background: "var(--color-bg-canvas)" }}>

      {/* ── Navbar ── */}
      <header
        className="h-14 flex items-center justify-between gap-3 px-4 sm:px-5 sticky top-0 z-40 border-b"
        style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all text-zinc-500 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-zinc-900 truncate font-display">{orderTitle}</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 shrink-0">ORD-001</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0"
                style={{
                  background: phase === "complete" ? "var(--color-success-bg)" : "var(--color-bg-elevated)",
                  color: phase === "complete" ? "var(--color-success)" : "var(--color-text-secondary)",
                }}
              >
                Phase {phaseIndex + 1}: {phase}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1.5">
              <span>{clientOrg}</span>
              <span>·</span>
              <span
                className="font-semibold font-mono flex items-center gap-1"
                style={{ color: role === "talent" ? "var(--color-mono-red)" : "var(--color-mono-purple)" }}
              >
                <Lock className="w-3 h-3" />
                ₦120,000 in escrow
              </span>
              {isOnsite && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 inline" /> Onsite
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Demo: gig type switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-zinc-100 text-[11px]">
            {(["remote", "onsite"] as GigType[]).map(g => (
              <button
                key={g}
                onClick={() => { setGigType(g); setDeliverableTab(g === "remote" ? "online" : "onsite"); }}
                className={`px-2.5 py-1 rounded-full font-medium capitalize transition-all ${gigType === g ? "bg-white text-zinc-900 shadow-2xs font-semibold" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Demo: role switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-zinc-100 text-[11px]">
            {(["talent", "client"] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-2.5 py-1 rounded-full font-medium capitalize transition-all ${role === r ? "bg-white text-zinc-900 shadow-2xs font-semibold" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                {r === "talent" ? "Performer" : "Client"}
              </button>
            ))}
          </div>

          {/* Order Info pill button matching screenshot aesthetic */}
          <button
            onClick={() => setShowOrderInfoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs active:scale-95"
            style={{
              border: role === "talent" ? "1px solid rgba(225, 29, 72, 0.25)" : "1px solid rgba(124, 58, 237, 0.25)",
              background: role === "talent" ? "var(--color-red-soft)" : "var(--color-purple-soft)",
              color: role === "talent" ? "var(--color-mono-red)" : "var(--color-mono-purple)",
            }}
            aria-label="Order Info"
            title="View Project Phases & Escrow Details"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Order Info</span>
          </button>
        </div>
      </header>

      {/* ── Chat Feed + Action Area (No stepper bar taking vertical space) ── */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
          {messages.map(msg => {
            /* System messages */
            if (msg.from === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 max-w-sm text-center shadow-2xs"
                    style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isMe = msg.from === role;
            const isTalent = msg.from === "talent";

            // Chat bubble colors matching user requirement:
            // 1. Incoming messages from the other party (!isMe):
            //    Crisp white card (#ffffff) with subtle neutral border (border-zinc-200/80)
            //    and dark neutral text (#18181b), exactly matching the user screenshot.
            // 2. Outgoing messages from current role (isMe):
            //    - Performer (role === "talent"): consistent soft red hue (#FFF1F2) with subtle red border.
            //    - Client (role === "client"): consistent soft purple hue (#FAF5FF) with subtle purple border.
            let bubbleBg: string;
            let bubbleBorder: string;

            if (!isMe) {
              bubbleBg = "#ffffff";
              bubbleBorder = "1px solid rgba(0, 0, 0, 0.08)";
            } else {
              if (role === "talent") {
                bubbleBg = "var(--color-red-soft)";
                bubbleBorder = "1px solid rgba(225, 29, 72, 0.22)";
              } else {
                bubbleBg = "var(--color-purple-soft)";
                bubbleBorder = "1px solid rgba(124, 58, 237, 0.22)";
              }
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION_MED, ease: EASE_OUT }}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar
                  size="sm"
                  className="w-7 h-7 text-[10px] shrink-0 mt-0.5 font-semibold"
                  background={isTalent ? "var(--color-red-soft)" : "var(--color-purple-soft)"}
                  color={isTalent ? "var(--color-mono-red)" : "var(--color-mono-purple)"}
                >
                  {isTalent ? talentInitials : "BN"}
                </Avatar>

                <div className={`max-w-[80%] sm:max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs text-zinc-900"
                    style={{
                      background: bubbleBg,
                      border: bubbleBorder,
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* File attachment */}
                    {msg.attachment && (
                      <div
                        className="mt-2 p-2.5 rounded-xl flex items-center gap-2.5 border transition-colors"
                        style={{
                          background: !isMe ? "var(--color-bg-canvas)" : "rgba(255, 255, 255, 0.85)",
                          borderColor: !isMe ? "rgba(0, 0, 0, 0.08)" : (role === "talent" ? "rgba(225, 29, 72, 0.18)" : "rgba(124, 58, 237, 0.18)"),
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: !isMe ? "rgba(0, 0, 0, 0.06)" : (role === "talent" ? "var(--color-red-soft)" : "var(--color-purple-soft)") }}
                        >
                          <FileText
                            className="w-4 h-4"
                            style={{ color: !isMe ? "var(--color-text-secondary)" : (role === "talent" ? "var(--color-mono-red)" : "var(--color-mono-purple)") }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="font-medium truncate text-zinc-900">{msg.attachment.name}</div>
                          <div className="text-zinc-500">{msg.attachment.size}</div>
                        </div>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg transition-colors text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Onsite evidence card inside performer bubble */}
                    {msg.onsiteEvidence && (
                      <div
                        className="mt-2.5 p-3 rounded-xl border text-xs shadow-2xs"
                        style={{
                          background: "rgba(255, 255, 255, 0.95)",
                          borderColor: isMe && role === "talent" ? "rgba(225, 29, 72, 0.25)" : "rgba(0, 0, 0, 0.08)",
                          color: "#18181b",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            Onsite Appearance Verified
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        </div>
                        <div className="space-y-1 text-zinc-600">
                          <div className="font-semibold text-zinc-900">{msg.onsiteEvidence.venue}</div>
                          <div>📍 {msg.onsiteEvidence.coords}</div>
                          <div>Arrived {msg.onsiteEvidence.arrivalTime} (Auto-verified)</div>
                          {msg.onsiteEvidence.pinCode && (
                            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-zinc-800">
                              <span>Client code confirmed:</span>
                              <span className="font-bold tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {msg.onsiteEvidence.pinCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 px-1" style={{ color: "var(--color-text-tertiary)" }}>{msg.time}</span>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Context-aware Action Dock */}
        {renderActionDock()}

        {/* Payment Released Banner */}
        {paymentReleased && (
          <div className="px-4 pb-2">
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-2.5 text-sm font-medium"
              style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>₦120,000 released to {talentName}. Order complete.</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div
          className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t"
          style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)" }}
        >
          <div className="flex items-center gap-2">
            <button
              aria-label="Attach"
              onClick={() => role === "talent" ? setShowSubmitModal(true) : fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all hover:bg-zinc-100 active:scale-95"
              style={{ color: "var(--color-text-secondary)", border: "1px solid var(--color-hairline)" }}
              title={role === "talent" ? "Submit deliverable" : "Attach file"}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              className="flex-1 px-3.5 py-2.5 rounded-xl text-sm resize-none focus:outline-none transition-colors"
              style={{
                lineHeight: "1.5",
                border: "1px solid var(--color-hairline)",
                background: "var(--color-bg-canvas)",
                color: "var(--color-text-primary)",
              }}
              rows={1}
              placeholder={`Message ${role === "talent" ? clientOrg : talentName}…`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Send CTA in main brand colors: red for performer, purple for client */}
            <button
              aria-label="Send"
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40 text-white shadow-2xs hover:opacity-95"
              style={{ background: role === "talent" ? "var(--color-red)" : "var(--color-purple)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Minimal footer */}
          <div className="flex items-center justify-between mt-2 px-0.5">
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Escrow protected · 48h auto-release</span>
            </div>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-[11px] flex items-center gap-1 transition-colors hover:text-red-600"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Dispute
            </button>
          </div>
        </div>
      </div>

      {/* ════════ MODALS ════════ */}

      {/* Submit Deliverable Modal (Dual Mode: Digital Files vs Onsite PIN Handshake) */}
      <AnimatePresence>
        {showSubmitModal && (
          <Modal onClose={() => setShowSubmitModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-display text-base font-semibold text-zinc-900">
                    {deliverableTab === "onsite" ? "Verify Live Appearance" : "Submit Deliverable"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Starts the 48-hour client review window</p>
                </div>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="px-6 pt-4">
                <div className="flex items-center p-1 rounded-xl gap-1" style={{ background: "var(--color-bg-elevated)" }}>
                  <button
                    onClick={() => setDeliverableTab("online")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${deliverableTab === "online" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"}`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Digital Files
                  </button>
                  <button
                    onClick={() => setDeliverableTab("onsite")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${deliverableTab === "onsite" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"}`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Onsite Gig
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">

                {/* ── TAB: Digital Files ── */}
                {deliverableTab === "online" && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".mp3,.mp4,.wav,.pdf,.zip,audio/*,video/*"
                      onChange={handleFileChange}
                    />

                    {stagedFile ? (
                      <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-900 truncate">{stagedFile.name}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{stagedFile.size} · <span className="text-emerald-600 font-medium">Ready</span></div>
                        </div>
                        <button onClick={() => setStagedFile(null)} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current ? fileInputRef.current.click() : setStagedFile({ name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" })}
                        className="border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-2xl flex flex-col items-center py-8 cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 transition-all text-center"
                      >
                        <div className="w-11 h-11 rounded-full bg-white shadow-2xs border border-zinc-200 flex items-center justify-center mb-2.5">
                          <UploadCloud className="w-5 h-5 text-zinc-600" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-800">Drop file or <span className="underline underline-offset-2">browse</span></p>
                        <p className="text-xs text-zinc-400 mt-1">MP3, MP4, WAV, PDF, ZIP · Max 500MB</p>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setStagedFile({ name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" }); }}
                          className="mt-3 text-[11px] text-zinc-400 hover:text-zinc-700 underline"
                        >
                          Use demo file
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Notes (optional)</label>
                      <textarea
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 resize-none"
                        style={{ "--tw-ring-color": "var(--color-accent-glow)" } as React.CSSProperties}
                        rows={2}
                        value={onlineNotes}
                        onChange={e => setOnlineNotes(e.target.value)}
                        placeholder="Any delivery notes for the client…"
                      />
                    </div>
                  </>
                )}

                {/* ── TAB: Onsite Gig (Streamlined auto-verified chip + Single 4-digit code input) ── */}
                {deliverableTab === "onsite" && (
                  <>
                    {/* Clean compact auto-verified banner without inner card boxes */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
                      <div className="text-xs text-emerald-950 leading-relaxed">
                        <span className="font-semibold">Presence auto-verified: </span>
                        <span>Your venue location and arrival timestamp are automatically recorded for proof of attendance.</span>
                      </div>
                    </div>

                    {/* Single 4-digit code input */}
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-zinc-900">Client Verification Code</label>
                        <span className="text-[10px] text-zinc-400 font-medium">4 digits</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                        Ask <strong>{clientOrg}</strong> for their 4-digit code upon arrival to confirm your check-in.
                      </p>

                      {/* Single input box for all 4 digits */}
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={pinEntry}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setPinEntry(v);
                        }}
                        placeholder="••••"
                        className={`w-full h-12 px-4 rounded-xl border text-center font-mono font-bold text-xl tracking-[0.4em] transition-all focus:outline-none ${
                          pinEntry.length === 4 && pinEntry === CLIENT_GENERATED_PIN
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-zinc-200 bg-white text-zinc-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        }`}
                      />

                      {pinEntry.length === 4 && pinEntry === CLIENT_GENERATED_PIN ? (
                        <div className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5 pt-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Code verified with {clientOrg}
                        </div>
                      ) : pinEntry.length === 4 ? (
                        <div className="text-xs text-red-600 font-medium text-center pt-2">
                          Incorrect code. Please ask the client to confirm.
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-400 text-center pt-2">
                          The client can find this 4-digit code in their Order Room.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Performance notes (optional)</label>
                      <textarea
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none resize-none"
                        rows={2}
                        value={onsiteNotes}
                        onChange={e => setOnsiteNotes(e.target.value)}
                        placeholder="e.g. Delivered 45-min headline set, full audience."
                      />
                    </div>
                  </>
                )}

                {/* Escrow Guarantee note */}
                <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-xs" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Submitting activates your <strong>48-hour inspection window</strong>. If uncontested, ₦120,000 auto-releases to your balance.</span>
                </div>

                {/* Modal action buttons with primary CTA "Verify" */}
                <div className="flex gap-2.5 pt-1">
                  <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => setShowSubmitModal(false)}>
                    Cancel
                  </Button>
                  <button
                    className="flex-1 h-11 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm hover:opacity-95 text-white disabled:opacity-40"
                    style={{ background: "var(--color-red)" }}
                    onClick={deliverableTab === "onsite" ? handleSubmitOnsiteEvidence : handleSubmitOnlineDeliverable}
                    disabled={deliverableTab === "onsite" && pinEntry !== CLIENT_GENERATED_PIN}
                  >
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Release Payment Modal */}
      <AnimatePresence>
        {showReleaseModal && (
          <Modal onClose={() => setShowReleaseModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6 bg-white border border-zinc-200 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-center mb-1 text-zinc-900">Release Payment?</h3>
              <p className="text-sm text-center text-zinc-500 mb-5">
                This will transfer <strong className="text-zinc-900">₦120,000</strong> from escrow to {talentName}.
              </p>
              <div className="p-3.5 rounded-xl mb-5 space-y-1.5 text-xs" style={{ background: "var(--color-bg-elevated)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-secondary)" }}>Escrow Total</span>
                  <span className="font-mono font-semibold text-zinc-900">₦120,000</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-secondary)" }}>Platform Fee</span>
                  <span className="font-mono text-zinc-400">₦0</span>
                </div>
                <div className="h-px bg-zinc-200 my-1" />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-zinc-900">Performer Payout</span>
                  <span className="font-mono text-emerald-600">₦120,000</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Button variant="secondary" className="flex-1 h-10 text-sm" onClick={() => setShowReleaseModal(false)}>Cancel</Button>
                <Button className="flex-1 h-10 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAutoRelease}>Confirm</Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Request Revision Modal */}
      <AnimatePresence>
        {showRevisionModal && (
          <Modal onClose={() => setShowRevisionModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6 bg-white border border-zinc-200 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <h3 className="font-display text-base font-semibold text-zinc-900">Request Revision</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4">The inspection timer pauses and the order returns to the performer.</p>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none resize-none mb-4"
                rows={4}
                value={revisionNotes}
                onChange={e => setRevisionNotes(e.target.value)}
                placeholder="What revisions are needed?"
              />
              <div className="flex gap-2.5">
                <Button variant="secondary" className="flex-1 h-10 text-sm" onClick={() => setShowRevisionModal(false)}>Cancel</Button>
                <Button
                  className="flex-1 h-10 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleRequestRevision}
                  disabled={!revisionNotes.trim()}
                >
                  Send Request
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <Modal onClose={() => setShowDisputeModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6 bg-white border border-zinc-200 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50 border border-amber-100">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-center mb-1 text-zinc-900">Raise a Dispute</h3>
              <p className="text-sm text-center text-zinc-500 mb-4">
                Our mediation team will review order evidence. Escrow stays locked until resolved.
              </p>
              <textarea
                className="w-full px-4 py-3 rounded-xl text-sm border border-zinc-200 bg-zinc-50 mb-4 resize-none focus:outline-none"
                rows={4}
                placeholder="Describe the issue in detail…"
              />
              <div className="flex gap-2.5">
                <Button variant="secondary" className="flex-1 h-10 text-sm" onClick={() => setShowDisputeModal(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1 h-10 text-sm font-semibold" onClick={() => setShowDisputeModal(false)}>Submit</Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Order Details Modal (Clean, responsive, performer doesn't see handshake code) ── */}
      <AnimatePresence>
        {showOrderInfoModal && (
          <Modal onClose={() => setShowOrderInfoModal(false)}>
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <div>
                  <h3 className="font-display text-base font-semibold text-zinc-900">Order Details</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{orderTitle} · ORD-001</p>
                </div>
                <button
                  onClick={() => setShowOrderInfoModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="px-6 py-5 space-y-4 overflow-y-auto">

                {/* Escrow Hero Balance Card */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: paymentReleased ? "var(--color-success-bg)" : "var(--color-bg-elevated)",
                    border: `1px solid ${paymentReleased ? "var(--color-success)" : "var(--color-hairline)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Escrow Protected</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        background: paymentReleased ? "var(--color-success-bg)" : "rgba(16,185,129,0.12)",
                        color: "var(--color-success)",
                      }}
                    >
                      <Shield className="w-3 h-3 text-emerald-600" />
                      {paymentReleased ? "Released" : "100% Secured"}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-zinc-900 tracking-tight">₦120,000</div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {paymentReleased
                      ? `Transferred to ${talentName}.`
                      : "Auto-releases to performer 48 hours after delivery or upon client approval."}
                  </p>
                </div>

                {/* Project Lifecycle Phases (Clean, cohesive, responsive cards) */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">Project Phases</div>
                  <div className="space-y-2">
                    {PHASES.map((p, idx) => {
                      const isPast = idx < phaseIndex;
                      const isCurrent = p.id === phase;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isCurrent
                              ? "bg-zinc-50/90 border-zinc-300 shadow-2xs"
                              : isPast
                                ? "bg-white border-zinc-100"
                                : "bg-white border-zinc-100/70 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isPast
                                    ? "bg-emerald-600 text-white"
                                    : isCurrent
                                      ? (role === "talent" ? "bg-red-600 text-white" : "bg-purple-600 text-white")
                                      : "bg-zinc-200 text-zinc-500"
                                }`}
                              >
                                {isPast ? "✓" : idx + 1}
                              </span>
                              <span className={`text-xs font-semibold truncate ${isCurrent ? "text-zinc-900" : "text-zinc-700"}`}>
                                {p.label}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                isPast
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isCurrent
                                    ? "bg-amber-50 text-amber-700 font-semibold"
                                    : "bg-zinc-100 text-zinc-400"
                              }`}
                            >
                              {isPast ? "Completed" : isCurrent ? (phase === "review" ? formatCountdown(timerSeconds) : "In Progress") : "Upcoming"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1 pl-7 leading-relaxed">
                            {p.id === "briefing" && "Scope and requirements agreed."}
                            {p.id === "deliverables" && (isOnsite ? "Live performance & onsite check-in." : "Deliverable submission & files staged.")}
                            {p.id === "review" && "48-hour client review window."}
                            {p.id === "complete" && "Escrow payout released to wallet balance."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Onsite Arrival Code: VISIBLE TO CLIENT ONLY (performer must not see this) */}
                {isOnsite && role === "client" && (
                  <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-950 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                        Arrival Verification Code
                      </span>
                      <span className="font-mono text-sm font-bold tracking-widest px-2.5 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-900 shadow-2xs">
                        {CLIENT_GENERATED_PIN}
                      </span>
                    </div>
                    <p className="text-xs text-purple-800/80">
                      Share this 4-digit code with {talentName} upon arrival to verify attendance.
                    </p>
                  </div>
                )}

                {/* Streamlined Payment Summary */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Payment Summary</div>
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Project Escrow (Funded)</span>
                    <span className="font-mono font-medium text-zinc-900">₦120,000</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Protection Fee</span>
                    <span className="font-mono text-emerald-600 font-medium">Free (₦0)</span>
                  </div>
                  <div className="h-px bg-zinc-200 my-1" />
                  <div className="flex justify-between items-center font-semibold text-zinc-900">
                    <span>{role === "talent" ? "Your Net Payout" : "Performer Payout"}</span>
                    <span className="font-mono text-emerald-600 text-sm">₦120,000</span>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-zinc-400">Participants</div>
                  <div className="space-y-2">
                    {[
                      { name: talentName, role: "Performer", initials: talentInitials, color: "var(--color-mono-red)", bg: "var(--color-red-soft)" },
                      { name: clientOrg, role: "Client", initials: "FS", color: "var(--color-mono-purple)", bg: "var(--color-purple-soft)" },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Avatar size="sm" className="w-7 h-7 text-xs font-semibold shrink-0" background={p.bg} color={p.color}>
                          {p.initials}
                        </Avatar>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
                            {p.name}
                            <Shield className="w-3 h-3 text-emerald-600" />
                          </div>
                          <div className="text-[11px] text-zinc-400">{p.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
