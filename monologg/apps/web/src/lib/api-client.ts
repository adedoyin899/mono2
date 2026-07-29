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

// ── Auth session (features.md Phase 4) ────────────────────────────────────
// Access token: in memory only (per spec — never persisted). Refresh token:
// localStorage, since it must survive a page reload for the rotation/refresh
// flow to work at all in a plain SPA. Both are no-ops in mock mode.
const REFRESH_TOKEN_STORAGE_KEY = "monologg_refresh_token";
let accessToken: string | null = null;

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

function setSession(tokens: { accessToken: string; refreshToken: string } | null): void {
  accessToken = tokens?.accessToken ?? null;
  if (typeof window === "undefined") return;
  if (tokens?.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

export interface AuthUser {
  userId: string;
  email: string;
  userType: "TALENT" | "CLIENT";
}

// Auth endpoints get their own minimal fetch helper, deliberately not routed through
// request(): a 401 from /auth/login means "wrong credentials", not "expired session",
// so it must never trigger the refresh-and-retry behavior below.
async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/v1/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Request failed (${res.status})`);
  }
  return data as T;
}

/** Attempts one silent refresh using the stored refresh token. Never throws. */
async function tryRefreshSession(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const data = await authRequest<{ accessToken: string; refreshToken: string }>("/refresh", {
      refreshToken,
    });
    setSession(data);
    return true;
  } catch {
    setSession(null);
    return false;
  }
}

async function request<T>(path: string, init: RequestInit = {}, allowRetry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`/api/v1${path}`, { ...init, headers });

  if (res.status === 401 && allowRetry && (await tryRefreshSession())) {
    return request<T>(path, init, false);
  }
  if (!res.ok) {
    throw new Error(`API error ${res.status} ${res.statusText}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export interface RegisterInput {
  email: string;
  password: string;
  userType: "TALENT" | "CLIENT";
  name: string;
}

export const apiClient = {
  mode: API_MODE,

  // ── Auth ────────────────────────────────────────────────────────────
  // Mock mode mirrors the prototype's original mock behavior exactly (no visual/
  // behavioral change) — only `live` mode talks to the real endpoints and stores tokens.
  async register(
    input: RegisterInput,
  ): Promise<{ userId: string; email: string; userType: "TALENT" | "CLIENT"; emailVerified: boolean }> {
    if (API_MODE === "mock") {
      return { userId: "mock-user", email: input.email, userType: input.userType, emailVerified: false };
    }
    return authRequest("/register", input);
  },
  async login(email: string, password: string): Promise<AuthUser> {
    if (API_MODE === "mock") {
      const userType: "TALENT" | "CLIENT" =
        email.includes("client") || email.includes("brand") ? "CLIENT" : "TALENT";
      return { userId: "mock-user", email, userType };
    }
    const data = await authRequest<{ accessToken: string; refreshToken: string; user: AuthUser }>(
      "/login",
      { email, password },
    );
    setSession(data);
    return data.user;
  },
  async logout(): Promise<void> {
    if (API_MODE === "live") {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await authRequest("/logout", { refreshToken }).catch(() => {});
      }
    }
    setSession(null);
  },
  async forgotPassword(email: string): Promise<void> {
    if (API_MODE === "mock") return;
    await authRequest("/forgot-password", { email });
  },
  /** Mock mode preserves today's ungated demo browsing exactly — no login required. */
  isAuthenticated(): boolean {
    if (API_MODE === "mock") return true;
    return accessToken !== null || getStoredRefreshToken() !== null;
  },

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
