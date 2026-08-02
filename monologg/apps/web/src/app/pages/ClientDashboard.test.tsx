import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 12A.3 — PWA-10 attribute filters. Only the new filter
// behavior is covered here, not a full ClientDashboard suite (none existed
// before this phase).

async function renderDiscoverTab() {
  const { ClientDashboard } = await import("./ClientDashboard");
  render(
    <MemoryRouter>
      <ClientDashboard />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getAllByText("Find Talent")[0]!);
  // AnimatePresence (mode="wait") delays mounting the next tab until the
  // previous one's exit transition finishes — same gotcha AuthFlow.test.tsx/
  // ProjectBrief.test.tsx already document; await the switch via something
  // only the discover tab renders before touching it further.
  await screen.findByPlaceholderText("Search by name, role, or vibe...");
}

describe("ClientDashboard — attribute filters", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mock mode: the filter panel toggles and makes no network calls", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await renderDiscoverTab();
    expect(screen.queryByText("Build")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Filter talent"));
    expect(await screen.findByText("Build")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("live mode: selecting an attribute chip re-fetches /talent with that filter", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (_input?: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ data: [], page: 1, pageSize: 100, total: 0, totalPages: 0 }), {
      status: 200, headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await renderDiscoverTab();
    fireEvent.click(screen.getByLabelText("Filter talent"));
    await screen.findByText("Build");

    fireEvent.click(screen.getByText("ATHLETIC"));

    await waitFor(() => {
      const calledUrls = fetchMock.mock.calls.map((c) => String(c[0]));
      expect(calledUrls.some((u) => u.includes("build=ATHLETIC"))).toBe(true);
    });
  });

  it("Clear attribute filters resets and re-fetches unfiltered", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (_input?: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ data: [], page: 1, pageSize: 100, total: 0, totalPages: 0 }), {
      status: 200, headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await renderDiscoverTab();
    fireEvent.click(screen.getByLabelText("Filter talent"));
    await screen.findByText("Build");
    fireEvent.click(screen.getByText("ATHLETIC"));
    await screen.findByText("Clear attribute filters");

    fireEvent.click(screen.getByText("Clear attribute filters"));

    await waitFor(() => {
      const lastUrl = String(fetchMock.mock.calls.at(-1)?.[0]);
      expect(lastUrl).not.toContain("build=");
    });
  });
});
