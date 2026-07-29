import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApp } from "../app.js";
import { generateAccessToken } from "../services/auth.js";

vi.mock("../db/client.js", () => ({
  prisma: {
    creator: { findUnique: vi.fn(), update: vi.fn() },
    mediaAsset: { create: vi.fn() },
  },
}));

import { prisma } from "../db/client.js";
const prismaMock = prisma as any;

const TALENT_TOKEN = generateAccessToken({ userId: "user-talent-1", userType: "TALENT", email: "t@monologg.dev" });

describe("Creator profile + media upload", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /creators/me returns styleTags and verification as read-only fields", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({
      id: "creator-1",
      userId: "user-talent-1",
      styleTags: ["Warm"],
      verification: "VERIFIED",
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/creators/me",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ styleTags: ["Warm"], verification: "VERIFIED" });
  });

  it("PATCH /creators/me silently ignores an attempt to set styleTags/verification directly (X3)", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
    prismaMock.creator.update.mockResolvedValue({ id: "creator-1", name: "New Name" });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/v1/creators/me",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      payload: { name: "New Name", styleTags: ["Hacked"], verification: "VERIFIED" },
    });

    expect(response.statusCode).toBe(200);
    // styleTags/verification aren't in updateProfileSchema, so zod strips them —
    // Prisma only ever receives the allowed fields.
    expect(prismaMock.creator.update).toHaveBeenCalledWith({
      where: { id: "creator-1" },
      data: { name: "New Name" },
    });
  });

  describe("POST /creators/me/media/presign", () => {
    it("issues a presigned upload for a valid video under the size cap", async () => {
      prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
      prismaMock.mediaAsset.create.mockResolvedValue({ id: "media-1" });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/creators/me/media/presign",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
        payload: { kind: "VIDEO", sizeBytes: 10_000_000 },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.uploadUrl).toContain("/api/v1/uploads/local/");
      expect(body.mediaAssetId).toBe("media-1");
    });

    it("rejects a file over the 150MB cap", async () => {
      prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/creators/me/media/presign",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
        payload: { kind: "VIDEO", sizeBytes: 200 * 1024 * 1024 },
      });

      expect(response.statusCode).toBe(400);
      expect(prismaMock.mediaAsset.create).not.toHaveBeenCalled();
    });

    it("rejects a kind that isn't VIDEO or AUDIO", async () => {
      prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/creators/me/media/presign",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
        payload: { kind: "IMAGE", sizeBytes: 1000 },
      });

      expect(response.statusCode).toBe(400);
      expect(prismaMock.mediaAsset.create).not.toHaveBeenCalled();
    });
  });
});
