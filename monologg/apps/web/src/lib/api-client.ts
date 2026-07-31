import type {
  ActivityItem,
  Applicant,
  CalendarEvent,
  CalendarEventKind,
  ClientProject,
  DayDetail,
  MyApplication,
  Order,
  OrderMessage,
  Project,
  PublicRateCard,
  PublicStorefront,
  ServiceRateCard,
  Slot,
  StatMetric,
  SupportTicket,
  Talent,
  Transaction,
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

// De-dupes concurrent refresh attempts. Refresh tokens are single-use/rotated
// server-side (features.md Phase 4) — a page that fires several protected
// requests at once (e.g. a dashboard's mount-time useEffect) previously had
// EACH one independently 401 and call tryRefreshSession(), all racing to
// spend the same stored refresh token. Only the first actually succeeded;
// every other concurrent attempt replayed an already-rotated token, which the
// server's reuse-detection correctly treats as theft and revokes the whole
// session family — stranding the user right after a real login. Sharing one
// in-flight promise means concurrent 401s await a single refresh instead of
// each spending it.
let refreshInFlight: Promise<boolean> | null = null;

/** Attempts one silent refresh using the stored refresh token. Never throws.
 * Safe to call concurrently — overlapping calls share the same in-flight
 * refresh rather than each consuming the single-use refresh token. */
async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
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
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
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
  // 204 No Content (e.g. DELETE /creators/me/attributes, POST .../guideline-ack —
  // features.md Phase 12A) has no body; calling res.json() on it throws
  // "Unexpected end of JSON input" in a real browser too, not just under test.
  if (res.status === 204) return undefined as T;
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

// features.md Phase 7: AI style-tagging job state. Independent of KYC/verification (X3) —
// see CreatorProfile below.
export type TaggingStatus = "QUEUED" | "TAGGING" | "DONE" | "FAILED";
export interface MediaAssetStatus {
  id: string;
  taggingStatus: TaggingStatus;
}

export type VerificationState = "UNVERIFIED" | "PROCESSING" | "VERIFIED" | "FAILED";
export interface CreatorProfile {
  id: string;
  name: string;
  bio: string | null;
  location: string;
  styleTags: string[];
  verification: VerificationState;
}

// features.md Phase 12: the client-side equivalent of CreatorProfile. Not yet
// consumed by any screen — Settings.tsx (the one screen that edits a profile)
// is only reachable from TalentDashboard.tsx's nav today, so there's no client
// entry point to wire this into yet. Added now, alongside the backend route
// (routes/clients.ts), so that gap is one screen away from closed, not a new
// backend build too, whenever a client "Account" screen is added.
export interface ClientProfile {
  id: string;
  name: string;
  orgName: string | null;
  orgType: "STUDIO" | "EVENT" | "BRAND" | "CHURCH" | null;
  location: string;
}

// features.md Phase 12A.1 — Media Kit.
export interface MediaKitStatus {
  creatorId: string;
  mode: "AUTO" | "UPLOAD";
  uploadUrl: string | null;
  uploadSizeBytes: number | null;
  autoVersion: number;
  autoLastRenderedAt: string | null;
}

// features.md Phase 12A.2 — Verification video. Deliberately not named
// "VerificationStatus" (that's the identity-KYC type above, VerificationState) —
// X3: these are two fully independent systems and must never share a name
// that could suggest otherwise.
export interface VerificationRecordingStatus {
  id: string;
  url: string;
  durationSec: number;
  guidelineAck: boolean;
  status: "UPLOADED" | "IN_REVIEW" | "APPROVED" | "NEEDS_RERECORD";
  reviewerNote: string | null;
}

// features.md Phase 12A.3 — Physical attributes. Value sets mirror
// apps/api/src/routes/attributes.ts's own zod enums exactly; kept as plain
// strings here (not a shared @monologg/types export) for the same reason
// apps/api/src/routes/talent.ts duplicates them rather than importing across
// a route-to-route boundary — small, stable, casting-industry enums.
export type AttributeVisibility = "PUBLIC" | "SEARCHABLE" | "PRIVATE";
export interface PhysicalAttributes {
  id: string;
  heightRange?: string | null;
  weightRange?: string | null;
  ageRange?: string | null;
  build?: string | null;
  complexion?: string | null;
  hairColor?: string | null;
  eyeColor?: string | null;
  genderPresentation?: string | null;
  shoeSize?: string | null;
  shoeSizeUnit?: string | null;
  distinctiveFeatures?: string | null;
  visibility: Partial<Record<string, AttributeVisibility>>;
  consentVersion: string;
  consentedAt: string;
}
export type UpdateAttributesInput = Partial<
  Pick<
    PhysicalAttributes,
    "heightRange" | "weightRange" | "ageRange" | "build" | "complexion" | "hairColor" | "eyeColor" | "genderPresentation" | "shoeSize" | "shoeSizeUnit" | "distinctiveFeatures" | "visibility"
  >
> & { consentVersion: string };

/** Discovery filters GET /talent accepts server-side (features.md Phase 12A.3
 * adds the attribute fields; niche/tag/location/price predate this phase). */
export interface TalentFilters {
  niche?: string;
  tag?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  heightRange?: string;
  weightRange?: string;
  ageRange?: string;
  build?: string;
  complexion?: string;
  hairColor?: string;
  eyeColor?: string;
  genderPresentation?: string;
}

// features.md Phase 9: notifications backend.
export interface AppNotification {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  userType: "TALENT" | "CLIENT";
  name: string;
  // features.md Phase 10: required — mirrors AuthFlow.tsx's "I agree" checkbox gate.
  acceptedTermsVersion: string;
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
  /** `filters` (features.md Phase 12A.3 adds the attribute fields) only apply
   * in live mode — mock mode keeps returning the full fixture list unfiltered,
   * same as every other mock-mode screen (no client-side re-filter is layered
   * on top here; ClientDashboard.tsx's own search/niche filtering already
   * happens client-side against whatever this returns, independent of mode). */
  async listTalents(filters: TalentFilters = {}): Promise<Talent[]> {
    if (API_MODE !== "live") return mocks.TALENTS;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const query = params.toString();
    return requestList(`/talent${query ? `?${query}` : ""}`);
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
  /** Creates a real Brief (features.md Phase 5; `applicantCap` added Phase 14).
   * Mock mode is a no-op — ProjectBrief.tsx's "Publish" already simulates
   * success locally without this. `status` defaults server-side to DRAFT
   * (Prisma schema) — callers meaning to actually publish (the only path that
   * exists today) must pass "ACTIVE" explicitly, or the brief is created but
   * never shows up in GET /projects' talent-facing browse list. */
  async createBrief(input: {
    projectName: string;
    projectType: string;
    nicheReq: string[];
    budgetAmount: number;
    budgetCurrency: string;
    applicantCap?: number | null;
    status?: "DRAFT" | "ACTIVE" | "IN_REVIEW" | "CLOSED";
  }): Promise<void> {
    if (API_MODE !== "live") return;
    await request("/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  // ── Project applications (features.md Phase 14, FA-2) ──────────────────────
  /** GET /projects — talent browse/search (PWA-14); only ACTIVE briefs are
   * returned, each annotated with the caller's own application (if any). */
  async listProjects(filters: { niche?: string; q?: string; minBudget?: number; maxBudget?: number } = {}): Promise<Project[]> {
    if (API_MODE !== "live") return mocks.PROJECTS;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const query = params.toString();
    return requestList(`/projects${query ? `?${query}` : ""}`);
  },
  /** Server re-verifies the cap itself (never trusts the client) — a 409
   * means the brief closed or this talent already applied. */
  async applyToProject(briefId: string, pitch?: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/projects/${briefId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitch }),
    });
  },
  /** GET /creators/me/applications — PWA-16 status list. */
  async listMyApplications(): Promise<MyApplication[]> {
    if (API_MODE !== "live") return mocks.MY_APPLICATIONS;
    return requestList("/creators/me/applications");
  },
  async withdrawMyApplication(applicationId: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/applications/${applicationId}/withdraw`, { method: "PATCH" });
  },
  /** GET /briefs/:id/applicants — PWA-17, client-side applicant management. */
  async listApplicants(briefId: string): Promise<Applicant[]> {
    if (API_MODE !== "live") return mocks.APPLICANTS;
    return request(`/briefs/${briefId}/applicants`);
  },
  async shortlistApplicant(applicationId: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/applications/${applicationId}/shortlist`, { method: "PATCH" });
  },
  async rejectApplicant(applicationId: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/applications/${applicationId}/reject`, { method: "PATCH" });
  },
  /** Selecting converts the application into a real booking (PENDING_PAYMENT) —
   * the client picks which of the talent's rate cards and which real open
   * slot (fed by the same getOpenSlots endpoint Checkout uses) this
   * engagement is for. */
  async selectApplicant(applicationId: string, input: { rateCardId: string; slotDate: string; slotStart: string; slotEnd: string }): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/applications/${applicationId}/select`, {
      method: "PATCH",
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
  async listTalentOrders(): Promise<Order[]> {
    if (API_MODE === "live") return requestList("/bookings?role=talent");
    return mocks.TALENT_ORDERS;
  },

  // ── Availability & calendar events (features.md Phase 13, FA-1) ────────────
  // Server-authoritative: openSlots on every response is exactly what
  // services/availability.ts's getOpenSlots computed — the UI only ever
  // renders it, never recomputes availability itself.
  async getAvailabilityDay(date: string): Promise<DayDetail> {
    if (API_MODE !== "live") return mocks.mockDayDetail(date);
    return request(`/availability/day?date=${date}`);
  },
  /** Creates a new exact-date override block for a day that has none yet.
   * Returns the created row (real `id`, needed for follow-up edits in the
   * same session) in live mode; null in mock mode, where the caller updates
   * its own local state optimistically instead (same pattern Settings.tsx /
   * ProjectBrief.tsx already use for mock-mode writes). */
  async createAvailabilityBlock(input: { date: string; slots: Slot[]; isRecurring?: boolean; recurRule?: string }): Promise<{ id: string } | null> {
    if (API_MODE !== "live") return null;
    return request("/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
  /** Updates an existing block's slots (or its recurring template) in place. */
  async updateAvailabilityBlock(id: string, input: { slots?: Slot[]; isRecurring?: boolean; recurRule?: string }): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/availability/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
  async deleteAvailabilityBlock(id: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/availability/${id}`, { method: "DELETE" });
  },
  async createCalendarEvent(input: { date: string; start: string; end: string; title: string; kind: CalendarEventKind }): Promise<CalendarEvent | null> {
    if (API_MODE !== "live") return null;
    return request("/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
  async deleteCalendarEvent(id: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/calendar-events/${id}`, { method: "DELETE" });
  },
  /** Public, no-auth — the booking sheet's ONLY source for what's bookable
   * (features.md Phase 13's own guardrail: the client never computes
   * availability itself). Mock mode reuses the same day-detail fixture so a
   * demo checkout sees consistent open slots. */
  async getOpenSlots(creatorId: string, date: string): Promise<{ start: string; end: string }[]> {
    if (API_MODE !== "live") return mocks.mockDayDetail(date).openSlots;
    const { openSlots } = await request<{ date: string; openSlots: { start: string; end: string }[] }>(
      `/creators/${creatorId}/open-slots?date=${date}`,
    );
    return openSlots;
  },
  /** Public, no-auth — the read-only counterpart to listServices() (which is
   * owner-scoped to the logged-in talent), used by a CLIENT picking a service
   * to book on someone else's storefront. */
  async getCreatorRateCardsPublic(creatorId: string): Promise<PublicRateCard[]> {
    if (API_MODE !== "live") return mocks.PUBLIC_RATE_CARDS;
    return request(`/creators/${creatorId}/rate-cards`);
  },

  // ── Public marketplace profile (features.md Phase 15, FA-3) ────────────────
  // monologg.co/[handle] — reachable logged out, no account. `handle` is the
  // creator's id (no phase's schema adds a real username/slug field yet, the
  // same forward-reference apps/api's routes/mediaKit.ts already documents
  // for its own public creator sub-resource).
  async getPublicStorefront(handle: string): Promise<PublicStorefront> {
    if (API_MODE !== "live") return mocks.PUBLIC_STOREFRONT;
    return request(`/creators/${handle}/public`);
  },
  /** A real, name-derived image (not a data: URI, not a fabricated stock
   * photo) — see apps/api's services/publicProfile.ts for why. Absolute path
   * (not routed through request()) since it's an <img src>/og:image target,
   * never JSON. */
  getOgImageUrl(handle: string): string {
    return `/api/v1/creators/${handle}/og-image.svg`;
  },

  // ── Creator media + AI style-tagging (features.md Phase 7) ────────────────
  // X3: this system only ever produces styleTags. It never sets `verification` —
  // see startKycVerification/getVerificationStatus below for the fully separate
  // identity flow. Mock mode makes no network calls (CreatorOnboarding.tsx runs
  // its own local simulation, matching every other mock-mode screen); only live
  // mode drives real job state.
  async uploadCreatorMedia(file: File, kind: "VIDEO" | "AUDIO"): Promise<{ mediaAssetId: string }> {
    if (API_MODE !== "live") return { mediaAssetId: "mock-media-1" };

    const presigned = await request<{ uploadUrl: string; mediaAssetId: string }>("/creators/me/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, sizeBytes: file.size }),
    });
    // `uploadUrl` is already a full API path (e.g. "/api/v1/uploads/local/:token")
    // — fetched directly, not through request(), which would double-prefix it.
    await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: file,
    });
    await request(`/creators/me/media/${presigned.mediaAssetId}/confirm`, { method: "POST" });
    return { mediaAssetId: presigned.mediaAssetId };
  },
  /** Polled by the UI to drive the real queued -> tagging -> done/failed state —
   * never a fixed timer. */
  async getMediaTaggingStatus(mediaAssetId: string): Promise<MediaAssetStatus> {
    if (API_MODE !== "live") return { id: mediaAssetId, taggingStatus: "DONE" };
    return request(`/creators/me/media/${mediaAssetId}`);
  },
  async getCreatorProfile(): Promise<CreatorProfile> {
    if (API_MODE !== "live") {
      // "Elias Thorne" is the mock talent persona used everywhere else in this
      // prototype (TalentDashboard.tsx, OrderRoom.tsx, Checkout.tsx) — matched
      // here rather than inventing a different placeholder for this one screen.
      return {
        id: "mock-creator",
        name: "Elias Thorne",
        bio: "Specializing in intense dramatic monologues and authoritative voice-overs. 10+ years stage experience.",
        location: "Lagos, Nigeria",
        styleTags: [],
        verification: "UNVERIFIED",
      };
    }
    return request("/creators/me");
  },
  /** Settings.tsx "Save Changes" — features.md Phase 12. No-op network-wise in
   * mock mode (echoes the input back, matching every other mock-mode write). */
  async updateCreatorProfile(
    data: Partial<Pick<CreatorProfile, "name" | "bio" | "location">>,
  ): Promise<CreatorProfile> {
    if (API_MODE !== "live") {
      const current = await apiClient.getCreatorProfile();
      return { ...current, ...data };
    }
    return request("/creators/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async getClientProfile(): Promise<ClientProfile> {
    if (API_MODE !== "live") {
      return { id: "mock-client", name: "Brand Agency NG", orgName: "Brand Agency NG", orgType: "BRAND", location: "Lagos, Nigeria" };
    }
    return request("/clients/me");
  },
  async updateClientProfile(
    data: Partial<Pick<ClientProfile, "name" | "orgName" | "orgType" | "location">>,
  ): Promise<ClientProfile> {
    if (API_MODE !== "live") {
      const current = await apiClient.getClientProfile();
      return { ...current, ...data };
    }
    return request("/clients/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  // ── Media Kit (features.md Phase 12A.1) ─────────────────────────────────────
  async getMediaKitStatus(): Promise<MediaKitStatus> {
    if (API_MODE !== "live") return { creatorId: "mock-creator", mode: "AUTO", uploadUrl: null, uploadSizeBytes: null, autoVersion: 1, autoLastRenderedAt: null };
    return request("/creators/me/media-kit");
  },
  async regenerateMediaKit(): Promise<MediaKitStatus> {
    if (API_MODE !== "live") return { creatorId: "mock-creator", mode: "AUTO", uploadUrl: null, uploadSizeBytes: null, autoVersion: 2, autoLastRenderedAt: new Date().toISOString() };
    return request("/creators/me/media-kit/regenerate", { method: "POST" });
  },
  /** Uploads a PDF override — real magic-byte/size/virus-scan validation happens
   * server-side (services/mediaKit.ts); this just ships the raw bytes, the same
   * "never JSON-wrap a file body" convention uploadCreatorMedia already uses. */
  async uploadMediaKit(file: File): Promise<MediaKitStatus> {
    if (API_MODE !== "live") return { creatorId: "mock-creator", mode: "UPLOAD", uploadUrl: "mock://media-kit-upload.pdf", uploadSizeBytes: file.size, autoVersion: 1, autoLastRenderedAt: null };
    return request("/creators/me/media-kit/upload", {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });
  },
  async revertMediaKitToAuto(): Promise<MediaKitStatus> {
    if (API_MODE !== "live") return { creatorId: "mock-creator", mode: "AUTO", uploadUrl: "mock://media-kit-upload.pdf", uploadSizeBytes: 1024, autoVersion: 1, autoLastRenderedAt: null };
    return request("/creators/me/media-kit/revert", { method: "POST" });
  },
  /** The public download/preview URL — same path whether AUTO or UPLOAD is
   * live, per the spec's "revert brings it back with no URL change." Not
   * fetched through request() (it's a direct browser download/embed target,
   * not a JSON call). */
  getMediaKitPublicUrl(creatorId: string): string {
    return `/api/v1/creators/${creatorId}/media-kit.pdf`;
  },

  // ── Verification video (features.md Phase 12A.2) ────────────────────────────
  // X3-shaped: entirely separate from startKycVerification/getVerificationStatus
  // above (identity KYC) — this is performance/presentation review only.
  async acknowledgeVerificationGuidelines(): Promise<void> {
    if (API_MODE !== "live") return;
    await request("/creators/me/verification/guideline-ack", { method: "POST" });
  },
  /** Server-authoritative duration check happens on the API side
   * (services/verificationRecording.ts) — a > 90s clip comes back as a 422
   * with `reRecord: true`, which the caller surfaces as a re-record prompt,
   * never trusting whatever the client-side recorder's own timer claimed. */
  async uploadVerificationRecording(file: File): Promise<VerificationRecordingStatus> {
    if (API_MODE !== "live") return { id: "mock-recording", url: "mock://verification.mp4", durationSec: 45, guidelineAck: true, status: "IN_REVIEW", reviewerNote: null };
    return request("/creators/me/verification/upload", {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: file,
    });
  },
  async getVerificationRecordingStatus(): Promise<VerificationRecordingStatus | null> {
    if (API_MODE !== "live") return null;
    return request("/creators/me/verification");
  },

  // ── Physical attributes (features.md Phase 12A.3) ───────────────────────────
  async getMyAttributes(): Promise<PhysicalAttributes | null> {
    if (API_MODE !== "live") return null;
    return request("/creators/me/attributes");
  },
  /** Partial-merge PUT — omitted fields are left as they were server-side
   * (services/attributes.ts). `consentVersion` is required even for a save
   * that only touches one field, since it's the record of having gone
   * through consent at all, not an attribute itself. */
  async updateMyAttributes(input: UpdateAttributesInput): Promise<PhysicalAttributes> {
    if (API_MODE !== "live") {
      const now = new Date().toISOString();
      return { id: "mock-attrs", visibility: input.visibility ?? {}, consentedAt: now, ...input };
    }
    return request("/creators/me/attributes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
  /** Non-Negotiable #5 — revocable at any time, hard-deletes the row. */
  async deleteMyAttributes(): Promise<void> {
    if (API_MODE !== "live") return;
    await request("/creators/me/attributes", { method: "DELETE" });
  },

  // ── Identity KYC (features.md Phase 7) ─────────────────────────────────────
  // X3: the ONLY system allowed to move `verification` / set the Verified badge.
  async startKycVerification(data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    country: string;
    idType: string;
    idNumber: string;
  }): Promise<{ verification: VerificationState }> {
    if (API_MODE !== "live") return { verification: "PROCESSING" };
    return request("/creators/me/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  /** Polled by the UI to reflect a real PROCESSING -> VERIFIED|FAILED transition. */
  async getVerificationStatus(): Promise<{ verification: VerificationState }> {
    if (API_MODE !== "live") return { verification: "UNVERIFIED" };
    return request("/creators/me/verify");
  },

  // ── Notifications (features.md Phase 9) ────────────────────────────────────
  // Mock mode preserves the original two hardcoded panel entries (no network) —
  // only live mode reads real, per-user notifications.
  async listNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    if (API_MODE !== "live") {
      const now = Date.now();
      return {
        notifications: [
          {
            id: "mock-1",
            kind: "booking_created",
            payload: { message: "Brand Agency NG requested a Commercial Voice-Over." },
            readAt: null,
            createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-2",
            kind: "payment_released",
            payload: { message: "₦120,000 released from escrow for FilmCraft Lagos." },
            readAt: null,
            createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        unreadCount: 2,
      };
    }
    const page = await request<{ data: AppNotification[]; unreadCount: number }>("/notifications?pageSize=50");
    return { notifications: page.data, unreadCount: page.unreadCount };
  },
  async markNotificationRead(id: string): Promise<void> {
    if (API_MODE !== "live") return;
    await request(`/notifications/${id}/read`, { method: "POST" });
  },

  // ── Transaction history (features.md Phase 10) ─────────────────────────────
  async listTransactions(filters: { state?: string; direction?: "payment" | "payout" } = {}): Promise<Transaction[]> {
    if (API_MODE !== "live") return mocks.TRANSACTIONS;
    const qs = new URLSearchParams();
    if (filters.state) qs.set("state", filters.state);
    if (filters.direction) qs.set("direction", filters.direction);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return requestList(`/transactions${suffix}`);
  },

  // ── Help & Support (features.md Phase 10) ───────────────────────────────────
  async listSupportTickets(): Promise<SupportTicket[]> {
    if (API_MODE !== "live") return mocks.SUPPORT_TICKETS;
    return requestList("/support/tickets");
  },
  /** Mock mode returns null — HelpSupport.tsx appends the submission to local
   * state itself, matching OrderRoom.tsx's sendOrderMessage precedent. */
  async submitSupportTicket(input: { subject: string; message: string }): Promise<SupportTicket | null> {
    if (API_MODE !== "live") return null;
    return request("/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
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

  // ── Booking + checkout (features.md Phase 13's slot-aware booking flow) ────
  /** POST /bookings — the server re-verifies the slot itself (never trusts
   * this call's claim); a 409 means someone else took it first. */
  async createBooking(input: {
    creatorId: string;
    rateCardId: string;
    slotDate: string;
    slotStart: string;
    slotEnd: string;
  }): Promise<CreatedBooking> {
    return request("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
  async payBooking(bookingId: string): Promise<{ checkoutUrl: string; providerRef: string; status: string }> {
    return request(`/bookings/${bookingId}/pay`, { method: "POST" });
  },
  /** Dev/demo-only: this prototype's Checkout UI has no real Paystack
   * redirect/SDK to receive a real server-to-server webhook from, so it POSTs
   * directly to the real, signature-checked webhook endpoint to reach
   * ESCROW_LOCKED (features.md Phase 6's e2e test does the exact same thing).
   * The webhook remains the sole authority over BookingState — this doesn't
   * bypass that, it exercises it. Against a real (non-mock) PAYMENT_PROVIDER
   * this signature check fails server-side and the call harmlessly no-ops:
   * a browser can never forge a real Paystack HMAC. */
  async simulateEscrowWebhook(providerRef: string): Promise<boolean> {
    try {
      await request("/webhooks/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paystack-signature": "dev-mock-signature" },
        body: JSON.stringify({ event: "charge.success", data: { id: Date.now(), reference: providerRef, status: "success" } }),
      });
      return true;
    } catch {
      return false;
    }
  },
};

/** The raw Booking row POST /bookings returns — not the display-mapped Order
 * shape (packages/types' Order), since Checkout needs the real computed fee
 * amounts before any display formatting happens. */
export interface CreatedBooking {
  id: string;
  creatorId: string;
  clientId: string;
  rateCardId: string;
  baseAmount: number;
  currency: string;
  talentFeeAmount: number;
  clientFeeAmount: number;
  slotDate: string;
  slotStart: string;
  slotEnd: string;
  state: string;
}

export type ApiClient = typeof apiClient;
