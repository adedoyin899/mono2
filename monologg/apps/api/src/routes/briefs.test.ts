import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApp } from "../app.js";
import { generateAccessToken } from "../services/auth.js";

vi.mock("../db/client.js", () => ({
  prisma: {
    client: { findUnique: vi.fn() },
    brief: { findMany: vi.fn(), count: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from "../db/client.js";
const prismaMock = prisma as any;

const CLIENT_TOKEN = generateAccessToken({ userId: "user-client-1", userType: "CLIENT", email: "c@monologg.dev" });
const TALENT_TOKEN = generateAccessToken({ userId: "user-talent-1", userType: "TALENT", email: "t@monologg.dev" });

describe("Briefs (client-owned CRUD)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /briefs returns a paginated envelope mapped to the ClientProject display shape", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
    prismaMock.brief.findMany.mockResolvedValue([
      {
        id: "brief-1",
        clientId: "client-1",
        projectName: "Nike Q1 Campaign",
        projectType: "Voice-Over",
        budgetAmount: 20_000_000,
        budgetCurrency: "NGN",
        status: "ACTIVE",
        createdAt: new Date("2026-01-14"),
      },
    ]);
    prismaMock.brief.count.mockResolvedValue(1);

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/briefs",
      headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data[0]).toMatchObject({
      id: "brief-1",
      name: "Nike Q1 Campaign",
      niche: "Voice-Over",
      budget: "₦200,000",
      status: "active",
      applicants: 0,
    });
    expect(prismaMock.brief.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: "client-1" } }),
    );
  });

  it("returns 403 when a TALENT-role token calls a CLIENT-only route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/briefs",
      headers: { authorization: `Bearer ${TALENT_TOKEN}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it("POST /briefs creates a brief owned by the caller's client profile", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
    prismaMock.brief.create.mockResolvedValue({ id: "brief-new", clientId: "client-1" });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/briefs",
      headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      payload: {
        projectName: "New Campaign",
        projectType: "Voice-Over",
        nicheReq: ["VO_ARTIST"],
        budgetAmount: 10_000_000,
        budgetCurrency: "NGN",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(prismaMock.brief.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ clientId: "client-1", projectName: "New Campaign" }),
    });
  });

  it("PATCH /briefs/:id returns 403 for a brief owned by a different client (owner-scoping)", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
    prismaMock.brief.findUnique.mockResolvedValue({ id: "brief-2", clientId: "client-OTHER" });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/v1/briefs/brief-2",
      headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      payload: { status: "CLOSED" },
    });

    expect(response.statusCode).toBe(403);
    expect(prismaMock.brief.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid niche value", async () => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/briefs",
      headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      payload: {
        projectName: "Bad Brief",
        projectType: "Voice-Over",
        nicheReq: ["NOT_A_REAL_NICHE"],
        budgetAmount: 1000,
        budgetCurrency: "NGN",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
