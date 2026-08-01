import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Receipt, X, Download, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { formatRelativeTime } from "../../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import type { Transaction } from "@monologg/types";

const STATE_META: Record<Transaction["state"], { label: string; tone: "success" | "accent" | "error" | "warning" | "neutral" }> = {
  INITIATED: { label: "Initiated", tone: "neutral" },
  AUTHORIZED: { label: "Authorized", tone: "accent" },
  ESCROW_HELD: { label: "In Escrow", tone: "accent" },
  RELEASING: { label: "Releasing", tone: "warning" },
  RELEASED: { label: "Released", tone: "success" },
  REFUNDING: { label: "Refunding", tone: "warning" },
  REFUNDED: { label: "Refunded", tone: "error" },
  FAILED: { label: "Failed", tone: "error" },
};

const STATE_FILTERS: Array<{ value: Transaction["state"] | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "ESCROW_HELD", label: "In Escrow" },
  { value: "RELEASED", label: "Released" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
];

export function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stateFilter, setStateFilter] = useState<Transaction["state"] | "">("");
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .listTransactions(stateFilter ? { state: stateFilter } : {})
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [stateFilter]);

  const s = {
    text: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    tertiary: { color: "var(--color-text-tertiary)" } as React.CSSProperties,
    surface: { background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
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
        <div className="text-sm font-semibold font-display" style={s.text}>Transaction History</div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <select
          aria-label="Filter by status"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as Transaction["state"] | "")}
          className="w-full h-11 mb-5 rounded-[var(--radius-lg)] border px-3 font-body text-sm"
          style={{ ...s.surface, color: "var(--color-text-primary)" }}
        >
          {STATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {!loading && transactions.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <Receipt className="w-8 h-8 mb-3" style={s.tertiary} />
            <p className="text-sm font-body" style={s.secondary}>No transactions yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {transactions.map((txn) => {
            const meta = STATE_META[txn.state];
            return (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className="rounded-[var(--radius-xl)] p-4 cursor-pointer hover:border-[var(--color-accent)] transition-all"
                style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-body" style={s.text}>
                    {txn.direction === "payout" ? "Payout" : "Payment"}
                  </span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-body" style={s.tertiary}>Booking {txn.bookingId}</span>
                  <span className="text-lg font-display tnum" style={s.text}>{txn.totalAmountFormatted}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-body tnum" style={s.tertiary}>
                  <span>Base {txn.baseAmountFormatted} · Fee {txn.feeAmountFormatted}</span>
                  <span>{formatRelativeTime(txn.createdAt)}</span>
                </div>
                {txn.providerRef && (
                  <div className="text-xs font-mono mt-2 truncate" style={s.tertiary}>Ref: {txn.providerRef}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTxn && (
          <Modal onClose={() => setSelectedTxn(null)}>
            <motion.div
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
              className="w-full max-w-md rounded-[var(--radius-xl)] p-6"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)", boxShadow: "var(--shadow-elevated)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: "var(--color-hairline)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-accent-glow)" }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>Transaction Invoice</h3>
                    <div className="text-xs font-mono" style={{ color: "var(--color-text-tertiary)" }}>{selectedTxn.id}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedTxn(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-4 mb-4 rounded-xl" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                <div className="text-xs font-body uppercase tracking-wider mb-1" style={{ color: "var(--color-text-tertiary)" }}>Total Amount</div>
                <div className="font-display text-3xl tnum font-semibold" style={{ color: "var(--color-accent)" }}>{selectedTxn.totalAmountFormatted}</div>
                <Badge tone={STATE_META[selectedTxn.state].tone} size="sm" className="mt-2">
                  {STATE_META[selectedTxn.state].label}
                </Badge>
              </div>

              <div className="space-y-3 mb-6 text-xs font-body">
                <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                  <span style={{ color: "var(--color-text-tertiary)" }}>Transaction Type</span>
                  <span className="font-semibold capitalize" style={{ color: "var(--color-text-primary)" }}>{selectedTxn.direction}</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                  <span style={{ color: "var(--color-text-tertiary)" }}>Booking Reference</span>
                  <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>{selectedTxn.bookingId}</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                  <span style={{ color: "var(--color-text-tertiary)" }}>Base Amount</span>
                  <span className="font-mono" style={{ color: "var(--color-text-primary)" }}>{selectedTxn.baseAmountFormatted}</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                  <span style={{ color: "var(--color-text-tertiary)" }}>Platform Fee</span>
                  <span className="font-mono" style={{ color: "var(--color-text-secondary)" }}>{selectedTxn.feeAmountFormatted}</span>
                </div>
                {selectedTxn.providerRef && (
                  <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                    <span style={{ color: "var(--color-text-tertiary)" }}>Provider Ref</span>
                    <span className="font-mono truncate max-w-[200px]" style={{ color: "var(--color-text-primary)" }}>{selectedTxn.providerRef}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span style={{ color: "var(--color-text-tertiary)" }}>Date & Time</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{formatRelativeTime(selectedTxn.createdAt)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 h-10 text-xs gap-1.5" onClick={() => window.print()}>
                  <Download className="w-4 h-4" /> Download Receipt
                </Button>
                <Button className="flex-1 h-10 text-xs" onClick={() => setSelectedTxn(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

