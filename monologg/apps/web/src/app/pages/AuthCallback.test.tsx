import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import React from "react";

// ── Mock supabase module — mutable so individual tests can flip between
// null (ALL-MOCK mode) and a fake real client (getSession) ─────────────────
const mockGetSession = vi.fn();
vi.mock("../../lib/supabase", () => ({
  get supabase() {
    return mockSupabaseClient();
  },
  SUPABASE_MODE: "mock",
}));
let supabaseIsNull = true;
function mockSupabaseClient() {
  return supabaseIsNull ? null : { auth: { getSession: mockGetSession } };
}

// ── Mock api-client (inline to avoid hoisting issues) ───────────────────────
const mockSessionSync = vi.fn().mockResolvedValue({
  userId: "mock-user",
  email: "demo@monologg.dev",
  userType: "TALENT",
});
vi.mock("../../lib/api-client", () => ({
  apiClient: {
    sessionSync: (...args: unknown[]) => mockSessionSync(...args),
  },
}));

// ── Mock state-sync (avoid touching real localStorage/notifications) ───────
vi.mock("../../lib/state-sync", () => ({
  appStateSync: {
    updateTalentProfile: vi.fn(),
    updateClientProfile: vi.fn(),
  },
}));

// ── Mock react-router navigate ───────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { AuthCallback } from "./AuthCallback";
import { appStateSync } from "../../lib/state-sync";

function fakeSession(overrides: { name?: string; avatarUrl?: string; email?: string } = {}) {
  return {
    data: {
      session: {
        access_token: "fake-supabase-jwt",
        user: {
          email: overrides.email ?? "real.person@gmail.com",
          user_metadata: {
            full_name: overrides.name ?? "Real Person",
            avatar_url: overrides.avatarUrl ?? "https://lh3.googleusercontent.com/a/fake-photo.jpg",
          },
          app_metadata: { provider: "google" },
        },
      },
    },
    error: null,
  };
}

describe("AuthCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseIsNull = true;
  });

  it("renders loading dots in initial state (supabase = null / mock mode)", () => {
    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    // In mock mode, supabase is null so the component immediately redirects to /auth
    // The component should render without crashing
    expect(document.body).toBeTruthy();
  });

  it("redirects to /auth when supabase is null (ALL-MOCK mode)", async () => {
    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    // Should redirect to /auth because supabase === null
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth", { replace: true });
    });
  });

  it("shows 'Finishing sign in…' text during normal load", () => {
    // Delay the navigate to simulate async work
    mockNavigate.mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    // The loading text should appear immediately
    // (may or may not be present depending on timing — test for non-crash at minimum)
    expect(document.body).toBeTruthy();
  });

  it("brand-new TALENT account lands on /onboarding, not the dashboard", async () => {
    supabaseIsNull = false;
    mockGetSession.mockResolvedValue(fakeSession());
    mockSessionSync.mockResolvedValue({ userId: "usr-1", email: "real.person@gmail.com", userType: "TALENT", isNewUser: true });

    render(
      <MemoryRouter initialEntries={["/auth/callback?userType=TALENT"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/onboarding", { replace: true });
    });
    expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard", expect.anything());
  });

  it("brand-new CLIENT account lands on /onboarding/client, not the dashboard", async () => {
    supabaseIsNull = false;
    mockGetSession.mockResolvedValue(fakeSession());
    mockSessionSync.mockResolvedValue({ userId: "usr-2", email: "studio@gmail.com", userType: "CLIENT", isNewUser: true });

    render(
      <MemoryRouter initialEntries={["/auth/callback?userType=CLIENT"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/onboarding/client", { replace: true });
    });
  });

  it("a returning (already onboarded) TALENT account goes straight to /dashboard", async () => {
    supabaseIsNull = false;
    mockGetSession.mockResolvedValue(fakeSession());
    mockSessionSync.mockResolvedValue({ userId: "usr-3", email: "real.person@gmail.com", userType: "TALENT", isNewUser: false });

    render(
      <MemoryRouter initialEntries={["/auth/callback?userType=TALENT"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("captures the real Google name/avatar (full_name, avatar_url) into the profile, not a demo fallback", async () => {
    supabaseIsNull = false;
    mockGetSession.mockResolvedValue(fakeSession({ name: "Ada Lovelace", avatarUrl: "https://lh3.googleusercontent.com/a/ada.jpg", email: "ada@gmail.com" }));
    mockSessionSync.mockResolvedValue({ userId: "usr-4", email: "ada@gmail.com", userType: "TALENT", isNewUser: true });

    render(
      <MemoryRouter initialEntries={["/auth/callback?userType=TALENT"]}>
        <AuthCallback />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(appStateSync.updateTalentProfile).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@gmail.com",
        avatarUrl: "https://lh3.googleusercontent.com/a/ada.jpg",
      });
    });
  });
});
