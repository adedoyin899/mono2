import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 12: Settings.tsx's "Edit Profile" section previously never
// called the API in either mode — "Save Changes" was a 2-second toast over
// local-only state, and the avatar circle was a hardcoded "ET". These tests
// cover the fix: mock mode still makes no network calls (same invariant every
// other mock-mode screen test asserts); live mode fetches the real profile on
// mount and PATCHes it on save.

async function renderSettingsOnProfileSection() {
  const { Settings } = await import("./Settings");
  render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText("Profile & Storefront"));
  await screen.findByText("Edit Profile");
}

describe("Settings — profile section", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mock mode: shows the Elias Thorne fixture and derives avatar initials from it, no network calls", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await renderSettingsOnProfileSection();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Elias Thorne")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Lagos, Nigeria")).toBeInTheDocument();
    // Initials derived from the name, not a hardcoded "ET" string.
    expect(screen.getByText("ET")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("live mode: fetches the real profile on mount and renders it, not the mock fixture", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("/api/v1/creators/me");
      return new Response(
        JSON.stringify({ id: "creator-1", name: "Ada Lovelace", bio: "Real bio", location: "Abuja", styleTags: [], verification: "UNVERIFIED" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderSettingsOnProfileSection();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Ada Lovelace")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Abuja")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Real bio")).toBeInTheDocument();
    // Initials update too — no longer the mock-mode "ET".
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("live mode: Save Changes PATCHes the edited fields to /api/v1/creators/me", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        expect(String(input)).toBe("/api/v1/creators/me");
        const body = JSON.parse(init.body as string);
        expect(body).toMatchObject({ name: "Renamed Talent", location: "Lagos, Nigeria" });
        return new Response(
          JSON.stringify({ id: "creator-1", name: "Renamed Talent", bio: body.bio, location: "Lagos, Nigeria", styleTags: [], verification: "UNVERIFIED" }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ id: "creator-1", name: "Elias Thorne", bio: "bio", location: "Lagos, Nigeria", styleTags: [], verification: "UNVERIFIED" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderSettingsOnProfileSection();
    await screen.findByDisplayValue("Elias Thorne");

    fireEvent.change(screen.getByDisplayValue("Elias Thorne"), { target: { value: "Renamed Talent" } });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/v1/creators/me", expect.objectContaining({ method: "PATCH" }));
    });
    // The avatar/initials reflect the saved name, read back from the PATCH response.
    await waitFor(() => {
      expect(screen.getByText("RT")).toBeInTheDocument();
    });
  });
});
