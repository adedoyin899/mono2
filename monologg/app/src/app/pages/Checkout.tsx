import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import {
  ChevronLeft, Lock, Shield, CreditCard, CheckCircle2,
  AlertTriangle, ArrowRight, Smartphone, Building2, Check
} from "lucide-react";

type PaymentMethod = "card" | "bank_transfer" | "ussd";
type CheckoutStep = "summary" | "payment" | "processing" | "confirmed";

export function Checkout() {
  const [step, setStep] = useState<CheckoutStep>("summary");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const navigate = useNavigate();

  const BASE_RATE = 120000;
  const ESCROW_FEE = Math.round(BASE_RATE * 0.12);
  const PROMO_DISCOUNT = promoApplied ? Math.round(BASE_RATE * 0.05) : 0;
  const TOTAL = BASE_RATE + ESCROW_FEE - PROMO_DISCOUNT;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setTimeout(() => setStep("confirmed"), 2500);
  };

  const formatCard = (val: string) => {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length > 2) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    return clean;
  };

  if (step === "processing") {
    return (
      <div className="role-client min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-canvas)" }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            style={{ background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <Lock className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="font-display text-2xl mb-2" style={{ color: "var(--color-text-primary)" }}>Processing Payment</h2>
          <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Securing your funds in escrow via FINCRA...</p>
        </motion.div>
      </div>
    );
  }

  if (step === "confirmed") {
    return (
      <div className="role-client min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-canvas)" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION_MED, ease: EASE_OUT }}
          className="text-center max-w-sm"
        >
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
            <span className="font-mono tnum font-semibold">₦{TOTAL.toLocaleString()}</span> secured in escrow
          </p>
          <p className="text-sm font-body mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Your funds are held securely until Elias Thorne delivers and you approve the work. The Order Room is ready.
          </p>

          <div className="p-5 rounded-[var(--radius-xl)] mb-6 text-left" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}>
            {[
              { label: "Talent", value: "Elias Thorne", mono: false },
              { label: "Service", value: "Commercial Voice-Over", mono: false },
              { label: "Amount in Escrow", value: `₦${TOTAL.toLocaleString()}`, mono: true },
              { label: "Order ID", value: "ORD-" + Math.floor(Math.random() * 9000 + 1000), mono: true },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between text-sm font-body py-2.5 ${i < 3 ? "border-b" : ""}`} style={{ borderColor: "var(--color-hairline)" }}>
                <span style={{ color: "var(--color-text-tertiary)" }}>{item.label}</span>
                <span className={`font-medium ${item.mono ? "font-mono tnum" : ""}`} style={{ color: "var(--color-text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full h-12" onClick={() => navigate("/order/1")}>
              Go to Order Room <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="secondary" className="w-full h-12" onClick={() => navigate("/client")}>
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="role-client min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      {/* Header */}
      <div
        className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel"
        style={{ borderBottom: "1px solid var(--color-hairline)" }}
      >
        <button
          aria-label="Go back"
          onClick={() => step === "payment" ? setStep("summary") : navigate(-1)}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-semibold font-display" style={{ color: "var(--color-text-primary)" }}>
            {step === "summary" ? "Booking Summary" : "Payment"}
          </div>
          <div className="text-xs font-body flex items-center gap-1" style={{ color: "var(--color-success)" }}>
            <Lock className="w-3 h-3" /> Escrow Protected · FINCRA
          </div>
        </div>
        {/* 2-step progress */}
        <div className="flex items-center gap-1.5" aria-hidden>
          {["summary", "payment"].map(st => (
            <div
              key={st}
              className="h-1.5 rounded-[var(--radius-full)] transition-all"
              style={{
                width: (step === st || (st === "summary" && step === "payment")) ? 22 : 10,
                background: (st === "summary" || step === "payment") ? "var(--color-accent)" : "var(--color-bg-elevated)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-w-lg mx-auto w-full">

        <AnimatePresence mode="wait">

          {/* Step 1: Summary */}
          {step === "summary" && (
            <motion.div key="summary" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Talent summary card */}
              <div
                className="p-5 rounded-2xl mb-5"
                style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg font-body" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                    ET
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-body font-semibold" style={{ color: "var(--color-text-primary)" }}>Elias Thorne</span>
                      <Shield className="w-4 h-4" style={{ color: "var(--color-success)" }} />
                    </div>
                    <div className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Actor & Voice Artist</div>
                  </div>
                </div>

                <div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)", borderLeft: "3px solid var(--color-accent)" }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Commercial Voice-Over</div>
                      <div className="text-xs font-body mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>Delivery: Same Day</div>
                    </div>
                    <div className="font-mono tnum text-xl font-semibold" style={{ color: "var(--color-accent)" }}>₦{BASE_RATE.toLocaleString()}</div>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="space-y-2.5 mb-4">
                  {[
                    { label: "Base Rate", value: `₦${BASE_RATE.toLocaleString()}`, color: "var(--color-text-primary)" },
                    { label: "Escrow Processing Fee (12%)", value: `+₦${ESCROW_FEE.toLocaleString()}`, color: "var(--color-text-secondary)", note: "Protects your payment" },
                    ...(promoApplied ? [{ label: "Promo (MONO5)", value: `-₦${PROMO_DISCOUNT.toLocaleString()}`, color: "var(--color-success)" }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-body">
                      <div>
                        <span style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                        {item.note && <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{item.note}</div>}
                      </div>
                      <span className="font-mono tnum" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center" style={{ borderColor: "var(--color-hairline)" }}>
                    <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>Total</span>
                    <span className="font-mono tnum text-2xl font-semibold" style={{ color: "var(--color-accent)" }}>₦{TOTAL.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo code */}
                {!promoOpen ? (
                  <button
                    className="text-sm font-body hover:underline"
                    style={{ color: "var(--color-accent)" }}
                    onClick={() => setPromoOpen(true)}
                  >
                    Have a promo code?
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      className="h-12 px-4 text-sm"
                      onClick={() => {
                        if (promoCode === "MONO5") setPromoApplied(true);
                        setPromoOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Escrow trust badge */}
              <div
                className="p-4 rounded-2xl mb-6 flex items-center gap-3"
                style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)" }}
              >
                <Shield className="w-6 h-6 shrink-0" style={{ color: "var(--color-success)" }} />
                <div>
                  <div className="text-sm font-semibold font-body" style={{ color: "var(--color-success)" }}>Escrow Protected</div>
                  <div className="text-xs font-body" style={{ color: "var(--color-success)" }}>
                    Your <span className="font-mono tnum">₦{TOTAL.toLocaleString()}</span> is held safely until you approve the completed work.
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-base" onClick={() => setStep("payment")}>
                Proceed to Payment <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button
                className="w-full text-sm text-center mt-3 font-body"
                style={{ color: "var(--color-text-tertiary)" }}
                onClick={() => navigate(-1)}
              >
                Go back
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              <h2 className="font-display text-2xl mb-5" style={{ color: "var(--color-text-primary)" }}>
                Pay <span className="font-mono tnum">₦{TOTAL.toLocaleString()}</span>
              </h2>

              {/* Payment method tabs */}
              <div
                className="flex p-1 rounded-xl mb-5"
                style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}
              >
                {[
                  { id: "card" as PaymentMethod, label: "Card", icon: CreditCard },
                  { id: "bank_transfer" as PaymentMethod, label: "Bank Transfer", icon: Building2 },
                  { id: "ussd" as PaymentMethod, label: "USSD", icon: Smartphone },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium font-body transition-all"
                    style={{
                      background: paymentMethod === method.id ? "var(--color-accent)" : "transparent",
                      /* dark text on gold passes; secondary text on transparent passes in both modes */
                      color: paymentMethod === method.id ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                    }}
                  >
                    <method.icon className="w-3.5 h-3.5" />
                    {method.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === "card" && (
                  <motion.form
                    key="card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handlePayment}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Card Number</label>
                      <div className="relative">
                        <Input
                          placeholder="0000 0000 0000 0000"
                          value={cardNum}
                          onChange={e => setCardNum(formatCard(e.target.value))}
                          className="pr-10"
                          required
                        />
                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Cardholder Name</label>
                      <Input
                        placeholder="Name on card"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Expiry</label>
                        <Input
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={e => setExpiry(formatExpiry(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>CVV</label>
                        <Input
                          placeholder="•••"
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          type="password"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 gap-2"
                      disabled={!cardNum || !cardName || !expiry || !cvv}
                    >
                      <Lock className="w-4 h-4" />
                      Confirm & Deposit ₦{TOTAL.toLocaleString()}
                    </Button>
                  </motion.form>
                )}

                {paymentMethod === "bank_transfer" && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}>
                      <div className="text-sm font-semibold font-body mb-4" style={{ color: "var(--color-text-primary)" }}>Transfer to this account:</div>
                      {[
                        { label: "Bank", value: "Access Bank", mono: false },
                        { label: "Account Name", value: "Monologg Escrow Ltd", mono: false },
                        { label: "Account Number", value: "0123456789", mono: true },
                        { label: "Amount", value: `₦${TOTAL.toLocaleString()}`, mono: true },
                        { label: "Reference", value: "ORD-" + Math.floor(Math.random() * 9000 + 1000), mono: true },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between py-2.5 text-sm font-body" style={{ borderBottom: i < 4 ? "1px solid var(--color-hairline)" : undefined }}>
                          <span style={{ color: "var(--color-text-tertiary)" }}>{item.label}</span>
                          <span className={`font-semibold ${item.mono ? "font-mono tnum" : ""}`} style={{ color: "var(--color-text-primary)" }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-body text-center" style={{ color: "var(--color-text-tertiary)" }}>
                      Include the reference in your transfer narration. Escrow will be activated within 2 business hours.
                    </p>
                    <Button className="w-full h-12" onClick={() => setStep("confirmed")}>
                      I've Made the Transfer
                    </Button>
                  </motion.div>
                )}

                {paymentMethod === "ussd" && (
                  <motion.div
                    key="ussd"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div
                      className="p-8 rounded-2xl"
                      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
                    >
                      <Smartphone className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
                      <p className="text-sm font-body mb-2" style={{ color: "var(--color-text-secondary)" }}>Dial this code on your phone:</p>
                      <div className="font-mono tnum text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>*901*2*120000#</div>
                      <p className="text-xs font-body mt-3" style={{ color: "var(--color-text-tertiary)" }}>Works on all Nigerian networks · GTBank USSD</p>
                    </div>
                    <Button className="w-full h-12" onClick={() => setStep("confirmed")}>
                      Payment Confirmed
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-center gap-2 mt-5">
                <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                  Powered by FINCRA · SSL encrypted · PCI DSS compliant
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
