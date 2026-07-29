import { afterEach, describe, expect, it, vi } from "vitest";

describe("api-client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("defaults to mock mode and returns local fixtures", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    const { apiClient } = await import("./api-client");
    expect(apiClient.mode).toBe("mock");

    const talents = await apiClient.listTalents();
    expect(talents.length).toBeGreaterThan(0);
    expect(talents[0]).toHaveProperty("name");

    const stats = await apiClient.getClientStats();
    expect(stats.every((s) => "kind" in s && "label" in s)).toBe(true);

    const messages = await apiClient.getOrderMessages("ORD-001");
    expect(messages.length).toBeGreaterThan(0);
  });

  it("in live mode, calls /api/v1 instead of returning fixtures", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("/api/v1/talent");
      return new Response(JSON.stringify([{ id: 99, name: "Live Talent" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { apiClient } = await import("./api-client");
    expect(apiClient.mode).toBe("live");

    const talents = await apiClient.listTalents();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(talents).toEqual([{ id: 99, name: "Live Talent" }]);
  });

  it("in live mode, throws on a non-ok response instead of silently succeeding", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500, statusText: "Internal Server Error" })),
    );

    const { apiClient } = await import("./api-client");
    await expect(apiClient.listTalents()).rejects.toThrow(/500/);
  });

  describe("auth (features.md Phase 4)", () => {
    afterEach(() => {
      window.localStorage.clear();
    });

    it("mock mode: register/login/logout mirror the original prototype behavior with no network calls", async () => {
      vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const { apiClient } = await import("./api-client");
      expect(apiClient.isAuthenticated()).toBe(true); // mock mode never gates browsing

      const registered = await apiClient.register({
        email: "talent@example.com",
        password: "password123",
        name: "Test Talent",
        userType: "TALENT",
      });
      expect(registered.email).toBe("talent@example.com");

      const client = await apiClient.login("someone@brand.com", "password123");
      expect(client.userType).toBe("CLIENT"); // preserves the original email-substring mock rule
      const talent = await apiClient.login("someone@example.com", "password123");
      expect(talent.userType).toBe("TALENT");

      await apiClient.logout();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("live mode: login stores tokens, isAuthenticated() becomes true, and later requests attach the Authorization header", async () => {
      vi.stubEnv("VITE_API_MODE", "live");
      const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === "/api/v1/auth/login") {
          return new Response(
            JSON.stringify({
              accessToken: "access-token-abc",
              refreshToken: "refresh-token-xyz",
              user: { userId: "u1", email: "t@example.com", userType: "TALENT" },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (String(input) === "/api/v1/talent") {
          expect((init?.headers as Headers).get("Authorization")).toBe("Bearer access-token-abc");
          return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
        }
        throw new Error(`Unexpected fetch: ${input}`);
      });
      vi.stubGlobal("fetch", fetchMock);

      const { apiClient } = await import("./api-client");
      expect(apiClient.isAuthenticated()).toBe(false);

      await apiClient.login("t@example.com", "password123");
      expect(apiClient.isAuthenticated()).toBe(true);
      expect(window.localStorage.getItem("monologg_refresh_token")).toBe("refresh-token-xyz");

      await apiClient.listTalents();
      expect(fetchMock).toHaveBeenCalledWith("/api/v1/talent", expect.anything());
    });

    it("live mode: a 401 triggers one silent refresh-and-retry, then succeeds", async () => {
      vi.stubEnv("VITE_API_MODE", "live");
      window.localStorage.setItem("monologg_refresh_token", "old-refresh-token");

      let talentCallCount = 0;
      const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "/api/v1/talent") {
          talentCallCount += 1;
          if (talentCallCount === 1) {
            return new Response("unauthorized", { status: 401 });
          }
          return new Response(JSON.stringify([{ id: 1, name: "Refreshed" }]), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (url === "/api/v1/auth/refresh") {
          return new Response(
            JSON.stringify({ accessToken: "new-access-token", refreshToken: "new-refresh-token" }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        throw new Error(`Unexpected fetch: ${url}`);
      });
      vi.stubGlobal("fetch", fetchMock);

      const { apiClient } = await import("./api-client");
      const talents = await apiClient.listTalents();

      expect(talents).toEqual([{ id: 1, name: "Refreshed" }]);
      expect(talentCallCount).toBe(2);
      expect(window.localStorage.getItem("monologg_refresh_token")).toBe("new-refresh-token");
    });

    it("live mode: logout calls the endpoint and clears the stored refresh token", async () => {
      vi.stubEnv("VITE_API_MODE", "live");
      window.localStorage.setItem("monologg_refresh_token", "some-refresh-token");

      const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        expect(String(input)).toBe("/api/v1/auth/logout");
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      });
      vi.stubGlobal("fetch", fetchMock);

      const { apiClient } = await import("./api-client");
      await apiClient.logout();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(window.localStorage.getItem("monologg_refresh_token")).toBeNull();
      expect(apiClient.isAuthenticated()).toBe(false);
    });
  });
});
