import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, Receipt, X, Download, CheckCircle2, ShieldCheck, AlertCircle, Clock, RotateCcw,
  ArrowDownToLine, AlertTriangle, Briefcase, ArrowRight, Building2, Sparkles
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { formatRelativeTime } from "../../lib/utils";
import { appStateSync } from "../../lib/state-sync";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import type { Transaction, ClientProject } from "@monologg/types";

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

  // Client Withdrawal Flow States
  const [withdrawalModalStep, setWithdrawalModalStep] = useState<"amount" | "live_projects_warning" | "success" | null>(null);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [withdrawAmountError, setWithdrawAmountError] = useState<string | null>(null);
  const [liveProjects, setLiveProjects] = useState<ClientProject[]>([]);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [bankDetails] = useState(() => appStateSync.getBankDetails());

  const handleOpenWithdrawal = () => {
    const allClientProjects = appStateSync.getClientProjects();
    const active = allClientProjects.filter(
      (p) => p.status === "active" || p.status === "in_review" || p.status === "in_progress"
    );
    setLiveProjects(active);
    setWithdrawAmountInput(Math.round(heroAmount || 1577950).toLocaleString());
    setWithdrawAmountError(null);
    setWithdrawalModalStep("amount");
  };

  const handleProceedFromAmount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = parseInt(withdrawAmountInput.replace(/\D/g, ""), 10);
    if (!raw || raw <= 0) {
      setWithdrawAmountError("Please enter a valid withdrawal amount.");
      return;
    }
    setWithdrawAmountError(null);
    // User requested: "The moment you withdraw any amount, lets a have a modal that pops up saying: you have 3 live projects list them, you have to move them to draft..."
    if (liveProjects.length > 0) {
      setWithdrawalModalStep("live_projects_warning");
    } else {
      executeWithdrawal(raw);
    }
  };

  const executeWithdrawal = (amtNaira: number) => {
    setIsProcessingWithdrawal(true);
    if (liveProjects.length > 0) {
      appStateSync.moveProjectsToDraft(liveProjects.map((p) => p.id));
    }
    appStateSync.withdrawClientFunds(amtNaira, {
      bankName: bankDetails.bankName || "Access Bank Plc",
      accountNumber: bankDetails.accountNumber || "0123455965",
      accountName: bankDetails.accountName || "Sarah Jenkins",
    });

    const updated = appStateSync.getTransactions();
    setAllTransactions(updated);
    setTransactions(updated);
    setIsProcessingWithdrawal(false);
    setWithdrawalModalStep("success");
  };

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

          {/* Right-side Action: Withdraw Funds (Replacing Escrow Protected & Automated Ledger) */}
          <div className="flex flex-col sm:items-end z-10 shrink-0 gap-1.5 w-full sm:w-auto">
            <Button
              onClick={handleOpenWithdrawal}
              className="h-10 px-5 text-xs font-bold font-mono tracking-wide rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto text-white"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
              }}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Withdraw Funds</span>
            </Button>
            <div className="text-[11px] text-white/50 font-mono flex items-center justify-center sm:justify-end gap-1.5">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>Direct 24hr settlement</span>
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

        {/* ── Client Withdrawal Modal Flow ── */}
        {withdrawalModalStep === "amount" && (
          <Modal onClose={() => setWithdrawalModalStep(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="p-6 max-w-md w-full rounded-[24px] space-y-5"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                      Withdraw Funds
                    </h3>
                    <p className="text-xs font-body" style={{ color: "var(--color-text-secondary)" }}>
                      Transfer available escrow &amp; platform balance to your personal bank
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWithdrawalModalStep(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Withdrawable Balance Card */}
              <div className="p-4 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-bg-elevated)] space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  Withdrawable Balance
                </div>
                <div className="text-2xl font-bold font-mono" style={{ color: "var(--color-text-primary)" }}>
                  ₦{Math.round(heroAmount || 1577950).toLocaleString()}
                </div>
                <div className="text-[11px] font-body text-[var(--color-text-tertiary)]">
                  Includes available wallet balance and released escrow holdings
                </div>
              </div>

              <form onSubmit={handleProceedFromAmount} className="space-y-4">
                {withdrawAmountError && (
                  <div className="p-3 rounded-xl flex items-center gap-2 text-xs font-body bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{withdrawAmountError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                    Amount to Withdraw (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm pointer-events-none text-zinc-400">
                      ₦
                    </span>
                    <Input
                      className="pl-8 text-base font-mono font-bold h-12"
                      value={withdrawAmountInput}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const num = parseInt(raw, 10);
                        setWithdrawAmountInput(isNaN(num) ? "" : num.toLocaleString());
                        if (withdrawAmountError) setWithdrawAmountError(null);
                      }}
                      placeholder="e.g. 500,000"
                      required
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmountInput(amt.toLocaleString())}
                      className="py-1.5 px-1 text-xs font-mono rounded-lg border text-center transition-all"
                      style={{
                        background: withdrawAmountInput.replace(/\D/g, "") === amt.toString() ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                        borderColor: withdrawAmountInput.replace(/\D/g, "") === amt.toString() ? "var(--color-accent)" : "var(--color-hairline)",
                        color: withdrawAmountInput.replace(/\D/g, "") === amt.toString() ? "var(--color-accent)" : "var(--color-text-secondary)",
                      }}
                    >
                      ₦{amt / 1000}k
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmountInput(Math.round(heroAmount || 1577950).toLocaleString())}
                    className="py-1.5 px-1 text-xs font-mono rounded-lg border text-center transition-all bg-[var(--color-bg-elevated)] border-[var(--color-hairline)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                  >
                    All Funds
                  </button>
                </div>

                {/* Destination Bank Account */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5 font-body" style={{ color: "var(--color-text-secondary)" }}>
                    Settlement Destination Account
                  </label>
                  <div className="p-3.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-bg-elevated)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                          {bankDetails.bankName || "Access Bank Plc"} · •••• {(bankDetails.accountNumber || "5965").slice(-4)}
                        </div>
                        <div className="text-xs font-body text-[var(--color-text-tertiary)]">
                          {bankDetails.accountName || "Sarah Jenkins"} (Verified Personal Account)
                        </div>
                      </div>
                    </div>
                    <Badge tone="success" size="sm">Verified</Badge>
                  </div>
                </div>

                {/* 24-hour SLA notice */}
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-body text-purple-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>24-Hour Settlement: Funds will reach your personal account within 24 hours.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 h-11 text-xs"
                    onClick={() => setWithdrawalModalStep(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleProceedFromAmount}
                    className="flex-1 h-11 text-xs font-bold text-white shadow-md"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}
                  >
                    Proceed with Withdrawal
                  </Button>
                </div>
              </form>
            </motion.div>
          </Modal>
        )}

        {/* ── Live Projects Safeguard Gate Modal ── */}
        {withdrawalModalStep === "live_projects_warning" && (
          <Modal onClose={() => setWithdrawalModalStep(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="p-6 max-w-lg w-full rounded-[24px] space-y-5"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b" style={{ borderColor: "var(--color-hairline)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        Escrow Safeguard
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                      You have {liveProjects.length} live projects holding escrow
                    </h3>
                    <p className="text-xs font-body mt-1 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      To withdraw funds from platform escrow to your personal account, your live projects must be moved to <strong>Draft</strong>. Once moved to draft, performers can no longer apply, and your funds are released for payout.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWithdrawalModalStep(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 ml-2"
                  style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* The Live Projects List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider font-body px-1" style={{ color: "var(--color-text-tertiary)" }}>
                  Live Projects Moving to Draft ({liveProjects.length})
                </div>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {liveProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-bg-elevated)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold font-body truncate" style={{ color: "var(--color-text-primary)" }}>
                            {p.name}
                          </div>
                          <div className="text-xs font-body text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                            <span>{p.niche}</span>
                            <span>·</span>
                            <span className="font-mono">{p.budget} Escrow</span>
                            {p.applicants !== undefined && (
                              <>
                                <span>·</span>
                                <span>{p.applicants} applicants</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge tone="warning" size="sm">Moving to Draft</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational Reassurance Card */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-body text-purple-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>When you have the money back:</span>
                </div>
                <p className="text-xs leading-relaxed text-purple-300">
                  You will simply go back to your <strong>Drafts</strong> in your Client Dashboard, open your project, and click <strong>Publish &amp; Fund Escrow</strong> to post it again. All audition sides, milestones, and applicant pitches are preserved intact.
                </p>
                <div className="text-[11px] text-purple-400 font-mono pt-1">
                  ⏱️ Payout will transfer to your personal bank account and takes 24 hours to process.
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 h-11 text-xs"
                  onClick={() => setWithdrawalModalStep(null)}
                >
                  Cancel &amp; Keep Projects Live
                </Button>
                <Button
                  className="flex-1 h-11 text-xs font-bold text-white shadow-md flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}
                  disabled={isProcessingWithdrawal}
                  onClick={() => {
                    const amt = parseInt(withdrawAmountInput.replace(/\D/g, ""), 10) || Math.round(heroAmount || 1577950);
                    executeWithdrawal(amt);
                  }}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Move {liveProjects.length} Projects to Draft &amp; Withdraw</span>
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}

        {/* ── Withdrawal Success Confirmation Modal ── */}
        {withdrawalModalStep === "success" && (
          <Modal onClose={() => setWithdrawalModalStep(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="p-6 max-w-md w-full rounded-[24px] space-y-5 text-center"
              style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Withdrawal Initiated!
                </h3>
                <div className="text-xl font-mono font-bold text-emerald-500 mt-1">
                  ₦{withdrawAmountInput || Math.round(heroAmount || 1577950).toLocaleString()}
                </div>
                <p className="text-xs font-body text-[var(--color-text-secondary)] mt-2">
                  Your funds will clear into your personal bank account within <strong>24 hours</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-bg-elevated)] text-left space-y-2 text-xs font-body">
                <div className="flex justify-between py-1 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-text-tertiary)]">Destination Account</span>
                  <span className="font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                    {bankDetails.bankName || "Access Bank Plc"} · •••• {(bankDetails.accountNumber || "5965").slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--color-hairline)]">
                  <span className="text-[var(--color-text-tertiary)]">Processing Timeline</span>
                  <span className="font-mono text-purple-400 font-semibold">
                    Within 24 Hours
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-text-tertiary)]">Projects Transferred</span>
                  <span className="font-semibold text-amber-500 font-body">
                    {liveProjects.length} Projects Moved to Draft
                  </span>
                </div>
              </div>

              {/* What to do next instructions */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-left text-xs font-body text-purple-200">
                <span className="font-bold text-white block mb-1">What to do next:</span>
                When you have the money back, head to your <strong>Client Dashboard</strong>, find your saved projects under Drafts, and click <strong>Publish &amp; Fund Escrow</strong> to post them again.
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 h-11 text-xs"
                  onClick={() => setWithdrawalModalStep(null)}
                >
                  Done
                </Button>
                <Button
                  className="flex-1 h-11 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}
                  onClick={() => {
                    setWithdrawalModalStep(null);
                    navigate("/client");
                  }}
                >
                  <span>View Draft Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}



