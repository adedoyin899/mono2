import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildApp } from "../app.js";
import { generateAccessToken } from "../services/auth.js";

vi.mock("../db/client.js", () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    message: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from "../db/client.js";
const prismaMock = prisma as any;

const TALENT_TOKEN = generateAccessToken({ userId: "user-talent-1", userType: "TALENT", email: "t@monologg.dev" });
const CLIENT_TOKEN = generateAccessToken({ userId: "user-client-1", userType: "CLIENT", email: "c@monologg.dev" });
const STRANGER_TOKEN = generateAccessToken({ userId: "user-stranger", userType: "TALENT", email: "s@monologg.dev" });

const BOOKING = {
  id: "b1",
  creator: { userId: "user-talent-1" },
  client: { userId: "user-client-1" },
  orderRoom: { id: "room-1" },
};

describe("Order-room messages (participants only)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /order-rooms/:bookingId/messages", () => {
    it("returns 403 for a user who isn't a participant", async () => {
      prismaMock.booking.findUnique.mockResolvedValue(BOOKING);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/order-rooms/b1/messages",
        headers: { authorization: `Bearer ${STRANGER_TOKEN}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 404 for a booking that doesn't exist", async () => {
      prismaMock.booking.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/order-rooms/nope/messages",
        headers: { authorization: `Bearer ${TALENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("maps SYSTEM messages to from:'system' and creator messages to from:'talent'", async () => {
      prismaMock.booking.findUnique.mockResolvedValue(BOOKING);
      prismaMock.message.findMany.mockResolvedValue([
        { id: "m1", kind: "SYSTEM", content: "Booking created.", senderId: "user-client-1", createdAt: new Date() },
        { id: "m2", kind: "TEXT", content: "Hello!", senderId: "user-talent-1", createdAt: new Date() },
      ]);
      prismaMock.message.count.mockResolvedValue(2);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/order-rooms/b1/messages",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data[0].from).toBe("system");
      expect(data[1].from).toBe("talent");
    });
  });

  describe("POST /order-rooms/:bookingId/messages", () => {
    it("creates a message for a participant and returns it mapped", async () => {
      prismaMock.booking.findUnique.mockResolvedValue(BOOKING);
      prismaMock.message.create.mockResolvedValue({
        id: "m3",
        kind: "TEXT",
        content: "New message",
        senderId: "user-client-1",
        createdAt: new Date(),
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/order-rooms/b1/messages",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
        payload: { text: "New message" },
      });

      expect(response.statusCode).toBe(201);
      expect(prismaMock.message.create).toHaveBeenCalledWith({
        data: { orderRoomId: "room-1", senderId: "user-client-1", kind: "TEXT", content: "New message" },
      });
      expect(response.json().from).toBe("client");
    });

    it("rejects a non-participant trying to send a message", async () => {
      prismaMock.booking.findUnique.mockResolvedValue(BOOKING);

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/order-rooms/b1/messages",
        headers: { authorization: `Bearer ${STRANGER_TOKEN}` },
        payload: { text: "I shouldn't be able to send this" },
      });

      expect(response.statusCode).toBe(403);
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it("rejects an empty message body", async () => {
      prismaMock.booking.findUnique.mockResolvedValue(BOOKING);

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/order-rooms/b1/messages",
        headers: { authorization: `Bearer ${CLIENT_TOKEN}` },
        payload: { text: "" },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
