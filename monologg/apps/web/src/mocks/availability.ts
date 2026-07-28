import type { AvailabilityWeek } from "@monologg/types";

export const AVAILABILITY: AvailabilityWeek = {
  Mon: ["available", "available", "booked", "off"],
  Tue: ["booked", "booked", "available", "available"],
  Wed: ["available", "off", "off", "available"],
  Thu: ["available", "available", "available", "booked"],
  Fri: ["booked", "available", "available", "off"],
  Sat: ["off", "off", "off", "off"],
  Sun: ["off", "off", "off", "off"],
};
