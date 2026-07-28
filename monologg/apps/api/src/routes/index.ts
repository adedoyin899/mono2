import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.js";

/**
 * Route aggregator — registers all route plugins onto the Fastify instance.
 * Add new route modules here as phases land.
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes);
  // Phase 4: auth routes
  // Phase 5: creators, rate-cards, availability, briefs, bookings, order-rooms
  // Phase 6: webhooks/paystack
}
