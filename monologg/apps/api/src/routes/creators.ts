import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../db/client.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { findOwnCreator } from "../lib/ownership.js";
import { storageProvider } from "../providers/index.js";

const NICHE_VALUES = ["ACTOR", "VO_ARTIST", "COMEDIAN", "COMPERE", "SPEAKER_PASTOR", "MUSICIAN", "CONTENT_CREATOR"] as const;

// styleTags/verification are deliberately absent from this schema — X3: they're
// read-only here, written only by the AI-tagging job and KYC flow (Phase 7).
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  location: z.string().min(1).optional(),
  niche: z.enum(NICHE_VALUES).optional(),
});

const MAX_UPLOAD_BYTES = 150 * 1024 * 1024; // 150MB, per features.md Phase 5

const presignSchema = z.object({
  kind: z.enum(["VIDEO", "AUDIO"]),
  sizeBytes: z.number().int().positive(),
});

export async function creatorRoutes(app: FastifyInstance): Promise<void> {
  // GET /creators/me — own profile, including read-only styleTags/verification.
  app.get(
    "/api/v1/creators/me",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }
      return reply.send(creator);
    },
  );

  // PATCH /creators/me — update profile fields. styleTags/verification are never
  // accepted here (X3) — they aren't even in updateProfileSchema.
  app.patch(
    "/api/v1/creators/me",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const parsed = updateProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const updated = await prisma.creator.update({ where: { id: creator.id }, data: parsed.data });
      return reply.send(updated);
    },
  );

  // POST /creators/me/media/presign — validate type (video/audio) and size (≤150MB),
  // then hand back a presigned upload. The API never accepts raw file bytes in the
  // JSON body — the caller PUTs directly to `uploadUrl`.
  app.post(
    "/api/v1/creators/me/media/presign",
    { preHandler: [requireAuth, requireRole("TALENT")] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const creator = await findOwnCreator(request.user!.userId);
      if (!creator) {
        return reply.status(404).send({ error: "Not Found", message: "No creator profile for this user", statusCode: 404 });
      }

      const parsed = presignSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Bad Request",
          message: parsed.error.issues.map((i) => i.message).join(", "),
          statusCode: 400,
        });
      }

      const { kind, sizeBytes } = parsed.data;
      if (sizeBytes > MAX_UPLOAD_BYTES) {
        return reply.status(400).send({
          error: "Bad Request",
          message: `File too large: ${sizeBytes} bytes exceeds the 150MB limit`,
          statusCode: 400,
        });
      }

      const presigned = await storageProvider.createPresignedUpload({
        ownerId: creator.id,
        kind,
        sizeBytes,
      });

      const mediaAsset = await prisma.mediaAsset.create({
        data: {
          creatorId: creator.id,
          kind,
          url: presigned.fileUrl,
          sizeBytes,
        },
      });

      return reply.status(201).send({ ...presigned, mediaAssetId: mediaAsset.id });
    },
  );
}
