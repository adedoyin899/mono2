import type { BookingState } from "@prisma/client";
import { prisma } from "../db/client.js";
import { computeFees } from "./fees.js";

// The booking state machine (features.md Phase 5): the single place that decides
// which BookingState transitions are legal. Nothing outside this file should
// mutate Booking.state directly.
//
// PENDING_PAYMENT ──▶ ESCROW_LOCKED ──▶ DELIVERABLES_PROVIDED ──▶ PAYMENT_RELEASED
//        │                   │                    │
//        └──────────────▶ CANCELLED          DISPUTED ◀───────────┘
//
// Only PENDING_PAYMENT → CANCELLED has a route in this phase (a client can cancel
// before paying). ESCROW_LOCKED (Phase 6, real payment) and everything after it
// are triggered by later phases' own machinery (webhooks, delivery/dispute flows) —
// but the full legal-transition graph is defined and rejected-on-violation here now,
// per this phase's own guardrail ("illegal transitions rejected").
const LEGAL_TRANSITIONS: Record<BookingState, BookingState[]> = {
  PENDING_PAYMENT: ["ESCROW_LOCKED", "CANCELLED"],
  ESCROW_LOCKED: ["DELIVERABLES_PROVIDED", "DISPUTED", "CANCELLED"],
  DELIVERABLES_PROVIDED: ["PAYMENT_RELEASED", "DISPUTED"],
  PAYMENT_RELEASED: [],
  CANCELLED: [],
  DISPUTED: ["PAYMENT_RELEASED", "CANCELLED"],
};

export class IllegalBookingTransitionError extends Error {
  constructor(from: BookingState, to: BookingState) {
    super(`Illegal booking state transition: ${from} → ${to}`);
    this.name = "IllegalBookingTransitionError";
  }
}

export function assertLegalTransition(from: BookingState, to: BookingState): void {
  if (!LEGAL_TRANSITIONS[from]?.includes(to)) {
    throw new IllegalBookingTransitionError(from, to);
  }
}

export interface CreateBookingInput {
  creatorId: string;
  clientId: string;
  rateCardId: string;
  baseAmount: number;
  currency: string;
  slotDate: Date;
  slotStart: string;
  slotEnd: string;
}

/** Creates a booking in PENDING_PAYMENT with fees derived from PLATFORM_FEES — never
 * from a client-supplied value (fees are always server-computed, features.md guardrail).
 * Also creates the booking's OrderRoom (1:1) so participants can message immediately,
 * even before payment — matches the seed data's shape (every booking has one). */
export async function createBooking(input: CreateBookingInput) {
  const { talentFee, clientFee } = computeFees(input.baseAmount);

  return prisma.booking.create({
    data: {
      creatorId: input.creatorId,
      clientId: input.clientId,
      rateCardId: input.rateCardId,
      baseAmount: input.baseAmount,
      currency: input.currency,
      talentFeeAmount: talentFee,
      clientFeeAmount: clientFee,
      slotDate: input.slotDate,
      slotStart: input.slotStart,
      slotEnd: input.slotEnd,
      state: "PENDING_PAYMENT",
      orderRoom: { create: {} },
    },
  });
}

/** Transitions a booking to `to`, throwing IllegalBookingTransitionError if the move
 * isn't legal from its current state. */
export async function transitionBooking(bookingId: string, to: BookingState) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  assertLegalTransition(booking.state, to);
  return prisma.booking.update({ where: { id: bookingId }, data: { state: to } });
}
