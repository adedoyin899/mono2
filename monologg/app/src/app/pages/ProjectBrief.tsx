import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import {
  ChevronLeft, FileText, Users, DollarSign, UploadCloud,
  Check, Mic, User, Star, Video, Music
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const NICHES = [
  { id: "actor", label: "Actor", icon: User },
  { id: "vo", label: "Voice-Over", icon: Mic },
  { id: "comedian", label: "Comedian", icon: Star },
  { id: "compere", label: "Compere / Host", icon: Video },
  { id: "speaker", label: "Speaker", icon: User },
  { id: "musician", label: "Musician", icon: Music },
  { id: "creator", label: "Content Creator", icon: Video },
];

const PROJECT_TYPES = [
  "Commercial / Ad Campaign",
  "Corporate Event",
  "Film / TV Production",
  "Radio / Podcast",
  "Brand Activation",
  "Social Media Content",
  "Conference / Summit",
  "Other",
];

const BUDGET_RANGES = [
  { label: "Under ₦50K", value: "0-50000" },
  { label: "₦50K – ₦150K", value: "50000-150000" },
  { label: "₦150K – ₦500K", value: "150000-500000" },
  { label: "₦500K – ₦1M", value: "500000-1000000" },
  { label: "₦1M+", value: "1000000+" },
];

const STEPS = [
  { num: 1 as Step, label: "Project Details", icon: FileText },
  { num: 2 as Step, label: "Requirements", icon: Users },
  { num: 3 as Step, label: "Assets & Script", icon: UploadCloud },
  { num: 4 as Step, label: "Budget & Publish", icon: DollarSign },
];

export function ProjectBrief() {
  const [step, setStep] = useState<Step>(1);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [location, setLocation] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const toggleNiche = (id: string) => {
    setSelectedNiches(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const canAdvance = () => {
    if (step === 1) return projectName.trim() && projectType;
    if (step === 2) return selectedNiches.length > 0;
    if (step === 3) return true;
    if (step === 4) return selectedBudget;
    return false;
  };

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
    else setSubmitSuccess(true);
  };

  if (submitSuccess) {
    return (
      <div className="role-client min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-bg-canvas)" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION_MED, ease: EASE_OUT }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)" }}>
            <Check className="w-10 h-10" style={{ color: "var(--color-success)" }} />
          </div>
          <h2 className="font-display text-3xl mb-2" style={{ color: "var(--color-text-primary)" }}>Project Published!</h2>
          <p className="text-sm font-body mb-2" style={{ color: "var(--color-text-secondary)" }}>
            <strong className="text-base" style={{ color: "var(--color-accent)" }}>{projectName || "Your Project"}</strong>
          </p>
          <p className="text-sm font-body mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Your brief is now live. Verified talents will start applying shortly. You can also browse and invite specific talent.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full h-12" onClick={() => navigate("/client")}>View My Projects</Button>
            <Button variant="secondary" className="w-full h-12" onClick={() => { setStep(1); setSubmitSuccess(false); setProjectName(""); setProjectType(""); setSelectedNiches([]); setSelectedBudget(""); }}>
              Post Another Project
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
          onClick={() => step === 1 ? navigate("/client") : setStep((step - 1) as Step)}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
          style={{ background: "var(--color-bg-elevated)" }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} />
        </button>
        <div className="flex-1">
          <div className="text-sm font-semibold font-display" style={{ color: "var(--color-text-primary)" }}>Create Project Brief</div>
          <div className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>Step {step} of 4</div>
        </div>
        <button onClick={() => navigate("/client")} className="text-sm font-body px-3 py-2 rounded-[var(--radius-full)] hover:opacity-80 active:scale-95 transition-all" style={{ color: "var(--color-text-tertiary)" }}>Cancel</button>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: "var(--color-bg-elevated)" }}>
        <motion.div
          className="h-full"
          style={{ background: "var(--color-accent)" }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Steps indicator */}
      <div className="px-4 py-4 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const isDone = s.num < step;
          const isActive = s.num === step;
          return (
            <React.Fragment key={s.num}>
              <div
                className="flex items-center gap-1.5 shrink-0"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono"
                  style={{
                    background: isDone ? "var(--color-success)" : isActive ? "var(--color-accent)" : "var(--color-bg-elevated)",
                    /* dark on gold ~10:1, white on green ~16:1, tertiary on elevated ~4:1 */
                    color: isDone ? "var(--color-text-inverse)" : isActive ? "var(--color-accent-on)" : "var(--color-text-tertiary)",
                  }}
                >
                  {isDone ? "✓" : s.num}
                </div>
                <span className="hidden sm:block text-xs font-body" style={{ color: isActive ? "var(--color-accent)" : isDone ? "var(--color-success)" : "var(--color-text-tertiary)" }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px" style={{ background: isDone ? "var(--color-success)" : "var(--color-hairline)" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex-1 px-4 pt-2 pb-40 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* Step 1 — Project Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Project Details</h2>
                <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Tell us about the work you need done.</p>
              </div>

              <FormField label="Project Name *">
                <Input
                  placeholder="e.g., Nike Q1 Campaign Voice-Over"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                />
              </FormField>

              <FormField label="Project Type *">
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setProjectType(type)}
                      className="px-3 py-2.5 rounded-xl text-left text-sm font-body transition-all"
                      style={{
                        background: projectType === type ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                        border: `1px solid ${projectType === type ? "var(--color-accent)" : "var(--color-hairline)"}`,
                        color: projectType === type ? "var(--color-accent)" : "var(--color-text-secondary)",
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Project Description">
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm font-body border resize-none"
                  rows={4}
                  placeholder="Describe your project, goals, and what you're looking for in a talent..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                />
              </FormField>
            </motion.div>
          )}

          {/* Step 2 — Requirements */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Talent Requirements</h2>
                <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>What type of talent are you looking for?</p>
              </div>

              <FormField label="Creative Niche * (select all that apply)">
                <div className="grid grid-cols-2 gap-2">
                  {NICHES.map(niche => {
                    const selected = selectedNiches.includes(niche.id);
                    return (
                      <button
                        key={niche.id}
                        onClick={() => toggleNiche(niche.id)}
                        className="flex items-center gap-2.5 p-3.5 rounded-xl text-left transition-all relative"
                        style={{
                          background: selected ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                          border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-hairline)"}`,
                        }}
                      >
                        <niche.icon className="w-5 h-5 shrink-0" style={{ color: selected ? "var(--color-accent)" : "var(--color-text-tertiary)" }} />
                        <span className="text-sm font-body" style={{ color: selected ? "var(--color-accent)" : "var(--color-text-secondary)" }}>{niche.label}</span>
                        {selected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--color-accent)" }}>
                            <Check className="w-2.5 h-2.5" style={{ color: "var(--color-accent-on)" }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Timeline">
                  <select
                    className="w-full h-12 px-4 rounded-xl text-sm font-body border appearance-none"
                    value={timeline}
                    onChange={e => setTimeline(e.target.value)}
                    style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                  >
                    <option value="">Select...</option>
                    <option>ASAP (1–3 days)</option>
                    <option>This week</option>
                    <option>2 weeks</option>
                    <option>This month</option>
                    <option>Flexible</option>
                  </select>
                </FormField>
                <FormField label="Location">
                  <Input
                    placeholder="e.g., Lagos or Remote"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </FormField>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Assets */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Script & Assets</h2>
                <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Upload any scripts, briefs, or reference materials. (Optional)</p>
              </div>

              <div
                className="relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 text-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  borderColor: uploadedFile ? "var(--color-success)" : "var(--color-hairline)",
                  background: uploadedFile ? "var(--color-success-bg)" : "var(--color-bg-elevated)",
                }}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.txt,.mp3,.mp4"
                  onChange={e => setUploadedFile(e.target.files?.[0] || null)}
                />
                {!uploadedFile ? (
                  <>
                    <UploadCloud className="w-12 h-12 mb-4" style={{ color: "var(--color-text-tertiary)" }} />
                    <p className="text-sm font-body mb-1" style={{ color: "var(--color-text-secondary)" }}>
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                      PDF, DOC, DOCX, TXT, MP3, MP4 · Max 50MB
                    </p>
                  </>
                ) : (
                  <>
                    <FileText className="w-12 h-12 mb-4" style={{ color: "var(--color-success)" }} />
                    <p className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{uploadedFile.name}</p>
                    <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      className="mt-3 text-xs font-body hover:underline relative z-10"
                      style={{ color: "var(--color-error)" }}
                      onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                    >
                      Remove file
                    </button>
                  </>
                )}
              </div>

              <FormField label="Additional Notes for Talent">
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm font-body border resize-none"
                  rows={5}
                  placeholder="Any specific requirements, tone preferences, reference examples, or important context the talent should know..."
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  style={{ background: "var(--color-bg-elevated)", borderColor: "var(--color-hairline)", color: "var(--color-text-primary)" }}
                />
              </FormField>
            </motion.div>
          )}

          {/* Step 4 — Budget */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Budget & Publish</h2>
                <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Set your project budget range to attract the right talent.</p>
              </div>

              <FormField label="Budget Range *">
                <div className="space-y-2">
                  {BUDGET_RANGES.map(range => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedBudget(range.value)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-body transition-all"
                      style={{
                        background: selectedBudget === range.value ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                        border: `1px solid ${selectedBudget === range.value ? "var(--color-accent)" : "var(--color-hairline)"}`,
                        color: selectedBudget === range.value ? "var(--color-accent)" : "var(--color-text-secondary)",
                      }}
                    >
                      {range.label}
                      {selectedBudget === range.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Summary card */}
              <div className="p-4 rounded-2xl" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>
                  Project Summary
                </div>
                <div className="space-y-2 text-sm font-body">
                  {[
                    { label: "Name", value: projectName || "—" },
                    { label: "Type", value: projectType || "—" },
                    { label: "Niches", value: selectedNiches.map(n => NICHES.find(nn => nn.id === n)?.label).join(", ") || "—" },
                    { label: "Timeline", value: timeline || "Flexible" },
                    { label: "Budget", value: BUDGET_RANGES.find(r => r.value === selectedBudget)?.label || "—" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span style={{ color: "var(--color-text-tertiary)" }}>{item.label}</span>
                      <span className="text-right font-medium truncate" style={{ color: "var(--color-text-secondary)" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Sticky CTA bar */}
      <div
        className="sticky bottom-0 z-40 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] glass-panel"
        style={{ borderTop: "1px solid var(--color-hairline)" }}
      >
        <div className="max-w-xl mx-auto w-full">
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="secondary" className="flex-1 h-12" onClick={() => setStep((step - 1) as Step)}>
                Back
              </Button>
            )}
            <Button
              className="flex-1 h-12"
              disabled={!canAdvance()}
              onClick={handleNext}
            >
              {step === 4 ? "Publish Project" : "Continue"}
            </Button>
          </div>

          {step < 4 && (
            <button
              className="w-full text-sm text-center mt-2.5 font-body hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-text-tertiary)" }}
              onClick={() => setStep((step + 1) as Step)}
            >
              Skip this step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
