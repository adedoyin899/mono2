import { prisma } from "../db/client.js";
import { paymentProvider, notifyProvider } from "../providers/index.js";
import { env } from "../config/env.js";
import { assertAllowedPaymentProvider, type PaymentProvider as PaymentProviderName } from "../config/paymentProviders.js";
import { assertLegalTransition, IllegalBookingTransitionError } from "./booking.js";

// Escrow / payment service (features.md Phase 6). The single place that moves
// Payment.status and the money-side of BookingState — nothing outside this file
// should touch Payment rows or transition a booking in/out of the money states.
//
// Ledger-based hold (beta): checkout charges the client's full total up front;
// funds sit at PaymentStatus.ESCROW_HELD until a client approval releases them.
// This is a custodial hold, not a true provider-side escrow split — flagged in
// features.md Phase 6 for human/legal sign-off before real funds move.
//
// Idempotency strategy (no dedicated IdempotencyKey table — deliberately, see
// below): each money-moving path guards itself with the mechanism that actually
// fits it, rather than a generic key store:
//   - initEscrowForBooking: Payment.bookingId is @unique, and a payment already
//     past INITIATED rejects a second pay attempt outright.
//   - processPaystackWebhookEvent: PaymentEvent has a DB-level unique constraint
//     on (paymentId, type, eventId) — a replayed webhook's insert violates it
//     (Prisma error P2002) and is treated as an already-processed no-op.
//   - releaseEscrowForBooking / refundEscrowForBooking: an atomic conditional
//     UPDATE (`updateMany` with a `status` filter) claims the transition before
//     any provider call — a concurrent second caller sees zero rows affected and
//     no-ops instead of paying/refunding twice.

export class BookingNotPayableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingNotPayableError";
  }
}

export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number | string;
    reference: string;
    status?: string;
    amount?: number;
  };
}

function resolveProviderName(): PaymentProviderName {
  // Payment.provider is stored as a real allowlisted value even when the app is
  // running with PAYMENT_PROVIDER=mock (dev/test) — "mock" itself isn't a valid
  // stored provider (config/paymentProviders.ts), so default to the primary
  // real rail (Paystack) for what would be used in production.
  const configured = env.PAYMENT_PROVIDER === "mock" ? "paystack" : env.PAYMENT_PROVIDER;
  return assertAllowedPaymentProvider(configured);
}

/**
 * POST /bookings/:id/pay — initiates the escrow charge with the payment provider.
 * Only legal from PENDING_PAYMENT; never advances BookingState itself (only the
 * verified webhook does that — see processPaystackWebhookEvent).
 */
export async function initEscrowForBooking(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (booking.state !== "PENDING_PAYMENT") {
    throw new BookingNotPayableError(`Booking ${bookingId} is not payable (state=${booking.state})`);
  }
  if (booking.payment && booking.payment.status !== "INITIATED") {
    throw new BookingNotPayableError(
      `Booking ${bookingId} already has a payment in status ${booking.payment.status}`,
    );
  }

  const clientTotal = booking.baseAmount + booking.clientFeeAmount;
  const providerName = resolveProviderName();
  const { ref, checkoutUrl } = await paymentProvider.initEscrow(bookingId, clientTotal, booking.currency);

  const payment = booking.payment
    ? await prisma.payment.update({
        where: { bookingId },
        data: { providerRef: ref, provider: providerName, amount: clientTotal, currency: booking.currency },
      })
    : await prisma.payment.create({
        data: {
          bookingId,
          provider: providerName,
          providerRef: ref,
          status: "INITIATED",
          amount: clientTotal,
          currency: booking.currency,
        },
      });

  return { payment, checkoutUrl };
}

/**
 * Processes one verified Paystack webhook event. The CALLER (routes/webhooks.ts)
 * must have already verified the signature — this function trusts its input
 * completely, so it must never be reachable from anywhere the signature hasn't
 * been checked first.
 *
 * Idempotent: replaying the identical event (same paymentId + type + eventId)
 * hits the PaymentEvent unique constraint and no-ops.
 */
export async function processPaystackWebhookEvent(
  payload: PaystackWebhookPayload,
): Promise<{ processed: boolean }> {
  const reference = payload?.data?.reference;
  if (!reference) return { processed: false };

  const payment = await prisma.payment.findUnique({ where: { providerRef: reference } });
  if (!payment) return { processed: false }; // event for a transaction we don't own — ignore

  const eventId = String(payload.data.id ?? reference);
  let duplicate = false;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentEvent.create({
        data: { paymentId: payment.id, type: payload.event, eventId, raw: payload as unknown as object },
      });

      if (payload.event === "charge.success") {
        const claimed = await tx.payment.updateMany({
          where: { id: payment.id, status: "INITIATED" },
          data: { status: "ESCROW_HELD", escrowHeld: true },
        });
        if (claimed.count > 0) {
          await tx.booking.update({ where: { id: payment.bookingId }, data: { state: "ESCROW_LOCKED" } });
        }
      }
    });
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      duplicate = true;
    } else {
      throw err;
    }
  }

  if (!duplicate && payload.event === "charge.success") {
    // Defense-in-depth re-verification against the provider directly. This is
    // never the authority (the webhook signature already was) — failures are
    // logged, not fatal, so a flaky secondary check can't strand a booking that
    // the webhook has already legitimately unlocked.
    await paymentProvider.holdFunds(reference).catch((err) => {
      console.error(`[services/payment] holdFunds re-verification failed for ${reference}:`, err);
    });

    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { creator: true, client: true },
    });
    if (booking) {
      await notifyProvider
        .inApp(booking.creator.userId, { kind: "payment_escrow_locked", bookingId: booking.id })
        .catch(() => {});
      await notifyProvider
        .inApp(booking.client.userId, { kind: "payment_escrow_locked", bookingId: booking.id })
        .catch(() => {});
    }
  }

  return { processed: !duplicate };
}

/**
 * PATCH /bookings/:id/approve — client approves delivered work. Only legal once
 * the booking is DELIVERABLES_PROVIDED (services/booking.ts's own transition
 * graph enforces this). Pays the creator's net (base − talentFee); the platform
 * keeps both fees, already accounted for at booking-creation time.
 */
export async function releaseEscrowForBooking(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { payment: true, creator: true, client: true },
  });

  assertLegalTransition(booking.state, "PAYMENT_RELEASED");
  if (!booking.payment) {
    throw new BookingNotPayableError(`Booking ${bookingId} has no payment record to release`);
  }

  const claim = await prisma.payment.updateMany({
    where: { id: booking.payment.id, status: "ESCROW_HELD" },
    data: { status: "RELEASING" },
  });
  if (claim.count === 0) {
    const current = await prisma.payment.findUniqueOrThrow({ where: { id: booking.payment.id } });
    return { alreadyProcessed: true, payment: current };
  }

  const talentNet = booking.baseAmount - booking.talentFeeAmount;
  try {
    await paymentProvider.releaseFunds(booking.payment.providerRef ?? booking.payment.id, talentNet, booking.currency);
  } catch (err) {
    // Funds were never actually released — undo the claim so a retry is possible.
    await prisma.payment.updateMany({
      where: { id: booking.payment.id, status: "RELEASING" },
      data: { status: "ESCROW_HELD" },
    });
    throw err;
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.update({ where: { id: booking.payment.id }, data: { status: "RELEASED" } }),
    prisma.booking.update({ where: { id: bookingId }, data: { state: "PAYMENT_RELEASED" } }),
  ]);

  await notifyProvider
    .inApp(booking.creator.userId, { kind: "payment_released", bookingId, amount: talentNet })
    .catch(() => {});
  await notifyProvider
    .inApp(booking.client.userId, { kind: "payment_released", bookingId })
    .catch(() => {});

  return { alreadyProcessed: false, payment };
}

/**
 * POST /bookings/:id/refund — dispute resolution path. Only legal from DISPUTED
 * (a plain pre-payment cancel goes through services/booking.ts's CANCELLED
 * transition directly and never touches a Payment row).
 */
export async function refundEscrowForBooking(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { payment: true, creator: true, client: true },
  });

  if (booking.state !== "DISPUTED") {
    throw new IllegalBookingTransitionError(booking.state, "CANCELLED");
  }
  if (!booking.payment) {
    throw new BookingNotPayableError(`Booking ${bookingId} has no payment record to refund`);
  }

  const claim = await prisma.payment.updateMany({
    where: { id: booking.payment.id, status: "ESCROW_HELD" },
    data: { status: "REFUNDING" },
  });
  if (claim.count === 0) {
    const current = await prisma.payment.findUniqueOrThrow({ where: { id: booking.payment.id } });
    return { alreadyProcessed: true, payment: current };
  }

  try {
    await paymentProvider.refund(booking.payment.providerRef ?? booking.payment.id);
  } catch (err) {
    await prisma.payment.updateMany({
      where: { id: booking.payment.id, status: "REFUNDING" },
      data: { status: "ESCROW_HELD" },
    });
    throw err;
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.update({ where: { id: booking.payment.id }, data: { status: "REFUNDED" } }),
    prisma.booking.update({ where: { id: bookingId }, data: { state: "CANCELLED" } }),
  ]);

  await notifyProvider
    .inApp(booking.client.userId, { kind: "payment_refunded", bookingId })
    .catch(() => {});
  await notifyProvider
    .inApp(booking.creator.userId, { kind: "payment_refunded", bookingId })
    .catch(() => {});

  return { alreadyProcessed: false, payment };
}
