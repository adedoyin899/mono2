import type {
  ActivityItem,
  AvailabilityWeek,
  ClientProject,
  Order,
  OrderMessage,
  ServiceRateCard,
  StatMetric,
  Talent,
} from "@monologg/types";
import * as mocks from "../mocks";

/**
 * The one seam every screen's data flows through (features.md Phase 1).
 * `VITE_API_MODE=mock` (the default) returns local fixtures; `live` calls
 * the real `/api/v1` endpoints once they exist (Phase 5+). No component
 * should import from `../mocks` directly — only this file does.
 */
const API_MODE = (import.meta.env.VITE_API_MODE as "mock" | "live" | undefined) ?? "mock";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, init);
  if (!res.ok) {
    throw new Error(`API error ${res.status} ${res.statusText}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  mode: API_MODE,

  // ── Client dashboard ──────────────────────────────────────────────
  async getClientStats(): Promise<StatMetric[]> {
    if (API_MODE === "live") return request("/client/stats");
    return mocks.CLIENT_STATS;
  },
  async listTalents(): Promise<Talent[]> {
    if (API_MODE === "live") return request("/talent");
    return mocks.TALENTS;
  },
  async listClientProjects(): Promise<ClientProject[]> {
    if (API_MODE === "live") return request("/briefs");
    return mocks.CLIENT_PROJECTS;
  },
  async listClientOrders(): Promise<Order[]> {
    if (API_MODE === "live") return request("/orders?role=client");
    return mocks.CLIENT_ORDERS;
  },
  async getShortlistedTalentIds(): Promise<number[]> {
    if (API_MODE === "live") return request("/client/shortlist");
    return mocks.SHORTLIST_IDS;
  },

  // ── Talent dashboard ──────────────────────────────────────────────
  async getTalentStats(): Promise<StatMetric[]> {
    if (API_MODE === "live") return request("/talent/me/stats");
    return mocks.TALENT_STATS;
  },
  async listTalentActivity(): Promise<ActivityItem[]> {
    if (API_MODE === "live") return request("/talent/me/activity");
    return mocks.TALENT_ACTIVITY;
  },
  async listServices(): Promise<ServiceRateCard[]> {
    if (API_MODE === "live") return request("/rate-cards");
    return mocks.SERVICES;
  },
  async getAvailability(): Promise<AvailabilityWeek> {
    if (API_MODE === "live") return request("/availability");
    return mocks.AVAILABILITY;
  },
  async listTalentOrders(): Promise<Order[]> {
    if (API_MODE === "live") return request("/orders?role=talent");
    return mocks.TALENT_ORDERS;
  },

  // ── Order Room ────────────────────────────────────────────────────
  async getOrderMessages(_orderId: string): Promise<OrderMessage[]> {
    if (API_MODE === "live") return request(`/order-rooms/${_orderId}/messages`);
    return mocks.ORDER_MESSAGES;
  },
};

export type ApiClient = typeof apiClient;
