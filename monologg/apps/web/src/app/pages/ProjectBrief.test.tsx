import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 5: ProjectBrief.tsx's "Publish Project" now calls apiClient.createBrief
// in live mode, but must stay visually/behaviorally identical to the original mock-only
// prototype in the default mock mode (AnimatePresence delays the next view, so each step
// change is awaited via findBy* rather than queried synchronously).

async function renderAndFillProjectBrief() {
  const { ProjectBrief } = await import("./ProjectBrief");
  render(
    <MemoryRouter>
      <ProjectBrief />
    </MemoryRouter>,
  );

  // Step 1
  fireEvent.change(screen.getByPlaceholderText("e.g., Nike Q1 Campaign Voice-Over"), {
    target: { value: "Nike Q1 Campaign" },
  });
  fireEvent.click(screen.getByText("Commercial / Ad Campaign"));
  fireEvent.click(screen.getByText("Continue"));

  // Step 2
  await screen.findByText("Talent Requirements");
  fireEvent.click(screen.getByText("Voice-Over"));
  fireEvent.click(screen.getByText("Continue"));

  // Step 3 — skip
  await screen.findByText("Script & Assets");
  fireEvent.click(screen.getByText("Continue"));

  // Step 4 — "Budget & Publish" text is ambiguous (it's also the always-visible
  // top stepper's label), so wait for step-4-unique content instead.
  await screen.findByText("Set your project budget range to attract the right talent.");
  fireEvent.click(screen.getByText("₦50K – ₦150K"));
}

describe("ProjectBrief", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mock mode: publishing shows the success screen with no network call", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await renderAndFillProjectBrief();
    fireEvent.click(screen.getByText("Publish Project"));

    await waitFor(() => {
      expect(screen.getByText("Project Published!")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("live mode: publishing creates a real Brief with the mapped niche enum and budget in kobo", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe("/api/v1/briefs");
      const body = JSON.parse(init!.body as string);
      expect(body).toMatchObject({
        projectName: "Nike Q1 Campaign",
        projectType: "Commercial / Ad Campaign",
        nicheReq: ["VO_ARTIST"],
        budgetAmount: 5_000_000,
        budgetCurrency: "NGN",
        // features.md Phase 14 regression: "Publish Project" must actually
        // publish (status ACTIVE) — the schema otherwise defaults new briefs
        // to DRAFT, which never appears in talent's GET /projects browse list.
        status: "ACTIVE",
      });
      return new Response(JSON.stringify({ id: "brief-new" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await renderAndFillProjectBrief();
    fireEvent.click(screen.getByText("Publish Project"));

    await waitFor(() => {
      expect(screen.getByText("Project Published!")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
