import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { apiClient, type CreatedBooking } from "../../lib/api-client";
import type { PublicRateCard, PublicStorefront } from "@monologg/types";
import { ChevronLeft, Lock, Shield, ArrowRight, AlertCircle, CheckCircle2, Mail } from "lucide-react";

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

const CURRENCY_SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£" };
function formatMinorUnits(minorUnits: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${(minorUnits / 100).toLocaleString("en-US")}`;
}

const CONTEXT_NOTE_MAX = 500;

export function ExternalBookingEntry() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [searchParams] = useSearchParams();
  const rateCardId = searchParams.get("rateCard");
  const navigate = useNavigate();

  const [creator, setCreator] = useState<PublicStorefront | null>(null);
  const [rateCards, setRateCards] = useState<PublicRateCard[]>([]);
  const [selectedRateCard, setSelectedRateCard] = useState<PublicRateCard | null>(null);
  const [step, setStep] = useState<Step>("slot");

  const [slotDate, setSlotDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [openSlots, setOpenSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlotStart, setSelectedSlotStart] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [contextNote, setContextNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [booking, setBooking] = useState<CreatedBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) return;
    apiClient.getPublicStorefront(creatorId).then(setCreator).catch(() => {});
    apiClient
      .getCreatorRateCardsPublic(creatorId)
      .then((cards) => {
        setRateCards(cards);
        setSelectedRateCard(cards.find((c) => c.id === rateCardId) ?? cards[0] ?? null);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  useEffect(() => {
    if (!creatorId || step !== "slot") return;
    setLoadingSlots(true);
    setSelectedSlotStart(null);
    apiClient.getOpenSlots(creatorId, slotDate).then((slots) => {
      setOpenSlots(slots);
      setLoadingSlots(false);
    });
  }, [creatorId, step, slotDate]);

  const slotFits = (start: string): boolean => {
    const end = addMinutes(start, SLOT_DURATION_MIN);
    return openSlots.some((o) => o.start <= start && o.end >= end);
  };

  const BASE_RATE = selectedRateCard?.basePriceAmount ?? 0;
  const currency = selectedRateCard?.basePriceCurrency ?? "NGN";
  const money = (minorUnits: number) => formatMinorUnits(minorUnits, currency);
  // features.md Phase 16: the client pays base + 15% client fee (config, X2) — the
  // server (services/fees.ts) recomputes and stores the authoritative amounts on
  // the created booking; this is only a preview until then.
  const CLIENT_FEE_PREVIEW = Math.round(BASE_RATE * 0.15);
  const TOTAL_PREVIEW = BASE_RATE + CLIENT_FEE_PREVIEW;
  const clientFee = booking ? booking.clientFeeAmount : CLIENT_FEE_PREVIEW;
  const total = booking ? booking.baseAmount + booking.clientFeeAmount : TOTAL_PREVIEW;

  const handlePay = async () => {
    if (!creatorId || !selectedRateCard || !selectedSlotStart) return;
    setStep("processing");
    setSubmitting(true);
    setPayError(null);
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
      // Server-authoritative: someone else may have taken this slot first (409) —
      // send the visitor back to the picker with a fresh read, same as Checkout.tsx.
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
            <div className="flex gap-2 mb-5 overflow-x-auto">
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
                  {card.title}
                </button>
              ))}
            </div>
          )}

          <input
            type="date"
            value={slotDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => e.target.value && setSlotDate(e.target.value)}
            className="w-full h-12 px-4 rounded-[var(--radius-lg)] text-sm font-body mb-5"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", color: "var(--color-text-primary)" }}
          />

          {slotError && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {slotError}
            </div>
          )}

          {loadingSlots ? (
            <p className="text-sm font-body text-center py-10" style={{ color: "var(--color-text-tertiary)" }}>Checking availability…</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CANDIDATE_SLOT_HOURS.map((h) => {
                const start = toTimeStr(h * 60);
                const fits = slotFits(start);
                const isSelected = selectedSlotStart === start;
                return (
                  <button
                    key={start}
                    disabled={!fits}
                    onClick={() => setSelectedSlotStart(start)}
                    className="py-2.5 rounded-xl text-sm font-mono tnum font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: isSelected ? "var(--color-accent)" : "var(--color-bg-surface)",
                      color: isSelected ? "var(--color-accent-on)" : fits ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                      border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-hairline)"}`,
                    }}
                  >
                    {start}
                  </button>
                );
              })}
            </div>
          )}

          <Button className="w-full h-12" disabled={!selectedSlotStart || !selectedRateCard} onClick={() => setStep("summary")}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: booking summary + escrow explainer ─────────────────────────────────
  if (step === "summary") {
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header("Booking Summary", () => setStep("slot"))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
          <div className="p-5 rounded-2xl mb-5" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg font-body" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                {(creator?.name ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-body font-semibold" style={{ color: "var(--color-text-primary)" }}>{creator?.name ?? "…"}</span>
                  <Shield className="w-4 h-4" style={{ color: "var(--color-success)" }} />
                </div>
                <div className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>{selectedRateCard?.delivery}</div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl mb-4" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)", borderLeft: "3px solid var(--color-accent)" }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{selectedRateCard?.title}</div>
                  <div className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    {slotDate} · {selectedSlotStart}–{selectedSlotStart ? addMinutes(selectedSlotStart, SLOT_DURATION_MIN) : ""}
                  </div>
                </div>
                <div className="font-mono tnum text-xl font-semibold" style={{ color: "var(--color-accent)" }}>{money(BASE_RATE)}</div>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-sm font-body">
                <span style={{ color: "var(--color-text-secondary)" }}>Base Rate</span>
                <span className="font-mono tnum" style={{ color: "var(--color-text-primary)" }}>{money(BASE_RATE)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-body">
                <span style={{ color: "var(--color-text-secondary)" }}>Escrow Client Fee (15%)</span>
                <span className="font-mono tnum" style={{ color: "var(--color-text-secondary)" }}>+{money(clientFee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center" style={{ borderColor: "var(--color-hairline)" }}>
                <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Total</span>
                <span className="font-mono tnum text-2xl font-semibold" style={{ color: "var(--color-accent)" }}>{money(total)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl mb-6 flex items-center gap-3" style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)" }}>
            <Shield className="w-6 h-6 shrink-0" style={{ color: "var(--color-success)" }} />
            <div>
              <div className="text-sm font-semibold font-body" style={{ color: "var(--color-success)" }}>Escrow Protected</div>
              <div className="text-xs font-body" style={{ color: "var(--color-success)" }}>
                Your <span className="font-mono tnum">{money(total)}</span> is held safely and released to {creator?.name ?? "the talent"} only once you approve the work.
              </div>
            </div>
          </div>

          <Button className="w-full h-12 text-base" onClick={() => setStep("context")}>
            Continue <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: optional one-way context note (NOT chat) ───────────────────────────
  if (step === "context") {
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header("A bit of context", () => setStep("summary"))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
          <label className="block text-sm font-semibold font-body mb-1" style={{ color: "var(--color-text-primary)" }}>
            Briefly, what do you need? <span style={{ color: "var(--color-text-tertiary)" }}>(optional)</span>
          </label>
          <p className="text-xs font-body mb-3" style={{ color: "var(--color-text-tertiary)" }}>
            This is a one-time note attached to your booking request — not a conversation. The chat opens once your booking is confirmed.
          </p>
          <textarea
            value={contextNote}
            maxLength={CONTEXT_NOTE_MAX}
            onChange={(e) => setContextNote(e.target.value)}
            rows={4}
            placeholder="E.g. A 30-second product voiceover for a launch video…"
            className="w-full p-4 rounded-[var(--radius-lg)] text-sm font-body resize-none"
            style={{ background: "var(--color-bg-surface-2)", border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)" }}
          />
          <div className="text-xs font-body text-right mt-1 mb-6" style={{ color: "var(--color-text-tertiary)" }}>
            {contextNote.length}/{CONTEXT_NOTE_MAX}
          </div>

          <Button className="w-full h-12" onClick={() => setStep("details")}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: name + email (the info the booking needs anyway) ───────────────────
  if (step === "details") {
    const canContinue = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email);
    return (
      <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
        {header("Your details", () => setStep("context"))}
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Full Name</label>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Email</label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <p className="text-xs font-body mt-2" style={{ color: "var(--color-text-tertiary)" }}>
              We'll create your booking account with this — no separate sign-up. You'll get a link to manage it after payment.
            </p>
          </div>

          <Button className="w-full h-12 mt-2" disabled={!canContinue} onClick={() => setStep("payment")}>
            Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="role-client min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-canvas)" }}>
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative" style={{ background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)" }}>
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <Lock className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="font-display text-2xl mb-2" style={{ color: "var(--color-text-primary)" }}>Processing Payment</h2>
          <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Securing your funds in escrow…</p>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="font-display text-2xl mb-5" style={{ color: "var(--color-text-primary)" }}>
              Pay <span className="font-mono tnum">{money(total)}</span>
            </h2>

            {payError && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
                <AlertCircle className="w-4 h-4 shrink-0" /> {payError}
              </div>
            )}

            <div className="p-5 rounded-2xl mb-5" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
              <div className="flex justify-between py-2 text-sm font-body" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
                <span style={{ color: "var(--color-text-tertiary)" }}>Booking for</span>
                <span style={{ color: "var(--color-text-primary)" }}>{name || "—"} ({email || "—"})</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-body">
                <span style={{ color: "var(--color-text-tertiary)" }}>Amount</span>
                <span className="font-mono tnum font-semibold" style={{ color: "var(--color-accent)" }}>{money(total)}</span>
              </div>
            </div>

            <Button className="w-full h-12 gap-2" disabled={submitting} onClick={handlePay}>
              <Lock className="w-4 h-4" />
              {submitting ? "Confirming…" : `Confirm & Deposit ${money(total)}`}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-5">
              <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
              <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>SSL encrypted · PCI DSS compliant</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
