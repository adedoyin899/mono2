import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Avatar } from "../components/ui/Avatar";
import { useTheme } from "../Root";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import { apiClient } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import type { OrderMessage } from "@monologg/types";
import {
  ChevronLeft, Shield, Send, Paperclip, CheckCircle2,
  Lock, FileText, Download, AlertTriangle,
  UploadCloud, X, Sun, Moon, DollarSign
} from "lucide-react";

type Phase = "briefing" | "deliverables" | "review" | "complete";
type UserRole = "talent" | "client";

// Same shape as @monologg/types' OrderMessage — aliased locally so the rest
// of this file's `Message` references didn't need touching.
type Message = OrderMessage;

const PHASES: { id: Phase; label: string; desc: string }[] = [
  { id: "briefing", label: "Briefing", desc: "Review and confirm the project brief" },
  { id: "deliverables", label: "Deliverables", desc: "Submit and review work" },
  { id: "review", label: "Review", desc: "Client approves final work" },
  { id: "complete", label: "Complete", desc: "Payment released to talent" },
];

export function OrderRoom() {
  const [phase, setPhase] = useState<Phase>("deliverables");
  const [role, setRole] = useState<UserRole>("talent");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [paymentReleased, setPaymentReleased] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const { id: orderId } = useParams();

  useEffect(() => {
    apiClient.getOrderMessages(orderId ?? "unknown").then(setMessages);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    // Live mode: persist for real and use the server's own message (real id/time).
    // Mock mode: append optimistically, exactly as before this phase.
    const sent = orderId ? await apiClient.sendOrderMessage(orderId, text) : null;
    const newMsg: Message = sent ?? {
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

  const advancePhase = () => {
    const nextIndex = phaseIndex + 1;
    if (nextIndex < PHASES.length) {
      const nextPhase = PHASES[nextIndex].id;
      setPhase(nextPhase);
      setMessages(prev => [
        ...prev,
        {
          id: `local-${prev.length + 1}`,
          from: "system",
          text: `Phase advanced to ${PHASES[nextIndex].label}.`,
          time: "Just now",
        },
      ]);
    }
  };

  return (
    <div className="role-talent min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      {/* Header */}
      <div
        className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel"
        style={{ borderBottom: "1px solid var(--color-hairline)" }}
      >
        <button aria-label="Go back" onClick={() => navigate(-1)} className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate font-display" style={{ color: "var(--color-text-primary)" }}>
            Nike Campaign VO
          </div>
          <div className="text-xs font-body flex items-center gap-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            <Lock className="w-3 h-3" style={{ color: "var(--color-accent)" }} />
            <span className="font-mono tnum">₦120,000</span> in escrow
          </div>
        </div>

        {/* Role toggle for demo */}
        <div className="flex p-0.5 rounded-[var(--radius-full)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
          {(["talent", "client"] as UserRole[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-medium font-body capitalize transition-all active:scale-95"
              style={{
                background: role === r ? "var(--color-accent)" : "transparent",
                color: role === r ? "var(--color-accent-on)" : "var(--color-text-secondary)",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <button aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle} className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">

        {/* Sidebar — Order Info */}
        <div
          className="lg:w-80 shrink-0 p-4 lg:p-5 lg:border-r overflow-y-auto"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-surface)" }}
        >
          {/* Escrow status hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION_MED, ease: EASE_OUT }}
            className="p-5 rounded-[var(--radius-xl)] mb-5"
            style={{
              background: paymentReleased ? "var(--color-success-bg)" : "var(--color-accent-soft)",
              border: `1px solid ${paymentReleased ? "var(--color-success)" : "var(--color-accent)"}`,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] mb-3"
              style={{ background: "var(--color-bg-surface)", color: paymentReleased ? "var(--color-success)" : "var(--color-accent)" }}
            >
              {paymentReleased
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <Lock className="w-3.5 h-3.5" />}
              <span className="text-xs font-semibold font-body">
                {paymentReleased ? "Payment Released" : "Escrow Locked"}
              </span>
            </div>
            <div className="font-mono tnum text-3xl font-semibold" style={{ color: "var(--color-text-primary)" }}>₦120,000</div>
            <div className="text-xs font-body mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {paymentReleased ? `Transferred to ${appStateSync.getTalentProfile().name}` : "Held securely until project complete"}
            </div>
          </motion.div>

          {/* Phase progress */}
          <div className="mb-4">
            <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>
              Project Phases
            </div>
            <div className="space-y-2">
              {PHASES.map((p, i) => {
                const isDone = i < phaseIndex;
                const isActive = p.id === phase;
                return (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-md)]"
                    style={{
                      background: isActive ? "var(--color-accent-soft)" : isDone ? "var(--color-success-bg)" : "var(--color-bg-elevated)",
                      border: `1px solid ${isActive ? "var(--color-accent)" : isDone ? "var(--color-success)" : "var(--color-hairline)"}`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono tnum shrink-0 mt-0.5"
                      style={{
                        background: isDone ? "var(--color-success)" : isActive ? "var(--color-accent)" : "var(--color-bg-surface)",
                        color: isDone ? "#FFFFFF" : isActive ? "var(--color-accent-on)" : "var(--color-text-tertiary)",
                        fontWeight: isActive ? 700 : undefined,
                      }}
                    >
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold font-body" style={{ color: isActive ? "var(--color-accent)" : isDone ? "var(--color-success)" : "var(--color-text-secondary)" }}>
                        {p.label}
                      </div>
                      <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{p.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participants */}
          <div className="mb-4">
            <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>
              Participants
            </div>
            <div className="space-y-2">
              {[
                { name: appStateSync.getTalentProfile().name, role: "Talent", avatar: appStateSync.getTalentProfile().name.split(/\s+/).map(w => w[0]).join(""), verified: true },
                { name: appStateSync.getClientProfile().orgName || "FilmCraft Studios", role: "Client", avatar: "FS", verified: true },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Avatar size="sm" className="text-xs" background="var(--color-accent-soft)" color="var(--color-accent)">
                    {p.avatar}
                  </Avatar>
                  <div>
                    <div className="text-xs font-semibold font-body flex items-center gap-1" style={{ color: "var(--color-text-primary)" }}>
                      {p.name} {p.verified && <Shield className="w-3 h-3" style={{ color: "var(--color-success)" }} />}
                    </div>
                    <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order details */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>
              Order Details
            </div>
            <div className="space-y-1.5 text-xs font-body">
              {[
                { label: "Order ID", value: "ORD-001" },
                { label: "Service", value: "Commercial Voice-Over" },
                { label: "Base Rate", value: "₦108,000" },
                { label: "Platform Fee (9%)", value: "₦12,000" },
                { label: "Deadline", value: "Dec 18, 2024" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span style={{ color: "var(--color-text-tertiary)" }}>{item.label}</span>
                  <span className="font-medium font-mono tnum" style={{ color: "var(--color-text-secondary)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main — Chat */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              if (msg.from === "system") {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <div
                      className="px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-body flex items-center gap-1.5"
                      style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)", border: "1px solid var(--color-hairline)" }}
                    >
                      <CheckCircle2 className="w-3 h-3" style={{ color: "var(--color-success)" }} />
                      {msg.text}
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
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar size="sm" className="w-8 h-8 text-xs" background="var(--color-accent-soft)" color="var(--color-accent)">
                    {msg.from === "talent" ? appStateSync.getTalentProfile().name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("") : "BN"}
                  </Avatar>
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className="px-4 py-3 text-sm font-body leading-relaxed"
                      style={{
                        background: isMe ? "var(--color-accent)" : "var(--color-bg-surface)",
                        color: isMe ? "var(--color-accent-on)" : "var(--color-text-primary)",
                        borderRadius: isMe ? "18px 6px 18px 18px" : "6px 18px 18px 18px",
                        border: isMe ? undefined : "1px solid var(--color-hairline)",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      {msg.text}
                    </div>
                    {msg.attachment && (
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: isMe ? "var(--color-accent)" : "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
                      >
                        <FileText className="w-4 h-4" style={{ color: isMe ? "var(--color-accent-on)" : "var(--color-accent)" }} />
                        <div>
                          <div className="text-xs font-semibold font-body" style={{ color: isMe ? "var(--color-text-inverse)" : "var(--color-text-primary)" }}>
                            {msg.attachment.name}
                          </div>
                          <div className="text-xs font-body" style={{ color: isMe ? "rgba(255,255,255,0.7)" : "var(--color-text-tertiary)" }}>
                            {msg.attachment.size}
                          </div>
                        </div>
                        <Download className="w-3.5 h-3.5 ml-2" style={{ color: isMe ? "var(--color-text-inverse)" : "var(--color-text-tertiary)" }} />
                      </div>
                    )}
                    <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>{msg.time}</div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Phase action banner */}
          {phase !== "complete" && !paymentReleased && (
            <div
              className="mx-4 mb-2 p-3.5 rounded-[var(--radius-lg)] flex items-center gap-3"
              style={{ background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold font-body" style={{ color: "var(--color-accent)" }}>
                  {phase === "briefing" && (role === "talent" ? "Confirm you've reviewed the brief to advance" : "Awaiting talent confirmation")}
                  {phase === "deliverables" && (role === "talent" ? "Submit your deliverable to enter review" : "Awaiting talent submission")}
                  {phase === "review" && (role === "client" ? "Approve work to release escrow payment" : "Awaiting client review")}
                </div>
                <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                  Current Phase: {PHASES[phaseIndex]?.label}
                </div>
              </div>
              {((phase === "briefing" && role === "talent") || (phase === "deliverables" && role === "talent") || (phase === "review" && role === "client")) && (
                <Button
                  className="h-8 px-3 text-xs shrink-0"
                  onClick={() => {
                    if (phase === "deliverables") {
                      setShowSubmitModal(true);
                    } else if (phase === "review") {
                      setShowReleaseModal(true);
                    } else {
                      advancePhase();
                    }
                  }}
                >
                  {phase === "briefing" && "Confirm Brief"}
                  {phase === "deliverables" && "Submit Deliverable"}
                  {phase === "review" && "Release Payment"}
                </Button>
              )}
            </div>
          )}

          {paymentReleased && (
            <div className="mx-4 mb-2 p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)" }}>
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--color-success)" }} />
              <div className="text-sm font-body" style={{ color: "var(--color-success)" }}>
                <strong>Payment Released!</strong> ₦120,000 has been transferred to {appStateSync.getTalentProfile().name}. Thank you for using Monologg.
              </div>
            </div>
          )}

          {/* Input */}
          <div
            className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            style={{ borderTop: "1px solid var(--color-hairline)", background: "var(--color-bg-surface)" }}
          >
            <div className="flex items-end gap-2">
              <button aria-label="Attach file" className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 hover:opacity-80 active:scale-95 transition-all" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)", color: "var(--color-text-secondary)" }}>
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] text-sm font-body resize-none border"
                  rows={1}
                  placeholder={`Message ${role === "talent" ? appStateSync.getClientProfile().orgName : appStateSync.getTalentProfile().name}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    background: "var(--color-bg-elevated)",
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-text-primary)",
                    lineHeight: "1.5",
                  }}
                />
              </div>
              <Button aria-label="Send message" className="w-11 h-11 p-0 shrink-0" onClick={sendMessage} disabled={!inputText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Dispute link */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                Auto-release in 5 days if no action taken
              </p>
              <button
                className="text-xs font-body hover:underline flex items-center gap-1"
                style={{ color: "var(--color-error)" }}
                onClick={() => setShowDisputeModal(true)}
              >
                <AlertTriangle className="w-3 h-3" /> Raise Dispute
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Release Payment Modal */}
      <AnimatePresence>
        {showReleaseModal && (
          <Modal onClose={() => setShowReleaseModal(false)} strength="strong">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-success-bg)" }}>
                <DollarSign className="w-7 h-7" style={{ color: "var(--color-success)" }} />
              </div>
              <h3 className="font-display text-xl text-center mb-2" style={{ color: "var(--color-text-primary)" }}>Release Payment?</h3>
              <p className="text-sm font-body text-center mb-5" style={{ color: "var(--color-text-secondary)" }}>
                This will release <strong>₦120,000</strong> from escrow to {appStateSync.getTalentProfile().name}. This action cannot be undone.
              </p>
              <div className="p-4 rounded-[var(--radius-lg)] mb-5" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                <div className="flex justify-between text-sm font-body">
                  <span style={{ color: "var(--color-text-secondary)" }}>Escrow Total</span>
                  <span className="font-mono tnum" style={{ color: "var(--color-text-primary)" }}>₦120,000</span>
                </div>
                <div className="flex justify-between text-sm font-body mt-1.5">
                  <span style={{ color: "var(--color-text-secondary)" }}>Platform Fee</span>
                  <span className="font-mono tnum" style={{ color: "var(--color-error)" }}>−₦12,000</span>
                </div>
                <div className="h-px my-3" style={{ background: "var(--color-hairline)" }} />
                <div className="flex justify-between text-sm font-semibold font-body">
                  <span style={{ color: "var(--color-text-primary)" }}>Talent Receives</span>
                  <span className="font-mono tnum" style={{ color: "var(--color-success)" }}>₦108,000</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => setShowReleaseModal(false)}>Cancel</Button>
                <Button className="flex-1 h-11 text-sm" onClick={() => {
                  setShowReleaseModal(false);
                  setPaymentReleased(true);
                  setPhase("complete");
                  setMessages(prev => [...prev, {
                    id: `local-${prev.length + 1}`, from: "system",
                    text: `Payment of ₦108,000 has been released to ${appStateSync.getTalentProfile().name}. Order complete!`,
                    time: "Just now",
                  }]);
                }}>
                  Confirm Release
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Submit Deliverable Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <Modal onClose={() => setShowSubmitModal(false)} align="end" strength="strong">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-5"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>Submit Deliverable</h3>
                <button aria-label="Close modal" className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }} onClick={() => setShowSubmitModal(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 mb-4 cursor-pointer hover:opacity-80"
                style={{ borderColor: "var(--color-hairline)", background: "var(--color-bg-elevated)" }}
              >
                <UploadCloud className="w-10 h-10 mb-3" style={{ color: "var(--color-text-tertiary)" }} />
                <p className="text-sm font-body text-center" style={{ color: "var(--color-text-secondary)" }}>
                  Drag & drop your file, or click to browse
                </p>
                <p className="text-xs font-body mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                  MP3, MP4, WAV, PDF, ZIP — Max 500MB
                </p>
              </div>

              <textarea
                className="w-full px-4 py-3 rounded-xl text-sm font-body border mb-4 resize-none"
                rows={3}
                placeholder="Add notes about this submission (optional)..."
                style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
              />

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                <Button className="flex-1 h-11 text-sm" onClick={() => {
                  setShowSubmitModal(false);
                  advancePhase();
                  setMessages(prev => [...prev, {
                    id: `local-${prev.length + 1}`, from: "talent",
                    text: "I've submitted the final voice-over recording. Please review and let me know if any revisions are needed.",
                    time: "Just now",
                    attachment: { name: "Nike_VO_Final_v1.mp3", size: "8.4 MB", type: "file" },
                  }]);
                }}>
                  Submit
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
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-error-bg)" }}>
                <AlertTriangle className="w-6 h-6" style={{ color: "var(--color-error)" }} />
              </div>
              <h3 className="font-display text-xl text-center mb-2" style={{ color: "var(--color-text-primary)" }}>Raise a Dispute</h3>
              <p className="text-sm font-body text-center mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Our support team will mediate. Escrow funds will remain locked until a resolution is reached.
              </p>
              <textarea
                className="w-full px-4 py-3 rounded-xl text-sm font-body border mb-4 resize-none"
                rows={4}
                placeholder="Describe the issue in detail..."
                style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
              />
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-11 text-sm" onClick={() => setShowDisputeModal(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1 h-11 text-sm" onClick={() => setShowDisputeModal(false)}>
                  Submit Dispute
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
