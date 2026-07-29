import { useNavigate } from "react-router";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { CURRENT_TERMS_VERSION } from "@monologg/types";

// features.md Phase 10: "static legal pages, versioned." The version + page
// structure are real and load-bearing (CURRENT_TERMS_VERSION is what
// AuthFlow.tsx sends and TermsAcceptance persists) — the prose below is NOT
// reviewed legal copy. Publishing real Terms/Privacy text requires legal
// review this project has never had; shipping fabricated "binding" language
// under an AI's byline would be actively wrong, not just incomplete. This is
// flagged inline on the page itself, not just in code comments.

type LegalPageType = "terms" | "privacy";

const CONTENT: Record<LegalPageType, { title: string; sections: Array<{ heading: string; body: string }> }> = {
  terms: {
    title: "Terms of Service",
    sections: [
      { heading: "1. Using Monologg", body: "You must be able to form a binding contract to use Monologg, and you agree to provide accurate account information." },
      { heading: "2. Bookings & Escrow", body: "Payments for bookings are held in escrow until deliverables are approved. Platform fees are disclosed before checkout and never change after a booking is confirmed." },
      { heading: "3. Identity Verification & AI Tagging", body: "Identity verification and AI-generated style tags are independent systems. Verification never derives from AI tagging, and AI tagging never confers identity verification." },
      { heading: "4. Account Termination", body: "Either party may close their account at any time. Bookings already in escrow are settled per their existing state before closure." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "1. What We Collect", body: "Account details (name, email, phone if provided), booking and payment records, and — for talent completing identity verification — the minimum KYC data our verification provider requires." },
      { heading: "2. How We Use It", body: "To operate bookings, escrow, notifications, and identity verification. We do not sell personal data." },
      { heading: "3. Third-Party Providers", body: "Payments (Paystack/Stripe/Airwallex), identity verification (Smile Identity), email/SMS delivery (SendGrid/Twilio), and calendar sync (Google) each process only the data their function requires." },
      { heading: "4. Your Rights", body: "You can request access to or deletion of your data by contacting support." },
    ],
  },
};

export function LegalPage({ type }: { type: LegalPageType }) {
  const navigate = useNavigate();
  const content = CONTENT[type];

  const s = {
    text: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    tertiary: { color: "var(--color-text-tertiary)" } as React.CSSProperties,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-semibold font-display" style={s.text}>{content.title}</div>
      </div>

      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-body mb-6 tnum" style={s.tertiary}>
          Version {CURRENT_TERMS_VERSION} · Last updated {CURRENT_TERMS_VERSION}
        </p>

        <div
          className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] mb-6 text-xs font-body leading-relaxed"
          style={{ background: "var(--color-gold-soft)", color: "var(--color-gold-dark)" }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Draft placeholder — this page has not been through legal review. Do not treat it as binding until real counsel-reviewed copy replaces it.</span>
        </div>

        {content.sections.map((section) => (
          <div key={section.heading} className="mb-6">
            <h2 className="font-display text-base mb-2" style={s.text}>{section.heading}</h2>
            <p className="text-sm font-body leading-relaxed" style={s.secondary}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
