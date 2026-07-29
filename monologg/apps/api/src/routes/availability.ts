import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../db/client.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { findOwnCreator } from "../lib/ownership.js";
import { paginationQuerySchema, paginate, toSkipTake } from "../lib/pagination.js";
import {
  pushAvailabilityToGoogle,
  CalendarNotConnectedError,
  CalendarReconnectRequiredError,
} from "../services/calendar.js";

const slotSchema = z.object({
  start: z.string(),
  end: z.string(),
  booked: z.boolean(),
});

const availabilityBlockSchema = z.object({
  date: z.coerce.date(),
  slots: z.array(slotSchema),
  calendarEventId: z.string().optional(),
});

export async function availabilityRoutes(app: FastifyInstance): Promise<void> {
  // GET /availability — the authenticated creator's own blocks, paginated.
  app.get(
    "/api/v1/availability",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const query = paginationQuerySchema.parse(request.query);
      const { skip, take } = toSkipTake(query);
      const where = { creatorId: creator.id };

      const [blocks, total] = await Promise.all([
        prisma.availabilityBlock.findMany({ where, skip, take, orderBy: { date: "asc" } }),
        prisma.availabilityBlock.count({ where }),
      ]);

      return reply.send(paginate(blocks, total, query));
    },
  );

  // POST /availability — create a block owned by the authenticated creator.
  app.post(
    "/api/v1/availability",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const parsed = availabilityBlockSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const block = await prisma.availabilityBlock.create({
        data: { ...parsed.data, creatorId: creator.id },
      });
      return reply.status(201).send(block);
    },
  );

  // PATCH /availability/:id — owner-scoped update.
  app.patch(
    "/api/v1/availability/:id",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const { id } = request.params as { id: string };
      const existing = await prisma.availabilityBlock.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "Not Found", message: `Availability block "${id}" not found`, statusCode: 404 });
      }
      if (existing.creatorId !== creator.id) {
        return reply.status(403).send({ error: "Forbidden", message: "You do not own this availability block", statusCode: 403 });
      }

      const parsed = availabilityBlockSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const updated = await prisma.availabilityBlock.update({ where: { id }, data: parsed.data });
      return reply.send(updated);
    },
  );

  // POST /availability/:id/sync-calendar — pushes this block to the owning
  // creator's connected Google Calendar (features.md Phase 8). 404 if never
  // connected; 409 + reconnectRequired if the connection was revoked.
  app.post(
    "/api/v1/availability/:id/sync-calendar",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const { id } = request.params as { id: string };
      const existing = await prisma.availabilityBlock.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "Not Found", message: `Availability block "${id}" not found`, statusCode: 404 });
      }
      if (existing.creatorId !== creator.id) {
        return reply.status(403).send({ error: "Forbidden", message: "You do not own this availability block", statusCode: 403 });
      }

      try {
        const result = await pushAvailabilityToGoogle(request.user!.userId, id);
        return reply.send(result);
      } catch (err) {
        if (err instanceof CalendarNotConnectedError) {
          return reply.status(404).send({ error: "Not Found", message: err.message, statusCode: 404 });
        }
        if (err instanceof CalendarReconnectRequiredError) {
          return reply.status(409).send({
            error: "Conflict",
            message: err.message,
            statusCode: 409,
            reconnectRequired: true,
          });
        }
        throw err;
      }
    },
  );

  // DELETE /availability/:id — owner-scoped delete.
  app.delete(
    "/api/v1/availability/:id",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const { id } = request.params as { id: string };
      const existing = await prisma.availabilityBlock.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "Not Found", message: `Availability block "${id}" not found`, statusCode: 404 });
      }
      if (existing.creatorId !== creator.id) {
        return reply.status(403).send({ error: "Forbidden", message: "You do not own this availability block", statusCode: 403 });
      }

      await prisma.availabilityBlock.delete({ where: { id } });
      return reply.status(200).send({ success: true });
    },
  );
}
