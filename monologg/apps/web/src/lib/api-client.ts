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

// features.md Phase 5: every list endpoint paginates server-side, but no current
// screen has "load more"/page-number UI — they all just render "the list". Rather
// than build pagination UI as a side effect of this phase, live-mode list calls
// fetch one generously-sized page and unwrap it, so today's no-pagination UI stays
// exactly as it is. The pagination itself is proven correct by apps/api's own tests.
interface Paginated<T> {
  data: T[];
}
async function requestList<T>(path: string): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const page = await request<Paginated<T>>(`${path}${separator}pageSize=100`);
  return page.data;
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
  // getClientStats/getShortlistedTalentIds stay mock-only: features.md Phase 5 doesn't
  // define a stats or shortlist resource (no schema/endpoint exists for either yet).
  async getClientStats(): Promise<StatMetric[]> {
    return mocks.CLIENT_STATS;
  },
  async listTalents(): Promise<Talent[]> {
    if (API_MODE === "live") return requestList("/talent");
    return mocks.TALENTS;
  },
  async listClientProjects(): Promise<ClientProject[]> {
    if (API_MODE === "live") return requestList("/briefs");
    return mocks.CLIENT_PROJECTS;
  },
  async listClientOrders(): Promise<Order[]> {
    if (API_MODE === "live") return requestList("/bookings?role=client");
    return mocks.CLIENT_ORDERS;
  },
  async getShortlistedTalentIds(): Promise<string[]> {
    return mocks.SHORTLIST_IDS;
  },
  /** Creates a real Brief (features.md Phase 5). Mock mode is a no-op — ProjectBrief.tsx's
   * "Publish" already simulates success locally without this. */
  async createBrief(input: {
    projectName: string;
    projectType: string;
    nicheReq: string[];
    budgetAmount: number;
    budgetCurrency: string;
  }): Promise<void> {
    if (API_MODE !== "live") return;
    await request("/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  // ── Talent dashboard ──────────────────────────────────────────────
  // getTalentStats/listTalentActivity stay mock-only, same reason as getClientStats
  // above. getAvailability also stays mock-only: the real AvailabilityBlock model
  // (per-date, {start,end,booked} slots) is a genuinely different shape from this
  // prototype's fixed weekly grid, which @monologg/types' own doc comment already
  // flags as superseded by Phase 13's real day/time-of-day model — translating one
  // into the other now would be exactly the premature redesign that comment warns
  // against. The real /availability CRUD endpoint exists and is tested; this UI
  // just doesn't consume it yet.
  async getTalentStats(): Promise<StatMetric[]> {
    return mocks.TALENT_STATS;
  },
  async listTalentActivity(): Promise<ActivityItem[]> {
    return mocks.TALENT_ACTIVITY;
  },
  async listServices(): Promise<ServiceRateCard[]> {
    if (API_MODE === "live") return requestList("/rate-cards");
    return mocks.SERVICES;
  },
  async getAvailability(): Promise<AvailabilityWeek> {
    return mocks.AVAILABILITY;
  },
  async listTalentOrders(): Promise<Order[]> {
    if (API_MODE === "live") return requestList("/bookings?role=talent");
    return mocks.TALENT_ORDERS;
  },

  // ── Order Room ────────────────────────────────────────────────────
  async getOrderMessages(orderId: string): Promise<OrderMessage[]> {
    if (API_MODE === "live") return requestList(`/order-rooms/${orderId}/messages`);
    return mocks.ORDER_MESSAGES;
  },
  /** Sends a real message (features.md Phase 5). Mock mode returns null — OrderRoom.tsx
   * keeps appending to local state itself, exactly as before this phase. */
  async sendOrderMessage(orderId: string, text: string): Promise<OrderMessage | null> {
    if (API_MODE !== "live") return null;
    return request(`/order-rooms/${orderId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  },
};

export type ApiClient = typeof apiClient;
