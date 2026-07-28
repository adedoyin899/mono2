import { z } from "zod";

/** The prototype's coarse, fixed-time-slot availability grid — superseded
 * entirely by the real day/time-of-day model in features.md Phase 13
 * (AvailabilityBlock, server-authoritative getOpenSlots). Kept as-is here
 * since Phase 1 is a pure refactor, not a redesign of the data model. */
export const SlotStatusSchema = z.enum(["available", "booked", "off"]);
export type SlotStatus = z.infer<typeof SlotStatusSchema>;

export const AvailabilityWeekSchema = z.record(z.string(), z.array(SlotStatusSchema));
export type AvailabilityWeek = z.infer<typeof AvailabilityWeekSchema>;
