import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Receipt, X, Download, CheckCircle2, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { formatRelativeTime } from "../../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import type { Transaction } from "@monologg/types";

export type CategoryFilter = "ALL" | "PAYOUT" | "ESCROW" | "DISPUTE";

interface CategoryTab {
  id: CategoryFilter;
  label: string;
  badge: string;
  description: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "ALL", label: "All", badge: "All 3", description: "All platform transactions across every status" },
  { id: "PAYOUT", label: "Payout", badge: "Success", description: "Successfully released payouts transferred to your bank" },
  { id: "ESCROW", label: "Escrow", badge: "Pending", description: "Active contract funds locked safely in Monologg escrow" },
  { id: "DISPUTE", label: "Dispute", badge: "Settled / In Review", description: "Contracts under mediation or settled via dispute resolution" },
];

const STATE_META: Record<Transaction["state"], { label: string; tone: "success" | "accent" | "error" | "warning" | "neutral" }> = {
  INITIATED: { label: "Initiated", tone: "neutral" },
  AUTHORIZED: { label: "Authorized", tone: "accent" },
  ESCROW_HELD: { label: "In Escrow", tone: "accent" },
  RELEASING: { label: "Releasing", tone: "warning" },
  RELEASED: { label: "Released", tone: "success" },
  REFUNDING: { label: "In Review", tone: "warning" },
  REFUNDED: { label: "Refunded to Client", tone: "error" },
  FAILED: { label: "Failed", tone: "error" },
};

export function TransactionHistory() {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
  const [stateFilter, setStateFilter] = useState<Transaction["state"] | "">("");
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .listTransactions(stateFilter ? { state: stateFilter } : {})
      .then((txns) => {
        setTransactions(txns);
        if (!stateFilter || allTransactions.length === 0) {
          setAllTransactions(txns);
        }
      })
      .finally(() => setLoading(false));
  }, [stateFilter]);

  const s = {
    text: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    tertiary: { color: "var(--color-text-tertiary)" } as React.CSSProperties,
    surface: { background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
  };

  // Source pool for metrics and category filtering
  const sourcePool = allTransactions.length > 0 ? allTransactions : transactions;

  // Filter pools by FAANG Escrow Taxonomy:
  // - Payout: Successful, released earnings disbursed to performer
  // - Escrow: Pending funds locked in vault awaiting completion
  // - Dispute: Disputed contracts undergoing arbitration (In Review) or settled (Refunded)
  const payoutTxns = sourcePool.filter(
    (t) => t.direction === "payout" && (t.state === "RELEASED" || t.state === "RELEASING")
  );
  const escrowTxns = sourcePool.filter(
    (t) => t.state === "ESCROW_HELD" || t.state === "AUTHORIZED" || t.state === "INITIATED"
  );
  const disputeTxns = sourcePool.filter(
    (t) => t.state === "REFUNDED" || t.state === "REFUNDING" || t.state === "FAILED"
  );

  // Calculate dynamic sums in Naira (amount / 100 for kobo)
  const sumNaira = (txns: Transaction[]) =>
    txns.reduce((acc, t) => acc + (t.totalAmount || 0), 0) / 100;

  const totalAllNaira = sumNaira(sourcePool);
  const totalPayoutNaira = sumNaira(payoutTxns);
  const totalEscrowNaira = sumNaira(escrowTxns);
  const totalDisputeNaira = sumNaira(disputeTxns);

  // Determine dynamic balance card telemetry based on selected category chip
  let heroTitle = "TOTAL PLATFORM VOLUME";
  let heroAmount = totalAllNaira;
  let heroSubtitle = `${sourcePool.length} Total Contracts across Payouts, Escrow & Disputes`;

  if (activeCategory === "PAYOUT") {
    heroTitle = "TOTAL COMPLETED PAYOUTS";
    heroAmount = totalPayoutNaira;
    heroSubtitle = `${payoutTxns.length} Completed Escrow Contracts Paid Out`;
  } else if (activeCategory === "ESCROW") {
    heroTitle = "FUNDS HELD IN ESCROW";
    heroAmount = totalEscrowNaira;
    heroSubtitle = `${escrowTxns.length} Active Contracts Pending Delivery & Approval`;
  } else if (activeCategory === "DISPUTE") {
    heroTitle = "TOTAL DISPUTED & SETTLED FUNDS";
    heroAmount = totalDisputeNaira;
    const inReviewCount = disputeTxns.filter((t) => t.state === "REFUNDING" || t.state === "INITIATED").length;
    const settledCount = disputeTxns.filter((t) => t.state === "REFUNDED").length;
    heroSubtitle =
      inReviewCount > 0 && settledCount > 0
        ? `${inReviewCount} In Review (Pending) · ${settledCount} Settled (Refunded to Client)`
        : settledCount > 0
        ? `${settledCount} Cases Settled · Escrow Refunded to Client`
        : inReviewCount > 0
        ? `${inReviewCount} Cases Under Dispute Arbitration`
        : "0 Active or Settled Disputes";
  }

  // Determine which transactions to display in the list
  let displayedTransactions = sourcePool;
  if (stateFilter) {
    displayedTransactions = transactions.filter((t) => !stateFilter || t.state === stateFilter);
  } else {
    if (activeCategory === "PAYOUT") displayedTransactions = payoutTxns;
    else if (activeCategory === "ESCROW") displayedTransactions = escrowTxns;
    else if (activeCategory === "DISPUTE") displayedTransactions = disputeTxns;
    else displayedTransactions = sourcePool;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-body">
      {/* Sticky Fixed Top Navigation Bar */}
      <div className="h-16 flex items-center justify-between px-5 md:px-8 sticky top-0 z-40 backdrop-blur-xl bg-[var(--color-bg-glass)] border-b border-[var(--color-hairline)] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-hairline)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-base font-bold font-display text-[var(--color-text-primary)]">
            Earnings &amp; Transaction History
          </div>
        </div>

        <Badge tone="accent">Monologg Escrow Verified</Badge>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Dynamic Financial Summary Card (Payout withdrawal CTA removed for performer) */}
        <div className="p-6 rounded-[24px] bg-[#16161A] text-white border border-[#26262E] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          {/* Subtle ambient lighting accent */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#F13030]/10 blur-3xl pointer-events-none" />

          <div className="space-y-1 z-10">
            <div className="text-xs font-mono text-[#F13030] uppercase tracking-wider font-bold flex items-center gap-2">
              <span>{heroTitle}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F13030]" />
              <span className="text-[10px] text-white/50 uppercase tracking-normal">
                {activeCategory === "ALL"
                  ? "All 3 Categories"
                  : activeCategory === "PAYOUT"
                  ? "Success"
                  : activeCategory === "ESCROW"
                  ? "Pending"
                  : "Settled / In Review"}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#F5F5F0] tracking-tight">
              ₦{Math.round(heroAmount).toLocaleString()}
            </div>
            <div className="text-xs text-white/70 flex items-center gap-1.5">
              <span>{heroSubtitle}</span>
            </div>
          </div>

          {/* Right-side Escrow Security Telemetry */}
          <div className="hidden sm:flex flex-col items-end text-right z-10 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#222228] px-3.5 py-1.5 rounded-full border border-[#32323C] text-xs font-mono text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F13030]" />
              <span>Escrow Protected</span>
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              Automated Ledger Settlement
            </div>
          </div>
        </div>

        {/* Accessible select control keeping compatibility with automated tests & screen readers */}
        <select
          aria-label="Filter by status"
          value={stateFilter}
          onChange={(e) => {
            const val = e.target.value as Transaction["state"] | "";
            setStateFilter(val);
            if (!val) setActiveCategory("ALL");
            else if (val === "RELEASED" || val === "RELEASING") setActiveCategory("PAYOUT");
            else if (val === "ESCROW_HELD" || val === "AUTHORIZED" || val === "INITIATED") setActiveCategory("ESCROW");
            else if (val === "REFUNDED" || val === "REFUNDING" || val === "FAILED") setActiveCategory("DISPUTE");
          }}
          className="sr-only"
        >
          <option value="">All statuses</option>
          <option value="ESCROW_HELD">In Escrow</option>
          <option value="RELEASED">Released</option>
          <option value="REFUNDED">Refunded</option>
          <option value="REFUNDING">In Review</option>
          <option value="FAILED">Failed</option>
        </select>

        {/* 4-Chip Filter Taxonomy: ALL (All 3) | Payout (Success) | Escrow (Pending) | Dispute (Settled / In Review) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.id && !stateFilter;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setStateFilter("");
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? "bg-[#F13030] text-white border-[#F13030] shadow-sm shadow-[#F13030]/20"
                    : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-hairline)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {!loading && displayedTransactions.length === 0 && (
          <div className="flex flex-col items-center text-center py-16">
            <Receipt className="w-8 h-8 mb-3" style={s.tertiary} />
            <p className="text-sm font-body" style={s.secondary}>No transactions found for this category.</p>
          </div>
        )}

        {/* Transaction History Ledger Feed */}
        <div className="space-y-3">
          {displayedTransactions.map((txn) => {
            const isSettledRefund = txn.state === "REFUNDED";
            const isInReview = txn.state === "REFUNDING";
            const isEscrow = txn.state === "ESCROW_HELD" || txn.state === "AUTHORIZED";
            const isReleased = txn.state === "RELEASED";

            // Card heading label
            let typeHeading = txn.direction === "payout" ? "Payout" : "Payment";
            if (isSettledRefund) typeHeading = "Dispute · Refund to Client";
            else if (isInReview) typeHeading = "Dispute · Under Review";
            else if (isEscrow) typeHeading = "Escrow Contract";

            // Status Badge metadata
            let badgeLabel = STATE_META[txn.state]?.label ?? txn.state;
            let badgeTone: "success" | "accent" | "error" | "warning" | "neutral" =
              STATE_META[txn.state]?.tone ?? "neutral";

            if (isSettledRefund) {
              badgeLabel = "Refunded to Client";
              badgeTone = "error";
            } else if (isInReview) {
              badgeLabel = "In Review";
              badgeTone = "warning";
            } else if (isEscrow) {
              badgeLabel = "In Escrow";
              badgeTone = "accent";
            } else if (isReleased) {
              badgeLabel = "Released";
              badgeTone = "success";
            }

            // Directional amount indicator
            let amountPrefix = "";
            if (isReleased) amountPrefix = "+";
            else if (isSettledRefund) amountPrefix = "↩ ";
            else if (isEscrow || isInReview) amountPrefix = "⏳ ";

            return (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className="rounded-[var(--radius-xl)] p-4 cursor-pointer hover:border-[var(--color-accent)] transition-all"
                style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-body" style={s.text}>
                    {typeHeading}
                  </span>
                  <Badge tone={badgeTone}>{badgeLabel}</Badge>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-body" style={s.tertiary}>Booking {txn.bookingId}</span>
                  <span className="text-lg font-display tnum font-semibold" style={s.text}>
                    {amountPrefix}{txn.totalAmountFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-body tnum" style={s.tertiary}>
                  <span>Base {txn.baseAmountFormatted} · Fee {txn.feeAmountFormatted}</span>
                  <span>{formatRelativeTime(txn.createdAt)}</span>
                </div>
                {/* Descriptive sub-ledger indicators for disputes */}
                {isSettledRefund && (
                  <div className="text-[11px] text-red-500/80 mt-1.5 flex items-center gap-1 font-body">
                    <span>• Escrow refunded to client · Net performer earnings: ₦0</span>
                  </div>
                )}
                {isInReview && (
                  <div className="text-[11px] text-amber-500/80 mt-1.5 flex items-center gap-1 font-body">
                    <span>• Arbitration in progress · Funds frozen in escrow</span>
                  </div>
                )}
                {txn.providerRef && (
                  <div className="text-xs font-mono mt-2 truncate" style={s.tertiary}>Ref: {txn.providerRef}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Details & Dispute Resolution Modal */}
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
                    <h3 className="font-display text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {selectedTxn.state === "REFUNDED" || selectedTxn.state === "REFUNDING"
                        ? "Dispute Resolution Invoice"
                        : "Transaction Invoice"}
                    </h3>
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
                <Badge tone={STATE_META[selectedTxn.state]?.tone ?? "neutral"} size="sm" className="mt-2">
                  {selectedTxn.state === "REFUNDED"
                    ? "Refunded to Client"
                    : selectedTxn.state === "REFUNDING"
                    ? "In Review"
                    : STATE_META[selectedTxn.state]?.label ?? selectedTxn.state}
                </Badge>
              </div>

              {/* Contextual Dispute / Escrow Transparency Banner */}
              {selectedTxn.state === "REFUNDED" && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 text-red-400 mb-1">
                    <AlertCircle className="w-4 h-4" /> Dispute Settled: Refunded to Client
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    Arbitration concluded that contract milestones were incomplete or cancelled. Full escrow funds have been refunded to the client's original payment method via Paystack. Net earnings to performer: ₦0.
                  </p>
                </div>
              )}

              {selectedTxn.state === "REFUNDING" && (
                <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-400 mb-1">
                    <Clock className="w-4 h-4" /> Dispute Case Under Review
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    This booking is actively being mediated by Monologg Escrow Arbitration. Contract funds remain frozen securely until review is completed (expected within 48h).
                  </p>
                </div>
              )}

              {selectedTxn.state === "ESCROW_HELD" && (
                <div className="p-3 mb-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 text-indigo-400 mb-1">
                    <ShieldCheck className="w-4 h-4" /> Monologg Escrow Vault Secured
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    Funds are deposited and safely locked in the Monologg escrow vault. Payout will be automatically released to your bank upon milestone delivery and client approval.
                  </p>
                </div>
              )}

              {selectedTxn.state === "RELEASED" && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Completed Escrow Payout
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    Contract milestones were approved and escrow funds have been released to your registered bank account.
                  </p>
                </div>
              )}

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


