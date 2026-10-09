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
  UploadCloud, X, DollarSign, MapPin, Clock, Camera,
  KeyRound, RefreshCw, FastForward, Check, ExternalLink
} from "lucide-react";

type Phase = "briefing" | "deliverables" | "review" | "complete";
type UserRole = "talent" | "client";
type GigType = "remote" | "onsite";

export type OnsiteEvidence = {
  venue: string;
  coords: string;
  arrivalTime: string;
  checkoutTime?: string;
  hasPhoto?: boolean;
  method: "checkin" | "pin";
  pinCode?: string;
  notes?: string;
};

export type ExtendedOrderMessage = OrderMessage & {
  onsiteEvidence?: OnsiteEvidence;
};

const PHASES: { id: Phase; label: string; desc: string }[] = [
  { id: "briefing", label: "Briefing", desc: "Review and confirm project brief" },
  { id: "deliverables", label: "Deliverables", desc: "Submit files or onsite proof" },
  { id: "review", label: "Review", desc: "Client 48h inspection window" },
  { id: "complete", label: "Complete", desc: "Escrow released to performer" },
];

export function OrderRoom() {
  const [phase, setPhase] = useState<Phase>("deliverables");
  const [role, setRole] = useState<UserRole>("talent");
  const [gigType, setGigType] = useState<GigType>("remote");
  const [messages, setMessages] = useState<ExtendedOrderMessage[]>([]);
  const [inputText, setInputText] = useState("");

  // Modals state
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);
  const [paymentReleased, setPaymentReleased] = useState(false);

  // Deliverables submission state (Tabs: Online vs Onsite)
  const [deliverableTab, setDeliverableTab] = useState<"online" | "onsite">("online");
  const [stagedFile, setStagedFile] = useState<{ name: string; size: string; type: "file" | "image" } | null>(null);
  const [onlineNotes, setOnlineNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Onsite evidence state (Check-in/Check-out vs PIN handshake)
  const [onsiteMethod, setOnsiteMethod] = useState<"checkin" | "pin">("checkin");
  const [isCheckedOut, setIsCheckedOut] = useState(true);
  const [hasAttachedPhoto, setHasAttachedPhoto] = useState(false);
  const [onsiteNotes, setOnsiteNotes] = useState("");
  const [clientPinInput, setClientPinInput] = useState("");

  // 48-Hour Inspection Timer (Seconds countdown)
  const [timerSeconds, setTimerSeconds] = useState(47 * 3600 + 58 * 60 + 20); // 47h 58m 20s
  const [revisionNotes, setRevisionNotes] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  // Load initial order messages
  useEffect(() => {
    apiClient.getOrderMessages(orderId ?? "unknown").then((msgs) => {
      setMessages(msgs as ExtendedOrderMessage[]);
    });
  }, [orderId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Live 48h countdown interval during Review phase
  useEffect(() => {
    if (phase !== "review" || paymentReleased) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          // Timer reached 0: Auto-release payment!
          handleAutoRelease();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, paymentReleased]);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const phaseIndex = PHASES.findIndex(p => p.id === phase);

  const advancePhase = (targetPhase?: Phase) => {
    const nextPhase = targetPhase ?? (phaseIndex + 1 < PHASES.length ? PHASES[phaseIndex + 1].id : phase);
    setPhase(nextPhase);
    const label = PHASES.find(p => p.id === nextPhase)?.label ?? nextPhase;
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "system",
        text: `Phase advanced to ${label}.`,
        time: "Just now",
      },
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const isImg = file.type.startsWith("image/");
      setStagedFile({
        name: file.name,
        size: `${sizeMb} MB`,
        type: isImg ? "image" : "file",
      });
    }
  };

  // Submit Digital Deliverables (Files)
  const handleSubmitOnlineDeliverable = () => {
    const finalFile = stagedFile ?? { name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" };
    setShowSubmitModal(false);
    advancePhase("review");
    setTimerSeconds(48 * 3600); // 48h window starts
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "talent",
        text: onlineNotes.trim() || "I've submitted the final voice-over recording. Please review within the 48-hour inspection window.",
        time: "Just now",
        attachment: finalFile,
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system",
        text: "48-Hour Inspection Timer started. Escrow will auto-release in 48 hours unless client requests revision or opens dispute.",
        time: "Just now",
      },
    ]);
    setStagedFile(null);
    setOnlineNotes("");
  };

  // Submit Onsite Evidence (Live Appearance Proof)
  const handleSubmitOnsiteEvidence = () => {
    setShowSubmitModal(false);
    advancePhase("review");
    setTimerSeconds(48 * 3600); // 48h window starts
    const evidence: OnsiteEvidence = {
      venue: gigType === "onsite" ? "Comedy night, Eko Hotel" : "Live Event, Victoria Island",
      coords: "6.5244° N, 3.3792° E · Lagos",
      arrivalTime: "7:52 PM, Today",
      checkoutTime: isCheckedOut ? "10:15 PM, Today" : undefined,
      hasPhoto: hasAttachedPhoto,
      method: onsiteMethod,
      pinCode: "4821",
      notes: onsiteNotes.trim() || "Completed live performance as scheduled.",
    };

    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "talent",
        text: onsiteNotes.trim() || "I've submitted verified onsite appearance proof for the live performance. Review window is now open.",
        time: "Just now",
        onsiteEvidence: evidence,
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system",
        text: "Onsite presence verified. 48-Hour Inspection Timer started. Escrow will auto-release in 48 hours if uncontested.",
        time: "Just now",
      },
    ]);
    setOnsiteNotes("");
  };

  // Fast-forward or trigger 48h auto-release
  const handleAutoRelease = () => {
    setShowReleaseModal(false);
    setPaymentReleased(true);
    setPhase("complete");
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "system",
        text: `48-hour inspection window concluded. ₦120,000 has been automatically released from escrow to ${appStateSync.getTalentProfile().name}. Order complete!`,
        time: "Just now",
      },
    ]);
  };

  // Client requests revision
  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) return;
    setShowRevisionModal(false);
    setPhase("deliverables");
    setMessages(prev => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        from: "client",
        text: `Revision Requested: ${revisionNotes.trim()}`,
        time: "Just now",
      },
      {
        id: `local-${prev.length + 2}`,
        from: "system",
        text: "Client requested revisions. 48-hour inspection timer paused. Phase returned to Deliverables.",
        time: "Just now",
      },
    ]);
    setRevisionNotes("");
  };

  const renderOrderInfoContent = () => (
    <>
      {/* Escrow status hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION_MED, ease: EASE_OUT }}
        className="p-5 rounded-2xl mb-5 border"
        style={{
          background: paymentReleased ? "var(--color-success-bg)" : "var(--color-bg-elevated)",
          borderColor: paymentReleased ? "var(--color-success)" : "var(--color-hairline)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "var(--color-bg-surface)",
              color: paymentReleased ? "var(--color-success)" : "var(--color-text-secondary)",
              border: "1px solid var(--color-hairline)",
            }}
          >
            {paymentReleased ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>{paymentReleased ? "Payment Released" : "100% Escrow Locked"}</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">ORD-001</span>
        </div>
        <div className="font-mono tnum text-3xl font-semibold text-zinc-900">₦120,000</div>
        <div className="text-xs text-zinc-500 mt-1">
          {paymentReleased
            ? `Transferred to ${appStateSync.getTalentProfile().name}`
            : "Held securely in Monologg Escrow with 48-Hour Inspection Guarantee"}
        </div>
      </motion.div>

      {/* Booking Mode Context */}
      <div className="mb-5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Service Category</span>
          <span className="font-semibold text-zinc-900 capitalize">
            {gigType === "onsite" ? "Live Standup (Onsite Appearance)" : "Voice-Over (Remote Digital)"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-zinc-500">Location Protocol</span>
          <span className="font-semibold text-zinc-900">
            {gigType === "onsite" ? "Eko Hotel & Suites, Victoria Island" : "Remote Home Studio"}
          </span>
        </div>
      </div>

      {/* Phase progress */}
      <div className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-zinc-400">
          Project Milestones
        </div>
        <div className="space-y-2">
          {PHASES.map((p, i) => {
            const isDone = i < phaseIndex;
            const isActive = p.id === phase;
            return (
              <div
                key={p.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : isDone
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-zinc-50 border-zinc-200/60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 font-semibold ${
                    isActive
                      ? "bg-white text-zinc-900"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isActive ? "text-white" : isDone ? "text-emerald-950" : "text-zinc-700"}`}>
                    {p.label}
                  </div>
                  <div className={`text-xs ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>
                    {p.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Participants */}
      <div className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-zinc-400">
          Participants
        </div>
        <div className="space-y-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
          {[
            { name: appStateSync.getTalentProfile().name, role: "Performer", avatar: appStateSync.getTalentProfile().name.split(/\s+/).map(w => w[0]).join(""), verified: true },
            { name: appStateSync.getClientProfile().orgName || "FilmCraft Studios", role: "Client", avatar: "FS", verified: true },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Avatar size="sm" className="w-8 h-8 text-xs shrink-0 font-medium" background="#18181B" color="#FFFFFF">
                {p.avatar}
              </Avatar>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1 truncate">
                  {p.name} {p.verified && <Shield className="w-3 h-3 text-emerald-600 shrink-0" />}
                </div>
                <div className="text-[11px] text-zinc-500">{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Details */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-zinc-400">
          Financial Breakdown
        </div>
        <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
          {[
            { label: "Order ID", value: "ORD-001" },
            { label: "Base Escrow Deposit", value: "₦120,000" },
            { label: "Platform Fee (0% Talent)", value: "₦0" },
            { label: "Inspection Window", value: "48 Hours (Auto-Release)" },
            { label: "Performer Payout", value: "₦120,000" },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-zinc-500">{item.label}</span>
              <span className="font-medium font-mono tnum text-zinc-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className={`${role === "client" ? "role-client" : "role-talent"} min-h-screen flex flex-col bg-zinc-50`}>
      {/* Clean Executive Navbar */}
      <header className="h-16 flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-40 bg-white border-b border-[var(--color-hairline)] shadow-2xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-all text-zinc-600 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-zinc-900 truncate font-display">
                {gigType === "onsite" ? "Comedy Night, Eko Hotel" : "Nike Campaign VO"}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 shrink-0">
                ORD-001
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${gigType === "onsite" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                {gigType === "onsite" ? "📍 Onsite Event" : "🎧 Remote Deliverable"}
              </span>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5 truncate">
              <span>{appStateSync.getClientProfile().orgName || "FilmCraft Studios"}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="font-mono tnum">₦120,000</span> in escrow
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Gig Type Toggle Demo (Remote vs Onsite) */}
          <div className="hidden md:flex items-center p-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs">
            <button
              onClick={() => {
                setGigType("remote");
                setDeliverableTab("online");
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                gigType === "remote"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Remote
            </button>
            <button
              onClick={() => {
                setGigType("onsite");
                setDeliverableTab("onsite");
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                gigType === "onsite"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Onsite Gig
            </button>
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs">
            <button
              onClick={() => setRole("talent")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                role === "talent"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Performer
            </button>
            <button
              onClick={() => setRole("client")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                role === "client"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Client
            </button>
          </div>

          {/* Order Info Button */}
          <button
            onClick={() => setShowOrderInfoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 transition-all active:scale-95 border border-zinc-200/60"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Order Info</span>
          </button>
        </div>
      </header>

      {/* Phase Milestones Stepper */}
      <div className="bg-white border-b border-[var(--color-hairline)] px-4 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-6 min-w-max text-xs">
            {PHASES.map((p, idx) => {
              const isDone = idx < phaseIndex;
              const isActive = p.id === phase;
              return (
                <div key={p.id} className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold font-mono ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                    }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-xs ${
                      isActive
                        ? "font-semibold text-zinc-900"
                        : isDone
                        ? "text-zinc-600 font-medium"
                        : "text-zinc-400"
                    }`}
                  >
                    {p.label}
                  </span>
                  {idx < PHASES.length - 1 && (
                    <span className="text-zinc-300 ml-1.5">›</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 48h Inspection Window Indicator when active */}
          {phase === "review" && !paymentReleased && (
            <div className="flex items-center gap-2 pl-4 border-l border-zinc-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {formatCountdown(timerSeconds)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Main Chat Thread */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map(msg => {
              if (msg.from === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="px-3.5 py-1.5 rounded-full text-xs font-body flex items-center gap-1.5 bg-zinc-100 text-zinc-600 border border-zinc-200/80 shadow-2xs text-center max-w-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }
              const isMe = msg.from === role;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION_MED, ease: EASE_OUT }}
                  className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar
                    size="sm"
                    className="w-8 h-8 text-xs shrink-0 mt-0.5 font-medium"
                    background={isMe ? "#18181B" : "#F4F4F5"}
                    color={isMe ? "#FFFFFF" : "#18181B"}
                  >
                    {msg.from === "talent"
                      ? appStateSync.getTalentProfile().name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("")
                      : "BN"}
                  </Avatar>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-sm font-body leading-relaxed shadow-2xs ${
                        isMe
                          ? "bg-zinc-900 text-white rounded-br-sm"
                          : "bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Digital File Attachment */}
                      {msg.attachment && (
                        <div
                          className={`mt-2.5 p-2.5 rounded-xl flex items-center gap-2.5 border transition-colors ${
                            isMe
                              ? "bg-white/10 border-white/15 text-white"
                              : "bg-zinc-50 border-zinc-200/80 text-zinc-900"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-white/15 text-white" : "bg-zinc-200/70 text-zinc-700"}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="font-medium truncate">{msg.attachment.name}</div>
                            <div className={isMe ? "text-zinc-300" : "text-zinc-500"}>
                              {msg.attachment.size}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isMe ? "hover:bg-white/20 text-white" : "hover:bg-zinc-200 text-zinc-600"}`}
                            title="Download file"
                          >
                            <Download className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      )}

                      {/* Onsite Evidence Card in Chat Thread */}
                      {msg.onsiteEvidence && (
                        <div className={`mt-3 p-3.5 rounded-xl border ${isMe ? "bg-white/10 border-white/20 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"}`}>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Onsite Live Appearance Proof</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300">
                              Verified
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="font-semibold text-sm">{msg.onsiteEvidence.venue}</div>
                            <div className="flex items-center gap-2 text-[11px] opacity-80">
                              <span>📍 {msg.onsiteEvidence.coords}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-1 text-[11px]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-400" /> Arrived: {msg.onsiteEvidence.arrivalTime}
                              </span>
                              {msg.onsiteEvidence.checkoutTime && (
                                <span className="flex items-center gap-1">
                                  ✓ Checked out: {msg.onsiteEvidence.checkoutTime}
                                </span>
                              )}
                            </div>
                            {msg.onsiteEvidence.method === "pin" && (
                              <div className="mt-2 p-2 rounded-lg bg-black/20 text-xs flex items-center justify-between">
                                <span className="opacity-80">PIN Handshake Verified</span>
                                <span className="font-mono font-bold tracking-widest text-emerald-400">
                                  {msg.onsiteEvidence.pinCode}
                                </span>
                              </div>
                            )}
                            {msg.onsiteEvidence.hasPhoto && (
                              <div className="mt-2.5 p-2 rounded-lg bg-black/20 flex items-center gap-2 text-xs">
                                <Camera className="w-4 h-4 text-emerald-400" />
                                <span>Stage & Backstage Appearance Photo Attached</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-[10px] font-body mt-1 px-1 text-zinc-400 ${
                        isMe ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Phase 1: Briefing Confirmation Banner */}
          {phase === "briefing" && role === "client" && (
            <div className="p-4 mx-4 mb-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-200 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">Confirm Project Brief</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Confirm the requirements so the performer can begin recording or prepare for the live event</div>
                </div>
              </div>
              <Button className="h-9 px-4 text-xs font-semibold shrink-0" onClick={() => advancePhase("deliverables")}>
                Confirm Brief
              </Button>
            </div>
          )}

          {/* Phase 2: Deliverables Ready for Submission Banner */}
          {phase === "deliverables" && role === "talent" && (
            <div className="p-4 mx-4 mb-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-200 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-800">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    Submit Project Deliverables
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                      Step 2 of 4
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {gigType === "onsite"
                      ? "Submit your live appearance evidence (GPS check-in/out or PIN handshake)"
                      : "Upload your completed audio or media deliverables to begin the 48-hour client review window"}
                  </div>
                </div>
              </div>
              <Button
                className="h-10 px-5 text-xs font-semibold shrink-0 gap-1.5 shadow-2xs"
                onClick={() => setShowSubmitModal(true)}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Submit Deliverable</span>
              </Button>
            </div>
          )}

          {/* Phase 3: 48-Hour Inspection Window Banner (For Client & Performer) */}
          {phase === "review" && !paymentReleased && (
            <div className="p-4 mx-4 mb-3 rounded-2xl bg-gradient-to-r from-amber-50/90 to-amber-100/60 border border-amber-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500 text-white shadow-2xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-950 flex items-center gap-2">
                      <span>48-Hour Inspection Window Active</span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                        ⏱ {formatCountdown(timerSeconds)}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      {role === "client"
                        ? "Review the submitted deliverables or live appearance proof. ₦120,000 will automatically release to the performer upon timer expiry unless contested."
                        : "Your deliverables are under 48-hour client review. If uncontested, ₦120,000 will automatically transfer to your account upon timer expiry."}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {role === "client" ? (
                    <>
                      <button
                        onClick={() => setShowRevisionModal(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 transition-all"
                      >
                        Request Revision
                      </button>
                      <Button
                        className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        onClick={() => setShowReleaseModal(true)}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Release ₦120,000</span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Demo tool to fast-forward countdown */}
                      <button
                        onClick={handleAutoRelease}
                        title="Simulate 48h timer expiry for demo"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors flex items-center gap-1"
                      >
                        <FastForward className="w-3 h-3" />
                        <span>Test Auto-Release</span>
                      </button>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                        100% Escrow Secured
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Phase 4: Payment Released Confirmation */}
          {paymentReleased && (
            <div className="p-4 mx-4 mb-3 rounded-2xl text-center bg-emerald-50 border border-emerald-200 shadow-2xs">
              <div className="text-sm font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Released Successfully!</span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                ₦120,000 has been transferred from escrow to {appStateSync.getTalentProfile().name}. Both parties have completed all requirements.
              </p>
            </div>
          )}

          {/* Message Input Dock */}
          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-[var(--color-hairline)]">
            <div className="flex items-center gap-2">
              <button
                aria-label="Attach file or onsite evidence"
                onClick={() => {
                  if (role === "talent") {
                    setShowSubmitModal(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 transition-all border border-zinc-200/60"
                title="Submit deliverable or attach proof"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-body resize-none border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
                  rows={1}
                  placeholder={`Message ${role === "talent" ? appStateSync.getClientProfile().orgName || "FilmCraft Studios" : appStateSync.getTalentProfile().name}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ lineHeight: "1.5" }}
                />
              </div>
              <Button
                aria-label="Send message"
                className="w-11 h-11 p-0 shrink-0 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
                onClick={sendMessage}
                disabled={!inputText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Footer Metadata & Guardrail */}
            <div className="flex items-center justify-between mt-2.5 px-1">
              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Auto-releases in 48h if uncontested · 100% Escrow Protected</span>
              </p>
              <button
                className="text-xs text-zinc-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                onClick={() => setShowDisputeModal(true)}
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Raise Dispute</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Release Payment Modal (Client Approval) */}
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
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-center mb-1.5 text-zinc-900">
                Release Escrow Payment?
              </h3>
              <p className="text-sm font-body text-center mb-5 text-zinc-500">
                This will release <strong>₦120,000</strong> from Monologg Escrow to {appStateSync.getTalentProfile().name}. This action concludes the order.
              </p>
              <div className="p-4 rounded-xl mb-5 bg-zinc-50 border border-zinc-200/80 text-xs">
                <div className="flex justify-between font-body text-zinc-600">
                  <span>Escrow Total</span>
                  <span className="font-mono tnum font-semibold text-zinc-900">₦120,000</span>
                </div>
                <div className="flex justify-between font-body mt-1.5 text-zinc-500">
                  <span>Platform Fee (0% Talent)</span>
                  <span className="font-mono tnum text-zinc-400">₦0</span>
                </div>
                <div className="h-px my-2.5 bg-zinc-200" />
                <div className="flex justify-between text-sm font-semibold font-body">
                  <span className="text-zinc-900">Performer Payout</span>
                  <span className="font-mono tnum text-emerald-600">₦120,000</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-11 text-sm font-medium" onClick={() => setShowReleaseModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleAutoRelease}
                >
                  Confirm Release
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Redesigned Submit Deliverables & Onsite Evidence Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <Modal onClose={() => setShowSubmitModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl p-6 bg-white border border-zinc-200 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header with Title and Mode Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-zinc-900">
                    {deliverableTab === "onsite" ? "Submit Onsite Evidence" : "Submit Deliverables"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {deliverableTab === "onsite"
                      ? "Proof of your live appearance. Auto-releases in 48h if uncontested."
                      : "Upload final files for client review. Auto-releases in 48h if uncontested."}
                  </p>
                </div>
                <button
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"
                  onClick={() => setShowSubmitModal(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segmented Deliverables Mode Switcher */}
              <div className="p-1 rounded-xl bg-zinc-100 flex items-center gap-1 mb-5">
                <button
                  onClick={() => setDeliverableTab("online")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    deliverableTab === "online"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Online / Digital Files</span>
                </button>
                <button
                  onClick={() => setDeliverableTab("onsite")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    deliverableTab === "onsite"
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Onsite Live Appearance</span>
                </button>
              </div>

              {/* TAB 1: Online Digital Files */}
              {deliverableTab === "online" && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".mp3,.mp4,.wav,.pdf,.zip,audio/*,video/*,application/pdf"
                    onChange={handleFileChange}
                  />

                  {stagedFile ? (
                    <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-900 truncate">{stagedFile.name}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                            <span>{stagedFile.size}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Ready for review</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setStagedFile(null)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 transition-colors shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        } else {
                          setStagedFile({ name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" });
                        }
                      }}
                      className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col items-center justify-center p-8 mb-4 cursor-pointer bg-zinc-50/60 hover:bg-zinc-50 transition-all text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-zinc-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6 text-zinc-700" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-800">
                        Drag & drop your files, or <span className="text-zinc-900 underline underline-offset-2">browse</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        MP3, MP4, WAV, PDF, ZIP — Max 500MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStagedFile({ name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" });
                        }}
                        className="mt-3 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 underline"
                      >
                        Or load demo deliverable (Nike_VO_Final_v1.mp3)
                      </button>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Submission Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-body border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 resize-none"
                      rows={3}
                      value={onlineNotes}
                      onChange={e => setOnlineNotes(e.target.value)}
                      placeholder="Add notes about your submission (e.g. revision notes, take variations, delivery format)..."
                    />
                  </div>
                </>
              )}

              {/* TAB 2: Onsite Live Appearance Proof */}
              {deliverableTab === "onsite" && (
                <div>
                  {/* Real-time GPS and Timestamp Badges (from design) */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>6.5244° N, 3.3792° E · Lagos</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>7:52 PM, Today</span>
                    </div>
                  </div>

                  {/* Two Onsite Verification Option Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Option 1: Check-in and check-out (Recommended) */}
                    <div
                      onClick={() => setOnsiteMethod("checkin")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        onsiteMethod === "checkin"
                          ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Recommended
                        </span>
                      </div>
                      <div className="text-sm font-bold text-zinc-900 mb-1">Check-in & Check-out</div>
                      <div className="text-xs text-zinc-500 mb-3">
                        <div className="font-semibold text-zinc-800">Comedy night, Eko Hotel</div>
                        <div>Sat, 8:00 PM</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Arrived 7:52 PM, location verified</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCheckedOut(!isCheckedOut);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          isCheckedOut
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        {isCheckedOut ? "✓ Checked out 10:15 PM" : "Check out"}
                      </button>

                      <div className="mt-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHasAttachedPhoto(!hasAttachedPhoto);
                          }}
                          className={`text-xs flex items-center gap-1 transition-colors ${
                            hasAttachedPhoto ? "text-emerald-700 font-semibold" : "text-zinc-500 hover:text-zinc-800"
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{hasAttachedPhoto ? "✓ Photo attached" : "Add stage photo (optional)"}</span>
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-zinc-100 text-[10px] text-zinc-400 space-y-0.5">
                        <div>Talent effort: two taps</div>
                        <div>Proof: strong, automatic</div>
                      </div>
                    </div>

                    {/* Option 2: PIN Handshake (High-value bookings) */}
                    <div
                      onClick={() => setOnsiteMethod("pin")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        onsiteMethod === "pin"
                          ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          High-value bookings
                        </span>
                      </div>
                      <div className="text-sm font-bold text-zinc-900 mb-1">PIN Handshake</div>
                      <div className="text-xs text-zinc-500 mb-2">Your start code</div>

                      {/* 4-digit PIN code boxes */}
                      <div className="flex items-center gap-2 mb-3">
                        {["4", "8", "2", "1"].map((digit, i) => (
                          <div
                            key={i}
                            className="flex-1 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center font-mono font-bold text-lg text-zinc-900 shadow-2xs"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-zinc-500 leading-tight mb-2.5">
                        Your client contact enters this on site to confirm you've arrived and performed.
                      </p>

                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ready for client handshake</span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-zinc-100 text-[10px] text-zinc-400 space-y-0.5">
                        <div>Talent effort: one ask on site</div>
                        <div>Proof: strongest, needs client</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Performance Summary & Set Notes
                    </label>
                    <textarea
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-body border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 resize-none"
                      rows={2}
                      value={onsiteNotes}
                      onChange={e => setOnsiteNotes(e.target.value)}
                      placeholder="e.g. Delivered 45-minute headline comedy set as contracted. Full venue audience."
                    />
                  </div>
                </div>
              )}

              {/* Escrow 48h Auto-Release Reassurance */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 mb-5 flex items-start gap-2.5 text-xs text-zinc-600">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>48-Hour Auto-Release Guarantee:</strong> Submitting evidence begins the 48-hour client review timer. Funds auto-release to your bank if uncontested.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 h-11 text-sm font-medium"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 text-sm font-semibold"
                  onClick={deliverableTab === "onsite" ? handleSubmitOnsiteEvidence : handleSubmitOnlineDeliverable}
                >
                  {deliverableTab === "onsite" ? "Submit Onsite Proof →" : "Submit Deliverables →"}
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Client Request Revisions Modal */}
      <AnimatePresence>
        {showRevisionModal && (
          <Modal onClose={() => setShowRevisionModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 bg-white border border-zinc-200 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  <h3 className="font-display text-lg font-semibold text-zinc-900">Request Revisions</h3>
                </div>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-500 mb-4">
                Requesting revisions pauses the 48-hour auto-release timer and returns the order to the performer for adjustments.
              </p>

              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-body border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 resize-none mb-5"
                rows={4}
                value={revisionNotes}
                onChange={e => setRevisionNotes(e.target.value)}
                placeholder="Specify the adjustments needed (e.g. please re-record line 4 with more enthusiasm, or provide additional event photo)..."
              />

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-11 text-sm font-medium" onClick={() => setShowRevisionModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleRequestRevision}
                  disabled={!revisionNotes.trim()}
                >
                  Send Revision Request
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
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50 text-amber-600 border border-amber-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-center mb-1.5 text-zinc-900">Raise a Dispute</h3>
              <p className="text-sm font-body text-center mb-4 text-zinc-500">
                Our support team will mediate. Escrow funds will remain locked until a resolution is reached.
              </p>
              <textarea
                className="w-full px-4 py-3 rounded-xl text-sm font-body border border-zinc-200 bg-zinc-50 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                rows={4}
                placeholder="Describe the issue in detail..."
              />
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-11 text-sm font-medium" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1 h-11 text-sm font-semibold" onClick={() => setShowDisputeModal(false)}>
                  Submit Dispute
                </Button>
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
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl p-6 max-h-[85vh] overflow-y-auto bg-white border border-zinc-200 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                <div>
                  <h3 className="font-display text-lg font-semibold text-zinc-900">Order Information</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {gigType === "onsite" ? "Comedy Night, Eko Hotel" : "Nike Campaign VO"} · ORD-001
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderInfoModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderOrderInfoContent()}
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
