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
  fireEvent.click(screen.getAllByText("Find Performers")[0]!);
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

    fireEvent.click(screen.getByLabelText("Filter performers"));
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
    fireEvent.click(screen.getByLabelText("Filter performers"));
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
    fireEvent.click(screen.getByLabelText("Filter performers"));
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

describe("ClientDashboard — Projects Detailed View (Client POV)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function renderProjectsTab() {
    const { ClientDashboard } = await import("./ClientDashboard");
    render(
      <MemoryRouter>
        <ClientDashboard />
      </MemoryRouter>,
    );
    // Click the "My Projects" tab in the navigation
    const projectsTabBtn = screen.getAllByText(/My Projects/i)[0]!;
    fireEvent.click(projectsTabBtn);
    await screen.findByText("Nike Q1 Campaign");
  }

  it("navigates to My Projects tab, opens project detailed view, and displays all key FAANG sections", async () => {
    await renderProjectsTab();

    // Click "View Project →"
    const viewButtons = screen.getAllByText("View Project →");
    fireEvent.click(viewButtons[0]!);

    // Check project header metadata
    expect(await screen.findByText("P-001")).toBeInTheDocument();
    expect(screen.getAllByText("Nike Q1 Campaign").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("₦200,000")).toBeInTheDocument();

    // Check Creative Brief & Synopsis
    expect(screen.getByText("Creative Brief & Synopsis")).toBeInTheDocument();
    expect(
      screen.getByText(/Seeking a commanding, resonant voiceover artist/i),
    ).toBeInTheDocument();

    // Check Role & Craft Requirements
    expect(screen.getByText("Role & Craft Requirements")).toBeInTheDocument();
    expect(screen.getByText("VO ARTIST")).toBeInTheDocument();

    // Check Audition Sides & Script Excerpt
    expect(screen.getByText("Audition Sides & Script Excerpt")).toBeInTheDocument();

    // Check Deliverables & Licensing Milestones
    expect(screen.getByText("Deliverables & Licensing Milestones")).toBeInTheDocument();
    expect(screen.getByText(/2x 30s broadcast WAV master audio files/i)).toBeInTheDocument();

    // Check Project Assets & Reference Files
    expect(screen.getByText("Project Assets & Reference Files")).toBeInTheDocument();
    expect(screen.getByText("Nike_Q1_Campaign_Creative_Brief.pdf")).toBeInTheDocument();

    // Check Applicant Pipeline & Casting
    expect(screen.getByText(/Applicant Pipeline & Casting/i)).toBeInTheDocument();
    expect(screen.getByText("Adaeze Obi")).toBeInTheDocument();
    expect(screen.getByText("Amara Diallo")).toBeInTheDocument();

    // Check Project Action Center
    expect(screen.getByText("Project Action Center")).toBeInTheDocument();
  });

  it("state switcher preview updates status badges and contextual Action Center CTAs", async () => {
    await renderProjectsTab();
    fireEvent.click(screen.getAllByText("View Project →")[0]!);
    await screen.findByText("P-001");

    // Click Draft state button
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));
    expect(screen.getAllByText("Draft").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /publish & fund escrow/i }).length).toBeGreaterThanOrEqual(1);

    // Click In Progress state button
    fireEvent.click(screen.getByRole("button", { name: "In Progress" }));
    expect(screen.getAllByText("In Progress · Hired").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Open Order Room/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Message Performer")).toBeInTheDocument();

    // Click Review state button
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.getAllByText("Under Review · Files Submitted").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Inspect in Order Room/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Request Revision")).toBeInTheDocument();

    // Click Closed state button
    fireEvent.click(screen.getByRole("button", { name: "Closed" }));
    expect(screen.getAllByText("Applications Closed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Reopen Applications")).toBeInTheDocument();
  });

  it("draft state renders inactive casting banner and hides active candidate list", async () => {
    await renderProjectsTab();
    fireEvent.click(screen.getAllByText("View Project →")[0]!);
    await screen.findByText("P-001");

    // Click Draft state switcher
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));
    expect(screen.getByText("Casting Pipeline Inactive")).toBeInTheDocument();
    expect(screen.queryByText("Adaeze Obi")).not.toBeInTheDocument();
    expect(screen.queryByText("Amara Diallo")).not.toBeInTheDocument();

    // Re-publishing switches to active and restores candidates
    fireEvent.click(screen.getAllByRole("button", { name: /publish & fund escrow/i })[0]!);
    expect(screen.getByText("Adaeze Obi")).toBeInTheDocument();
  });

  it("view profile & reels opens performer storefront modal with casting CTAs", async () => {
    await renderProjectsTab();
    fireEvent.click(screen.getAllByText("View Project →")[0]!);
    await screen.findByText("Adaeze Obi");

    const viewProfileBtns = screen.getAllByRole("button", { name: /view profile & reels/i });
    fireEvent.click(viewProfileBtns[0]!);

    // Storefront modal mounts
    expect(screen.getByText("Open Public Storefront")).toBeInTheDocument();
    expect(screen.getByText(/Audition Pitch & Proposal/i)).toBeInTheDocument();
    expect(screen.getByText("Accept / Hire Performer")).toBeInTheDocument();

    // Clicking Shortlist in modal updates applicant status
    const shortlistBtns = screen.getAllByRole("button", { name: "Shortlist" });
    fireEvent.click(shortlistBtns[shortlistBtns.length - 1]!);

    // Clicking Hire in modal triggers hire flow and transitions to in_progress
    const hireModalBtn = screen.getByRole("button", { name: /accept \/ hire performer/i });
    fireEvent.click(hireModalBtn);
    expect(screen.getAllByRole("button", { name: /open order room/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("copies audition script to clipboard and confirms copied state", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await renderProjectsTab();
    fireEvent.click(screen.getAllByText("View Project →")[0]!);
    await screen.findByText("Audition Sides & Script Excerpt");

    const copyBtn = screen.getByRole("button", { name: /copy script/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });

  it("filters applicant pipeline and navigates back to projects list", async () => {
    await renderProjectsTab();
    fireEvent.click(screen.getAllByText("View Project →")[0]!);
    await screen.findByText(/Applicant Pipeline & Casting/i);

    // Filter by Shortlisted
    fireEvent.click(screen.getByRole("button", { name: /shortlisted \(/i }));
    expect(screen.getByText("Amara Diallo")).toBeInTheDocument();
    expect(screen.queryByText("Adaeze Obi")).not.toBeInTheDocument();

    // Filter by All
    fireEvent.click(screen.getByRole("button", { name: /all \(/i }));
    expect(screen.getByText("Adaeze Obi")).toBeInTheDocument();
    expect(screen.getByText("Amara Diallo")).toBeInTheDocument();

    // Search filter input
    const searchInput = screen.getByPlaceholderText(/search applicants\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "Adaeze" } });
    expect(screen.getByText("Adaeze Obi")).toBeInTheDocument();
    expect(screen.queryByText("Amara Diallo")).not.toBeInTheDocument();

    // Back to My Projects
    fireEvent.click(screen.getByRole("button", { name: /back to my projects/i }));
    expect(await screen.findByText("Post a new project")).toBeInTheDocument();
    expect(screen.queryByText("Role & Craft Requirements")).not.toBeInTheDocument();
  });
});

