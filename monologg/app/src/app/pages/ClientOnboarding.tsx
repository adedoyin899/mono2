import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EASE_OUT, DURATION_MED, DURATION_SLOW } from "../../lib/motionTokens";
import { ChevronLeft, Building2, Check, Users, Briefcase, Globe, ShieldCheck } from "lucide-react";

type Step = 1 | 2 | 3;

const COMPANY_TYPES = [
  { id: "agency", label: "Creative Agency", icon: Building2 },
  { id: "brand", label: "Brand / Corporate", icon: Briefcase },
  { id: "production", label: "Production Company", icon: Globe },
  { id: "event", label: "Events Company", icon: Users },
  { id: "individual", label: "Individual / Freelancer", icon: Users },
  { id: "other", label: "Other", icon: Globe },
];

export function ClientOnboarding() {
  const [step, setStep] = useState<Step>(1);
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("agency");
  const [website, setWebsite] = useState("");
  const [teamSize, setTeamSize] = useState("Monthly");
  const navigate = useNavigate();

  const rise = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: DURATION_MED, ease: EASE_OUT },
  };

  return (
    <div
      className="role-client min-h-screen flex flex-col w-full max-w-[480px] mx-auto"
      style={{ background: "var(--color-bg-canvas)" }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => step === 1 ? navigate("/auth") : setStep((step - 1) as Step)}
          className="w-10 h-10 -ml-1 flex items-center justify-center rounded-[var(--radius-full)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] active:scale-[0.94] transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-1.5">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] overflow-hidden">
              <motion.div
                className="h-full rounded-[var(--radius-full)] bg-[var(--color-accent)]"
                initial={false}
                animate={{ width: s <= step ? "100%" : "0%" }}
                transition={{ duration: DURATION_SLOW, ease: EASE_OUT }}
              />
            </div>
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 py-5 w-full flex flex-col">
        <AnimatePresence mode="wait">

          {/* Step 1 — Company Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              {...rise}
              className="flex-1 flex flex-col"
            >
              <div className="mb-7">
                <h2 className="font-display text-[28px] leading-[1.15] mb-2" style={{ color: "var(--color-text-primary)" }}>
                  Tell us about your company
                </h2>
                <p className="text-[15px] font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  Help us personalize your talent discovery experience.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>
                    Company / Organization Name
                  </label>
                  <Input
                    placeholder="e.g., Brand Agency NG"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-secondary)" }}>
                    Type of Organization
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {COMPANY_TYPES.map(type => {
                      const selected = companyType === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          onClick={() => setCompanyType(type.id)}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2.5 min-h-[52px] px-3.5 py-3 rounded-[var(--radius-lg)] text-left relative transition-colors duration-[var(--duration-fast)]"
                          style={{
                            background: selected ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                            border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-hairline)"}`,
                          }}
                        >
                          <type.icon className="w-4 h-4 shrink-0" style={{ color: selected ? "var(--color-accent)" : "var(--color-text-tertiary)" }} />
                          <span className="text-[14px] font-body font-medium" style={{ color: selected ? "var(--color-accent)" : "var(--color-text-primary)" }}>{type.label}</span>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 22 }}
                              className="absolute top-2 right-2 w-4 h-4 rounded-[var(--radius-full)] flex items-center justify-center"
                              style={{ background: "var(--color-accent)" }}
                            >
                              <Check className="w-2.5 h-2.5" strokeWidth={3} style={{ color: "var(--color-accent-on)" }} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>
                    Website (optional)
                  </label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-auto pt-8 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
                <Button
                  className="w-full"
                  disabled={!companyName || !companyType}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Hiring Preferences */}
          {step === 2 && (
            <motion.div
              key="step2"
              {...rise}
              className="flex-1 flex flex-col"
            >
              <div className="mb-7">
                <h2 className="font-display text-[28px] leading-[1.15] mb-2" style={{ color: "var(--color-text-primary)" }}>
                  What are you looking for?
                </h2>
                <p className="text-[15px] font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  Help us show you the most relevant talent.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-secondary)" }}>
                  How often do you hire talent?
                </label>
                <div className="space-y-2.5">
                  {[
                    "Once or twice a year",
                    "Monthly",
                    "Weekly",
                    "Multiple times per week",
                    "I'm exploring",
                  ].map(opt => {
                    const selected = teamSize === opt;
                    return (
                      <motion.button
                        key={opt}
                        onClick={() => setTeamSize(opt)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between min-h-[52px] px-4 py-3 rounded-[var(--radius-lg)] text-[15px] font-body font-medium transition-colors duration-[var(--duration-fast)]"
                        style={{
                          background: selected ? "var(--color-accent-soft)" : "var(--color-bg-surface)",
                          border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-hairline)"}`,
                          color: selected ? "var(--color-accent)" : "var(--color-text-primary)",
                        }}
                      >
                        {opt}
                        {selected && (
                          <span className="w-5 h-5 rounded-[var(--radius-full)] flex items-center justify-center shrink-0" style={{ background: "var(--color-accent)" }}>
                            <Check className="w-3 h-3" strokeWidth={3} style={{ color: "var(--color-accent-on)" }} />
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto pt-8 flex gap-3 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-[2]" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Add Payment Method */}
          {step === 3 && (
            <motion.div
              key="step3"
              {...rise}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="font-display text-[28px] leading-[1.15] mb-2" style={{ color: "var(--color-text-primary)" }}>
                  Set up your payment
                </h2>
                <p className="text-[15px] font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  We'll use this to secure escrow for your bookings. You're only charged when you book talent.
                </p>
              </div>

              <div
                className="p-4 rounded-[var(--radius-lg)] flex items-start gap-3 mb-6"
                style={{ background: "var(--color-success-bg)" }}
              >
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-success)" }} />
                <p className="text-[13px] font-body leading-relaxed" style={{ color: "var(--color-success)" }}>
                  Your payment is protected by FINCRA escrow. Funds are only charged when you confirm a booking.
                </p>
              </div>

              <div className="rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] p-5 space-y-4">
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Card Number</label>
                  <Input className="font-mono tnum" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>Expiry</label>
                    <Input className="font-mono tnum" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium uppercase tracking-wider mb-2 font-body" style={{ color: "var(--color-text-secondary)" }}>CVV</label>
                    <Input className="font-mono tnum" type="password" placeholder="•••" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-[2]" onClick={() => navigate("/client")}>
                    Get Started
                  </Button>
                </div>
                <button
                  className="w-full text-[14px] font-body font-medium text-center mt-4 py-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                  onClick={() => navigate("/client")}
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
