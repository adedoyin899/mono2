import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { EASE_OUT, DURATION_MED } from "../../lib/motionTokens";
import { apiClient } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import { CURRENCIES, convertCurrency, CODE_TO_SYMBOL, getRandomLimitError, LimitError } from "../../lib/currency";
import { Modal } from "../components/ui/Modal";
import {
  ChevronLeft, FileText, Users, DollarSign, UploadCloud,
  Check, Mic, Video, AlertTriangle,
  Drama, AudioLines, Laugh, Headphones, MapPin, X
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const NICHES = [
  { id: "actors", label: "Actors", icon: Drama },
  { id: "public_speakers", label: "Public speakers", icon: AudioLines },
  { id: "comperes", label: "Comperes", icon: Mic },
  { id: "comedians", label: "Comedians", icon: Laugh },
  { id: "artists", label: "Artists", icon: Headphones },
  { id: "creators", label: "Creators", icon: Video },
];

// Maps this form's local niche ids to the real Niche enum (features.md Phase 2/5) —
// supports both the standard 6 performer categories and legacy identifiers.
const NICHE_TO_ENUM: Record<string, string> = {
  actors: "ACTOR",
  public_speakers: "SPEAKER_PASTOR",
  comperes: "COMPERE",
  comedians: "COMEDIAN",
  artists: "MUSICIAN",
  creators: "CONTENT_CREATOR",
  actor: "ACTOR",
  vo: "VO_ARTIST",
  comedian: "COMEDIAN",
  compere: "COMPERE",
  speaker: "SPEAKER_PASTOR",
  musician: "MUSICIAN",
  creator: "CONTENT_CREATOR",
};

interface LocationItem {
  city: string;
  state: string;
}

const NIGERIAN_LOCATIONS: LocationItem[] = [
  { city: "Ikeja", state: "Lagos" },
  { city: "Lekki", state: "Lagos" },
  { city: "Victoria Island", state: "Lagos" },
  { city: "Yaba", state: "Lagos" },
  { city: "Surulere", state: "Lagos" },
  { city: "Ajah", state: "Lagos" },
  { city: "Maryland", state: "Lagos" },
  { city: "Abuja", state: "Federal Capital Territory FCT" },
  { city: "Maitama", state: "Abuja FCT" },
  { city: "Wuse 2", state: "Abuja FCT" },
  { city: "Gwarinpa", state: "Abuja FCT" },
  { city: "Port Harcourt", state: "Rivers" },
  { city: "Ibadan", state: "Oyo" },
  { city: "Benin City", state: "Edo" },
  { city: "Enugu", state: "Enugu" },
  { city: "Asaba", state: "Delta" },
  { city: "Warri", state: "Delta" },
  { city: "Calabar", state: "Cross River" },
  { city: "Kano", state: "Kano" },
  { city: "Uyo", state: "Akwa Ibom" },
  { city: "Abeokuta", state: "Ogun" },
  { city: "Jos", state: "Plateau" },
  { city: "Owerri", state: "Imo" },
  { city: "Ilorin", state: "Kwara" },
  { city: "Akure", state: "Ondo" },
  { city: "Osogbo", state: "Osun" },
  { city: "Awka", state: "Anambra" },
  { city: "Onitsha", state: "Anambra" },
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

const STEPS = [
  { num: 1 as Step, label: "Project Details", icon: FileText },
  { num: 2 as Step, label: "Requirements", icon: Users },
  { num: 3 as Step, label: "Assets", icon: UploadCloud },
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
  const [locationInput, setLocationInput] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const filteredLocations = React.useMemo(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) return NIGERIAN_LOCATIONS.slice(0, 8);
    return NIGERIAN_LOCATIONS.filter(
      (item) =>
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q)
    );
  }, [locationInput]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [budgetAmount, setBudgetAmount] = useState(150000);
  const [sliderMax, setSliderMax] = useState(2000000);
  const [budgetInputStr, setBudgetInputStr] = useState("150,000");
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  // features.md Phase 14 (X4): empty = uncapped, matching the server's own
  // "null = uncapped" convention (routes/briefs.ts).
  const [applicantCap, setApplicantCap] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const activeCurr = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  // Sync sliderMax when currency changes
  React.useEffect(() => {
    const active = CURRENCIES.find(c => c.code === selectedCurrency);
    if (active) {
      setSliderMax(prev => Math.max(prev, active.max));
    }
  }, [selectedCurrency]);

  // Sync input string when budgetAmount changes
  React.useEffect(() => {
    setBudgetInputStr(budgetAmount.toLocaleString("en-US"));
  }, [budgetAmount]);

  const toggleNiche = (id: string) => {
    setSelectedNiches(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const canAdvance = () => {
    if (step === 1) return projectName.trim() && projectType;
    if (step === 2) return selectedNiches.length > 0;
    if (step === 3) return true;
    if (step === 4) return budgetAmount > 0;
    return false;
  };

  const symbol = "₦";

  const handleBudgetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericStr = rawVal.replace(/\D/g, "");
    
    if (numericStr.length > 15 || (numericStr.length === 15 && parseInt(numericStr, 10) > 999999999999999)) {
      const isMobile = window.innerWidth < 500;
      setLimitError(getRandomLimitError(isMobile));
      return;
    }
    
    setBudgetInputStr(numericStr);
    
    const numericVal = numericStr ? parseInt(numericStr, 10) : 0;
    setBudgetAmount(numericVal);
    if (numericVal > sliderMax) {
      setSliderMax(numericVal);
    }
  };

  const handleBudgetInputFocus = () => {
    setBudgetInputStr(budgetAmount === 0 ? "" : budgetAmount.toString());
  };

  const handleBudgetInputBlur = () => {
    setBudgetInputStr(budgetAmount.toLocaleString("en-US"));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBudgetAmount(val);
    if (val >= sliderMax * 0.95) {
      setSliderMax(prev => Math.round(prev * 1.5));
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep((step + 1) as Step);
      return;
    }
    // Live mode: actually create the Brief so it shows up in ClientDashboard's real
    // "My Projects" list. Mock mode: unchanged — just show the success screen.
    setPublishing(true);
    try {
      await apiClient.createBrief({
        projectName,
        projectType,
        nicheReq: selectedNiches.map(id => NICHE_TO_ENUM[id]).filter(Boolean),
        budgetAmount: Math.round(budgetAmount * 100),
        budgetCurrency: selectedCurrency,
        applicantCap: applicantCap.trim() ? Number(applicantCap) : null,
        status: "ACTIVE",
      });
      appStateSync.addNotification({
        id: `notif-${Date.now()}`,
        kind: "PROJECT_APPLICATION",
        createdAt: new Date().toISOString(),
        payload: { clientName: `New Brief Posted: ${projectName}` },
      });
      setSubmitSuccess(true);
    } finally {
      setPublishing(false);
    }
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
            Your brief is now live. Verified performers will start applying shortly. You can also browse and invite specific performers.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full h-12" onClick={() => navigate("/client")}>View My Projects</Button>
            <Button variant="secondary" className="w-full h-12" onClick={() => { setStep(1); setSubmitSuccess(false); setProjectName(""); setProjectType(""); setSelectedNiches([]); setSelectedCurrency("NGN"); setBudgetAmount(150000); setSliderMax(2000000); setBudgetInputStr("150,000"); setApplicantCap(""); }}>
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
                  placeholder="Describe your project, goals, and what you're looking for in a performer..."
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
                <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Performer Requirements</h2>
                <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>What type of performer are you looking for?</p>
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
                    className="w-full h-[54px] px-4 rounded-[var(--radius-lg)] text-base font-body border appearance-none"
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
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider font-body mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-accent)" }} />
                    <Input
                      className="pl-9 pr-8 h-[54px] text-sm"
                      placeholder="e.g., Lagos or Remote"
                      value={locationInput}
                      onFocus={() => setShowLocationDropdown(true)}
                      onChange={e => {
                        setLocationInput(e.target.value);
                        setLocation(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                    />
                    {locationInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocationInput("");
                          setLocation("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Location interactive dropdown */}
                  {showLocationDropdown && filteredLocations.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 p-1 rounded-xl shadow-xl max-h-48 overflow-y-auto space-y-0.5 z-50"
                      style={{
                        background: "var(--color-bg-surface)",
                        border: "1px solid var(--color-hairline)",
                      }}
                    >
                      {filteredLocations.map(item => (
                        <button
                          key={item.city}
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault();
                            setLocationInput(item.city);
                            setLocation(item.city);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors flex items-baseline justify-between gap-3"
                        >
                          <span className="text-sm font-body font-medium" style={{ color: "var(--color-text-primary)" }}>{item.city}</span>
                          <span className="text-[11px] font-body shrink-0" style={{ color: "var(--color-text-tertiary)" }}>{item.state}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>Assets</h2>
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

              <FormField label="Additional Notes for Performers">
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm font-body border resize-none"
                  rows={5}
                  placeholder="Any specific requirements, tone preferences, reference examples, or important context the performer should know..."
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
                <p className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>Set your project budget range to attract the right performers.</p>
              </div>

              <FormField label="Budget Amount (NGN) *">
                <div className="space-y-4">
                  <div className="relative flex items-center">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-semibold text-sm pointer-events-none z-10" style={{ color: "var(--color-text-secondary)" }}>
                      ₦
                    </span>
                    <Input
                      className="pl-8 pr-4 font-mono tnum w-full"
                      value={budgetInputStr}
                      onChange={handleBudgetInputChange}
                      onFocus={handleBudgetInputFocus}
                      onBlur={handleBudgetInputBlur}
                    />
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={sliderMax}
                    step={5000}
                    value={budgetAmount}
                    onChange={handleSliderChange}
                    className="w-full accent-[#7B00FE] cursor-pointer"
                  />
                </div>
              </FormField>

              <FormField label="Maximum applicants (optional)">
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 10 — leave blank for unlimited"
                  value={applicantCap}
                  onChange={e => setApplicantCap(e.target.value.replace(/\D/g, ""))}
                />
                <p className="text-xs font-body mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                  Applications close automatically once this many performers have applied — you still choose who to hire from the pool.
                </p>
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
                    { label: "Categories", value: selectedNiches.map(n => NICHES.find(nn => nn.id === n)?.label).join(", ") || "—" },
                    { label: "Timeline", value: timeline || "Flexible" },
                    { label: "Budget", value: `₦${budgetAmount.toLocaleString()}` },
                    { label: "Maximum applicants", value: applicantCap || "Unlimited" },
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
              disabled={!canAdvance() || publishing}
              onClick={handleNext}
            >
              {step === 4 ? (publishing ? "Publishing…" : "Publish Project") : "Continue"}
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

      {limitError && (
        <Modal onClose={() => setLimitError(null)} align="center" strength="strong">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] rounded-[28px] p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F13030]/10 flex items-center justify-center text-[#F13030]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-[#16161A] dark:text-white">
                {limitError.heading}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#A6A6B0] font-body leading-relaxed">
                {limitError.subtext}
              </p>
            </div>
            <button
              onClick={() => setLimitError(null)}
              className="w-full py-3 rounded-full bg-[#F13030] text-white font-bold text-sm hover:bg-[#d31f20] transition-all shadow-lg active:scale-95"
            >
              Adjust Amount
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
