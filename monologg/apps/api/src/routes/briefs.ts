import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../db/client.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { findOwnClient } from "../lib/ownership.js";
import { paginationQuerySchema, paginate, toSkipTake } from "../lib/pagination.js";
import { formatMoney } from "../lib/display.js";

// Maps a real Brief row to the display shape apps/web's ClientProject type
// expects. `applicants` is honestly 0 — no application system exists yet
// (that's Phase 14's job), not a fabricated number.
function mapBriefToClientProject(brief: {
  id: string;
  projectName: string;
  projectType: string;
  budgetAmount: number;
  budgetCurrency: string;
  status: string;
  createdAt: Date;
}) {
  return {
    id: brief.id,
    name: brief.projectName,
    niche: brief.projectType,
    budget: formatMoney(brief.budgetAmount, brief.budgetCurrency),
    status: brief.status.toLowerCase(),
    applicants: 0,
    posted: brief.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

const NICHE_VALUES = ["ACTOR", "VO_ARTIST", "COMEDIAN", "COMPERE", "SPEAKER_PASTOR", "MUSICIAN", "CONTENT_CREATOR"] as const;
const STATUS_VALUES = ["DRAFT", "ACTIVE", "IN_REVIEW", "CLOSED"] as const;

const briefSchema = z.object({
  projectName: z.string().min(1),
  projectType: z.string().min(1),
  nicheReq: z.array(z.enum(NICHE_VALUES)),
  budgetAmount: z.number().int().nonnegative(),
  budgetCurrency: z.string().min(1),
  status: z.enum(STATUS_VALUES).optional(),
});

export async function briefRoutes(app: FastifyInstance): Promise<void> {
  // GET /briefs — the authenticated client's own briefs, paginated.
  app.get(
    "/api/v1/briefs",
    { preHandler: [requireAuth, requireRole("CLIENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const client = await findOwnClient(request.user!.userId);
      if (!client) {
        return reply.status(404).send({ error: "Not Found", message: "No client profile for this user", statusCode: 404 });
      }

      const query = paginationQuerySchema.parse(request.query);
      const { skip, take } = toSkipTake(query);
      const where = { clientId: client.id };

      const [briefs, total] = await Promise.all([
        prisma.brief.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
        prisma.brief.count({ where }),
      ]);

      return reply.send(paginate(briefs.map(mapBriefToClientProject), total, query));
    },
  );

  // POST /briefs — create a brief owned by the authenticated client.
  app.post(
    "/api/v1/briefs",
    { preHandler: [requireAuth, requireRole("CLIENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const client = await findOwnClient(request.user!.userId);
      if (!client) {
        return reply.status(404).send({ error: "Not Found", message: "No client profile for this user", statusCode: 404 });
      }

      const parsed = briefSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const brief = await prisma.brief.create({
        data: { ...parsed.data, clientId: client.id },
      });
      return reply.status(201).send(brief);
    },
  );

  // PATCH /briefs/:id — owner-scoped update.
  app.patch(
    "/api/v1/briefs/:id",
    { preHandler: [requireAuth, requireRole("CLIENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const client = await findOwnClient(request.user!.userId);
      if (!client) {
        return reply.status(404).send({ error: "Not Found", message: "No client profile for this user", statusCode: 404 });
      }

      const { id } = request.params as { id: string };
      const existing = await prisma.brief.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: "Not Found", message: `Brief "${id}" not found`, statusCode: 404 });
      }
      if (existing.clientId !== client.id) {
        return reply.status(403).send({ error: "Forbidden", message: "You do not own this brief", statusCode: 403 });
      }

      const parsed = briefSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const updated = await prisma.brief.update({ where: { id }, data: parsed.data });
      return reply.send(updated);
    },
  );
}
