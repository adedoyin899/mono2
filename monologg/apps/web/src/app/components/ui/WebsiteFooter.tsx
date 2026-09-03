import { Lock } from "lucide-react";
import { Logo } from "./Logo";

/** Marketing-site footer for the single merged landing page (Home/Product/
 * Pricing/Resources are sections of one page, not separate routes).
 * Purely presentational, no session logic. */
export function WebsiteFooter() {
  return (
    <footer
      className="py-10 px-5 md:px-16"
      style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-hairline)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          <div>
            <Logo className="h-6 w-auto mb-2" style={{ color: "var(--color-text-primary)" }} />
            <p className="text-sm font-body max-w-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Find performers, find gigs, finish your project — zero agent commissions.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm font-body">
            <div>
              <div className="font-semibold mb-3">Product</div>
              <ul className="space-y-2">
                <li><a href="#product" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>Product</a></li>
                <li><a href="#pricing" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>Pricing</a></li>
                <li><a href="#resources" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>Resources</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">Legal</div>
              <ul className="space-y-2">
                <li><a href="/legal/terms" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>Terms</a></li>
                <li><a href="/legal/privacy" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>Privacy</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">Contact</div>
              <ul className="space-y-2">
                <li><a href="mailto:hello@monologg.co" className="hover:opacity-100 transition-opacity font-body" style={{ color: "var(--color-text-tertiary)" }}>hello@monologg.co</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--color-hairline)" }}
        >
          <p className="text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
            © {new Date().getFullYear()} Monologg Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
            <Lock className="w-3 h-3" style={{ color: "var(--color-success)" }} />
            Escrow guaranteed by FINCRA / Paystack
          </div>
        </div>
      </div>
    </footer>
  );
}
