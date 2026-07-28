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
});
