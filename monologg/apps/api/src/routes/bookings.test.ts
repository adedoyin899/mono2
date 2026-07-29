import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApp } from "../app.js";
import { generateAccessToken } from "../services/auth.js";
import { computeFees } from "../services/fees.js";

vi.mock("../db/client.js", () => ({
  prisma: {
    client: { findUnique: vi.fn() },
    creator: { findUnique: vi.fn() },
    rateCard: { findUnique: vi.fn(), findMany: vi.fn() },
    booking: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from "../db/client.js";
const prismaMock = prisma as any;

const CLIENT_TOKEN = generateAccessToken({ userId: "user-client-1", userType: "CLIENT", email: "c@monologg.dev" });
const TALENT_TOKEN = generateAccessToken({ userId: "user-talent-1", userType: "TALENT", email: "t@monologg.dev" });
const OTHER_TALENT_TOKEN = generateAccessToken({ userId: "user-talent-OTHER", userType: "TALENT", email: "other@monologg.dev" });

describe("Bookings", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /bookings", () => {
    it("persists fee amounts exactly equal to computeFees() output for the rate card's baseAmount", async () => {
      const baseAmount = 12_000_000;
      prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
      prismaMock.rateCard.findUnique.mockResolvedValue({
        id: "rc-1",
        creatorId: "creator-1",
        basePriceAmount: baseAmount,
        basePriceCurrency: "NGN",
      });
      prismaMock.booking.create.mockResolvedValue({ id: "booking-new", state: "PENDING_PAYMENT" });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/bookings",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
        payload: {
          creatorId: "creator-1",
          rateCardId: "rc-1",
          slotDate: "2026-08-01",
          slotStart: "10:00",
          slotEnd: "12:00",
        },
      });

      expect(response.statusCode).toBe(201);
      const expected = computeFees(baseAmount);
      expect(prismaMock.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          talentFeeAmount: expected.talentFee,
          clientFeeAmount: expected.clientFee,
          state: "PENDING_PAYMENT",
        }),
      });
    });

    it("rejects a talent-role token (only clients create bookings)", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/bookings",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
        payload: { creatorId: "c1", rateCardId: "rc1", slotDate: "2026-08-01", slotStart: "10:00", slotEnd: "12:00" },
      });
      expect(response.statusCode).toBe(403);
    });

    it("rejects when the rate card doesn't belong to the given creator", async () => {
      prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
      prismaMock.rateCard.findUnique.mockResolvedValue({ id: "rc-1", creatorId: "creator-DIFFERENT" });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/bookings",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
        payload: { creatorId: "creator-1", rateCardId: "rc-1", slotDate: "2026-08-01", slotStart: "10:00", slotEnd: "12:00" },
      });
      expect(response.statusCode).toBe(400);
      expect(prismaMock.booking.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /bookings", () => {
    it("?role=talent scopes to the caller's own creator id", async () => {
      prismaMock.creator.findUnique.mockResolvedValue({ id: "creator-1", userId: "user-talent-1" });
      prismaMock.booking.findMany.mockResolvedValue([]);
      prismaMock.booking.count.mockResolvedValue(0);
      prismaMock.rateCard.findMany.mockResolvedValue([]);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/bookings?role=talent",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(200);
      expect(prismaMock.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { creatorId: "creator-1" } }),
      );
    });

    it("?role=client scopes to the caller's own client id", async () => {
      prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
      prismaMock.booking.findMany.mockResolvedValue([]);
      prismaMock.booking.count.mockResolvedValue(0);
      prismaMock.rateCard.findMany.mockResolvedValue([]);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/bookings?role=client",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(200);
      expect(prismaMock.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clientId: "client-1" } }),
      );
    });

    it("computes client amount as base+clientFee and formats it", async () => {
      const baseAmount = 4_500_000;
      const fees = computeFees(baseAmount);
      prismaMock.client.findUnique.mockResolvedValue({ id: "client-1", userId: "user-client-1" });
      prismaMock.booking.findMany.mockResolvedValue([
        {
          id: "b1",
          baseAmount,
          clientFeeAmount: fees.clientFee,
          talentFeeAmount: fees.talentFee,
          currency: "NGN",
          state: "PENDING_PAYMENT",
          rateCardId: "rc-1",
          slotDate: new Date("2026-08-01"),
          creator: { name: "Adaeze Obi" },
          client: { name: "Ngozi Balogun" },
        },
      ]);
      prismaMock.booking.count.mockResolvedValue(1);
      prismaMock.rateCard.findMany.mockResolvedValue([{ id: "rc-1", serviceTitle: "Voice-Over Session" }]);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/bookings?role=client",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      });

      const order = response.json().data[0];
      expect(order.counterpart).toBe("Adaeze Obi");
      expect(order.project).toBe("Voice-Over Session");
      expect(order.amount).toBe(`₦${((baseAmount + fees.clientFee) / 100).toLocaleString("en-US")}`);
      expect(order.phase).toBe("Briefing");
    });
  });

  describe("GET /bookings/:id — participant-scoping", () => {
    it("returns 403 for a talent who isn't a participant in the booking", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: "b1",
        creator: { userId: "user-talent-1" },
        client: { userId: "user-client-1" },
        rateCardId: "rc-1",
        baseAmount: 1000,
        clientFeeAmount: 150,
        talentFeeAmount: 110,
        currency: "NGN",
        state: "PENDING_PAYMENT",
        slotDate: new Date(),
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/bookings/b1",
        headers: { authorization: `Bearer ${OTHER_TALENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 200 for the actual talent participant", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: "b1",
        creator: { userId: "user-talent-1", name: "Elias Thorne" },
        client: { userId: "user-client-1", name: "Brand Agency NG" },
        rateCardId: "rc-1",
        baseAmount: 1000,
        clientFeeAmount: 150,
        talentFeeAmount: 110,
        currency: "NGN",
        state: "PENDING_PAYMENT",
        slotDate: new Date(),
      });
      prismaMock.rateCard.findMany.mockResolvedValue([]);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/bookings/b1",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().counterpart).toBe("Brand Agency NG");
    });
  });

  describe("PATCH /bookings/:id/cancel", () => {
    it("cancels a PENDING_PAYMENT booking for a participant", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: "b1",
        state: "PENDING_PAYMENT",
        creator: { userId: "user-talent-1" },
        client: { userId: "user-client-1" },
      });
      prismaMock.booking.findUniqueOrThrow.mockResolvedValue({ id: "b1", state: "PENDING_PAYMENT" });
      prismaMock.booking.update.mockResolvedValue({ id: "b1", state: "CANCELLED" });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/v1/bookings/b1/cancel",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().state).toBe("CANCELLED");
    });

    it("rejects cancelling a booking that's already PAYMENT_RELEASED (illegal transition)", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: "b1",
        state: "PAYMENT_RELEASED",
        creator: { userId: "user-talent-1" },
        client: { userId: "user-client-1" },
      });
      prismaMock.booking.findUniqueOrThrow.mockResolvedValue({ id: "b1", state: "PAYMENT_RELEASED" });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/v1/bookings/b1/cancel",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(409);
      expect(prismaMock.booking.update).not.toHaveBeenCalled();
    });

    it("returns 403 for a non-participant", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: "b1",
        state: "PENDING_PAYMENT",
        creator: { userId: "user-talent-1" },
        client: { userId: "user-client-1" },
      });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/v1/bookings/b1/cancel",
        headers: { authorization: `Bearer ${OTHER_TALENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(403);
      expect(prismaMock.booking.update).not.toHaveBeenCalled();
    });
  });
});
