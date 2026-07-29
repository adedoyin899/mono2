import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApp } from "../app.js";

vi.mock("../db/client.js", () => ({
  prisma: {
    creator: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "../db/client.js";
const prismaMock = prisma as any;

const SAMPLE_CREATOR = {
  id: "creator-1",
  name: "Adaeze Obi",
  niche: "VO_ARTIST",
  location: "Lagos",
  styleTags: ["Warm", "Multilingual"],
  verification: "VERIFIED",
  rateCards: [{ basePriceAmount: 2_800_000, basePriceCurrency: "NGN" }],
};

describe("GET /talent — public discovery", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    vi.clearAllMocks();
    prismaMock.creator.findMany.mockResolvedValue([SAMPLE_CREATOR]);
    prismaMock.creator.count.mockResolvedValue(1);
  });

  afterEach(async () => {
    await app.close();
  });

  it("requires no authentication", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/talent" });
    expect(response.statusCode).toBe(200);
  });

  it("maps a creator to the Talent shape with a real derived price", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/talent" });
    const body = response.json();
    expect(body.data[0]).toMatchObject({
      id: "creator-1",
      name: "Adaeze Obi",
      role: "Voice-Over Artist",
      location: "Lagos",
      price: "₦28,000",
      tags: ["Warm", "Multilingual"],
      verified: true,
      avatar: "AO",
    });
  });

  it("returns a paginated envelope", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/talent?page=2&pageSize=5" });
    const body = response.json();
    expect(body).toMatchObject({ page: 2, pageSize: 5, total: 1, totalPages: 1 });
  });

  it("passes the niche filter through to the Prisma query", async () => {
    await app.inject({ method: "GET", url: "/api/v1/talent?niche=ACTOR" });
    expect(prismaMock.creator.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ niche: "ACTOR" }) }),
    );
  });

  it("passes the tag filter through as a styleTags 'has' clause", async () => {
    await app.inject({ method: "GET", url: "/api/v1/talent?tag=Warm" });
    expect(prismaMock.creator.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ styleTags: { has: "Warm" } }) }),
    );
  });

  it("passes minPrice/maxPrice through as a rateCards.some price-range clause", async () => {
    await app.inject({ method: "GET", url: "/api/v1/talent?minPrice=1000000&maxPrice=5000000" });
    expect(prismaMock.creator.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          rateCards: { some: { basePriceAmount: { gte: 1_000_000, lte: 5_000_000 } } },
        }),
      }),
    );
  });

  it("rejects an invalid niche value", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/talent?niche=NOT_REAL" });
    expect(response.statusCode).toBe(400);
  });
});
