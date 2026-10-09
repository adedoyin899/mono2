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
  UploadCloud, X, MapPin, Clock, Camera,
  RefreshCw, FastForward, Check, ChevronRight,
  Smartphone
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type Phase = "briefing" | "deliverables" | "review" | "complete";
type UserRole = "talent" | "client";
type GigType = "remote" | "onsite";
type OnsiteMethod = "checkin" | "pin";

export type OnsiteEvidence = {
  venue: string;
  coords: string;
  arrivalTime: string;
  checkoutTime?: string;
  hasPhoto?: boolean;
  method: OnsiteMethod;
  pinCode?: string;
  notes?: string;
};

export type ExtendedOrderMessage = OrderMessage & {
  onsiteEvidence?: OnsiteEvidence;
};

/* ─── Constants ─────────────────────────────────────────────── */
const PHASES: { id: Phase; label: string }[] = [
  { id: "briefing", label: "Briefing" },
  { id: "deliverables", label: "Deliverables" },
  { id: "review", label: "Review" },
  { id: "complete", label: "Complete" },
];

// Ride-hailing-style client PIN (client generates, performer enters on arrival)
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

  // Submit modal — onsite
  const [onsiteMethod, setOnsiteMethod] = useState<OnsiteMethod>("checkin");
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [hasAttachedPhoto, setHasAttachedPhoto] = useState(false);
  const [onsiteNotes, setOnsiteNotes] = useState("");
  const [pinEntry, setPinEntry] = useState("");

  // Review phase timer
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
        text: "48-hour review window started. Escrow auto-releases if uncontested.",
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
      checkoutTime: isCheckedOut ? "10:15 PM" : undefined,
      hasPhoto: hasAttachedPhoto,
      method: onsiteMethod,
      pinCode: onsiteMethod === "pin" ? CLIENT_GENERATED_PIN : undefined,
      notes: onsiteNotes.trim() || "Live performance completed as scheduled.",
    };
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "talent" as const,
        text: onsiteNotes.trim() || "Live performance completed. Onsite verification submitted.",
        time: "Just now",
        onsiteEvidence: evidence,
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system" as const,
        text: "Onsite presence verified. 48-hour review window started.",
        time: "Just now",
      },
    ]);
    setOnsiteNotes("");
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
        text: "Revision requested. Timer paused. Phase returned to Deliverables.",
        time: "Just now",
      },
    ]);
    setRevisionNotes("");
  };

  /* ─── Action dock — rendered below chat ─── */
  const renderActionDock = () => {
    if (paymentReleased) return null;

    if (phase === "briefing" && role === "client") {
      return (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => advancePhase("deliverables")}
            className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            <Check className="w-4 h-4" />
            Confirm Brief
          </button>
        </div>
      );
    }

    if (phase === "deliverables" && role === "talent") {
      return (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => {
              setDeliverableTab(isOnsite ? "onsite" : "online");
              setShowSubmitModal(true);
            }}
            className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            <UploadCloud className="w-4 h-4" />
            {isOnsite ? "Submit Appearance Proof" : "Submit Deliverable"}
          </button>
        </div>
      );
    }

    if (phase === "review") {
      return (
        <div className="px-4 pb-3 pt-1 space-y-2">
          {/* Timer bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-xs text-amber-800 font-medium">
                {role === "client" ? "Review window" : "Escrow secured"}
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
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: "var(--color-success)" }}
              >
                Release ₦120,000
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Funds auto-release on timer expiry</span>
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
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-zinc-900 truncate font-display">{orderTitle}</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 shrink-0">ORD-001</span>
            </div>
            <div className="text-[11px] text-zinc-500 truncate mt-px">
              {clientOrg} ·&nbsp;
              <span className="font-medium" style={{ color: "var(--color-success)" }}>
                ₦120,000 in escrow
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Demo: gig type switcher */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-zinc-100 text-[11px]">
            {(["remote", "onsite"] as GigType[]).map(g => (
              <button
                key={g}
                onClick={() => { setGigType(g); setDeliverableTab(g === "remote" ? "online" : "onsite"); }}
                className={`px-2.5 py-1 rounded-full font-medium capitalize transition-all ${gigType === g ? "bg-white text-zinc-900 shadow-sm font-semibold" : "text-zinc-500 hover:text-zinc-800"}`}
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
                className={`px-2.5 py-1 rounded-full font-medium capitalize transition-all ${role === r ? "bg-white text-zinc-900 shadow-sm font-semibold" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                {r === "talent" ? "Performer" : "Client"}
              </button>
            ))}
          </div>

          {/* Order Info */}
          <button
            onClick={() => setShowOrderInfoModal(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-all border border-zinc-200/60"
            aria-label="Order Info"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Phase stepper (slim) ── */}
      <div className="border-b px-4 sm:px-5 py-2" style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)" }}>
        <div className="max-w-2xl mx-auto flex items-center gap-1.5 text-xs">
          {PHASES.map((p, idx) => {
            const isDone = idx < phaseIndex;
            const isActive = p.id === phase;
            return (
              <React.Fragment key={p.id}>
                <div className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{
                      background: isActive ? "var(--color-accent)" : isDone ? "var(--color-success)" : "var(--color-bg-elevated)",
                      color: isActive || isDone ? "#fff" : "var(--color-text-tertiary)",
                    }}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      color: isActive ? "var(--color-text-primary)" : isDone ? "var(--color-text-secondary)" : "var(--color-text-tertiary)",
                    }}
                  >
                    {p.label}
                  </span>
                </div>
                {idx < PHASES.length - 1 && (
                  <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Chat + Action area ── */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
          {messages.map(msg => {
            /* System messages */
            if (msg.from === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 max-w-xs text-center"
                    style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isMe = msg.from === role;
            const isTalent = msg.from === "talent";

            // Brand tint: performer = red-tinted, client = purple-tinted
            // "me" bubble is solid brand accent; "them" bubble is soft tint
            const meBubbleBg = isTalent ? "var(--color-red)" : "var(--color-purple)";
            const themBubbleBg = isTalent ? "var(--color-red-soft)" : "var(--color-purple-soft)";
            const meBubbleColor = "#ffffff";
            const themBubbleColor = isTalent ? "var(--color-red-press)" : "var(--color-purple-press)";

            const bubbleBg = isMe ? meBubbleBg : themBubbleBg;
            const bubbleColor = isMe ? meBubbleColor : (isTalent ? "var(--color-mono-red)" : "var(--color-mono-purple)");

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
                    className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: bubbleBg,
                      color: bubbleColor,
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* File attachment */}
                    {msg.attachment && (
                      <div
                        className="mt-2 p-2.5 rounded-xl flex items-center gap-2.5 border"
                        style={{
                          background: isMe ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.8)",
                          borderColor: isMe ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: isMe ? "rgba(255,255,255,0.2)" : "var(--color-bg-elevated)" }}>
                          <FileText className="w-4 h-4" style={{ color: isMe ? "#fff" : "var(--color-text-secondary)" }} />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="font-medium truncate" style={{ color: isMe ? "#fff" : "var(--color-text-primary)" }}>{msg.attachment.name}</div>
                          <div style={{ color: isMe ? "rgba(255,255,255,0.7)" : "var(--color-text-tertiary)" }}>{msg.attachment.size}</div>
                        </div>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: isMe ? "rgba(255,255,255,0.8)" : "var(--color-text-secondary)" }}
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Onsite evidence card */}
                    {msg.onsiteEvidence && (
                      <div
                        className="mt-2.5 p-3 rounded-xl border"
                        style={{
                          background: isMe ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.85)",
                          borderColor: isMe ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.07)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: isMe ? "#fff" : "var(--color-text-primary)" }}>
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            Onsite Appearance Verified
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-600">Verified</span>
                        </div>
                        <div className="space-y-1 text-xs" style={{ color: isMe ? "rgba(255,255,255,0.85)" : "var(--color-text-secondary)" }}>
                          <div className="font-semibold" style={{ color: isMe ? "#fff" : "var(--color-text-primary)" }}>{msg.onsiteEvidence.venue}</div>
                          <div>📍 {msg.onsiteEvidence.coords}</div>
                          <div className="flex items-center gap-3">
                            <span>Arrived {msg.onsiteEvidence.arrivalTime}</span>
                            {msg.onsiteEvidence.checkoutTime && (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" />
                                Checked out {msg.onsiteEvidence.checkoutTime}
                              </span>
                            )}
                          </div>
                          {msg.onsiteEvidence.pinCode && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span>PIN confirmed:</span>
                              <span className="font-mono font-bold tracking-widest text-emerald-500">{msg.onsiteEvidence.pinCode}</span>
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

        {/* Action Dock — context-aware CTA above input */}
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

            <button
              aria-label="Send"
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
              style={{ background: "var(--color-accent)", color: "#fff" }}
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

      {/* Submit Deliverable Modal */}
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
                    {deliverableTab === "onsite" ? "Submit Appearance Proof" : "Submit Deliverable"}
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
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${deliverableTab === "online" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Digital Files
                  </button>
                  <button
                    onClick={() => setDeliverableTab("onsite")}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${deliverableTab === "onsite" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
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
                        <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center mb-2.5">
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
                        placeholder="Any notes for the client…"
                      />
                    </div>
                  </>
                )}

                {/* ── TAB: Onsite Gig ── */}
                {deliverableTab === "onsite" && (
                  <>
                    {/* Location + time context */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200/70 text-emerald-800">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        6.5244° N, 3.3792° E · Lagos
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 border border-blue-200/70 text-blue-800">
                        <Clock className="w-3 h-3 text-blue-600" />
                        7:52 PM, Today
                      </div>
                    </div>

                    {/* Verification method selector */}
                    <div className="space-y-2.5">
                      {/* Option A: Check-in / Check-out */}
                      <div
                        onClick={() => setOnsiteMethod("checkin")}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${onsiteMethod === "checkin" ? "border-blue-400 bg-blue-50/30 ring-1 ring-blue-400/30" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-zinc-900">Check-in & Check-out</div>
                            <div className="text-xs text-zinc-500 mt-0.5">Comedy Night, Eko Hotel · Sat, 8:00 PM</div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0 ml-2">Recommended</span>
                        </div>

                        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center gap-2 text-xs text-emerald-800">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          Arrived 7:52 PM · Location verified
                        </div>

                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setIsCheckedOut(!isCheckedOut); }}
                          className={`w-full mt-2.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${isCheckedOut ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"}`}
                        >
                          {isCheckedOut ? "✓ Checked out 10:15 PM" : "Tap to check out"}
                        </button>

                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setHasAttachedPhoto(!hasAttachedPhoto); }}
                          className={`mt-2 flex items-center gap-1.5 text-xs transition-colors ${hasAttachedPhoto ? "text-emerald-700 font-medium" : "text-zinc-400 hover:text-zinc-700"}`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {hasAttachedPhoto ? "✓ Stage photo attached" : "Add stage photo (optional)"}
                        </button>
                      </div>

                      {/* Option B: PIN Handshake */}
                      <div
                        onClick={() => setOnsiteMethod("pin")}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${onsiteMethod === "pin" ? "border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/30" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-semibold text-zinc-900">PIN Code Handshake</div>
                            <div className="text-xs text-zinc-500 mt-0.5">For high-value or formal bookings</div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0 ml-2">High-value</span>
                        </div>

                        {/* Ride-hailing style explanation */}
                        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60 mb-3">
                          <Smartphone className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            Your client already has a <strong>4-digit booking PIN</strong> in their app — like a ride-hailing code.
                            Ask them for it when you arrive onsite.
                          </p>
                        </div>

                        {/* PIN entry for performer */}
                        <label className="block text-xs font-semibold text-zinc-700 mb-2">
                          Enter the PIN your client shared:
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                          {[0, 1, 2, 3].map(i => (
                            <input
                              key={i}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={pinEntry[i] ?? ""}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                const v = e.target.value.replace(/\D/g, "").slice(-1);
                                const arr = (pinEntry + "    ").split("").slice(0, 4);
                                arr[i] = v;
                                setPinEntry(arr.join("").trim());
                                // auto-advance focus
                                if (v && i < 3) {
                                  const next = e.currentTarget.parentElement?.children[i + 1] as HTMLInputElement;
                                  next?.focus();
                                }
                              }}
                              className="flex-1 h-12 rounded-xl border border-zinc-200 bg-white text-center font-mono font-bold text-lg text-zinc-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition-all"
                            />
                          ))}
                        </div>
                        {pinEntry.length === 4 && pinEntry === CLIENT_GENERATED_PIN ? (
                          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> PIN verified ✓
                          </div>
                        ) : pinEntry.length === 4 ? (
                          <div className="text-xs text-red-600 font-medium">Incorrect PIN. Ask client to confirm.</div>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Performance notes (optional)</label>
                      <textarea
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none resize-none"
                        rows={2}
                        value={onsiteNotes}
                        onChange={e => setOnsiteNotes(e.target.value)}
                        placeholder="e.g. Delivered 45-min headline set, full venue."
                      />
                    </div>
                  </>
                )}

                {/* Escrow note */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Submitting starts the <strong>48-hour review window</strong>. Escrow auto-releases if client doesn't respond.</span>
                </div>

                {/* Modal buttons */}
                <div className="flex gap-2.5 pt-1">
                  <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => setShowSubmitModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-11 text-sm font-semibold"
                    onClick={deliverableTab === "onsite" ? handleSubmitOnsiteEvidence : handleSubmitOnlineDeliverable}
                    disabled={deliverableTab === "onsite" && onsiteMethod === "pin" && pinEntry !== CLIENT_GENERATED_PIN && pinEntry.length === 4}
                  >
                    {deliverableTab === "onsite" ? "Submit Proof" : "Submit"} →
                  </Button>
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
              <p className="text-xs text-zinc-500 mb-4">The timer pauses and the order returns to the performer.</p>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none resize-none mb-4"
                rows={4}
                value={revisionNotes}
                onChange={e => setRevisionNotes(e.target.value)}
                placeholder="What needs to change?"
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
                Our team will mediate. Escrow stays locked until resolved.
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

      {/* Order Info Modal */}
      <AnimatePresence>
        {showOrderInfoModal && (
          <Modal onClose={() => setShowOrderInfoModal(false)}>
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-display text-base font-semibold text-zinc-900">Order Info</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{orderTitle} · ORD-001</p>
                </div>
                <button onClick={() => setShowOrderInfoModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Escrow */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: paymentReleased ? "var(--color-success-bg)" : "var(--color-bg-elevated)",
                    border: `1px solid ${paymentReleased ? "var(--color-success)" : "var(--color-hairline)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: paymentReleased ? "var(--color-success)" : "var(--color-text-secondary)" }}>
                      {paymentReleased ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {paymentReleased ? "Released" : "Escrow Locked"}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">ORD-001</span>
                  </div>
                  <div className="text-2xl font-semibold font-mono text-zinc-900">₦120,000</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    {paymentReleased ? `Transferred to ${talentName}` : "100% secured · auto-releases in 48h"}
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Participants</div>
                  <div className="space-y-2.5">
                    {[
                      { name: talentName, role: "Performer", initials: talentInitials, color: "var(--color-mono-red)", bg: "var(--color-red-soft)" },
                      { name: clientOrg, role: "Client", initials: "FS", color: "var(--color-mono-purple)", bg: "var(--color-purple-soft)" },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Avatar size="sm" className="w-8 h-8 text-xs font-semibold shrink-0" background={p.bg} color={p.color}>
                          {p.initials}
                        </Avatar>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
                            {p.name}
                            <Shield className="w-3 h-3 text-emerald-600" />
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{p.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Status</div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: phase === "complete" ? "var(--color-success)" : "var(--color-accent)" }}
                    />
                    <span className="text-sm font-medium text-zinc-900 capitalize">{phase}</span>
                    {phase === "review" && !paymentReleased && (
                      <span className="text-xs font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {formatCountdown(timerSeconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financials */}
                <div
                  className="p-3.5 rounded-xl space-y-1.5 text-xs"
                  style={{ background: "var(--color-bg-elevated)" }}
                >
                  {[
                    ["Service", isOnsite ? "Live Standup (Onsite)" : "Voice-Over (Remote)"],
                    ["Inspection Window", "48 Hours"],
                    ["Performer Payout", "₦120,000"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                      <span className="font-mono font-medium text-zinc-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
