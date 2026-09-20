import { Lock } from "lucide-react";
import { Logo } from "./Logo";

/** Shared marketing-site footer — used by the Home, Product, Pricing, and
 * Resources pages. Purely presentational, no session logic. */
export function WebsiteFooter() {
  return (
    <footer
      className="py-12 px-5 md:px-16 transition-colors"
      style={{
        background: "var(--color-paper-white)",
        borderTop: "1px solid var(--color-faint-line)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          <div>
            <Logo className="h-6 w-auto mb-3" style={{ color: "var(--color-text-primary)" }} title="Monologg" />
            <p className="text-sm font-body max-w-xs leading-relaxed" style={{ color: "var(--color-warm-gray)" }}>
              Find performers, find gigs, finish your project — zero agent commissions.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm font-body">
            <div>
              <div className="font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Product</div>
              <ul className="space-y-2.5">
                <li><a href="/product" className="hover:text-[var(--color-text-primary)] transition-colors font-body" style={{ color: "var(--color-warm-gray)" }}>Product</a></li>
                <li><a href="/pricing" className="hover:text-[var(--color-text-primary)] transition-colors font-body" style={{ color: "var(--color-warm-gray)" }}>Pricing</a></li>
                <li><a href="/resources" className="hover:text-[var(--color-text-primary)] transition-colors font-body" style={{ color: "var(--color-warm-gray)" }}>Resources</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Legal</div>
              <ul className="space-y-2.5">
                <li><a href="/legal/terms" className="hover:text-[var(--color-text-primary)] transition-colors font-body" style={{ color: "var(--color-warm-gray)" }}>Terms</a></li>
                <li><a href="/legal/privacy" className="hover:text-[var(--color-text-primary)] transition-colors font-body" style={{ color: "var(--color-warm-gray)" }}>Privacy</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Contact</div>
              <ul className="space-y-2.5">
                <li><a href="mailto:hello@monologg.co" className="hover:text-[var(--color-text-primary)] transition-colors font-body" style={{ color: "var(--color-warm-gray)" }}>hello@monologg.co</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--color-faint-line)" }}
        >
          <p className="text-xs font-body" style={{ color: "var(--color-warm-gray)" }}>
            © {new Date().getFullYear()} Monologg Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-body" style={{ color: "var(--color-warm-gray)" }}>
            <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
            Escrow guaranteed by FINCRA / Paystack
          </div>
        </div>
      </div>
    </footer>
  );
}
