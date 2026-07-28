import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/ui/Logo";
import { EASE_OUT, DURATION_MED, DURATION_SLOW } from "../../lib/motionTokens";
import { ChevronLeft, User, Mic, Star, Video, Check, Shield, UploadCloud, Plus, Sparkles } from "lucide-react";

export function CreatorOnboarding() {
  const [step, setStep] = useState(1);
  const [selectedNiche, setSelectedNiche] = useState<string | null>("actor");
  const [file, setFile] = useState<File | null>(null);
  const [tags] = useState(["Warm Texture", "Conversational", "Expressive", "High Energy"]);
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // PWA-04 AI Processing Simulation
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setStep(4);
      }, 3000); // simulate 3s for demo
      return () => clearTimeout(timer);
    }
  }, [step]);

  const rise = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: DURATION_MED, ease: EASE_OUT },
  };

  return (
    <div className="role-talent min-h-screen bg-[var(--color-bg-canvas)] flex flex-col w-full max-w-[480px] mx-auto relative overflow-hidden">

      {/* Top Progress Bar - Only visible on steps 1, 2, 4, 5 */}
      {step !== 3 && (
        <div className="px-5 pt-6 pb-3 flex items-center gap-3">
          <button
            onClick={step === 1 ? () => navigate("/auth") : handleBack}
            className="w-10 h-10 -ml-1 flex items-center justify-center rounded-[var(--radius-full)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] active:scale-[0.94] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-1.5">
            {[1, 2, 4, 5].map((s) => {
              const done = s < step && step !== 3;
              const active = s === step;
              return (
                <div key={s} className="flex-1 h-1.5 rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-[var(--radius-full)] bg-[var(--color-accent)]"
                    initial={false}
                    animate={{ width: active || done ? "100%" : "0%" }}
                    transition={{ duration: DURATION_SLOW, ease: EASE_OUT }}
                  />
                </div>
              );
            })}
          </div>
          <div className="w-10" /> {/* Balancer */}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="pwa-02"
            {...rise}
            className="flex-1 flex flex-col px-5 pb-6 overflow-y-auto"
          >
            <div className="mt-4 mb-8">
              <h2 className="font-display text-[28px] leading-[1.15] text-[var(--color-text-primary)] mb-2">What best describes your craft?</h2>
              <p className="font-body text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                Select your primary niche to personalize your storefront.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: "actor", label: "Actor", icon: User },
                { id: "vo", label: "Voice-Over Artist", icon: Mic },
                { id: "comedian", label: "Comedian", icon: Star },
                { id: "host", label: "Compere / Host", icon: Mic },
                { id: "speaker", label: "Speaker / Pastor", icon: User },
                { id: "musician", label: "Musician", icon: Star },
                { id: "creator", label: "Content Creator", icon: Video },
                { id: "streamer", label: "Streamer", icon: Video },
              ].map(niche => {
                const selected = selectedNiche === niche.id;
                return (
                  <motion.button
                    key={niche.id}
                    onClick={() => setSelectedNiche(niche.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-4 rounded-[var(--radius-lg)] border flex flex-col items-center justify-center text-center gap-3 min-h-[108px] transition-colors duration-[var(--duration-fast)] ${
                      selected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                        : "border-[var(--color-hairline)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <niche.icon className={`w-7 h-7 transition-colors ${selected ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"}`} />
                    <span className={`font-body text-[14px] font-semibold ${selected ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"}`}>{niche.label}</span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 bg-[var(--color-accent)] rounded-[var(--radius-full)] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-[var(--color-accent-on)]" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-auto pt-6 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
              <Button
                onClick={handleNext}
                disabled={!selectedNiche}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="pwa-03"
            {...rise}
            className="flex-1 flex flex-col px-5 pb-6 overflow-y-auto"
          >
            <div className="mt-4 mb-8">
              <h2 className="font-display text-[28px] leading-[1.15] text-[var(--color-text-primary)] mb-2">Upload your showcase reel</h2>
              <p className="font-body text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                MP4, MOV, AVI — up to 150MB
              </p>
            </div>

            <div className={`relative min-h-[220px] rounded-[var(--radius-xl)] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors ${
              file ? "border-[var(--color-success)] bg-[var(--color-success-bg)]" : "border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
            }`}>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="video/*,audio/*"
              />

              {!file ? (
                <>
                  <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
                    <UploadCloud className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <p className="font-body text-[15px] font-semibold text-[var(--color-text-primary)]">Drag and drop here, or tap to browse</p>
                  <p className="font-body text-[13px] text-[var(--color-text-tertiary)] mt-1">Your reel is analysed to build your profile</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-[var(--radius-full)] bg-[var(--color-success-bg)] flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-[var(--color-success)]" />
                  </div>
                  <p className="font-body text-[15px] font-semibold text-[var(--color-text-primary)]">{file.name}</p>
                  <p className="font-body text-[12px] text-[var(--color-text-secondary)] mt-1 tnum">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  <Button variant="ghost" className="h-9 mt-2 z-10 relative text-[var(--color-error)] opacity-100 hover:opacity-80" onClick={() => setFile(null)}>Remove</Button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <Shield className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
              <p className="font-body text-[13px] text-[var(--color-text-tertiary)] text-center">
                Processed securely to extract performance parameters.
              </p>
            </div>

            <div className="mt-auto pt-6 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
              <Button
                onClick={handleNext}
                disabled={!file}
                className="w-full"
              >
                Upload &amp; Analyse
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="pwa-04"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
          >
            <Logo className="h-5 w-auto absolute top-10" style={{ color: "var(--color-text-primary)" }} />

            <div className="relative w-[120px] h-[120px] rounded-[var(--radius-full)] flex items-center justify-center bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-elevated)] mb-10">
              <motion.div
                className="absolute inset-0 rounded-[var(--radius-full)] border-2 border-[var(--color-accent)]"
                animate={{ scale: [1, 1.14, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <Shield className="w-10 h-10 text-[var(--color-accent)]" />
            </div>

            <div className="w-[220px] h-1.5 rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] mb-6 overflow-hidden relative">
              <motion.div
                className="absolute top-0 bottom-0 left-0 w-1/3 rounded-[var(--radius-full)] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent"
                animate={{ x: [-90, 300] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <p className="font-display text-[19px] text-[var(--color-text-primary)] mb-3 leading-snug max-w-[300px]">
              Thespian AI is reviewing your performance parameters…
            </p>
            <p className="font-body text-[14px] text-[var(--color-text-secondary)]">
              This usually takes 15–45 seconds. Stay with us.
            </p>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="pwa-05"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex-1 flex flex-col px-5 pb-6 overflow-y-auto"
          >
            <div className="flex flex-col items-center text-center mt-6 mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1.1, 1] }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-[84px] h-[84px] rounded-[var(--radius-full)] bg-[var(--color-success-bg)] flex items-center justify-center mb-5 relative"
              >
                <motion.div
                  initial={{ boxShadow: "0 0 0 8px rgba(26,117,68,0)" }}
                  animate={{ boxShadow: ["0 0 0 0px rgba(26,117,68,0.4)", "0 0 0 22px rgba(26,117,68,0)"] }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute inset-0 rounded-[var(--radius-full)]"
                />
                <Check className="w-9 h-9 text-[var(--color-success)]" strokeWidth={2.5} />
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] bg-[var(--color-success-bg)] mb-6">
                <Shield className="w-3.5 h-3.5 text-[var(--color-success)]" />
                <span className="font-body text-[12px] font-semibold text-[var(--color-success)] uppercase tracking-wider">Thespian AI Verified</span>
              </div>

              <h2 className="font-display text-[26px] leading-[1.15] text-[var(--color-text-primary)] mb-2">Your verification is confirmed.</h2>
              <p className="font-body text-[15px] text-[var(--color-text-secondary)] leading-relaxed">Based on your upload, we've generated your profile tags.</p>
            </div>

            <div className="mb-8 rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] p-5">
              <div className="flex items-center gap-1.5 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <h3 className="font-body text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Your performance profile</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, i) => (
                  <div key={i} className="px-3.5 py-2 rounded-[var(--radius-full)] bg-[var(--color-accent-soft)] border border-[var(--color-accent)] font-body text-[13px] font-medium text-[var(--color-accent)]">
                    {tag}
                  </div>
                ))}
              </div>
              <button className="font-body text-[13px] font-semibold text-[var(--color-accent)] hover:underline">Edit tags</button>
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-3 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
              <Button onClick={handleNext} className="w-full">Looks great, continue</Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>Re-upload my reel</Button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="pwa-06"
            {...rise}
            className="flex-1 flex flex-col px-5 pb-6 overflow-y-auto"
          >
            <div className="mt-4 mb-6">
              <h2 className="font-display text-[28px] leading-[1.15] text-[var(--color-text-primary)] mb-2">Set your booking rates</h2>
              <p className="font-body text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                Create purchasable services for your storefront.
              </p>
            </div>

            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] shadow-[var(--shadow-card)] rounded-[var(--radius-xl)] p-5 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)]" />
              <div className="space-y-4">
                <div>
                  <label className="font-body text-[12px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">Booking Service Title</label>
                  <Input defaultValue="Feature Film Audition" />
                </div>
                <div>
                  <label className="font-body text-[12px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">Base Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] font-mono text-[16px]">$</span>
                    <Input className="pl-8 font-mono tnum" defaultValue="250" />
                  </div>
                </div>
                <div>
                  <label className="font-body text-[12px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">Delivery Timeline</label>
                  <select className="w-full h-[54px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface-2)] px-4 font-body text-[16px] text-[var(--color-text-primary)] focus:border-[var(--color-border-active)] focus:shadow-[0_0_0_4px_var(--color-accent-glow)] outline-none appearance-none">
                    <option>Same Day</option>
                    <option>24 Hours</option>
                    <option>2–3 Days</option>
                    <option>1 Week</option>
                  </select>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full border-dashed mb-8">
              <Plus className="w-4 h-4 mr-2" /> Add another service
            </Button>

            <div className="mt-auto pt-6 sticky bottom-0 bg-gradient-to-t from-[var(--color-bg-canvas)] via-[var(--color-bg-canvas)] to-transparent pb-1">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                Preview My Storefront
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
