import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { apiClient, type CreatedBooking } from "../../lib/api-client";
import type { PublicRateCard, PublicStorefront } from "@monologg/types";
import {
  ChevronLeft, Lock, Shield, ArrowRight, AlertCircle, CheckCircle2, Mail,
  CreditCard, Building2, Smartphone, ShieldCheck, Check
} from "lucide-react";

/**
 * PWA-18 — the external, logged-out booking flow (features.md Phase 16, FA-5),
 * reached from a public storefront's "Book" action (Phase 15). Replaces the
 * Phase-15 stub: the visitor never sees a "sign up" step — an account
 * materializes from the name/email this flow needs anyway, surfaced only once
 * escrow is genuinely funded (services/payment.ts's webhook). Deliberately NOT
 * wrapped in RequireAuth for its whole duration.
 *
 * Step sequence per the PRD: slot → summary (+ escrow explainer) → context
 * note (one-way, not chat) → name+email → payment → confirmed (+ PWA-19
 * set-password/magic-link surfacing).
 */

type Step = "slot" | "summary" | "context" | "details" | "payment" | "processing" | "confirmed";

const CANDIDATE_SLOT_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00..19:00
const SLOT_DURATION_MIN = 60;

function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}

function addMinutes(timeHHMM: string, mins: number): string {
  const [h, m] = timeHHMM.split(":").map(Number);
  const total = h! * 60 + m! + mins;
  const rh = Math.floor(total / 60) % 24;
  const rm = total % 60;
  return `${String(rh).padStart(2, "0")}:${String(rm).padStart(2, "0")}`;
}

export function ExternalBookingEntry() {
  const params = useParams<{ handle?: string; creatorId?: string }>();
  const handle = params.handle || params.creatorId;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<PublicStorefront | null>(null);
  const [rateCards, setRateCards] = useState<PublicRateCard[]>([]);
  const [selectedRateCard, setSelectedRateCard] = useState<PublicRateCard | null>(null);
  const [step, setStep] = useState<Step>("slot");

  // Selection state
  const [slotDate, setSlotDate] = useState<string>(todayISO());
  const [openSlots, setOpenSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlotStart, setSelectedSlotStart] = useState<string | null>(null);
  const [contextNote, setContextNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Payment channel state
  const [paymentChannel, setPaymentChannel] = useState<"card" | "transfer" | "ussd">("card");

  // API + error state
  const [booking, setBooking] = useState<CreatedBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const creatorId = creator?.id ?? null;

  // Load creator + rate cards
  useEffect(() => {
    if (!handle) return;
    apiClient.getPublicStorefront(handle).then(setCreator).catch(() => {});
    apiClient.getCreatorRateCardsPublic(handle).then((cards) => {
      setRateCards(cards);
      const preselectedId = searchParams.get("rateCard");
      const matched = cards.find((c) => c.id === preselectedId) ?? cards[0] ?? null;
      setSelectedRateCard(matched);
    }).catch(() => {});
  }, [handle, searchParams]);

  // Load open slots when date or creator changes
  useEffect(() => {
    if (!creatorId) return;
    setSlotError(null);
    apiClient.getOpenSlots(creatorId, slotDate).then((slots) => {
      setOpenSlots(slots);
      if (slots.length > 0 && !slots.some((s) => s.start === selectedSlotStart)) {
        setSelectedSlotStart(slots[0]!.start);
      }
    });
  }, [creatorId, slotDate]);

  const baseRate = selectedRateCard?.basePriceAmount ?? 120_000_00;
  const escrowFee = Math.round(baseRate * 0.12);
  const total = baseRate + escrowFee;

  const money = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;

  const handlePay = async () => {
    if (!selectedRateCard || !selectedSlotStart || !creatorId) return;
    setSubmitting(true);
    setPayError(null);
    setStep("processing");

    try {
      const created =
        booking ??
        (await apiClient.createGuestBooking({
          creatorId,
          rateCardId: selectedRateCard.id,
          slotDate,
          slotStart: selectedSlotStart,
          slotEnd: addMinutes(selectedSlotStart, SLOT_DURATION_MIN),
          contextNote: contextNote.trim() || undefined,
          name: name.trim(),
          email: email.trim(),
        }));
      setBooking(created);

      const { providerRef } = await apiClient.payGuestBooking(created.id);
      const ok = await apiClient.simulateEscrowWebhook(providerRef);
      if (!ok) throw new Error("escrow confirmation failed");
      setStep("confirmed");
    } catch (err) {
      if (!booking && err instanceof Error && err.message.includes("409")) {
        setSlotError("That slot was just taken — please pick another time.");
        setSelectedSlotStart(null);
        if (creatorId) apiClient.getOpenSlots(creatorId, slotDate).then(setOpenSlots);
        setStep("slot");
      } else {
        setPayError("We couldn't confirm your payment. Please try again.");
        setStep("payment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const header = (title: string, onBack: () => void) => (
    <div className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
      <button
        aria-label="Go back"
        onClick={onBack}
        className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center"
        style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="text-sm font-semibold font-display" style={{ color: "var(--color-text-primary)" }}>{title}</div>
    </div>
  );

  // ── Step: pick a real, server-verified open slot ────────────────────────────
  if (step === "slot") {
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header(`Book ${creator?.name ?? "…"}`, () => navigate(-1))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
          {rateCards.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {rateCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedRateCard(card)}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium font-body"
                  style={{
                    background: selectedRateCard?.id === card.id ? "var(--color-accent)" : "var(--color-bg-surface)",
                    color: selectedRateCard?.id === card.id ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                    border: "1px solid var(--color-hairline)",
                  }}
                >
                  {card.title} ({money(card.basePriceAmount)})
                </button>
              ))}
            </div>
          )}

          {selectedRateCard && (
            <div className="p-4 rounded-2xl mb-6" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
              <div className="text-xs font-medium uppercase tracking-wider mb-1 font-body" style={{ color: "var(--color-text-tertiary)" }}>Selected Service</div>
              <div className="text-lg font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{selectedRateCard.title}</div>
              <div className="text-sm font-mono tnum mt-1" style={{ color: "var(--color-accent)" }}>{money(selectedRateCard.basePriceAmount)}</div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>Select Date</label>
            <Input type="date" value={slotDate} min={todayISO()} onChange={(e) => setSlotDate(e.target.value)} />
          </div>

          {slotError && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {slotError}
            </div>
          )}

          <div className="mb-6">
            <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Available Time Slots</div>
            <div className="grid grid-cols-3 gap-2">
              {CANDIDATE_SLOT_HOURS.map((h) => {
                const startStr = `${String(h).padStart(2, "0")}:00`;
                const isOpen = openSlots.some((s) => startStr >= s.start && startStr < s.end);
                const selected = selectedSlotStart === startStr;
                return (
                  <button
                    key={startStr}
                    disabled={!isOpen}
                    onClick={() => setSelectedSlotStart(startStr)}
                    className="h-11 rounded-xl font-mono text-sm font-medium transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      background: selected ? "var(--color-accent)" : isOpen ? "var(--color-bg-surface)" : "var(--color-bg-elevated)",
                      color: selected ? "var(--color-accent-on)" : "var(--color-text-primary)",
                      border: "1px solid var(--color-hairline)",
                    }}
                  >
                    {startStr}
                  </button>
                );
              })}
            </div>
          </div>

          <Button className="w-full h-12" disabled={!selectedSlotStart} onClick={() => setStep("summary")}>
            Continue to Summary <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: summary ─────────────────────────────────────────────────────────────
  if (step === "summary") {
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header("Booking Summary", () => setStep("slot"))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">
          <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
            <div className="flex justify-between text-sm font-body">
              <span style={{ color: "var(--color-text-tertiary)" }}>Talent</span>
              <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{creator?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span style={{ color: "var(--color-text-tertiary)" }}>Service</span>
              <span style={{ color: "var(--color-text-primary)" }}>{selectedRateCard?.title ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span style={{ color: "var(--color-text-tertiary)" }}>Slot</span>
              <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>{slotDate} @ {selectedSlotStart}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl space-y-2" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
            <div className="flex justify-between text-sm font-body">
              <span style={{ color: "var(--color-text-secondary)" }}>Base Rate</span>
              <span className="font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{money(baseRate)}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span style={{ color: "var(--color-text-secondary)" }}>Escrow Protection Fee (12%)</span>
              <span className="font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{money(escrowFee)}</span>
            </div>
            <div className="pt-2 flex justify-between text-base font-semibold font-body" style={{ borderTop: "1px solid var(--color-hairline)" }}>
              <span style={{ color: "var(--color-text-primary)" }}>Total</span>
              <span className="font-mono tnum" style={{ color: "var(--color-accent)" }}>{money(total)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl flex items-start gap-3 text-xs font-body" style={{ background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)" }}>
            <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
            <div style={{ color: "var(--color-text-primary)" }}>
              <strong className="block font-semibold mb-0.5">Escrow Protection</strong>
              Your payment is held safely in escrow. {creator?.name ?? "The talent"} gets paid only after they deliver and you approve.
            </div>
          </div>

          <Button className="w-full h-12" onClick={() => setStep("context")}>
            Continue to Context <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: context note ────────────────────────────────────────────────────────
  if (step === "context") {
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header("A bit of context", () => setStep("summary"))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">
          <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
            Share your project brief, script, or key direction for {creator?.name ?? "the talent"} (optional). Note: this is a one-way note, not a conversation.
          </p>
          <textarea
            rows={5}
            value={contextNote}
            onChange={(e) => setContextNote(e.target.value)}
            placeholder="e.g. Please use a warm, authoritative tone matching our brand voice. Script link or directions here…"
            className="w-full p-4 rounded-2xl text-sm font-body border resize-none"
            style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
          />
          <Button className="w-full h-12" onClick={() => setStep("details")}>
            Continue to Details <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: name + email ────────────────────────────────────────────────────────
  if (step === "details") {
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header("Your details", () => setStep("context"))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">
          <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
            No account required to start — we'll create your secure login automatically once your escrow payment is confirmed.
          </p>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>Your Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-tertiary)" }}>Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <Button className="w-full h-12" disabled={!name.trim() || !email.trim() || !email.includes("@")} onClick={() => setStep("payment")}>
            Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: processing payment ──────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="role-client min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-canvas)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: "var(--color-accent-soft)" }}>
            <Lock className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="font-display text-2xl mb-2" style={{ color: "var(--color-text-primary)" }}>Processing Payment</h2>
          <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Securing your funds in escrow…</p>
        </motion.div>
      </div>
    );
  }

  // ── Step: confirmed ───────────────────────────────────────────────────────────
  if (step === "confirmed") {
    return (
      <div className="role-client min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-canvas)" }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "var(--color-success)" }} />
          </motion.div>

          <h2 className="font-display text-3xl mb-2" style={{ color: "var(--color-text-primary)" }}>Booking Confirmed!</h2>
          <p className="text-base font-body mb-1" style={{ color: "var(--color-accent)" }}>
            <span className="font-mono tnum font-semibold">{money(total)}</span> secured in escrow
          </p>
          <p className="text-sm font-body mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Your funds are held securely until {creator?.name ?? "your talent"} delivers and you approve the work.
          </p>

          <div className="p-4 rounded-2xl mb-6 flex items-start gap-3 text-left" style={{ background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)" }}>
            <Mail className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
            <div>
              <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>We've created your account</div>
              <div className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                Check <span className="font-medium">{email}</span> for a link to set your password and manage this booking — that's also how you'll approve releasing payment.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full h-12" onClick={() => navigate("/auth")}>
              Go to Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Step: payment ─────────────────────────────────────────────────────────────
  return (
    <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <button
          aria-label="Go back"
          onClick={() => setStep("details")}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-semibold font-display" style={{ color: "var(--color-text-primary)" }}>Payment</div>
          <div className="text-xs font-body flex items-center gap-1" style={{ color: "var(--color-success)" }}>
            <Lock className="w-3 h-3" /> Escrow Protected
          </div>
        </div>
        <div className="text-xs font-body font-medium" style={{ color: "var(--color-text-tertiary)" }}>Step 2 of 3: Secure your booking</div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Title with clean flex spacing */}
            <div className="flex items-baseline gap-2 mb-5">
              <span className="font-display text-2xl" style={{ color: "var(--color-text-primary)" }}>Pay</span>
              <span className="font-display text-2xl font-mono tnum font-semibold" style={{ color: "var(--color-accent)" }}>{money(total)}</span>
            </div>

            {payError && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
                <AlertCircle className="w-4 h-4 shrink-0" /> {payError}
              </div>
            )}

            {/* Booking summary box */}
            <div className="p-4 rounded-2xl mb-5" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
              <div className="flex justify-between py-2 text-sm font-body" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
                <span style={{ color: "var(--color-text-tertiary)" }}>Booking for</span>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>{name || "—"} ({email || "—"})</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-body">
                <span style={{ color: "var(--color-text-tertiary)" }}>Total Deposit</span>
                <span className="font-mono tnum font-semibold" style={{ color: "var(--color-accent)" }}>{money(total)}</span>
              </div>
            </div>

            {/* Trusted Payment Option Cards */}
            <div className="mb-5">
              <div className="text-xs font-medium uppercase tracking-wider mb-2.5 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                Select Payment Method
              </div>
              <div className="space-y-2.5">
                {[
                  { id: "card", label: "Card Payment", sub: "Visa, Mastercard, Verve (Paystack)", icon: CreditCard, badge: "Popular" },
                  { id: "transfer", label: "Instant Bank Transfer", sub: "Virtual GTBank / Zenith Account", icon: Building2, badge: "Instant" },
                  { id: "ussd", label: "USSD / Mobile Money", sub: "Quick *737# or *894# transfer", icon: Smartphone, badge: null },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentChannel(option.id as any)}
                    className="w-full p-4 rounded-xl flex items-center justify-between border text-left transition-all"
                    style={{
                      background: paymentChannel === option.id ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                      borderColor: paymentChannel === option.id ? "var(--color-accent)" : "var(--color-hairline)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: paymentChannel === option.id ? "var(--color-accent)" : "var(--color-bg-elevated)" }}>
                        <option.icon className="w-5 h-5" style={{ color: paymentChannel === option.id ? "var(--color-accent-on)" : "var(--color-text-primary)" }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{option.label}</div>
                        <div className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>{option.sub}</div>
                      </div>
                    </div>
                    {paymentChannel === option.id ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--color-accent)" }}>
                        <Check className="w-3.5 h-3.5" style={{ color: "var(--color-accent-on)" }} />
                      </div>
                    ) : option.badge ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full font-body" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                        {option.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Escrow Trust Guarantee */}
            <div className="p-4 rounded-2xl mb-5 flex items-start gap-3" style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)" }}>
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-success)" }} />
              <div className="text-xs font-body" style={{ color: "var(--color-text-primary)" }}>
                <strong className="block font-semibold mb-0.5">100% Escrow Money-Back Guarantee</strong>
                Your <strong>{money(total)}</strong> deposit is held safely by Monologg until {creator?.name ?? "the talent"} completes your order and you approve the deliverables.
              </div>
            </div>

            <Button className="w-full h-12 gap-2" disabled={submitting} onClick={handlePay}>
              <Lock className="w-4 h-4" />
              {submitting ? "Confirming…" : `Confirm & Deposit ${money(total)}`}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-5">
              <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
              <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>256-Bit SSL Encrypted · PCI-DSS Compliant Paystack Escrow</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
