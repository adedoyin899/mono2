import { z } from "zod";

/** A client's posted project brief, as shown in the client dashboard's
 * "Projects" list. Mirrors the eventual Brief model (features.md Phase 2);
 * gains `applicantCap`/`applicationsOpen` in Phase 14. */
export const ClientProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  niche: z.string(),
  /** Pre-formatted display string — see the same note on Talent.price. */
  budget: z.string(),
  status: z.string(),
  applicants: z.number().int(),
  posted: z.string(),
});
export type ClientProject = z.infer<typeof ClientProjectSchema>;
