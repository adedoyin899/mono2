import { z } from "zod";

/** A talent's purchasable service listing. Mirrors the eventual RateCard
 * model (features.md Phase 2). */
export const ServiceRateCardSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  price: z.string(),
  delivery: z.string(),
  bookings: z.number().int(),
});
export type ServiceRateCard = z.infer<typeof ServiceRateCardSchema>;
