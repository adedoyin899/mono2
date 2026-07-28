// Provider registry — selects mock vs real per NODE_ENV / per-provider env flag.
//
// How selection works:
//   1. If NODE_ENV === "test", ALWAYS use mocks — no env flag overrides this.
//   2. In development/production, read the per-provider env flag (e.g. PAYMENT_PROVIDER).
//      "mock" → mock implementation.  Any real value → real implementation.
//
// The env module validates all flag values at boot, so an invalid flag (e.g. a
// typo like "pastack") fails immediately with a clear message, not silently at
// the first real checkout.
//
// IMPORTANT: import this module (not individual mock/real files) everywhere you
// need a provider. That keeps the selection logic in one place.

import { env } from "../config/env.js";

import { mockPaymentProvider } from "./payment.mock.js";
import { realPaymentProvider } from "./payment.real.js";
import { mockKycProvider } from "./kyc.mock.js";
import { realKycProvider } from "./kyc.real.js";
import { mockAiTaggingProvider } from "./aiTagging.mock.js";
import { realAiTaggingProvider } from "./aiTagging.real.js";
import { mockCalendarProvider } from "./calendar.mock.js";
import { realCalendarProvider } from "./calendar.real.js";
import { mockNotifyProvider } from "./notify.mock.js";
import { realNotifyProvider } from "./notify.real.js";

import type { PaymentProvider } from "./payment.interface.js";
import type { KycProvider } from "./kyc.interface.js";
import type { AiTaggingProvider } from "./aiTagging.interface.js";
import type { CalendarProvider } from "./calendar.interface.js";
import type { NotifyProvider } from "./notify.interface.js";

const isTest = env.NODE_ENV === "test";

export const paymentProvider: PaymentProvider = isTest || env.PAYMENT_PROVIDER === "mock"
  ? mockPaymentProvider
  : realPaymentProvider;

export const kycProvider: KycProvider = isTest || env.KYC_PROVIDER === "mock"
  ? mockKycProvider
  : realKycProvider;

// X3: aiTaggingProvider is for style/vibe tags ONLY — never identity verification.
export const aiTaggingProvider: AiTaggingProvider = isTest || env.AI_PROVIDER === "mock"
  ? mockAiTaggingProvider
  : realAiTaggingProvider;

export const calendarProvider: CalendarProvider = isTest || env.CALENDAR_PROVIDER === "mock"
  ? mockCalendarProvider
  : realCalendarProvider;

export const notifyProvider: NotifyProvider = isTest || env.NOTIFY_PROVIDER === "mock"
  ? mockNotifyProvider
  : realNotifyProvider;

// Re-export interfaces so callers only need to import from "providers/index.ts".
export type { PaymentProvider } from "./payment.interface.js";
export type { KycProvider } from "./kyc.interface.js";
export type { AiTaggingProvider } from "./aiTagging.interface.js";
export type { CalendarProvider } from "./calendar.interface.js";
export type { NotifyProvider } from "./notify.interface.js";
