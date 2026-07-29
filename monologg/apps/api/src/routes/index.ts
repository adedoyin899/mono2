import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.js";
import { authRoutes } from "./auth.js";
import { creatorRoutes } from "./creators.js";
import { rateCardRoutes } from "./rateCards.js";
import { availabilityRoutes } from "./availability.js";
import { briefRoutes } from "./briefs.js";
import { talentRoutes } from "./talent.js";
import { bookingRoutes } from "./bookings.js";
import { orderRoomRoutes } from "./orderRooms.js";
import { uploadRoutes } from "./uploads.js";
import { webhookRoutes } from "./webhooks.js";

/**
 * Route aggregator — registers all route plugins onto the Fastify instance.
 * Add new route modules here as phases land.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(creatorRoutes);
  await app.register(rateCardRoutes);
  await app.register(availabilityRoutes);
  await app.register(briefRoutes);
  await app.register(talentRoutes);
  await app.register(bookingRoutes);
  await app.register(orderRoomRoutes);
  await app.register(uploadRoutes);
  await app.register(webhookRoutes);
}
