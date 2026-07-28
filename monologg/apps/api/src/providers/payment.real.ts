import type { PaymentProvider } from "./payment.interface.js";

// ---------------------------------------------------------------------------
// REAL PaymentProvider — Paystack implementation (Africa / NGN market).
// TODO(conflict:X1) Phase 6: implement Paystack API calls.
//   - initEscrow: POST https://api.paystack.co/transaction/initialize
//   - holdFunds:  called after webhook charge.success
//   - releaseFunds: POST https://api.paystack.co/transfer
//   - refund:     POST https://api.paystack.co/refund
//   - verifyWebhook: HMAC-SHA512 of rawBody using PAYSTACK_SECRET_KEY
// ---------------------------------------------------------------------------

export const realPaymentProvider: PaymentProvider = {
  async initEscrow(_bookingId, _amountMinorUnits, _currency) {
    throw new Error("[payment.real] Paystack integration not yet implemented — Phase 6.");
  },

  async holdFunds(_ref) {
    throw new Error("[payment.real] Paystack holdFunds not yet implemented — Phase 6.");
  },

  async releaseFunds(_ref, _talentNetMinorUnits, _currency) {
    throw new Error("[payment.real] Paystack releaseFunds not yet implemented — Phase 6.");
  },

  async refund(_ref) {
    throw new Error("[payment.real] Paystack refund not yet implemented — Phase 6.");
  },

  verifyWebhook(_signature, _rawBody) {
    throw new Error("[payment.real] Paystack webhook verification not yet implemented — Phase 6.");
  },
};
