import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Receipt, X, Download, CheckCircle2, ShieldCheck, AlertCircle, Clock, RotateCcw } from "lucide-react";
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
  description: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "ALL", label: "All", description: "All platform transactions across every status" },
  { id: "PAYOUT", label: "Payout", description: "Completed payouts transferred to your bank" },
  { id: "ESCROW", label: "Escrow", description: "Funds locked safely in Monologg escrow" },
  { id: "DISPUTE", label: "Dispute", description: "Contracts under mediation or settled via dispute resolution" },
];

// Clean, human-friendly status taxonomy:
// - Payout: "Success"
// - Escrow: "Pending"
// - Dispute: "Settled" (or "In Review")
const STATE_META: Record<Transaction["state"], { label: string; tone: "success" | "accent" | "error" | "warning" | "neutral" }> = {
  INITIATED: { label: "Pending", tone: "warning" },
  AUTHORIZED: { label: "Pending", tone: "warning" },
  ESCROW_HELD: { label: "Pending", tone: "warning" },
  RELEASING: { label: "Processing", tone: "warning" },
  RELEASED: { label: "Success", tone: "success" },
  REFUNDING: { label: "In Review", tone: "warning" },
  REFUNDED: { label: "Settled", tone: "error" },
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

  // Filter pools by Category Taxonomy:
  // - Payout: Success (Released payouts)
  // - Escrow: Pending (Escrow held funds)
  // - Dispute: Settled or In Review
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
        {/* Dynamic Financial Summary Card */}
        <div className="p-6 rounded-[24px] bg-[#16161A] text-white border border-[#26262E] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          {/* Subtle ambient lighting accent */}
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#F13030]/10 blur-3xl pointer-events-none" />

          <div className="space-y-1 z-10">
            <div className="text-xs font-mono text-[#F13030] uppercase tracking-wider font-bold">
              <span>{heroTitle}</span>
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
          <option value="ESCROW_HELD">Pending</option>
          <option value="RELEASED">Success</option>
          <option value="REFUNDED">Settled</option>
          <option value="REFUNDING">In Review</option>
          <option value="FAILED">Failed</option>
        </select>

        {/* 4-Chip Filter Taxonomy: All | Payout | Escrow | Dispute */}
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
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center active:scale-95 ${
                  isSelected
                    ? "bg-[#F13030] text-white border-[#F13030] shadow-sm shadow-[#F13030]/20"
                    : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-hairline)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <span>{tab.label}</span>
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

        {/* High-Hierarchy, Easy-to-Scan Transaction Ledger Feed */}
        <div className="space-y-3">
          {displayedTransactions.map((txn) => {
            const isSettledRefund = txn.state === "REFUNDED";
            const isInReview = txn.state === "REFUNDING";
            const isEscrow = txn.state === "ESCROW_HELD" || txn.state === "AUTHORIZED" || txn.state === "INITIATED";
            const isReleased = txn.state === "RELEASED";

            // Clean, simple category label
            let typeLabel = "Payout";
            if (isSettledRefund || isInReview) typeLabel = "Dispute";
            else if (isEscrow) typeLabel = "Escrow";

            // Status Badge metadata:
            // Payout -> Success
            // Escrow -> Pending
            // Dispute -> Settled or In Review
            let badgeLabel = STATE_META[txn.state]?.label ?? "Pending";
            let badgeTone: "success" | "accent" | "error" | "warning" | "neutral" =
              STATE_META[txn.state]?.tone ?? "neutral";

            // Directional prefix and text color
            let amountPrefix = "";
            let amountColor = "text-[var(--color-text-primary)]";
            if (isReleased) {
              amountPrefix = "+";
              amountColor = "text-emerald-500 font-semibold";
            } else if (isSettledRefund) {
              amountPrefix = "↩ ";
              amountColor = "text-zinc-400";
            } else if (isInReview) {
              amountPrefix = "⏳ ";
              amountColor = "text-amber-500 font-semibold";
            }

            return (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className="rounded-[20px] p-4 cursor-pointer hover:border-[var(--color-accent)] transition-all bg-[var(--color-bg-surface)] border border-[var(--color-hairline)] hover:shadow-md group"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Primary Row: Left (Icon + Booking + Category) | Right (Amount + Status Badge) */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left Column */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isReleased
                          ? "bg-emerald-500/15 text-emerald-500"
                          : isEscrow
                          ? "bg-amber-500/15 text-amber-500"
                          : isInReview
                          ? "bg-purple-500/15 text-purple-400"
                          : "bg-red-500/15 text-red-500"
                      }`}
                    >
                      {isReleased && <CheckCircle2 className="w-5 h-5" />}
                      {isEscrow && <Clock className="w-5 h-5" />}
                      {isInReview && <AlertCircle className="w-5 h-5" />}
                      {isSettledRefund && <RotateCcw className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[var(--color-text-primary)] font-display truncate">
                        Booking {txn.bookingId}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-[var(--color-text-secondary)]">{typeLabel}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(txn.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount + Status Chip */}
                  <div className="text-right shrink-0">
                    <div className={`text-base sm:text-lg font-mono tracking-tight ${amountColor}`}>
                      {amountPrefix}{txn.totalAmountFormatted}
                    </div>
                    <div className="mt-1 flex justify-end">
                      <Badge tone={badgeTone} size="sm">
                        {badgeLabel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Details Modal (Simple, Jargon-Free Language) */}
      <AnimatePresence>
        {selectedTxn && (
          <Modal onClose={() => setSelectedTxn(null)}>
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="w-full max-w-md rounded-[24px] p-6 text-[var(--color-text-primary)]"
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-hairline)",
                boxShadow: "var(--shadow-elevated)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-hairline)] mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedTxn.state === "RELEASED"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : selectedTxn.state === "ESCROW_HELD" || selectedTxn.state === "AUTHORIZED"
                        ? "bg-amber-500/15 text-amber-500"
                        : selectedTxn.state === "REFUNDING"
                        ? "bg-purple-500/15 text-purple-400"
                        : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {selectedTxn.state === "RELEASED" && <CheckCircle2 className="w-4 h-4" />}
                    {(selectedTxn.state === "ESCROW_HELD" || selectedTxn.state === "AUTHORIZED" || selectedTxn.state === "INITIATED") && (
                      <Clock className="w-4 h-4" />
                    )}
                    {selectedTxn.state === "REFUNDING" && <AlertCircle className="w-4 h-4" />}
                    {selectedTxn.state === "REFUNDED" && <RotateCcw className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold">Transaction Details</h3>
                    <div className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{selectedTxn.id}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-bg-elevated)] hover:bg-[var(--color-hairline)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hero Amount & Simple Status Notice */}
              <div className="text-center py-4 px-4 mb-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-hairline)] space-y-2">
                <div className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-medium">
                  Total Amount
                </div>
                <div className="font-display text-3xl font-bold font-mono text-[var(--color-text-primary)]">
                  {selectedTxn.totalAmountFormatted}
                </div>
                <div className="flex justify-center">
                  <Badge tone={STATE_META[selectedTxn.state]?.tone ?? "neutral"} size="sm">
                    {STATE_META[selectedTxn.state]?.label ?? "Pending"}
                  </Badge>
                </div>
                {/* Plain-English summary: direct and easy to understand */}
                <p className="text-xs text-[var(--color-text-secondary)] pt-1 max-w-xs mx-auto leading-relaxed">
                  {selectedTxn.state === "RELEASED" && "Money sent to your bank account."}
                  {(selectedTxn.state === "ESCROW_HELD" ||
                    selectedTxn.state === "AUTHORIZED" ||
                    selectedTxn.state === "INITIATED") &&
                    "Money is held safely in escrow. You will be paid once the client approves your work."}
                  {selectedTxn.state === "REFUNDING" &&
                    "This booking is under dispute review. Our team will resolve it within 48 hours."}
                  {selectedTxn.state === "REFUNDED" &&
                    "Booking was cancelled. Money was refunded to the client. You received ₦0."}
                </p>
              </div>

              {/* Simple, Clear Breakdown List */}
              <div className="space-y-2.5 mb-6 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-text-tertiary)]">Booking</span>
                  <span className="font-semibold text-[var(--color-text-primary)] font-mono">{selectedTxn.bookingId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-text-tertiary)]">Type</span>
                  <span className="font-medium text-[var(--color-text-primary)] capitalize">
                    {selectedTxn.state === "REFUNDED" || selectedTxn.state === "REFUNDING"
                      ? "Dispute"
                      : selectedTxn.state === "ESCROW_HELD" || selectedTxn.state === "AUTHORIZED"
                      ? "Escrow"
                      : "Payout"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-text-tertiary)]">Gig Price</span>
                  <span className="font-mono text-[var(--color-text-primary)]">{selectedTxn.baseAmountFormatted}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-text-tertiary)]">Platform Fee</span>
                  <span className="font-mono text-[var(--color-text-secondary)]">-{selectedTxn.feeAmountFormatted}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--color-hairline)] font-semibold">
                  <span className="text-[var(--color-text-primary)]">You Receive</span>
                  <span className="font-mono text-[var(--color-text-primary)]">
                    {selectedTxn.state === "REFUNDED" ? "₦0" : selectedTxn.totalAmountFormatted}
                  </span>
                </div>
                {selectedTxn.providerRef && (
                  <div className="flex justify-between py-1.5 border-b border-[var(--color-hairline)]">
                    <span className="text-[var(--color-text-tertiary)]">Reference / Destination</span>
                    <span className="font-mono text-[var(--color-text-primary)] truncate max-w-[200px]">
                      {selectedTxn.providerRef.replace("bank-", "")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-[var(--color-text-tertiary)]">Date</span>
                  <span className="text-[var(--color-text-secondary)]">{formatRelativeTime(selectedTxn.createdAt)}</span>
                </div>
              </div>

              {/* Modal Actions */}
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



