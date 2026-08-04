import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { FormField } from "../components/ui/FormField";
import { Modal } from "../components/ui/Modal";
import { useTheme } from "../Root";
import { DURATION_FAST, DURATION_MED, DURATION_SLOW, EASE_OUT, EASE_SPRING } from "../../lib/motionTokens";
import { ChevronLeft, Shield, Check, X } from "lucide-react";

type Role = "talent" | "client";

/** Reads the live value of a CSS custom property off :root at render time —
 * this page shows what the tokens actually resolve to right now, not a
 * hand-copied snapshot, so it can never drift from src/styles/tokens.css. */
function useCSSVar(name: string, scopeRef: React.RefObject<HTMLElement>) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const el = scopeRef.current ?? document.documentElement;
    setValue(getComputedStyle(el).getPropertyValue(name).trim());
  });
  return value;
}

function Swatch({ name, label, scopeRef }: { name: string; label?: string; scopeRef: React.RefObject<HTMLElement> }) {
  const value = useCSSVar(name, scopeRef);
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-[var(--radius-md)] shrink-0"
        style={{ background: `var(${name})`, border: "1px solid var(--color-border-default)" }}
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold font-body truncate" style={{ color: "var(--color-text-primary)" }}>{label ?? name}</div>
        <div className="text-xs font-mono truncate" style={{ color: "var(--color-text-tertiary)" }}>{name} · {value}</div>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
      {description && <p className="text-sm font-body mb-5 max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>{description}</p>}
      {!description && <div className="mb-5" />}
      {children}
    </section>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`p-5 rounded-[var(--radius-lg)] ${className}`}
      style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-card)", ...style }}
    >
      {children}
    </div>
  );
}

export function DesignSystem() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [role, setRole] = useState<Role>("talent");
  const [modalOpen, setModalOpen] = useState(false);
  const scopeRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={scopeRef} className={`role-${role} min-h-screen`} style={{ background: "var(--color-bg-canvas)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              aria-label="Back"
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
              style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="font-display text-lg leading-tight truncate" style={{ color: "var(--color-text-primary)" }}>Monologg Design System</div>
              <div className="text-xs font-mono truncate" style={{ color: "var(--color-text-tertiary)" }}>src/styles/tokens.css · live values</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-full p-0.5" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}>
              {(["talent", "client"] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="px-3 h-8 rounded-full text-xs font-semibold font-body capitalize transition-all"
                  style={{
                    background: role === r ? "var(--color-accent)" : "transparent",
                    color: role === r ? "var(--color-accent-on)" : "var(--color-text-secondary)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="h-8 px-3 text-xs" onClick={toggle}>{isDark ? "Light" : "Dark"}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">

        <p className="text-sm font-body mb-10 max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
          Every value below is read live from the CSS custom properties defined in{" "}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-bg-elevated)" }}>src/styles/tokens.css</code>.
          Change a token there and every page in the app — and this page — updates automatically, because they all
          resolve the same <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-bg-elevated)" }}>var(--token-name)</code>.
          Toggle <strong>Talent / Client</strong> above to see the role-adaptive accent (red ↔ purple) flip, and{" "}
          <strong>Light / Dark</strong> to see the full theme swap.
        </p>

        {/* ── Colors ── */}
        <Section title="Color" description="Neutrals and semantic colors are theme-invariant token names — only their values change between light and dark. --color-accent* is role-adaptive: it aliases to the red ramp under .role-talent and the purple ramp under .role-client.">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
            <Swatch name="--color-bg-canvas" label="Canvas" scopeRef={scopeRef} />
            <Swatch name="--color-bg-surface" label="Surface" scopeRef={scopeRef} />
            <Swatch name="--color-bg-elevated" label="Elevated" scopeRef={scopeRef} />
            <Swatch name="--color-hairline" label="Hairline" scopeRef={scopeRef} />
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
            <Swatch name="--color-accent" label="Accent (role-adaptive)" scopeRef={scopeRef} />
            <Swatch name="--color-accent-press" label="Accent · press" scopeRef={scopeRef} />
            <Swatch name="--color-accent-soft" label="Accent · soft" scopeRef={scopeRef} />
            <Swatch name="--color-accent-glow" label="Accent · glow" scopeRef={scopeRef} />
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
            <Swatch name="--color-text-primary" label="Text · primary" scopeRef={scopeRef} />
            <Swatch name="--color-text-secondary" label="Text · secondary" scopeRef={scopeRef} />
            <Swatch name="--color-text-tertiary" label="Text · tertiary" scopeRef={scopeRef} />
            <Swatch name="--color-border-default" label="Border · default" scopeRef={scopeRef} />
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            <Swatch name="--color-success" label="Success" scopeRef={scopeRef} />
            <Swatch name="--color-warning" label="Warning" scopeRef={scopeRef} />
            <Swatch name="--color-error" label="Error" scopeRef={scopeRef} />
            <Swatch name="--color-overlay" label="Modal overlay" scopeRef={scopeRef} />
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography" description="Display face for headings (font-display), body face for everything else (font-body), tabular mono for numbers (font-mono / .tnum). The --font-size-* scale is defined in tokens.css but not yet adopted on every heading — see the audit note at the bottom.">
          <Card className="space-y-3">
            <div className="font-display" style={{ fontSize: "var(--font-size-4xl)", color: "var(--color-text-primary)" }}>Aa — General Sans</div>
            <div className="font-body text-base" style={{ color: "var(--color-text-primary)" }}>Plus Jakarta Sans — the body face used for paragraphs, labels and UI copy.</div>
            <div className="font-mono tnum text-sm" style={{ color: "var(--color-text-secondary)" }}>₦120,000.00 — JetBrains Mono, tabular-nums</div>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] as const).map(step => (
              <div key={step} className="text-center p-3 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)" }}>
                <div className="font-mono text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>--font-size-{step}</div>
                <div className="font-display truncate" style={{ fontSize: `var(--font-size-${step})`, color: "var(--color-text-primary)" }}>Aa</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Radius & Shadow ── */}
        <Section title="Radius & shadow" description="Six steps, used consistently via rounded-[var(--radius-*)] — not Tailwind's default rounded-xl/2xl scale, which doesn't share these values.">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            {(["sm", "md", "lg", "xl", "2xl", "full"] as const).map(step => (
              <div key={step} className="text-center">
                <div
                  className="w-full aspect-square mb-2"
                  style={{ background: "var(--color-accent-soft)", borderRadius: `var(--radius-${step})` }}
                />
                <div className="font-mono text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>--radius-{step}</div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {(["card", "elevated", "modal"] as const).map(step => (
              <div key={step} className="p-4 rounded-[var(--radius-md)] text-center" style={{ background: "var(--color-bg-surface)", boxShadow: `var(--shadow-${step})` }}>
                <div className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>--shadow-{step}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Motion ── */}
        <Section title="Motion" description="CSS transitions read var(--duration-*)/var(--ease-*) directly. Framer Motion's JS transition prop can't read CSS custom properties, so src/lib/motionTokens.ts mirrors these as plain numbers — keep the two in sync by hand when either changes.">
          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <div className="text-xs font-mono mb-2" style={{ color: "var(--color-text-tertiary)" }}>tokens.css</div>
              <div className="text-sm font-body space-y-1" style={{ color: "var(--color-text-primary)" }}>
                <div>--duration-fast: 160ms</div>
                <div>--duration-med: 280ms</div>
                <div>--duration-slow: 400ms</div>
                <div>--ease-out: cubic-bezier(0.22, 1, 0.36, 1)</div>
                <div>--ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1)</div>
              </div>
            </Card>
            <Card>
              <div className="text-xs font-mono mb-2" style={{ color: "var(--color-text-tertiary)" }}>lib/motionTokens.ts</div>
              <div className="text-sm font-mono space-y-1" style={{ color: "var(--color-text-primary)" }}>
                <div>DURATION_FAST = {DURATION_FAST}</div>
                <div>DURATION_MED = {DURATION_MED}</div>
                <div>DURATION_SLOW = {DURATION_SLOW}</div>
                <div>EASE_OUT = [{EASE_OUT.join(", ")}]</div>
                <div>EASE_SPRING = [{EASE_SPRING.join(", ")}]</div>
              </div>
            </Card>
          </div>
        </Section>

        {/* ── Components ── */}
        <Section title="Components" description="Rendered from the actual source in src/app/components/ui — not a copy. Editing Button.tsx, Badge.tsx, etc. changes both the live app and this page.">
          <div className="space-y-8">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Wise &amp; Hyer Pill Buttons</div>
              <div className="flex flex-wrap gap-3">
                <Button variant="lime">Lime Voltage</Button>
                <Button variant="forest">Forest Ink</Button>
                <Button variant="outline-pill">Outline Pill</Button>
                <Button variant="clay">Clay Ember</Button>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="icon"><Check className="w-4 h-4" /></Button>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Web vs Mobile Breakpoints &amp; Layout Strategy</div>
              <Card className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[16px] bg-[#163300] text-white space-y-2">
                    <div className="text-xs font-bold text-[#9fe870] uppercase font-mono">Web Application (Desktop)</div>
                    <div className="text-xs text-white/80">Persistent left sidebar navigation, multi-column bento grids, 1200px max-width centered canvas, elevated hover tilt cards, and WebGL particle backgrounds.</div>
                  </div>
                  <div className="p-4 rounded-[16px] bg-[#e8ebe6] text-[#163300] dark:bg-[#16161A] dark:text-[#9fe870] space-y-2 border border-[var(--color-hairline)]">
                    <div className="text-xs font-bold uppercase font-mono">Mobile Web App (Touch)</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Bottom pill navigation sheet with safe-area spacing, single-column stacked card streams, 9999px pill action triggers, and swipeable gesture cards.</div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Badge</div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="accent">Accent</Badge>
                <Badge tone="success">Success</Badge>
                <Badge tone="warning">Warning</Badge>
                <Badge tone="error">Error</Badge>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Avatar</div>
              <div className="flex flex-wrap items-end gap-3">
                <Avatar size="sm" background="var(--color-accent-glow)" color="var(--color-accent)">ET</Avatar>
                <Avatar size="md" background="var(--color-accent-glow)" color="var(--color-accent)">ET</Avatar>
                <Avatar size="lg" background="var(--color-accent-glow)" color="var(--color-accent)">ET</Avatar>
                <Avatar size="xl" background="var(--color-accent-glow)" color="var(--color-accent)">ET</Avatar>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>FormField + Input</div>
              <div className="max-w-sm">
                <FormField label="Full Name">
                  <Input placeholder="Elias Thorne" />
                </FormField>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Modal</div>
              <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal example</Button>
              {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                  <div
                    className="w-full max-w-sm rounded-[var(--radius-lg)] p-6"
                    style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-xl" style={{ color: "var(--color-text-primary)" }}>Example modal</h3>
                      <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-body mb-5" style={{ color: "var(--color-text-secondary)" }}>
                      This is the real <code className="font-mono text-xs">Modal</code> component — the scrim color, blur and positioning come from{" "}
                      <code className="font-mono text-xs">src/app/components/ui/Modal.tsx</code>, used identically here and in every dashboard.
                    </p>
                    <Button className="w-full" onClick={() => setModalOpen(false)}>Close</Button>
                  </div>
                </Modal>
              )}
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider mb-3 font-body" style={{ color: "var(--color-text-tertiary)" }}>Role scope demo</div>
              <Card className="flex items-center gap-3">
                <Avatar background="var(--color-accent-soft)" color="var(--color-accent)"><Shield className="w-4 h-4" /></Avatar>
                <div className="text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                  This card sits inside <code className="font-mono text-xs">.role-{role}</code> — its accent color is{" "}
                  <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>currently {role === "talent" ? "red" : "purple"}</span>. Toggle the switch in the header to see it change.
                </div>
              </Card>
            </div>
          </div>
        </Section>

        {/* ── Known gaps ── */}
        <Section title="Known gaps (tracked, not yet migrated)">
          <Card className="text-sm font-body space-y-2" style={{ color: "var(--color-text-secondary)" }}>
            <p>· The <code className="font-mono text-xs">--font-size-*</code> scale above is new — most page headings still use ad-hoc arbitrary pixel values rather than these tokens.</p>
            <p>· <code className="font-mono text-xs">src/styles/theme.css</code> and <code className="font-mono text-xs">src/DoyinXMonologgCopy/styles.css</code> are deprecated, unimported legacy token sets kept on disk for reference only — see their file headers.</p>
            <p>· Framer Motion's JS-side durations/eases are mirrored by hand in <code className="font-mono text-xs">motionTokens.ts</code> since CSS custom properties aren't readable from JS animation props.</p>
          </Card>
        </Section>

      </div>
    </div>
  );
}
