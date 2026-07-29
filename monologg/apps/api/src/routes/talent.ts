import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";
import { paginationQuerySchema, paginate, toSkipTake } from "../lib/pagination.js";
import { nicheLabel, initials, formatMoney } from "../lib/display.js";

const NICHE_VALUES = ["ACTOR", "VO_ARTIST", "COMEDIAN", "COMPERE", "SPEAKER_PASTOR", "MUSICIAN", "CONTENT_CREATOR"] as const;

const discoveryQuerySchema = paginationQuerySchema.extend({
  niche: z.enum(NICHE_VALUES).optional(),
  tag: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
});

// Public talent discovery (features.md Phase 5) — no auth required. Fields with no
// real backing yet (rating/reviews — no review system exists in any phase's schema;
// available — no real availability-computation exists until Phase 13) are honest
// placeholders (0 / true), not fabricated data, and documented as such.
export async function talentRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/v1/talent",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = discoveryQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }
      const query = parsed.data;
      const { skip, take } = toSkipTake(query);

      const where: Prisma.CreatorWhereInput = {
        ...(query.niche ? { niche: query.niche } : {}),
        ...(query.tag ? { styleTags: { has: query.tag } } : {}),
        ...(query.location ? { location: { contains: query.location, mode: "insensitive" } } : {}),
        ...(query.minPrice !== undefined || query.maxPrice !== undefined
          ? {
              rateCards: {
                some: {
                  basePriceAmount: {
                    ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
                    ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
                  },
                },
              },
            }
          : {}),
      };

      const [creators, total] = await Promise.all([
        prisma.creator.findMany({
          where,
          skip,
          take,
          orderBy: { name: "asc" },
          include: { rateCards: { orderBy: { basePriceAmount: "asc" }, take: 1 } },
        }),
        prisma.creator.count({ where }),
      ]);

      const talents = creators.map((creator) => {
        const cheapest = creator.rateCards[0];
        return {
          id: creator.id,
          name: creator.name,
          role: nicheLabel(creator.niche),
          location: creator.location,
          price: cheapest ? formatMoney(cheapest.basePriceAmount, cheapest.basePriceCurrency) : "Contact for pricing",
          tags: creator.styleTags,
          verified: creator.verification === "VERIFIED",
          rating: 0,
          reviews: 0,
          available: true,
          avatar: initials(creator.name),
        };
      });

      return reply.send(paginate(talents, total, query));
    },
  );
}
