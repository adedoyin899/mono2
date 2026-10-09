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
  fireEvent.click(screen.getByText("Profile"));
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
      expect(screen.getByDisplayValue("Emeka Johnson")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Lagos, Nigeria")).toBeInTheDocument();
    // Initials derived from the name, not a hardcoded string.
    expect(screen.getByText("EJ")).toBeInTheDocument();
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
        JSON.stringify({ id: "creator-1", name: "Emeka Johnson", bio: "bio", location: "Lagos, Nigeria", styleTags: [], verification: "UNVERIFIED" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderSettingsOnProfileSection();
    await screen.findByDisplayValue("Emeka Johnson");

    fireEvent.change(screen.getByDisplayValue("Emeka Johnson"), { target: { value: "Renamed Talent" } });
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

// features.md Phase 12A.3 — the settings editor half of the six privacy
// non-negotiables (services/attributes.ts owns the rest).
describe("Settings — physical attributes section", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function renderOnAttributesSection() {
    const { Settings } = await import("./Settings");
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Physical Attributes"));
    await screen.findByText("Save Attributes");
  }

  it("Save Attributes is disabled until the consent checkbox is checked (Non-Negotiable #4)", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    vi.stubGlobal("fetch", vi.fn());

    await renderOnAttributesSection();

    expect(screen.getByText("Save Attributes").closest("button")).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Save Attributes").closest("button")).not.toBeDisabled();
  });

  it("live mode: saving PUTs the consent version and any set field to the real endpoint", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "PUT") {
        expect(String(input)).toBe("/api/v1/creators/me/attributes");
        const body = JSON.parse(init.body as string);
        expect(body.heightRange).toBe("CM_170_180");
        expect(body.consentVersion).toBeTruthy();
        return new Response(JSON.stringify({ id: "attrs-1", ...body, consentedAt: "2026-01-01T00:00:00.000Z" }), {
          status: 200, headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify(null), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderOnAttributesSection();

    fireEvent.change(screen.getByLabelText("Height"), { target: { value: "CM_170_180" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByText("Save Attributes"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/v1/creators/me/attributes", expect.objectContaining({ method: "PUT" }));
    });
  });

  it("live mode: Delete calls the real DELETE endpoint (Non-Negotiable #5 — revocable at any time)", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === "DELETE") {
        expect(url).toBe("/api/v1/creators/me/attributes");
        return new Response(null, { status: 204 });
      }
      if (url === "/api/v1/creators/me/attributes") {
        return new Response(JSON.stringify({ id: "attrs-1", heightRange: "CM_170_180", visibility: { heightRange: "SEARCHABLE" }, consentVersion: "v1", consentedAt: "2026-01-01T00:00:00.000Z" }), {
          status: 200, headers: { "content-type": "application/json" },
        });
      }
      // Settings.tsx also fetches the creator profile on mount, independent
      // of which section is being viewed.
      return new Response(JSON.stringify({ id: "creator-1", name: "Emeka Johnson", bio: "bio", location: "Lagos, Nigeria", styleTags: [], verification: "UNVERIFIED" }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderOnAttributesSection();
    await screen.findByText("Delete all attribute data");

    fireEvent.click(screen.getByText("Delete all attribute data"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/v1/creators/me/attributes", expect.objectContaining({ method: "DELETE" }));
    });
  });

  it("client mode: renders Client Settings with .role-client and client-specific sections", async () => {
    const { Settings } = await import("./Settings");
    render(
      <MemoryRouter initialEntries={["/settings?role=client"]}>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Client Settings")).toBeInTheDocument();
    });
    expect(screen.getByText("Verified Studio")).toBeInTheDocument();
    expect(screen.getByText("Organization Profile")).toBeInTheDocument();
    // Physical attributes (talent-only) is omitted for client
    expect(screen.queryByText("Physical Attributes")).not.toBeInTheDocument();
  });
});

describe("Settings — payment details section", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("talent mode: menu item is Payment details, displays single payout bank rule, 48hr memo, and no saved cards", async () => {
    const { Settings } = await import("./Settings");
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Menu label is "Payment details"
    const paymentMenu = screen.getByText("Payment details");
    expect(paymentMenu).toBeInTheDocument();
    fireEvent.click(paymentMenu);

    // Section header and content render
    await screen.findByText("Payout Bank Account");
    expect(screen.getByText("Direct earnings withdrawal destination for your completed orders.")).toBeInTheDocument();

    // No "Verified" badge tag in the payout card
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();

    // Single payout bank policy is stated
    expect(screen.getByText(/You can only have one payout bank. This is how Monologg operates/i)).toBeInTheDocument();

    // 48-hour memo is stated
    expect(screen.getByText(/You can change your bank account after 48hrs/i)).toBeInTheDocument();

    // Saved cards / backup cards / + Add Payment Method are NOT rendered for performers
    expect(screen.queryByText("Saved Cards (Optional Backup)")).not.toBeInTheDocument();
    expect(screen.queryByText("+ Add Card")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Payment Method")).not.toBeInTheDocument();

    // Clicking "Change Bank Account" switches to edit form
    const changeBtn = screen.getByText("Change Bank Account");
    expect(changeBtn).toBeInTheDocument();
    fireEvent.click(changeBtn);

    // Form inputs and policy/memo visible before saving
    expect(screen.getByText(/You can only have one payout bank. This is how Monologg operates/i)).toBeInTheDocument();
    expect(screen.getByText(/You can change your bank account after 48hrs/i)).toBeInTheDocument();
    expect(screen.getByText("Save Payout Bank Account")).toBeInTheDocument();
  });
});
