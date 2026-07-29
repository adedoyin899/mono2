import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApp } from "../app.js";
import { generateAccessToken } from "../services/auth.js";

vi.mock("../db/client.js", () => ({
  prisma: {
    creator: { findUnique: vi.fn() },
    availabilityBlock: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../db/client.js";
const prismaMock = prisma as any;

const TALENT_TOKEN = generateAccessToken({ userId: "user-talent-1", userType: "TALENT", email: "t@monologg.dev" });

describe("Availability blocks (owner-scoped CRUD)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /availability returns a paginated envelope scoped to the caller's creator", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
    prismaMock.availabilityBlock.findMany.mockResolvedValue([{ id: "block-1", creatorId: "creator-1" }]);
    prismaMock.availabilityBlock.count.mockResolvedValue(1);

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/availability",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
    });

    expect(response.statusCode).toBe(200);
    expect(prismaMock.availabilityBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { creatorId: "creator-1" } }),
    );
  });

  it("POST /availability creates a block with the slot shape validated", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
    prismaMock.availabilityBlock.create.mockResolvedValue({ id: "block-new" });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/availability",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      payload: { date: "2026-08-01", slots: [{ start: "09:00", end: "10:00", booked: false }] },
    });

    expect(response.statusCode).toBe(201);
  });

  it("rejects a malformed slots array", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/availability",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      payload: { date: "2026-08-01", slots: [{ start: "09:00" }] },
    });

    expect(response.statusCode).toBe(400);
    expect(prismaMock.availabilityBlock.create).not.toHaveBeenCalled();
  });

  it("PATCH /availability/:id returns 403 for a block owned by a different creator", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
    prismaMock.availabilityBlock.findUnique.mockResolvedValue({ id: "block-2", creatorId: "creator-OTHER" });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/v1/availability/block-2",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      payload: { calendarEventId: "evt-hijack" },
    });

    expect(response.statusCode).toBe(403);
    expect(prismaMock.availabilityBlock.update).not.toHaveBeenCalled();
  });

  it("DELETE /availability/:id succeeds when the caller owns the block", async () => {
    prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
    prismaMock.availabilityBlock.findUnique.mockResolvedValue({ id: "block-1", creatorId: "creator-1" });
    prismaMock.availabilityBlock.delete.mockResolvedValue({ id: "block-1" });

    const response = await app.inject({
      method: "DELETE",
      url: "/api/v1/availability/block-1",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
    });

    expect(response.statusCode).toBe(200);
    expect(prismaMock.availabilityBlock.delete).toHaveBeenCalledWith({ where: { id: "block-1" } });
  });
});
