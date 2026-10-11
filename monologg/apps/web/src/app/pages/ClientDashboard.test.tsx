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

  it("renders the 5-step draft setup stepper and transforms sections into inline inputs that save back to view mode", async () => {
    await renderProjectsTab();
    fireEvent.click(screen.getAllByText("View Project →")[0]!);
    await screen.findByText("P-001");

    // Switch to Draft mode
    fireEvent.click(screen.getByRole("button", { name: "Draft" }));

    // Check Stepper renders
    expect(screen.getByText("Draft Setup Stepper")).toBeInTheDocument();
    expect(screen.getByText("5/5 Sections Ready")).toBeInTheDocument();
    expect(screen.getByText("Title & Synopsis")).toBeInTheDocument();
    expect(screen.getByText("Craft Niches")).toBeInTheDocument();
    expect(screen.getByText("Audition Script")).toBeInTheDocument();

    // Click "Edit Overview"
    const editOverviewBtn = screen.getByRole("button", { name: "Edit Overview" });
    fireEvent.click(editOverviewBtn);

    // Section transforms into form with inputs
    expect(screen.getByText("Edit Overview & Synopsis Details")).toBeInTheDocument();
    const titleInput = screen.getByPlaceholderText("Project Title");
    fireEvent.change(titleInput, { target: { value: "Updated Nike Master Spot" } });

    // Save Overview
    const saveBtn = screen.getByRole("button", { name: "Save Overview" });
    fireEvent.click(saveBtn);

    // Form transforms back to view mode with updated title
    expect(screen.queryByText("Edit Overview & Synopsis Details")).not.toBeInTheDocument();
    expect(screen.getAllByText("Updated Nike Master Spot").length).toBeGreaterThanOrEqual(1);

    // Test Deliverables inline edit transformation
    const editDelivBtn = screen.getByRole("button", { name: "Edit Deliverables" });
    fireEvent.click(editDelivBtn);
    expect(screen.getByText("Manage Milestone Deliverables")).toBeInTheDocument();

    const addDelivInput = screen.getByPlaceholderText(/Add deliverable milestone/i);
    fireEvent.change(addDelivInput, { target: { value: "1x Dolby Atmos Spatial Master" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByDisplayValue("1x Dolby Atmos Spatial Master")).toBeInTheDocument();

    // Save Deliverables
    fireEvent.click(screen.getByRole("button", { name: "Save Deliverables" }));
    expect(screen.queryByText("Manage Milestone Deliverables")).not.toBeInTheDocument();
    expect(screen.getByText("1x Dolby Atmos Spatial Master")).toBeInTheDocument();
  });
});

describe("ClientDashboard — Analytics Tab", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("renders 4 updated metrics cards, date range dropdown, and spend graph while removing funnel and category allocation", async () => {
    const { ClientDashboard } = await import("./ClientDashboard");
    render(
      <MemoryRouter initialEntries={["/client"]}>
        <ClientDashboard />
      </MemoryRouter>,
    );

    // Navigate to Analytics tab
    const analyticsNav = screen.getByRole("button", { name: "Analytics" });
    fireEvent.click(analyticsNav);

    // Heading renders
    await screen.findByText("Hiring & Budget Analytics");

    // Live Sync chip is removed; Date Range dropdown is rendered
    expect(screen.queryByText("Live Sync Active")).not.toBeInTheDocument();
    const dateRangeSelect = screen.getByLabelText("Analytics date range");
    expect(dateRangeSelect).toBeInTheDocument();

    // 4 metric cards are rendered with initial This Year data
    expect(screen.getByText("Total Spend Till date")).toBeInTheDocument();
    expect(screen.getAllByText("₦850,000").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Total successful projects")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    expect(screen.getByText("average rating")).toBeInTheDocument();
    expect(screen.getByText("4.9 ★")).toBeInTheDocument();

    expect(screen.getByText("repeat talent rate")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();

    // Funnel and category budget allocation cards are removed
    expect(screen.queryByText("Performer Acquisition Funnel")).not.toBeInTheDocument();
    expect(screen.queryByText("Category Budget Allocation")).not.toBeInTheDocument();

    // Spend Over Time spline chart is rendered
    expect(screen.getByText("Spend Over Time")).toBeInTheDocument();

    // Changing the date range dropdown updates the metrics and spend graph
    fireEvent.change(dateRangeSelect, { target: { value: "30d" } });

    expect(screen.getAllByText("₦285,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5.0 ★")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByText("Campaign spend across 4 weekly payout milestones")).toBeInTheDocument();

    // Switching to 90d updates
    fireEvent.change(dateRangeSelect, { target: { value: "90d" } });
    expect(screen.getAllByText("₦590,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("28%")).toBeInTheDocument();

    // Switching to All Time updates
    fireEvent.change(dateRangeSelect, { target: { value: "all" } });
    expect(screen.getAllByText("₦1,420,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });
});


